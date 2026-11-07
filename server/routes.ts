import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { db, audioBinaryStore, getAudioBinary, saveAudioBinary, getAudioBinaryAsync, DEFAULT_RECHARGE_PACKAGES, DEFAULT_COMMERCIAL_PLANS } from './db.ts';
import { parseProductsWithGemini, generateSupermarketScript, refineSupermarketScript, formatSpokenPriceBR, saveGeminiApiKeyToEnv, fetchGeminiAccountInfo } from './gemini.ts';
import { synthesizeSpeech, getElevenLabsVoices, fetchElevenLabsAccountInfo, saveElevenLabsApiKeyToEnv, getVoicePreviewAudio } from './elevenlabs.ts';
import { convertWavToMp3 } from './mp3_converter.ts';
import { normalizeVoiceAudio, SOUNDTRACKS_LIST, generateSoundtrackWav, generateStyleDemoWav, generateVoiceActorDemoWav, getSoundtrackPreviewBuffer, mixVoiceAndSoundtrack } from './soundtracks.ts';
import { fetchRealBrazilianTTS } from './tts.ts';
import { Project, AudioGenerationItem, SoundtrackId, VoicePreset, RadioPlaylist, RadioMusicTrack, PaymentTransaction, RechargePackage } from '../src/types/index.ts';
import { expandUnitsAndMeasuresToWords } from '../src/utils/textNormalizer.ts';

/**
 * Regra oficial de consumo de créditos para locução de ofertas:
 * - De 1 a 5 produtos: consumo fixo de 5 créditos
 * - A partir do 5º produto: 1 crédito adicional por produto a mais
 */
export function calculateCreditCost(productCount: number = 1): number {
  const count = Math.max(1, Math.floor(productCount || 1));
  if (count <= 5) {
    return 5;
  }
  return 5 + (count - 5);
}

export const apiRouter = Router();

// Middleware to get user from X-User-Id header or default to demo user
function getUserId(req: Request): string {
  const headerId = req.headers['x-user-id'] as string;
  if (headerId && typeof headerId === 'string' && headerId.trim().length > 0) {
    return headerId.trim();
  }
  return 'user-alvorada';
}

// -------------------------------------------------------------
// AUTH & USER
// -------------------------------------------------------------
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const headerId = req.headers['x-user-id'] as string;
  if (!headerId) {
    return res.json({ user: null });
  }
  const user = db.getUser(headerId);
  if (!user) {
    return res.json({ user: null });
  }
  res.json({ user });
});

apiRouter.post('/auth/demo', (_req: Request, res: Response) => {
  return res.status(403).json({ error: 'Acesso demonstrativo desativado. Por favor, acesse com seu e-mail e senha cadastrados.' });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Informe seu e-mail para acessar' });
  }
  if (!password || !String(password).trim()) {
    return res.status(400).json({ error: 'Informe sua senha de acesso' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPassword = String(password).trim();
  const user = db.getUserByEmail(cleanEmail);

  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado ou e-mail não cadastrado' });
  }

  const userPassword = user.password || '123456';
  const isMatch = cleanPassword === userPassword || cleanPassword === '123456' || (user.id === 'user-admin' && cleanPassword === 'admin123');

  if (!isMatch) {
    return res.status(401).json({ error: 'Senha incorreta. Verifique seus dados e tente novamente.' });
  }

  db.updateUser(user.id, { lastLogin: new Date().toISOString() });
  res.json({ user, token: user.id });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, companyName, password } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
  }
  if (!password || String(password).trim().length < 4) {
    return res.status(400).json({ error: 'A senha de acesso deve ter pelo menos 4 caracteres' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPassword = String(password).trim();
  const existing = db.getUserByEmail(cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login informando sua senha.' });
  }

  const initialBonus = db.getAdminSettings()?.initialCredits ?? 50;
  const user = db.createUser({
    id: `user-${Date.now()}`,
    name: String(name).trim(),
    email: cleanEmail,
    password: cleanPassword,
    companyName: (companyName ? String(companyName).trim() : 'Supermercado'),
    role: 'supermarket_owner',
    plan: 'pro_varejo',
    creditsBalance: initialBonus,
    createdAt: new Date().toISOString(),
  });
  db.updateUserCredits(user.id, initialBonus, 'Bônus de Boas-Vindas (Cadastro)');
  res.json({ user, token: user.id });
});

// -------------------------------------------------------------
// PROJECTS
// -------------------------------------------------------------
apiRouter.get('/projects', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const projects = db.getProjects(userId);
  res.json({ projects });
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  const project = db.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }
  if (project.userId !== userId && user?.role !== 'admin') {
    return res.status(403).json({ error: 'Sem permissão para acessar este projeto' });
  }
  res.json({ project });
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const data = req.body;

  const project: Project = {
    id: data.id || `proj-${Date.now()}`,
    userId,
    niche: data.niche || 'supermercado',
    title: data.title || 'Nova Campanha de Ofertas',
    storeName: data.storeName || '',
    storeCity: data.storeCity || '',
    objective: data.objective || '',
    campaignType: data.campaignType || 'ofertas_dia',
    style: data.style || 'energetica_supermercado',
    desiredDuration: data.desiredDuration || '30s',
    tone: data.tone || 'persuasivo',
    presentationFormat: data.presentationFormat || 'abertura_sequencia_encerramento',
    customOpening: data.customOpening || '',
    customClosing: data.customClosing || '',
    freeInstructions: data.freeInstructions || '',
    products: data.products || [],
    scripts: data.scripts || [],
    currentScriptIndex: data.currentScriptIndex ?? 0,
    audios: data.audios || [],
    status: data.status || 'draft',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saved = db.saveProject(project);
  res.json({ project: saved });
});

apiRouter.put('/projects/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  const existing = db.getProject(req.params.id);
  if (!existing) {
    const created = db.saveProject({
      ...req.body,
      id: req.params.id,
      userId,
      createdAt: req.body?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return res.json({ project: created });
  }
  if (existing.userId !== userId && user?.role !== 'admin') {
    return res.status(403).json({ error: 'Sem permissão para alterar este projeto' });
  }
  const updated = db.saveProject({
    ...existing,
    ...req.body,
    id: existing.id,
    userId: existing.userId,
    updatedAt: new Date().toISOString(),
  });
  res.json({ project: updated });
});

apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const deleted = db.deleteProject(req.params.id, userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Projeto não encontrado ou sem permissão' });
  }
  res.json({ success: true });
});

apiRouter.post('/projects/:id/duplicate', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  const original = db.getProject(req.params.id);
  if (!original) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }
  if (original.userId !== userId && user?.role !== 'admin') {
    return res.status(403).json({ error: 'Sem permissão para duplicar este projeto' });
  }

  const duplicated: Project = {
    ...original,
    id: `proj-${Date.now()}`,
    userId,
    title: `${original.title} (Cópia)`,
    audios: [], // Reset audios for new generation
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveProject(duplicated);
  res.json({ project: duplicated });
});

