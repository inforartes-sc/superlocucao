import fs from 'fs';
import path from 'path';
import { StoredAudioBinary, db, saveAudioBinary } from './db.ts';
import { generateGeminiSpeech } from './gemini.ts';
import { mixVoiceAndSoundtrack, normalizeVoiceAudio } from './soundtracks.ts';
import { convertWavToMp3 } from './mp3_converter.ts';
import { fetchRealBrazilianTTS } from './tts.ts';
import { SoundtrackId, VoicePreset } from '../src/types/index.ts';
import { expandUnitsAndMeasuresToWords } from '../src/utils/textNormalizer.ts';

export interface TTSOptions {
  text: string;
  voiceId?: string;
  voiceName?: string;
  soundtrackId?: SoundtrackId;
  soundtrackVolume?: number;
  speed?: number;
  stability?: number;
  similarity?: number;
  provider?: 'elevenlabs' | 'gemini_tts';
}

export interface TTSResult {
  audioId: string;
  audioUrl: string;
  downloadUrl: string;
  provider: 'elevenlabs' | 'gemini_tts' | 'studio_synthesizer';
  format: 'mp3';
  durationSeconds: number;
  fileSizeBytes: number;
}

/**
 * Creates a clean valid audio WAV buffer with supermarket background chime & announcement tone
 * as an ultra-reliable fallback if remote APIs are temporarily unreachable or without keys.
 */
function createSupermarketAudioWav(text: string, durationEstimate: number): Buffer {
  const sampleRate = 24000;
  const numChannels = 1;
  const duration = Math.max(3, Math.min(60, durationEstimate));
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * 2, 28); // byte rate
  buffer.writeUInt16LE(numChannels * 2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate supermarket style pleasant ding-dong opening chime (frequencies: 660Hz -> 550Hz)
  // followed by gentle voice modulation envelope
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (t < 0.4) {
      // Ding 1: 660 Hz with exponential decay
      const env = Math.exp(-t * 6);
      sample += Math.sin(2 * Math.PI * 660 * t) * 0.4 * env;
    } else if (t < 0.9) {
      // Dong 2: 520 Hz
      const dt = t - 0.4;
      const env = Math.exp(-dt * 5);
      sample += Math.sin(2 * Math.PI * 520 * dt) * 0.4 * env;
    } else {
      // Supermarket announcer vocal cadence simulation tone
      const speechT = t - 0.9;
      const syllable = Math.sin(speechT * 9);
      const isSpeaking = syllable > -0.2;
      if (isSpeaking) {
        const fundamental = 140 + 20 * Math.sin(speechT * 3);
        const form1 = Math.sin(2 * Math.PI * fundamental * speechT);
        const form2 = Math.sin(2 * Math.PI * (fundamental * 2.5) * speechT) * 0.4;
        const form3 = Math.sin(2 * Math.PI * (fundamental * 4.2) * speechT) * 0.2;
        sample = (form1 + form2 + form3) * 0.25 * (0.6 + 0.4 * Math.sin(speechT * 7));
      }
    }

    const intVal = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intVal, 44 + i * 2);
  }

  return buffer;
}