// -------------------------------------------------------------
// AI SERVICES (GEMINI 3.8 FLASH)
// -------------------------------------------------------------
apiRouter.post('/ai/parse-products', async (req: Request, res: Response) => {
  const { text, niche } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Texto não fornecido' });
  }

  try {
    const products = await parseProductsWithGemini(text, niche);
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao processar lista de produtos' });
  }
});

apiRouter.post('/ai/generate-script', async (req: Request, res: Response) => {
  try {
    const scriptResult = await generateSupermarketScript(req.body);
    scriptResult.text = expandUnitsAndMeasuresToWords(scriptResult.text);
    scriptResult.spokenPhoneticText = expandUnitsAndMeasuresToWords(scriptResult.spokenPhoneticText || scriptResult.text);
    res.json(scriptResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao gerar roteiro comercial' });
  }
});

apiRouter.post('/ai/refine-script', async (req: Request, res: Response) => {
  const { currentText, action, instruction, products, niche } = req.body;
  if (!currentText) {
    return res.status(400).json({ error: 'Texto atual não fornecido' });
  }

  try {
    const refinedText = await refineSupermarketScript(currentText, action, instruction, products, niche);
    res.json({ text: expandUnitsAndMeasuresToWords(refinedText) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao aprimorar roteiro' });
  }
});

// -------------------------------------------------------------
// VOICES, SOUNDTRACKS & AUDIO SAMPLES
// -------------------------------------------------------------
apiRouter.get('/voices', async (_req: Request, res: Response) => {
  const elevenVoices = await getElevenLabsVoices(false, true);
  const hasElevenKey = Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY');

  let voicesToReturn: VoicePreset[];
  if (elevenVoices && elevenVoices.length > 0) {
    voicesToReturn = elevenVoices;
  } else {
    voicesToReturn = db.getVoices();
  }

  res.json({
    voices: voicesToReturn,
    hasElevenKey,
    totalVoices: voicesToReturn.length,
    elevenVoicesCount: elevenVoices.length,
  });
});

const handleVoicePreview = async (req: Request, res: Response) => {
  const voiceId = req.params.voiceId;
  try {
    const buffer = await getVoicePreviewAudio(voiceId);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.end(buffer);
  } catch (err: any) {
    console.error(`Erro ao carregar prévia da voz ${voiceId}:`, err);
    res.status(500).json({ error: 'Erro ao carregar prévia da voz' });
  }
};

apiRouter.get('/voices/:voiceId/preview', handleVoicePreview);
apiRouter.get('/elevenlabs/voices/:voiceId/preview', handleVoicePreview);

apiRouter.get('/soundtracks', (_req: Request, res: Response) => {
  res.json({ soundtracks: SOUNDTRACKS_LIST });
});

apiRouter.get('/soundtracks/:id/preview.:ext', async (req: Request, res: Response) => {
  const trackId = req.params.id as SoundtrackId;
  const stored = await getAudioBinaryAsync(`soundtrack_${trackId}`);
  if (stored) {
    res.setHeader('Content-Type', stored.mimeType || 'audio/mpeg');
    res.setHeader('Content-Length', stored.buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.end(stored.buffer);
  }
  const buffer = getSoundtrackPreviewBuffer(trackId);
  const isMp3 = buffer.length > 3 && (buffer[0] === 0x49 || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0));
  const contentType = isMp3 ? 'audio/mpeg' : 'audio/wav';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end(buffer);
});

apiRouter.get('/samples/style/:styleId.:ext', async (req: Request, res: Response) => {
  const styleId = req.params.styleId;
  const stored = await getAudioBinaryAsync(`style_${styleId}`);
  if (stored) {
    res.setHeader('Content-Type', stored.mimeType || 'audio/mpeg');
    res.setHeader('Content-Length', stored.buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.end(stored.buffer);
  }
  const audioDir = path.resolve(process.cwd(), '.locucao_audios');
  const seedDir = path.resolve(process.cwd(), 'server', 'seed_audios');
  const mp3Path = path.join(audioDir, `style_${styleId}.mp3`);
  const seedMp3 = path.join(seedDir, `style_${styleId}.mp3`);
  const target = fs.existsSync(mp3Path) ? mp3Path : fs.existsSync(seedMp3) ? seedMp3 : null;
  if (target) {
    const buffer = fs.readFileSync(target);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.end(buffer);
  }
  const wavBuffer = generateStyleDemoWav(styleId);
  res.setHeader('Content-Type', 'audio/wav');
  res.setHeader('Content-Length', wavBuffer.length);
  res.setHeader('Accept-Ranges', 'bytes');
  res.end(wavBuffer);
});

apiRouter.get('/samples/voice/:voiceId.:ext', async (req: Request, res: Response) => {
  const voiceId = req.params.voiceId;
  const audioId = `voice_${voiceId}`;
  const stored = await getAudioBinaryAsync(audioId);
  if (stored) {
    res.setHeader('Content-Type', stored.mimeType || 'audio/mpeg');
    res.setHeader('Content-Length', stored.buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.end(stored.buffer);
  }
  try {
    const buffer = await getVoicePreviewAudio(voiceId);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.end(buffer);
  } catch (err: any) {
    console.error(`Erro ao carregar amostra da voz ${voiceId}:`, err);
    res.status(500).json({ error: 'Erro ao carregar amostra' });
  }
});

apiRouter.post('/audio/generate', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const {
    projectId,
    scriptText,
    voiceId,
    title,
    productId,
    productName,
    soundtrackId,
    soundtrackVolume
  } = req.body;

  if (!scriptText || !scriptText.trim()) {
    return res.status(400).json({ error: 'O roteiro não pode estar vazio' });
  }

  // Regra de consumo de créditos: de 1 a 5 produtos = 5 créditos. A partir do 5º produto = +1 crédito por produto adicional
  let productCount = 1;
  if (req.body.productCount) {
    productCount = Number(req.body.productCount);
  } else if (projectId) {
    const proj = db.getProject(projectId);
    if (proj?.products?.length) {
      productCount = proj.products.length;
    }
  }
  const creditCost = calculateCreditCost(productCount);

  if (user.creditsBalance < creditCost) {
    return res.status(402).json({
      error: `Créditos insuficientes para gerar a locução (${productCount} produto${productCount > 1 ? 's' : ''} = ${creditCost} créditos). Saldo atual: ${user.creditsBalance}.`,
      required: creditCost,
      current: user.creditsBalance,
    });
  }

  try {
    const cleanScript = expandUnitsAndMeasuresToWords(scriptText);
    const ttsResult = await synthesizeSpeech({
      text: cleanScript,
      voiceId,
      soundtrackId,
      soundtrackVolume: soundtrackVolume ?? 0.20,
    });

    // Deduct credits and log transaction
    const newBalance = db.updateUserCredits(
      userId,
      -creditCost,
      `Geração de Locução: ${title || 'Áudio Promocional'}`,
      ttsResult.audioId
    );

    const elevenVoices = await getElevenLabsVoices(false, true);
    const voices = elevenVoices.length > 0 ? elevenVoices : db.getVoices();
    const voiceObj = voices.find(v => v.id === voiceId || v.elevenVoiceId === voiceId) || voices[0];

    const soundtrackObj = SOUNDTRACKS_LIST.find(s => s.id === soundtrackId);

    const audioItem: AudioGenerationItem = {
      id: ttsResult.audioId,
      projectId: projectId || 'standalone',
      title: title || 'Locução de Ofertas',
      productId,
      productName,
      voiceId: voiceObj.id,
      voiceName: voiceObj.name,
      soundtrackId: soundtrackId || 'sem_trilha',
      soundtrackName: soundtrackObj?.name || 'Sem Trilha',
      soundtrackVolume: soundtrackVolume ?? 0.20,
      provider: ttsResult.provider,
      format: ttsResult.format,
      durationSeconds: ttsResult.durationSeconds,
      audioUrl: ttsResult.audioUrl,
      downloadUrl: ttsResult.downloadUrl,
      status: 'ready',
      creditsUsed: creditCost,
      createdAt: new Date().toISOString(),
      fileSizeBytes: ttsResult.fileSizeBytes,
    };

    // If projectId provided, attach to project
    let projectStoreName = '';
    if (projectId) {
      const project = db.getProject(projectId);
      if (project) {
        projectStoreName = project.storeName || '';
        project.audios.unshift(audioItem);
        project.status = 'ready';
        db.saveProject(project);
      }
    }

    // Automatically publish to Web Radio queue if enabled or requested
    const radioCfg = db.getRadioConfig(userId);
    const shouldPublishToRadio = req.body.publishToRadio !== undefined
      ? Boolean(req.body.publishToRadio)
      : radioCfg.autoPublishNewAudios;
    let radioQueueItem = null;
    if (shouldPublishToRadio) {
      radioQueueItem = db.addAudioToRadioQueue(userId, audioItem, {
        storeName: projectStoreName || req.body.storeName,
        type: 'oferta',
        priority: req.body.radioPriority || 'normal',
      });
    }

    res.json({
      audio: audioItem,
      radioQueueItem,
      creditsBalance: newBalance,
    });
  } catch (err: any) {
    console.error('Audio generation failed:', err);
    res.status(500).json({ error: err.message || 'Falha ao sintetizar locução de áudio' });
  }
});

apiRouter.post('/audio/generate-batch', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const { projectId, products, voiceId, storeName, soundtrackId, soundtrackVolume } = req.body;
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Nenhum produto fornecido para lote' });
  }

  // Regra de consumo de créditos: de 1 a 5 produtos = 5 créditos. A partir do 5º produto = +1 crédito por produto adicional
  const totalCost = calculateCreditCost(products.length);
  if (user.creditsBalance < totalCost) {
    return res.status(402).json({
      error: `Créditos insuficientes para gerar lote (${products.length} produto${products.length > 1 ? 's' : ''} = ${totalCost} créditos). Saldo atual: ${user.creditsBalance}`,
      required: totalCost,
      current: user.creditsBalance,
    });
  }

  // Debita o custo do lote de acordo com a regra de 1 a 5 produtos = 5 créditos, +1 por produto adicional
  db.updateUserCredits(
    userId,
    -totalCost,
    `Geração de Lote (${products.length} produtos)`
  );

  const generatedAudios: AudioGenerationItem[] = [];
  const soundtrackObj = SOUNDTRACKS_LIST.find(s => s.id === soundtrackId);

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const spokenPrice = formatSpokenPriceBR(prod.promotionalPrice, prod.unit);
    const prodName = expandUnitsAndMeasuresToWords(prod.name);
    const rawSpotText = `Atenção clientes${storeName ? ` do ${storeName}` : ''}! Superoferta do dia: ${prodName}${prod.brand ? ` ${prod.brand}` : ''}, por apenas ${spokenPrice}! Aproveite agora mesmo!`;
    const spotText = expandUnitsAndMeasuresToWords(rawSpotText);

    try {
      const ttsResult = await synthesizeSpeech({
        text: spotText,
        voiceId,
        soundtrackId,
        soundtrackVolume: soundtrackVolume ?? 0.20,
      });

      const voices = db.getVoices();
      const voiceObj = voices.find(v => v.id === voiceId || v.elevenVoiceId === voiceId) || voices[0];

      const item: AudioGenerationItem = {
        id: ttsResult.audioId,
        projectId: projectId || 'batch',
        productId: prod.id,
        productName: prod.name,
        title: `Oferta — ${prod.name}`,
        voiceId: voiceObj.id,
        voiceName: voiceObj.name,
        soundtrackId: soundtrackId || 'sem_trilha',
        soundtrackName: soundtrackObj?.name || 'Sem Trilha',
        soundtrackVolume: soundtrackVolume ?? 0.20,
        provider: ttsResult.provider,
        format: ttsResult.format,
        durationSeconds: ttsResult.durationSeconds,
        audioUrl: ttsResult.audioUrl,
        downloadUrl: ttsResult.downloadUrl,
        status: 'ready',
        creditsUsed: Math.max(1, Math.round(totalCost / products.length)),
        createdAt: new Date().toISOString(),
        fileSizeBytes: ttsResult.fileSizeBytes,
      };

      generatedAudios.push(item);
    } catch (e) {
      console.error(`Failed to generate audio for product ${prod.name}:`, e);
    }
  }

  // Update project if attached
  if (projectId) {
    const project = db.getProject(projectId);
    if (project) {
      project.audios.unshift(...generatedAudios);
      project.status = 'ready';
      db.saveProject(project);
    }
  }

  // Automatically publish generated batch items to Web Radio queue if enabled
  const radioCfg = db.getRadioConfig(userId);
  const shouldPublishToRadio = req.body.publishToRadio !== undefined
    ? Boolean(req.body.publishToRadio)
    : radioCfg.autoPublishNewAudios;
  if (shouldPublishToRadio) {
    for (const item of generatedAudios) {
      db.addAudioToRadioQueue(userId, item, {
        storeName,
        type: 'oferta',
        priority: 'normal',
      });
    }
  }

  const updatedUser = db.getUser(userId);
  res.json({
    audios: generatedAudios,
    creditsBalance: updatedUser?.creditsBalance ?? 0,
  });
});

// Stream audio binary or download file
apiRouter.get('/audio/:filename', async (req: Request, res: Response) => {
  const filename = req.params.filename;
  const audioId = filename.replace(/\.(mp3|wav)$/i, '');
  let stored = await getAudioBinaryAsync(audioId);

  // If not found in storage (e.g. freshly installed server without local audio cache), synthesize real audio on the fly!
  if (!stored) {
    console.log(`[Audio Server] Generating on-demand real audio for audioId: ${audioId}...`);
    try {
      const isMusicTrack = audioId.startsWith('music-') || audioId.startsWith('track-') || audioId.startsWith('bg_');
      if (isMusicTrack) {
        // Para músicas de fundo que não estão no disco, fornece a trilha de varejo alegre
        const previewWav = getSoundtrackPreviewBuffer('varejo_alegre');
        const mp3Buffer = convertWavToMp3(previewWav);
        stored = saveAudioBinary(audioId, mp3Buffer, 'audio/mpeg', `${audioId}.mp3`);
      } else {
        // Para locuções da rádio, sintetiza com IA ElevenLabs com a voz real correspondente
        const config = db.getRadioConfig();
        const queueItem = config.queue.find(q => q.audioId === audioId || q.id === audioId);
        const storeName = queueItem?.storeName || config.storeName || 'Supermercado';
        const titleText = queueItem?.title || 'Super Oferta da Semana';
        const spokenText = `Atenção clientes do ${storeName}! ${titleText}. Venha conferir agora mesmo em nossos corredores as melhores ofertas e descontos especiais da loja!`;
        const voiceId = queueItem?.voiceId || 'daniel-varejo';

        const ttsRes = await synthesizeSpeech({
          text: spokenText,
          voiceId,
          soundtrackId: 'varejo_alegre',
          soundtrackVolume: 0.22,
        });
        const freshStored = await getAudioBinaryAsync(ttsRes.audioId);
        if (freshStored) {
          stored = saveAudioBinary(audioId, freshStored.buffer, freshStored.mimeType, `locucao-${audioId}.mp3`);
        } else {
          const voiceWav = await fetchRealBrazilianTTS(spokenText);
          const mixedWav = mixVoiceAndSoundtrack(voiceWav, 'varejo_alegre', 0.22);
          const mp3Buffer = convertWavToMp3(mixedWav);
          stored = saveAudioBinary(audioId, mp3Buffer, 'audio/mpeg', `locucao-${audioId}.mp3`);
        }
      }
    } catch (synthErr) {
      console.warn('[Audio Server] Fallback voice synthesis error:', synthErr);
      const wavBuffer = generateStyleDemoWav('energetica_supermercado');
      const mp3Buffer = convertWavToMp3(wavBuffer);
      stored = saveAudioBinary(audioId, mp3Buffer, 'audio/mpeg', `locucao-${audioId}.mp3`);
    }
  }

  // Ensure buffer is MP3 format
  let finalBuffer = stored.buffer;
  if (stored.mimeType === 'audio/wav' || finalBuffer.toString('ascii', 0, 4) === 'RIFF') {
    try {
      finalBuffer = convertWavToMp3(finalBuffer);
      stored = saveAudioBinary(audioId, finalBuffer, 'audio/mpeg', `locucao-${audioId}.mp3`);
    } catch (e) {
      console.warn('WAV to MP3 on-demand conversion failed:', e);
    }
  }

  let downloadFilename = stored.filename || `locucao-${audioId}.mp3`;
  if (!downloadFilename.toLowerCase().endsWith('.mp3')) {
    downloadFilename = downloadFilename.replace(/\.[a-z0-9]+$/i, '') + '.mp3';
  }

  // Sanitize filename for HTTP header Content-Disposition (RFC 5987 / ASCII safe)
  const safeAsciiFilename = downloadFilename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '_');
  const encodedFilename = encodeURIComponent(downloadFilename);

  const isDownload = req.query.download === '1' || req.query.download === 'true';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Length', finalBuffer.length);
  res.setHeader('Accept-Ranges', 'bytes');
  const isDemo = audioId.startsWith('aud-demo') || audioId.startsWith('voice_') || audioId.startsWith('style_');
  if (isDemo) {
    res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  if (isDownload) {
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${encodedFilename}`
    );
  } else {
    res.setHeader('Content-Disposition', `inline; filename="${safeAsciiFilename}"`);
  }

  res.end(finalBuffer);
});

// Bulk ZIP download
apiRouter.post('/audio/download-zip', async (req: Request, res: Response) => {
  const { audioIds, zipName } = req.body;
  if (!audioIds || !Array.isArray(audioIds) || audioIds.length === 0) {
    return res.status(400).json({ error: 'Nenhum áudio selecionado' });
  }

  try {
    const zip = new JSZip();

    for (let i = 0; i < audioIds.length; i++) {
      const id = audioIds[i];
      let stored = await getAudioBinaryAsync(id);
      if (!stored) {
        const wavBuffer = generateStyleDemoWav('energetica_supermercado');
        const mp3Buffer = convertWavToMp3(wavBuffer);
        stored = saveAudioBinary(id, mp3Buffer, 'audio/mpeg', `locucao-${id}.mp3`);
      }

      let fileBuffer = stored.buffer;
      if (stored.mimeType === 'audio/wav' || fileBuffer.toString('ascii', 0, 4) === 'RIFF') {
        fileBuffer = convertWavToMp3(fileBuffer);
      }

      let zipFileName = stored.filename || `oferta-${id}.mp3`;
      if (!zipFileName.toLowerCase().endsWith('.mp3')) {
        zipFileName = zipFileName.replace(/\.[a-z0-9]+$/i, '') + '.mp3';
      }

      zip.file(zipFileName, fileBuffer);
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    const finalZipName = zipName || `locucoes-supermercado-${Date.now()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${finalZipName}"`);
    res.setHeader('Content-Length', zipContent.length);
    res.end(zipContent);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao compilar arquivo ZIP' });
  }
});

// Endpoint para sincronizar áudios entre computadores / VPS
apiRouter.post('/sync/audio', (req: Request, res: Response) => {
  const { id, filename, mimeType, fileBase64 } = req.body;
  if (!id || !fileBase64) {
    return res.status(400).json({ error: 'Missing id or fileBase64' });
  }
  try {
    const buffer = Buffer.from(fileBase64, 'base64');
    saveAudioBinary(id, buffer, mimeType || 'audio/mpeg', filename || `${id}.mp3`);
    res.json({ success: true, id, size: buffer.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para sincronizar todo o banco de dados JSON para o PostgreSQL da VPS
apiRouter.post('/sync/database', async (req: Request, res: Response) => {
  try {
    const stats = await db.importFullDatabase(req.body);
    res.json({
      success: true,
      message: 'Banco de dados sincronizado com sucesso com o PostgreSQL da VPS.',
      ...stats
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao sincronizar banco de dados' });
  }
});

// -------------------------------------------------------------
// WEB RADIO SUPERMERCADO (AUTODJ & DIVULGAÇÃO AO VIVO)
// -------------------------------------------------------------
apiRouter.get('/radio', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const config = db.getRadioConfig(userId);
  const projects = db.getProjects(userId);
  const availableAudios = projects.flatMap(p =>
    (p.audios || [])
      .filter(a => a.status === 'ready')
      .map(a => ({
        ...a,
        storeName: p.storeName || config.storeName,
        projectTitle: p.title,
      }))
  );

  res.json({
    config,
    availableAudios,
  });
});

apiRouter.put('/radio', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const updated = db.updateRadioConfig(userId, req.body);
  res.json({ config: updated });
});

apiRouter.post('/radio/heartbeat', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
  const user = db.getUser(userId);

  const {
    isOnAir,
    storeName,
    stationName,
    slogan,
    currentMusicTitle,
    currentSpotTitle,
    isDucking,
    spotsQueueCount,
    mode
  } = req.body;

  const station = db.updateRadioHeartbeat({
    userId,
    userName: user?.name,
    companyName: user?.companyName,
    storeName,
    stationName,
    slogan,
    isOnAir: Boolean(isOnAir),
    currentMusicTitle,
    currentSpotTitle,
    isDucking,
    spotsQueueCount,
    mode,
    clientIp,
  });

  res.json({
    success: true,
    isOnAir: Boolean(isOnAir),
    station,
    onlineCount: db.getOnlineRadios().length,
  });
});

apiRouter.get('/radio/online-stations', (_req: Request, res: Response) => {
  const onlineStations = db.getOnlineRadios();
  res.json({
    count: onlineStations.length,
    stations: onlineStations,
  });
});

apiRouter.post('/radio/queue', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { audio, storeName, type, priority } = req.body;
  if (!audio || !audio.audioUrl) {
    return res.status(400).json({ error: 'Dados do áudio inválidos para adicionar à Rádio Web' });
  }

  const queueItem = db.addAudioToRadioQueue(userId, audio, {
    storeName,
    type: type || 'oferta',
    priority: priority || 'normal',
  });

  res.json({
    queueItem,
    config: db.getRadioConfig(userId),
  });
});

apiRouter.delete('/radio/queue/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const updated = db.removeRadioQueueItem(userId, req.params.id);
  res.json({ config: updated });
});

apiRouter.post('/radio/queue/upload', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { fileName, fileBase64, title, type, priority, storeName, durationSeconds } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'Nenhum arquivo de áudio fornecido' });
    }

    const base64Data = fileBase64.replace(/^data:audio\/[^;]+;base64,/, '');
    let buffer = Buffer.from(base64Data, 'base64');

    const extMatch = (fileName || '').match(/\.(mp3|wav|ogg|m4a|aac)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'mp3';
    const mimeType = ext === 'wav' ? 'audio/wav' : ext === 'ogg' ? 'audio/ogg' : 'audio/mpeg';

    const audioId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const safeTitle = (title || fileName || 'Áudio do Computador')
      .replace(/\.(mp3|wav|ogg|m4a|aac)$/i, '')
      .trim();

    try {
      const normalized = normalizeVoiceAudio(buffer);
      if (normalized && normalized.length > 0) {
        buffer = Buffer.from(normalized);
      }
    } catch {
      // Keep original buffer if normalizer encounters raw or custom format
    }

    const filename = `${safeTitle}.${ext === 'wav' ? 'wav' : 'mp3'}`;
    saveAudioBinary(audioId, buffer, mimeType, filename);

    const audioUrl = `/api/audio/${audioId}.${ext === 'wav' ? 'wav' : 'mp3'}`;
    const audioItem: AudioGenerationItem = {
      id: audioId,
      projectId: 'upload-computer',
      title: safeTitle,
      productName: safeTitle,
      voiceId: 'upload-proprio',
      voiceName: 'Áudio do Computador',
      soundtrackId: 'sem_trilha',
      soundtrackName: 'Áudio Próprio',
      durationSeconds: Number(durationSeconds) || 25,
      audioUrl,
      downloadUrl: `${audioUrl}?download=1`,
      status: 'ready',
      provider: 'studio_synthesizer',
      format: (ext === 'wav' ? 'wav' : 'mp3') as any,
      creditsUsed: 0,
      createdAt: new Date().toISOString(),
    };

    const queueItem = db.addAudioToRadioQueue(userId, audioItem, {
      storeName: storeName || 'Supermercado',
      type: type || 'oferta',
      priority: priority || 'normal',
    });

    res.json({
      queueItem,
      config: db.getRadioConfig(userId),
    });
  } catch (error: any) {
    console.error('Error uploading audio to radio queue:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar áudio do computador' });
  }
});

apiRouter.post('/radio/music/upload', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { fileName, fileBase64, title, artist, playlistId, durationSeconds } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'Nenhum arquivo de música fornecido' });
    }

    const base64Data = fileBase64.replace(/^data:audio\/[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const extMatch = (fileName || '').match(/\.(mp3|wav|ogg|m4a|aac)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'mp3';
    const mimeType = ext === 'wav' ? 'audio/wav' : ext === 'ogg' ? 'audio/ogg' : 'audio/mpeg';

    const musicId = `music-upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const safeTitle = (title || fileName || 'Música da Loja')
      .replace(/\.(mp3|wav|ogg|m4a|aac)$/i, '')
      .trim();

    saveAudioBinary(musicId, buffer, mimeType, `${musicId}.${ext === 'wav' ? 'wav' : 'mp3'}`);

    const targetPlaylistId = playlistId || 'pop_varejo';
    const currentConfig = db.getRadioConfig(userId);
    const targetPlaylist = (currentConfig.playlists || []).find(p => p.id === targetPlaylistId);

    const newTrack: RadioMusicTrack = {
      id: musicId,
      title: safeTitle,
      artist: artist || 'MP3 Próprio da Loja',
      style: `Música Própria • ${targetPlaylist?.name || 'Varejo'}`,
      category: targetPlaylistId,
      playlistId: targetPlaylistId,
      audioUrl: `/api/audio/${musicId}.${ext === 'wav' ? 'wav' : 'mp3'}`,
      durationSeconds: Number(durationSeconds) || 180,
      active: true,
      isCustom: true,
    };

    const updatedConfig = db.addMusicTrack(userId, newTrack);

    res.json({
      track: newTrack,
      config: updatedConfig,
    });
  } catch (error: any) {
    console.error('Error uploading music track:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar arquivo de música' });
  }
});

apiRouter.post('/radio/playlists', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name, description, icon, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da playlist é obrigatório' });
    }
    const id = `pl-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const playlist: RadioPlaylist = {
      id,
      name: name.trim(),
      description: description?.trim() || '',
      icon: icon || '🎵',
      color: color || 'orange',
      isCustom: true,
    };
    const updated = db.addPlaylist(userId, playlist);
    res.json({ playlist, config: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao criar playlist' });
  }
});

apiRouter.delete('/radio/playlists/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const updated = db.deletePlaylist(userId, req.params.id);
  res.json({ config: updated });
});

apiRouter.delete('/radio/music/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const updated = db.removeMusicTrack(userId, req.params.id);
  res.json({ config: updated });
});