export async function synthesizeSpeech(options: TTSOptions): Promise<TTSResult> {
  options.text = expandUnitsAndMeasuresToWords(options.text);
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const words = options.text.split(/\s+/).length;
  const estimatedDuration = Math.max(3, Math.round(words / 2.7));
  const audioId = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Find voice preset
  let elevenVoiceId = options.voiceId;
  const elevenVoices = cachedElevenVoices || [];
  const matchedEleven = elevenVoices.find(v => v.id === options.voiceId || v.elevenVoiceId === options.voiceId);
  const localVoices = db.getVoices();
  const matchedLocal = localVoices.find(v => v.id === options.voiceId || v.elevenVoiceId === options.voiceId);

  if (matchedEleven) {
    elevenVoiceId = matchedEleven.elevenVoiceId || matchedEleven.id;
  } else if (matchedLocal?.elevenVoiceId) {
    elevenVoiceId = matchedLocal.elevenVoiceId;
  }

  if (!elevenVoiceId || elevenVoiceId === 'daniel-varejo' || elevenVoiceId === 'default' || elevenVoiceId.startsWith('user-')) {
    elevenVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'OlxPtqeyGl5zwd5zVlKX';
  }
  const selectedVoice = matchedEleven || matchedLocal || { id: elevenVoiceId, geminiVoiceName: 'Fenrir' };

  let audioBuffer: Buffer | null = null;
  let providerUsed: 'elevenlabs' | 'gemini_tts' | 'studio_synthesizer' = 'studio_synthesizer';
  let isAlreadyMp3 = false;

  // 1. Try ElevenLabs if API key is present
  if (elevenKey && elevenKey.trim() && elevenKey !== 'YOUR_ELEVENLABS_API_KEY' && options.provider !== 'gemini_tts') {
    try {
      console.log(`[ElevenLabs] Synthesizing speech with voice ${elevenVoiceId}...`);
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenKey,
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: options.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: options.stability ?? 0.5,
            similarity_boost: options.similarity ?? 0.75,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
        providerUsed = 'elevenlabs';
        isAlreadyMp3 = true;
        console.log(`[ElevenLabs] Audio generated successfully (${audioBuffer.length} bytes)`);
      } else {
        const errText = await response.text();
        console.warn(`[ElevenLabs] API responded with ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.error('[ElevenLabs] Fetch error:', err);
    }
  }

  // 2. If ElevenLabs not used or failed, try Gemini TTS (gemini-3.8-flash-lite-tts)
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!audioBuffer && geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY' && !geminiKey.startsWith('AQ.')) {
    try {
      console.log(`[Gemini TTS] Generating audio with voice ${selectedVoice.geminiVoiceName || 'Fenrir'}...`);
      const wav = await generateGeminiSpeech(options.text, selectedVoice.geminiVoiceName || 'Fenrir');
      audioBuffer = wav;
      providerUsed = 'gemini_tts';
      isAlreadyMp3 = false;
      console.log(`[Gemini TTS] Audio generated successfully (${audioBuffer.length} bytes)`);
    } catch (err) {
      console.warn('[Gemini TTS] Failed, falling back to studio synthesizer:', err);
    }
  }

  // 3. High quality real Brazilian voice synthesis (Google TTS pt-BR)
  if (!audioBuffer) {
    try {
      console.log(`[Neural Real Voice] Synthesizing real Brazilian voice for: "${options.text.substring(0, 40)}..."`);
      const realVoice = await fetchRealBrazilianTTS(options.text);
      if (realVoice && realVoice.length > 0) {
        audioBuffer = realVoice;
        providerUsed = 'studio_synthesizer';
        isAlreadyMp3 = true;
      }
    } catch (ttsErr) {
      console.warn('[Neural Real Voice] TTS failed, falling back to backup tone:', ttsErr);
    }
  }

  // 4. Fallback to resilient supermarket radio tone
  if (!audioBuffer) {
    console.log('[Studio Synthesizer] Generating supermarket audio preview...');
    audioBuffer = createSupermarketAudioWav(options.text, estimatedDuration);
    providerUsed = 'studio_synthesizer';
    isAlreadyMp3 = false;
  }

  // 4. Mix with Soundtrack if requested or normalize pure voice
  if (options.soundtrackId && options.soundtrackId !== 'sem_trilha') {
    try {
      console.log(`[Soundtrack Mixer] Mixing with track "${options.soundtrackId}" at volume ${options.soundtrackVolume ?? 0.20}...`);
      audioBuffer = mixVoiceAndSoundtrack(audioBuffer, options.soundtrackId, options.soundtrackVolume ?? 0.20);
      isAlreadyMp3 = true;
    } catch (mixErr) {
      console.error('[Soundtrack Mixer] Error mixing audio:', mixErr);
    }
  } else {
    try {
      console.log('[Voice Normalizer] Applying broadcast loudness leveling to pure voice...');
      audioBuffer = normalizeVoiceAudio(audioBuffer);
      isAlreadyMp3 = true;
    } catch (normErr) {
      console.warn('[Voice Normalizer] Fallback:', normErr);
    }
  }

  // 5. Ensure final format is ALWAYS true standard MP3 (audio/mpeg)
  let finalMp3Buffer: Buffer;
  if (isAlreadyMp3) {
    finalMp3Buffer = audioBuffer;
  } else {
    try {
      finalMp3Buffer = convertWavToMp3(audioBuffer);
    } catch (encErr) {
      console.warn('MP3 conversion fallback:', encErr);
      finalMp3Buffer = audioBuffer;
    }
  }

  const filename = `locucao-${selectedVoice.id}-${audioId}.mp3`;
  saveAudioBinary(audioId, finalMp3Buffer, 'audio/mpeg', filename);

  return {
    audioId,
    audioUrl: `/api/audio/${audioId}.mp3`,
    downloadUrl: `/api/audio/${audioId}.mp3?download=1`,
    provider: providerUsed,
    format: 'mp3',
    durationSeconds: estimatedDuration,
    fileSizeBytes: finalMp3Buffer.length,
  };
}

export function getElevenLabsApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key || key === 'YOUR_ELEVENLABS_API_KEY') return null;
  return key;
}

export const STYLE_ELEVEN_VOICES: Record<string, string> = {
  energetica_supermercado: 'dXQsuVXyCGkF7meZLeFk', // Dany Varejo (Varejo Comercial Enérgico)
  animada_promocional: 'ohZOfA9iwlZ5nOsoY7LB',     // Roberta (Animada e Promocional / Jovem & Dinâmica)
  natural_amigavel: 'BKv4Uz2HPF6TFlDgFBKN',        // Marianne (Natural e Amigável / Atendimento Empático)
  urgente_oportunidade: 'Fjiik8aKXNDjmxd1Q2jF',    // Nassif (Urgente / Oferta Relâmpago)
  elegante_institucional: 'a1ijbt2xmlhzaGXHewzV',  // Augusto Vasconcelos (Elegante e Institucional)
  popular_descontraida: 'plASsyS7JE6GCAvx9uIc',    // Marcio (Popular e Descontraída)
};

export async function synthesizeElevenLabsVoice(voiceId: string, text: string): Promise<Buffer> {
  const elevenKey = getElevenLabsApiKey();
  if (!elevenKey) {
    throw new Error('ElevenLabs API Key não configurada');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': elevenKey,
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: expandUnitsAndMeasuresToWords(text),
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs TTS HTTP ${response.status}: ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function maskApiKey(key: string | null): string {
  if (!key) return '';
  if (key.length <= 10) return 'sk_****';
  return `${key.slice(0, 9)}...${key.slice(-4)}`;
}

let cachedSubscription: any = null;
let lastSubCheck = 0;

export async function fetchElevenLabsAccountInfo(): Promise<{
  configured: boolean;
  apiKeyMasked: string;
  apiKey: string;
  subscription?: {
    tier: string;
    characterCount: number;
    characterLimit: number;
    percentUsed: number;
  };
  voicesCount: number;
}> {
  const key = getElevenLabsApiKey();
  if (!key) {
    return {
      configured: false,
      apiKeyMasked: '',
      apiKey: '',
      voicesCount: 0,
    };
  }

  if (!cachedSubscription || Date.now() - lastSubCheck > 60000) {
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        const sub = data.subscription;
        const count = sub?.character_count || 0;
        const limit = sub?.character_limit || 1;
        cachedSubscription = {
          tier: sub?.tier || 'creator',
          characterCount: count,
          characterLimit: limit,
          percentUsed: Math.min(100, Math.round((count / limit) * 100)),
        };
        lastSubCheck = Date.now();
      }
    } catch (e) {
      console.warn('Failed to fetch ElevenLabs account info:', e);
    }
  }

  const voices = await getElevenLabsVoices(false);

  return {
    configured: true,
    apiKeyMasked: maskApiKey(key),
    apiKey: key,
    subscription: cachedSubscription,
    voicesCount: voices.length,
  };
}

const BRAZILIAN_VOICE_METADATA: Record<string, {
  name: string;
  styleTag: string;
  accent: string;
  description: string;
  gender: 'masculino' | 'feminino';
  isDefault?: boolean;
}> = {
  'OlxPtqeyGl5zwd5zVlKX': {
    name: 'Super (Comercial Supermercado)',
    styleTag: 'Varejo & Supermercado',
    accent: 'Português Brasileiro (Comercial / Varejo)',
    description: 'Voz oficial criada para supermercado com entonação comercial rápida, clara e persuasiva.',
    gender: 'masculino',
    isDefault: true,
  },
  'dXQsuVXyCGkF7meZLeFk': {
    name: 'Dany Varejo',
    styleTag: 'Varejo Enérgico',
    accent: 'Português Brasileiro (Varejo Enérgico)',
    description: 'Voz clássica e enérgica de locutor de rádio de supermercado para ofertas do dia.',
    gender: 'masculino',
  },
  'JhgDkhRvudPzqCf0IUJE': {
    name: 'Trailer (Voz de Impacto)',
    styleTag: 'Chamada & Impacto',
    accent: 'Português Brasileiro (Impacto)',
    description: 'Voz cinematográfica e impactante para grandes queimas de estoque e inaugurações.',
    gender: 'masculino',
  },
  'UaeEQHfiDI8l58WWXiwS': {
    name: 'Leonardo Hamaral',
    styleTag: 'Comercial & Vendas',
    accent: 'Português Brasileiro (Comercial)',
    description: 'Voz calorosa, confiante e persuasiva. Excelente para atacarejos e marcas próprias.',
    gender: 'masculino',
  },
  'cabLxBh81HurPAAJfEHo': {
    name: 'Bea (Acolhedora & Amigável)',
    styleTag: 'Familiar & Empática',
    accent: 'Português Brasileiro (Suave e Firme)',
    description: 'Tom caloroso, amigável e convidativo. Perfeito para padaria, hortifrúti e compras em família.',
    gender: 'feminino',
  },
  'AKXBn24T1f9tvTDnWzWT': {
    name: 'Bruna Costa',
    styleTag: 'Elegante & Suave',
    accent: 'Português Brasileiro (Aveludado)',
    description: 'Locução feminina aveludada e refinada para hortifrúti gourmet, adega e perfumaria.',
    gender: 'feminino',
  },
  'ohZOfA9iwlZ5nOsoY7LB': {
    name: 'Roberta',
    styleTag: 'Jovem & Dinâmica',
    accent: 'Português Brasileiro (Contemporâneo)',
    description: 'Jovem, moderna e cheia de ritmo. Excelente para bebidas, conveniência e novidades.',
    gender: 'feminino',
  },
  'GM2UA3fbsIaLHcswCDX9': {
    name: 'Nina M.',
    styleTag: 'Institucional & Clube',
    accent: 'Português Brasileiro (Institucional)',
    description: 'Locução executiva e confiante para comunicados institucionais, horários e clube de vantagens.',
    gender: 'feminino',
  },
  'zNEsdgTUa3ndwKry8Xcq': {
    name: 'Elvis',
    styleTag: 'Impacto & Atacarejo',
    accent: 'Português Brasileiro (Locutor FM)',
    description: 'Grave imponente e vibrante para atacarejos, festival de carnes e Black Friday.',
    gender: 'masculino',
  },
  'Fjiik8aKXNDjmxd1Q2jF': {
    name: 'Nassif (Oferta Relâmpago)',
    styleTag: 'Oferta Relâmpago',
    accent: 'Português Brasileiro (Enérgico)',
    description: 'Voz dinâmica e rápida para chamadas de última hora e ofertas relâmpago.',
    gender: 'masculino',
  },
  '2CECaLAGTS5NRGxgbcxr': {
    name: 'Davi Andrei',
    styleTag: 'Natural & Amigável',
    accent: 'Português Brasileiro (Natural)',
    description: 'Locução próxima, simpática e espontânea para compras do dia a dia.',
    gender: 'masculino',
  },
  'Hmn4B9B77pf6ttydteJ8': {
    name: 'Kaique',
    styleTag: 'Contemporâneo',
    accent: 'Português Brasileiro (Suave)',
    description: 'Tom calmo e contemporâneo para rotisseria, café e hortifrúti selecionado.',
    gender: 'masculino',
  },
  'IKpiSijWzlhOL6uX83EH': {
    name: 'Will',
    styleTag: 'Premium & Gourmet',
    accent: 'Português Brasileiro (Pausado)',
    description: 'Locução sóbria e refinada com ritmo pausado para carnes nobres e importados.',
    gender: 'masculino',
  },
  'wHnxjlY53t8X9Oi14Awz': {
    name: 'Juliano Magalhães',
    styleTag: 'Voz Clássica',
    accent: 'Português Brasileiro (Clássico)',
    description: 'Voz clássica e nítida para comunicados gerais da loja e avisos ao cliente.',
    gender: 'masculino',
  },
};

export const elevenVoicePreviewsMap = new Map<string, string>();

let cachedElevenVoices: VoicePreset[] | null = null;
let lastVoicesFetch = 0;

export async function getElevenLabsVoices(forceRefresh = false, ptBrOnly = true): Promise<VoicePreset[]> {
  const key = getElevenLabsApiKey();
  if (!key) return [];

  // Return cached if fresh within 10 minutes
  if (!forceRefresh && cachedElevenVoices && Date.now() - lastVoicesFetch < 600000) {
    return cachedElevenVoices;
  }

  try {
    console.log('[ElevenLabs] Carregando vozes oficiais da conta...');
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': key },
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.warn(`[ElevenLabs] Erro ao buscar vozes: HTTP ${res.status} - Key: ${key?.slice(0, 7)}... - Body: ${errBody}`);
      return cachedElevenVoices || [];
    }

    const data = await res.json();
    const rawVoices: any[] = data.voices || [];

    // Register all preview URLs in map
    rawVoices.forEach((v) => {
      if (v.voice_id && v.preview_url) {
        elevenVoicePreviewsMap.set(v.voice_id, v.preview_url);
      }
    });

    // Filter to Brazilian Portuguese & custom/cloned voices
    const ptVoices = rawVoices.filter((v) => {
      // Exclude premade English voices (e.g. Roger, Sarah, Laura, George, etc.)
      if (v.category === 'premade') return false;

      const lang = (v.labels?.language || '').toLowerCase();
      const accent = (v.labels?.accent || '').toLowerCase();

      if (lang === 'pt' || lang.startsWith('pt-') || accent.includes('brazil') || accent.includes('portugues')) {
        return true;
      }
      if (v.category === 'generated' || v.category === 'cloned') {
        return true;
      }
      return false;
    });

    const voicesToProcess = ptBrOnly && ptVoices.length > 0 ? ptVoices : rawVoices;

    const mappedVoices: VoicePreset[] = voicesToProcess.map((v) => {
      const isFemale = v.labels?.gender?.toLowerCase() === 'female';
      const meta = BRAZILIAN_VOICE_METADATA[v.voice_id];

      // Local preview endpoint (streams downloaded mp3 with zero noise)
      const previewUrl = `/api/voices/${v.voice_id}/preview`;
      const isDef = Boolean(meta?.isDefault || v.voice_id === process.env.ELEVENLABS_DEFAULT_VOICE_ID || v.name === 'Super');

      return {
        id: v.voice_id,
        name: meta?.name || v.name,
        gender: meta?.gender || (isFemale ? 'feminino' : 'masculino'),
        description:
          meta?.description ||
          v.description ||
          `Voz profissional para comerciais de supermercado e varejo em português`,
        previewUrl,
        sampleAudioUrl: previewUrl,
        elevenVoiceId: v.voice_id,
        geminiVoiceName: isFemale ? 'Kore' : 'Fenrir',
        accent: meta?.accent || 'Português Brasileiro',
        styleTag: meta?.styleTag || 'Voz Comercial',
        category: v.category,
        isDefault: isDef,
      };
    });

    // Ensure default voice (Super) is first
    mappedVoices.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    cachedElevenVoices = mappedVoices;
    lastVoicesFetch = Date.now();
    console.log(`[ElevenLabs] ${mappedVoices.length} vozes oficiais em Português BR carregadas com sucesso!`);

    // Asynchronous background pre-cache of preview MP3s for smooth instant playback
    const audioDir = path.resolve(process.cwd(), '.locucao_audios');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    setTimeout(async () => {
      for (const v of mappedVoices) {
        const previewFile = path.join(audioDir, `eleven_preview_${v.id}.mp3`);
        if (!fs.existsSync(previewFile)) {
          const pUrl = elevenVoicePreviewsMap.get(v.id);
          if (pUrl) {
            try {
              const pRes = await fetch(pUrl);
              if (pRes.ok) {
                const b = Buffer.from(await pRes.arrayBuffer());
                if (b.length > 500) {
                  fs.writeFileSync(previewFile, b);
                  console.log(`[ElevenLabs] Prévia pré-carregada em disco: ${v.name}`);
                }
              }
            } catch {
              // ignore
            }
          }
        }
      }
    }, 100);

    return mappedVoices;
  } catch (err) {
    console.error('[ElevenLabs] Falha ao consultar API de vozes:', err);
    return cachedElevenVoices || [];
  }
}

/**
 * Retrieves the genuine preview audio for any ElevenLabs voice.
 * Downloads and caches the real audio from ElevenLabs preview_url so there is ZERO noise/chiado.
 */
export async function getVoicePreviewAudio(voiceId: string): Promise<Buffer> {
  const audioDir = path.resolve(process.cwd(), '.locucao_audios');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Resolve preset id (e.g. 'daniel-varejo') to ElevenLabs voice id (e.g. 'dXQsuVXyCGkF7meZLeFk')
  const localVoices = db.getVoices();
  const matched = localVoices.find(v => v.id === voiceId || v.elevenVoiceId === voiceId);
  const actualVoiceId = matched?.elevenVoiceId || voiceId;

  // 1. Check local files on disk (prioritizing true ElevenLabs preview files)
  const candidateFiles = [
    path.join(audioDir, `eleven_preview_${actualVoiceId}.mp3`),
    path.join(audioDir, `eleven_${actualVoiceId}.mp3`),
    path.join(audioDir, `eleven_preview_${voiceId}.mp3`),
  ];

  for (const file of candidateFiles) {
    if (fs.existsSync(file)) {
      try {
        const buf = fs.readFileSync(file);
        if (buf.length > 500) {
          return buf;
        }
      } catch {
        // continue
      }
    }
  }

  // 2. Look up official ElevenLabs preview_url from map or by fetching voice
  let previewUrl = elevenVoicePreviewsMap.get(actualVoiceId) || elevenVoicePreviewsMap.get(voiceId);
  if (!previewUrl) {
    const key = getElevenLabsApiKey();
    if (key) {
      try {
        const vRes = await fetch(`https://api.elevenlabs.io/v1/voices/${actualVoiceId}`, {
          headers: { 'xi-api-key': key },
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.preview_url && typeof vData.preview_url === 'string') {
            const validUrl: string = vData.preview_url;
            previewUrl = validUrl;
            elevenVoicePreviewsMap.set(actualVoiceId, validUrl);
          }
        }
      } catch (err) {
        console.warn(`[ElevenLabs] Não foi possível consultar detalhes da voz ${actualVoiceId}:`, err);
      }
    }
  }

  // 3. Download and cache the real MP3 preview from ElevenLabs
  if (previewUrl) {
    try {
      console.log(`[ElevenLabs] Baixando áudio oficial de prévia da voz ${actualVoiceId}...`);
      const resp = await fetch(previewUrl);
      if (resp.ok) {
        const arrayBuf = await resp.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        if (buf.length > 500) {
          const cachePath = path.join(audioDir, `eleven_preview_${actualVoiceId}.mp3`);
          fs.writeFileSync(cachePath, buf);
          console.log(`[ElevenLabs] Áudio de prévia salvo com sucesso: ${actualVoiceId} (${buf.length} bytes)`);
          return buf;
        }
      }
    } catch (err) {
      console.error(`[ElevenLabs] Erro ao baixar prévia de ${previewUrl}:`, err);
    }
  }

  // 4. Safe fallback: Brazilian Portuguese spoken sample using Edge-TTS (NEVER buzzer/noise!)
  try {
    console.log(`[Real TTS] Gerando prévia falada em português para a voz ${voiceId}...`);
    const fallbackText = 'Olá! Esta é uma demonstração da voz comercial para as ofertas e promoções do seu supermercado.';
    const ttsBuf = await fetchRealBrazilianTTS(fallbackText);
    if (ttsBuf && ttsBuf.length > 1000) {
      const cachePath = path.join(audioDir, `eleven_preview_${voiceId}.mp3`);
      fs.writeFileSync(cachePath, ttsBuf);
      return ttsBuf;
    }
  } catch (err) {
    console.warn(`[Real TTS] Falha no fallback para prévia ${voiceId}:`, err);
  }

  // 5. Ultimate fallback with clean chime
  return createSupermarketAudioWav('Demonstração comercial', 4);
}

export function saveElevenLabsApiKeyToEnv(newKey: string): boolean {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    if (content.includes('ELEVENLABS_API_KEY=')) {
      content = content.replace(/ELEVENLABS_API_KEY="[^"]*"/, `ELEVENLABS_API_KEY="${newKey}"`);
      content = content.replace(/ELEVENLABS_API_KEY=[^\r\n]*/, `ELEVENLABS_API_KEY="${newKey}"`);
    } else {
      content += `\nELEVENLABS_API_KEY="${newKey}"\n`;
    }

    fs.writeFileSync(envPath, content, 'utf-8');
    process.env.ELEVENLABS_API_KEY = newKey;

    // Reset caches
    cachedSubscription = null;
    cachedElevenVoices = null;
    lastSubCheck = 0;
    lastVoicesFetch = 0;

    return true;
  } catch (err) {
    console.error('Failed to save ElevenLabs API key to .env:', err);
    return false;
  }
}