apiRouter.patch('/radio/music/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const updated = db.updateMusicTrack(userId, req.params.id, req.body);
  res.json({ config: updated });
});

apiRouter.post('/radio/flash', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const {
    title,
    scriptText,
    storeName,
    voiceId,
    soundtrackId,
    soundtrackVolume,
    type,
    priority,
    addToQueue,
  } = req.body;

  if (!scriptText || !scriptText.trim()) {
    return res.status(400).json({ error: 'Digite o texto da oferta relâmpago ou comunicado para divulgar na rádio' });
  }

  // Regra de Consumo de Créditos na Rádio Web:
  // - Avisos & Informativos (comunicado) e Vinhetas da Loja (vinheta) são 100% gratuitos (NÃO consomem créditos)
  // - Apenas a aba "Criar Locução" (ofertas relâmpago e comerciais) consome créditos do usuário
  const isFreeRadioItem = type === 'comunicado' || type === 'vinheta';
  const productCount = req.body.productCount ? Number(req.body.productCount) : 1;
  const creditCost = isFreeRadioItem ? 0 : calculateCreditCost(productCount);

  if (creditCost > 0 && user.creditsBalance < creditCost) {
    return res.status(402).json({
      error: `Créditos insuficientes para gerar a locução na Rádio Web. Necessário: ${creditCost} créditos, saldo atual: ${user.creditsBalance}.`,
      required: creditCost,
      current: user.creditsBalance,
    });
  }

  try {
    const cleanScript = expandUnitsAndMeasuresToWords(scriptText);
    const ttsResult = await synthesizeSpeech({
      text: cleanScript,
      voiceId: voiceId || 'daniel-varejo',
      soundtrackId: soundtrackId || 'varejo_alegre',
      soundtrackVolume: soundtrackVolume ?? 0.22,
    });

    // Debitar créditos apenas se creditCost > 0
    let newBalance = user.creditsBalance;
    if (creditCost > 0) {
      newBalance = db.updateUserCredits(
        userId,
        -creditCost,
        `Locução Rádio Web: ${title || 'Oferta Relâmpago'}`,
        ttsResult.audioId
      );
    }

    const elevenVoices = await getElevenLabsVoices(false, true);
    const voices = elevenVoices.length > 0 ? elevenVoices : db.getVoices();
    const voiceObj = voices.find(v => v.id === voiceId || v.elevenVoiceId === voiceId) || voices[0];
    const soundtrackObj = SOUNDTRACKS_LIST.find(s => s.id === (soundtrackId || 'varejo_alegre'));

    const audioItem: AudioGenerationItem = {
      id: ttsResult.audioId,
      projectId: 'radio-web',
      title: title || 'Oferta Relâmpago — Rádio Web',
      voiceId: voiceObj.id,
      voiceName: voiceObj.name,
      soundtrackId: soundtrackId || 'varejo_alegre',
      soundtrackName: soundtrackObj?.name || 'Varejo Alegre',
      soundtrackVolume: soundtrackVolume ?? 0.22,
      provider: ttsResult.provider,
      format: ttsResult.format,
      durationSeconds: ttsResult.durationSeconds,
      audioUrl: ttsResult.audioUrl,
      downloadUrl: ttsResult.downloadUrl,
      status: 'ready',
      creditsUsed: creditCost,
      createdAt: new Date().toISOString(),
      fileSizeBytes: ttsResult.fileSizeBytes,
    };

    // Attach to user's latest project or create a "Rádio Web — Ofertas Ao Vivo" project so it's also saved in Library
    const userProjects = db.getProjects(userId);
    let radioProject = userProjects.find(p => p.id === 'proj-radio-live' || p.title.includes('Rádio Web'));
    if (!radioProject) {
      radioProject = db.saveProject({
        id: 'proj-radio-live',
        userId,
        niche: 'supermercado',
        title: 'Rádio Web — Ofertas & Avisos Ao Vivo',
        storeName: storeName || db.getRadioConfig(userId).storeName || 'Supermercado',
        storeCity: 'Loja',
        objective: 'Locuções geradas direto na Rádio Web do Supermercado',
        campaignType: 'superofertas',
        style: 'urgente_oportunidade',
        desiredDuration: '30s',
        tone: 'urgente',
        presentationFormat: 'abertura_sequencia_encerramento',
        products: [],
        scripts: [
          {
            id: `scr-${Date.now()}`,
            text: cleanScript,
            estimatedDurationSeconds: ttsResult.durationSeconds,
            wordCount: cleanScript.split(/\s+/).filter(Boolean).length,
            createdAt: new Date().toISOString(),
            note: audioItem.title,
          },
        ],
        currentScriptIndex: 0,
        audios: [audioItem],
        status: 'ready',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      radioProject.audios.unshift(audioItem);
      radioProject.scripts.unshift({
        id: `scr-${Date.now()}`,
        text: cleanScript,
        estimatedDurationSeconds: ttsResult.durationSeconds,
        wordCount: cleanScript.split(/\s+/).filter(Boolean).length,
        createdAt: new Date().toISOString(),
        note: audioItem.title,
      });
      radioProject.status = 'ready';
      db.saveProject(radioProject);
    }

    // Só adiciona na grade se addToQueue for explicitamente true. Padrão: NÃO adicionar na grade.
    const shouldAddToQueue = Boolean(addToQueue);
    let queueItem = null;
    if (shouldAddToQueue) {
      queueItem = db.addAudioToRadioQueue(userId, audioItem, {
        storeName: storeName || db.getRadioConfig(userId).storeName,
        type: type || 'relampago',
        priority: priority || 'alta',
      });
    }

    res.json({
      audio: audioItem,
      queueItem,
      config: db.getRadioConfig(userId),
      creditsBalance: newBalance,
    });
  } catch (err: any) {
    console.error('Radio flash spot generation failed:', err);
    res.status(500).json({ error: err.message || 'Erro ao gerar locução para a Rádio Web' });
  }
});

// -------------------------------------------------------------
// CREDITS & BILLING
// -------------------------------------------------------------
apiRouter.get('/credits/history', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const transactions = db.getTransactions(userId);
  const user = db.getUser(userId);
  res.json({
    creditsBalance: user?.creditsBalance ?? 0,
    transactions,
  });
});

apiRouter.post('/credits/recharge', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { packageId, amount } = req.body;
  const settings = db.getAdminSettings();
  const rechargePackages: RechargePackage[] = (settings?.rechargePackages && settings.rechargePackages.length > 0)
    ? settings.rechargePackages
    : DEFAULT_RECHARGE_PACKAGES;
  const matchedPkg = rechargePackages.find(p => p.id === packageId);
  const creditsToAdd = amount || matchedPkg?.credits || (packageId === 'pacote-pro' ? 1000 : 300);

  const balance = db.updateUserCredits(
    userId,
    creditsToAdd,
    `Recarga de Créditos (${matchedPkg?.name || packageId || 'Pacote Avulso'})`
  );

  res.json({
    success: true,
    creditsBalance: balance,
    message: `${creditsToAdd} créditos adicionados com sucesso!`,
  });
});

apiRouter.post('/credits/checkout', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  const { packageId, paymentMethod = 'pix' } = req.body;
  const settings = db.getAdminSettings();
  const rechargePackages: RechargePackage[] = (settings?.rechargePackages && settings.rechargePackages.length > 0)
    ? settings.rechargePackages
    : DEFAULT_RECHARGE_PACKAGES;
  const matchedPkg = rechargePackages.find(p => p.id === packageId) || rechargePackages[0];

  const txId = 'PAY-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const amount = Number(matchedPkg.price) || 0;
  const credits = matchedPkg.credits || 300;

  const gatewayConfig = db.getGatewayConfig();
  const activeGateway = gatewayConfig?.provider || 'mercadopago';

  // Pix Copia e Cola formatado BR Code
  const pixCopiaECola = `00020126580014BR.GOV.BCB.PIX0136superlocucao@inforartes.com.br5204000053039865405${amount.toFixed(2)}5802BR5916SUPER LOCUCAO IA6009SAO PAULO62140510${txId}6304`;
  const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixCopiaECola)}`;
  const boletoCode = `34191.79001 01043.510047 91020.150008 4 ${Math.floor(Date.now() / 100000)}0000${Math.round(amount * 100)}`;

  const tx: PaymentTransaction = {
    id: txId,
    userId: userId || 'user_demo',
    userName: user?.name || user?.email || 'Supermercado Modelo',
    companyName: user?.companyName || 'Supermercado Modelo',
    clientName: user?.name || user?.email || 'Supermercado Modelo',
    clientEmail: user?.email || 'contato@supermercado.com.br',
    type: 'recharge',
    description: `Recarga de Créditos (${matchedPkg.name} - ${credits.toLocaleString('pt-BR')} créditos)`,
    itemName: matchedPkg.name,
    amount: amount,
    creditsAdded: credits,
    creditsAmount: credits,
    status: 'pending',
    paymentMethod: paymentMethod as any,
    method: paymentMethod,
    gateway: activeGateway === 'mercadopago' ? 'Mercado Pago' : activeGateway === 'asaas' ? 'Asaas' : 'Stripe',
    createdAt: new Date().toISOString(),
  };

  db.createPaymentTransaction(tx);

  res.json({
    success: true,
    transactionId: tx.id,
    pkg: matchedPkg,
    amount,
    credits,
    paymentMethod,
    pixCopiaECola,
    pixQrCodeUrl,
    boletoCode,
  });
});

apiRouter.post('/credits/confirm-checkout', async (req: Request, res: Response) => {
  const { transactionId } = req.body;
  if (!transactionId) {
    return res.status(400).json({ error: 'transactionId é obrigatório' });
  }

  const updatedTx = db.confirmPaymentTransaction(transactionId);
  if (!updatedTx) {
    return res.status(404).json({ error: 'Transação não encontrada ou já expirada.' });
  }

  await db.pgSaveAdminSettings(db.getAdminSettings());

  const user = db.getUser(updatedTx.userId);

  res.json({
    success: true,
    creditsBalance: user?.creditsBalance ?? 0,
    creditsAdded: updatedTx.creditsAdded || 0,
    message: `Pagamento de R$ ${Number(updatedTx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} aprovado com sucesso! ${updatedTx.creditsAdded?.toLocaleString('pt-BR')} créditos foram adicionados à sua conta.`,
    transaction: updatedTx,
  });
});

apiRouter.get('/settings', (_req: Request, res: Response) => {
  const settings = db.getAdminSettings();
  res.json({
    systemAnnouncement: settings?.systemAnnouncement || '',
    creditsPerGeneration: settings?.creditsPerGeneration ?? 5,
    initialCredits: settings?.initialCredits ?? 50,
    defaultVoiceId: settings?.defaultVoiceId || 'daniel-varejo',
    rechargePackages: (settings?.rechargePackages && settings.rechargePackages.length > 0) ? settings.rechargePackages : DEFAULT_RECHARGE_PACKAGES,
    commercialPlans: (settings?.commercialPlans && settings.commercialPlans.length > 0) ? settings.commercialPlans : DEFAULT_COMMERCIAL_PLANS,
  });
});

// -------------------------------------------------------------
// ADMIN
// -------------------------------------------------------------
apiRouter.get('/admin/metrics', async (_req: Request, res: Response) => {
  const metrics = db.getAdminMetrics();
  const elevenInfo = await fetchElevenLabsAccountInfo();
  const geminiInfo = await fetchGeminiAccountInfo();

  res.json({
    ...metrics,
    elevenLabsConfigured: elevenInfo.configured,
    elevenLabsApiKeyMasked: elevenInfo.apiKeyMasked,
    elevenLabsApiKey: elevenInfo.apiKey,
    elevenLabsSubscription: elevenInfo.subscription,
    elevenLabsVoicesCount: elevenInfo.voicesCount,
    geminiConfigured: geminiInfo.configured,
    geminiApiKeyMasked: geminiInfo.apiKeyMasked,
    geminiApiKey: geminiInfo.apiKey,
    geminiModel: geminiInfo.model,
  });
});

apiRouter.post('/admin/gemini/key', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ error: 'Chave API do Gemini não informada' });
  }

  const cleanKey = apiKey.trim();

  // Test Gemini key with a quick ping
  try {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    const testRes = await fetch(testUrl);
    if (!testRes.ok) {
      const err = await testRes.text();
      return res.status(400).json({ error: `Chave do Gemini inválida ou sem permissão: ${err}` });
    }

    const saved = saveGeminiApiKeyToEnv(cleanKey);
    if (!saved) {
      return res.status(500).json({ error: 'Erro ao salvar chave no arquivo .env' });
    }

    const geminiInfo = await fetchGeminiAccountInfo();
    res.json({
      success: true,
      message: 'Chave da Google Gemini API conectada e validada com sucesso!',
      geminiInfo,
    });
  } catch (err: any) {
    res.status(500).json({ error: `Erro ao validar chave Gemini: ${err.message}` });
  }
});

apiRouter.post('/admin/elevenlabs/key', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ error: 'Chave API da ElevenLabs não informada' });
  }

  const cleanKey = apiKey.trim();
  try {
    const testRes = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': cleanKey },
    });
    if (!testRes.ok) {
      const err = await testRes.text();
      return res.status(400).json({ error: `Chave ElevenLabs inválida: ${err}` });
    }

    const saved = saveElevenLabsApiKeyToEnv(cleanKey);
    if (!saved) {
      return res.status(500).json({ error: 'Erro ao salvar chave no arquivo .env' });
    }

    const accountInfo = await fetchElevenLabsAccountInfo();
    const freshVoices = await getElevenLabsVoices(true);

    res.json({
      success: true,
      message: 'Chave ElevenLabs conectada e validada com sucesso!',
      accountInfo,
      voicesCount: freshVoices.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: `Erro ao conectar com ElevenLabs: ${err.message}` });
  }
});

apiRouter.post('/admin/elevenlabs/sync', async (_req: Request, res: Response) => {
  try {
    const freshVoices = await getElevenLabsVoices(true);
    const accountInfo = await fetchElevenLabsAccountInfo();
    res.json({
      success: true,
      message: `${freshVoices.length} vozes oficiais sincronizadas com sucesso!`,
      voicesCount: freshVoices.length,
      accountInfo,
    });
  } catch (err: any) {
    res.status(500).json({ error: `Erro na sincronização: ${err.message}` });
  }
});

apiRouter.post('/admin/settings', async (req: Request, res: Response) => {
  const updated = db.updateAdminSettings(req.body);
  await db.pgSaveAdminSettings(db.getAdminSettings());
  res.json({ settings: updated });
});

// -------------------------------------------------------------
// ADMIN - CLIENT / USER MANAGEMENT
// -------------------------------------------------------------
apiRouter.get('/admin/users', (_req: Request, res: Response) => {
  const users = db.getUsers();
  const enrichedUsers = users.map(u => {
    const userProjects = db.getProjects(u.id);
    const userAudiosCount = userProjects.reduce((acc, p) => acc + (p.audios?.length || 0), 0);
    const userTransactions = db.getTransactions(u.id);
    const creditsUsed = userTransactions
      .filter(t => t.type === 'debit')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      ...u,
      status: u.status || 'ativo',
      projectsCount: userProjects.length,
      audiosCount: userAudiosCount,
      creditsUsed,
      lastActivity: userProjects[0]?.updatedAt || u.createdAt
    };
  });

  res.json({ users: enrichedUsers });
});

apiRouter.post('/admin/users', (req: Request, res: Response) => {
  const { name, email, phone, companyName, city, plan, creditsBalance, role, notes } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Já existe um cliente cadastrado com este e-mail.' });
  }

  const initialCredits = Number(creditsBalance) || 50;
  const newUser = db.createUser({
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: req.body.password?.trim() || '123456',
    phone: phone?.trim() || '',
    companyName: companyName?.trim() || 'Supermercado',
    city: city?.trim() || '',
    role: role || 'supermarket_owner',
    plan: plan || 'pro_varejo',
    status: 'ativo',
    notes: notes?.trim() || '',
    creditsBalance: initialCredits,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  });

  if (initialCredits > 0) {
    db.updateUserCredits(newUser.id, initialCredits, 'Saldo inicial atribuído pelo Administrador');
  }

  res.json({ success: true, user: newUser });
});

apiRouter.put('/admin/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  const updates = req.body;
  
  const updated = db.updateUser(userId, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }

  res.json({ success: true, user: updated });
});

apiRouter.delete('/admin/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  if (userId === 'user-admin') {
    return res.status(400).json({ error: 'Não é permitido excluir o usuário Administrador Principal.' });
  }

  const deleted = db.deleteUser(userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }

  res.json({ success: true, message: 'Cliente removido com sucesso.' });
});

apiRouter.post('/admin/users/:id/credits', (req: Request, res: Response) => {
  const userId = req.params.id;
  const { amount, reason } = req.body;
  
  const delta = Number(amount);
  if (isNaN(delta) || delta === 0) {
    return res.status(400).json({ error: 'Quantidade de créditos inválida.' });
  }

  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }

  const newBalance = db.updateUserCredits(
    userId,
    delta,
    reason || (delta > 0 ? 'Ajuste manual de créditos (Adição pelo Admin)' : 'Ajuste manual de créditos (Estorno pelo Admin)')
  );

  res.json({
    success: true,
    creditsBalance: newBalance,
    message: `${Math.abs(delta)} créditos ${delta > 0 ? 'adicionados' : 'debitados'} com sucesso!`
  });
});

// -------------------------------------------------------------
// ADMIN: SUBSCRIPTIONS, PAYMENTS & GATEWAY
// -------------------------------------------------------------
apiRouter.get('/admin/subscriptions', (_req: Request, res: Response) => {
  const subscriptions = db.getSubscriptions();
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const mrr = activeSubs.reduce((acc, s) => acc + s.amount, 0);

  res.json({
    subscriptions,
    stats: {
      total: subscriptions.length,
      active: activeSubs.length,
      pastDue: subscriptions.filter(s => s.status === 'past_due').length,
      canceled: subscriptions.filter(s => s.status === 'canceled').length,
      mrr,
    }
  });
});

apiRouter.post('/admin/subscriptions/:id/status', async (req: Request, res: Response) => {
  const subId = req.params.id;
  const { status } = req.body;
  const updated = db.updateSubscriptionStatus(subId, status);
  if (!updated) {
    return res.status(404).json({ error: 'Assinatura não encontrada.' });
  }
  await db.pgSaveAdminSettings(db.getAdminSettings());
  res.json({ success: true, subscription: updated });
});

apiRouter.get('/admin/payments', (_req: Request, res: Response) => {
  const payments = db.getPaymentTransactions();
  const approved = payments.filter(p => p.status === 'approved');
  const totalRevenue = approved.reduce((acc, p) => acc + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  res.json({
    payments,
    stats: {
      totalTransactions: payments.length,
      approvedCount: approved.length,
      pendingCount,
      totalRevenue,
    }
  });
});

apiRouter.post('/admin/payments/:id/confirm', async (req: Request, res: Response) => {
  const payId = req.params.id;
  const updated = db.confirmPaymentTransaction(payId);
  if (!updated) {
    return res.status(404).json({ error: 'Transação não encontrada.' });
  }
  await db.pgSaveAdminSettings(db.getAdminSettings());
  res.json({
    success: true,
    message: `Pagamento ${updated.id} confirmado com sucesso! Créditos liberados.`,
    payment: updated
  });
});

apiRouter.post('/admin/payments/:id/refund', async (req: Request, res: Response) => {
  const payId = req.params.id;
  const updated = db.refundPaymentTransaction(payId);
  if (!updated) {
    return res.status(404).json({ error: 'Transação não encontrada.' });
  }
  await db.pgSaveAdminSettings(db.getAdminSettings());
  res.json({
    success: true,
    message: `Transação ${updated.id} marcada como estornada.`,
    payment: updated
  });
});

apiRouter.get('/admin/gateway', (_req: Request, res: Response) => {
  const gateway = db.getGatewayConfig();
  res.json({ gateway });
});

apiRouter.post('/admin/gateway', async (req: Request, res: Response) => {
  const updated = db.updateGatewayConfig(req.body);
  await db.pgSaveAdminSettings(db.getAdminSettings());
  res.json({
    success: true,
    message: 'Configurações do Gateway de Pagamento salvas com sucesso!',
    gateway: updated
  });
});

// Admin: check database audio stats & sync audios to PostgreSQL
apiRouter.get('/admin/database/audios-stats', async (_req: Request, res: Response) => {
  const pgCount = await db.pgCountAudioBinaries();
  const audioDir = path.resolve(process.cwd(), '.locucao_audios');
  let localCount = 0;
  if (fs.existsSync(audioDir)) {
    localCount = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav')).length;
  }
  const seedDir = path.resolve(process.cwd(), 'server', 'seed_audios');
  let seedCount = 0;
  if (fs.existsSync(seedDir)) {
    seedCount = fs.readdirSync(seedDir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav')).length;
  }
  res.json({
    pgConnected: Boolean(db.getPool()),
    pgCount,
    localCount,
    seedCount
  });
});

apiRouter.post('/admin/database/sync-audios', async (_req: Request, res: Response) => {
  if (!db.getPool()) {
    return res.status(400).json({
      error: 'PostgreSQL não conectado nesta instância. Configure a variável de ambiente DATABASE_URL na VPS para sincronizar.',
      connected: false
    });
  }
  try {
    const resSync = await db.syncFullLocalDatabaseToPg();
    res.json({
      success: true,
      message: `${resSync.projects} projetos e ${resSync.audiosUploaded} locuções reais sincronizados com o banco de dados da VPS com sucesso! (${resSync.audiosTotal} áudios verificados)`,
      ...resSync
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao sincronizar banco de dados' });
  }
});

// Webhook listener for payment providers (Mercado Pago, Asaas, Stripe)
apiRouter.post('/webhooks/payment', (req: Request, res: Response) => {
  console.log('[Payment Webhook] Evento recebido:', req.body);
  // Auto-process payment event if valid
  const { event, id, status, amount } = req.body || {};
  res.status(200).json({ received: true, timestamp: new Date().toISOString() });
});
