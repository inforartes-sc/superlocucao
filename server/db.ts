import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;
import {
  Project, UserProfile, CreditTransaction, VoicePreset, AudioGenerationItem,
  RadioStationConfig, RadioQueueItem, RadioMusicTrack, RadioPlaylist,
  RechargePackage, CommercialPlan,
  PaymentGatewayConfig, SubscriptionItem, PaymentTransaction, OnlineRadioStation,
  RadioStoreBranch
} from '../src/types/index.ts';

const DB_FILE = path.resolve(process.cwd(), '.locucao_db.json');

export const INITIAL_VOICES: VoicePreset[] = [
  {
    id: 'daniel-varejo',
    name: 'Daniel (Varejo Enérgico)',
    gender: 'masculino',
    description: 'Voz comercial clássica de supermercado, vibrante e persuasiva. Ideal para ofertas relâmpago.',
    elevenVoiceId: 'dXQsuVXyCGkF7meZLeFk',
    geminiVoiceName: 'Fenrir',
    accent: 'Português Brasileiro (Neutro/Comercial)',
    styleTag: 'Varejo & Supermercado',
    isDefault: true
  },
  {
    id: 'carolina-acolhedora',
    name: 'Carolina (Vendedora Amigável)',
    gender: 'feminino',
    description: 'Tom caloroso, convidativo e empático. Perfeito para padaria, hortifrúti e compras familiares.',
    elevenVoiceId: 'cabLxBh81HurPAAJfEHo',
    geminiVoiceName: 'Kore',
    accent: 'Português Brasileiro (Suave e Firme)',
    styleTag: 'Familiar & Empática',
    isDefault: false
  },
  {
    id: 'rodrigo-grave',
    name: 'Rodrigo (Voz de Impacto)',
    gender: 'masculino',
    description: 'Grave marcante, autoridade e entusiasmo. Excelente para atacarejos, queima de estoque e Black Friday.',
    elevenVoiceId: 'wHnxjlY53t8X9Oi14Awz',
    geminiVoiceName: 'Puck',
    accent: 'Português Brasileiro (Locutor FM)',
    styleTag: 'Impacto & Atacarejo',
    isDefault: false
  },
  {
    id: 'mariana-jovem',
    name: 'Mariana (Descontraída & Dinâmica)',
    gender: 'feminino',
    description: 'Jovem, moderna e cheia de ritmo. Excelente para conveniências, hortifrúti gourmet e bebidas.',
    elevenVoiceId: 'AKXBn24T1f9tvTDnWzWT',
    geminiVoiceName: 'Zephyr',
    accent: 'Português Brasileiro (Contemporâneo)',
    styleTag: 'Jovem & Dinâmica',
    isDefault: false
  },
  {
    id: 'marcos-institucional',
    name: 'Marcos (Elegante & Institucional)',
    gender: 'masculino',
    description: 'Locução sóbria e refinada para comunicados da loja, inaugurações, clube de vantagens e horários.',
    elevenVoiceId: 'a1ijbt2xmlhzaGXHewzV',
    geminiVoiceName: 'Charon',
    accent: 'Português Brasileiro (Institucional)',
    styleTag: 'Institucional & Clube',
    isDefault: false
  }
];

export const DEFAULT_RADIO_PLAYLISTS: RadioPlaylist[] = [
  {
    id: 'pop_varejo',
    name: 'Pop & Varejo Comercial',
    description: 'Hits animados e ritmo comercial moderno para compras do dia a dia no supermercado',
    icon: '🛒',
    color: 'orange',
  },
  {
    id: 'acustico_manha',
    name: 'Manhã, Padaria & Hortifrúti',
    description: 'Violão acústico suave, frescor matinal e compras aconchegantes',
    icon: '🥖',
    color: 'emerald',
  },
  {
    id: 'energetico_ofertas',
    name: 'Super Ofertas & Batidão de Preço',
    description: 'Batida acelerada para promoções relâmpago, queima de estoque e hora do rush',
    icon: '⚡',
    color: 'red',
  },
  {
    id: 'lounge_gourmet',
    name: 'Lounge Empório & Adega Gourmet',
    description: 'Smooth lounge e harmonia sofisticada para vinhos, queijos nobres e empório',
    icon: '🍷',
    color: 'purple',
  },
  {
    id: 'brasil_sucessos',
    name: 'Brasilidades & Sertanejo Suave',
    description: 'Ritmos populares brasileiros, clima acolhedor de feira e fim de semana',
    icon: '🤠',
    color: 'amber',
  },
  {
    id: 'tarde_calma',
    name: 'Tarde Tranquila & Clássicos de Loja',
    description: 'Músicas suaves e relaxantes para compras calmas sem pressa',
    icon: '☕',
    color: 'sky',
  },
  {
    id: 'natal_final_de_ano',
    name: 'Natal & Final de Ano Mágico',
    description: 'Clássicos natalinos, sinos festivos e celebração para compras de Natal e Réveillon no supermercado',
    icon: '🎄',
    color: 'red',
  },
];

export const DEFAULT_RADIO_MUSIC_TRACKS: RadioMusicTrack[] = [
  {
    id: 'music-varejo-alegre',
    title: 'Manhã de Compras & Ofertas',
    artist: 'Rádio Supermercado Instrumental',
    style: 'Pop Varejo Alegre & Família (124 BPM)',
    category: 'pop_varejo',
    playlistId: 'pop_varejo',
    audioUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
    durationSeconds: 185,
    bpm: 124,
    active: true,
  },
  {
    id: 'music-batida-comercial',
    title: 'Pop Comercial Varejo Hit',
    artist: 'Estúdio Som de Loja',
    style: 'Batida Pop Comercial Moderna (120 BPM)',
    category: 'pop_varejo',
    playlistId: 'pop_varejo',
    audioUrl: '/api/soundtracks/batida_comercial/preview.mp3',
    durationSeconds: 210,
    bpm: 120,
    active: true,
  },
  {
    id: 'music-radio-sucesso',
    title: 'Rádio Sucesso do Varejo',
    artist: 'Varejo FM Mix',
    style: 'Hit Comercial Contagiante de Loja (122 BPM)',
    category: 'pop_varejo',
    playlistId: 'pop_varejo',
    audioUrl: '/api/soundtracks/radio_sucesso/preview.mp3',
    durationSeconds: 195,
    bpm: 122,
    active: true,
  },
  {
    id: 'music-acustico-hortifruti',
    title: 'Feirinha & Padaria Acústica',
    artist: 'Violão & Café',
    style: 'Violão Acústico Suave & Pão Quentinho (105 BPM)',
    category: 'acustico_manha',
    playlistId: 'acustico_manha',
    audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
    durationSeconds: 195,
    bpm: 105,
    active: true,
  },
  {
    id: 'music-manha-tropical',
    title: 'Manhã Tropical & Frutas Frescas',
    artist: 'Acústico & MPB Instrumental',
    style: 'Frescor Matinal para Hortifrúti e Padaria (108 BPM)',
    category: 'acustico_manha',
    playlistId: 'acustico_manha',
    audioUrl: '/api/soundtracks/acustico_hortifruti/preview.mp3',
    durationSeconds: 180,
    bpm: 108,
    active: true,
  },
  {
    id: 'music-black-friday',
    title: 'Ritmo Quente de Superofertas',
    artist: 'Groove Atacarejo',
    style: 'Batidão Promocional & Hora do Rush (128 BPM)',
    category: 'energetico_ofertas',
    playlistId: 'energetico_ofertas',
    audioUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
    durationSeconds: 175,
    bpm: 128,
    active: true,
  },
  {
    id: 'music-liquidacao-geral',
    title: 'Liquidação Imbatível & Queima Geral',
    artist: 'Super Ofertas Bass',
    style: 'Ritmo Dinâmico de Grande Urgência (130 BPM)',
    category: 'energetico_ofertas',
    playlistId: 'energetico_ofertas',
    audioUrl: '/api/soundtracks/black_friday_urgente/preview.mp3',
    durationSeconds: 190,
    bpm: 130,
    active: true,
  },
  {
    id: 'music-institucional-gourmet',
    title: 'Lounge Empório & Adega',
    artist: 'Supermercado Premium',
    style: 'Smooth Piano & Adega de Vinhos Nobres (96 BPM)',
    category: 'lounge_gourmet',
    playlistId: 'lounge_gourmet',
    audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
    durationSeconds: 240,
    bpm: 96,
    active: true,
  },
  {
    id: 'music-bossa-emporio',
    title: 'Bossa & Jazz no Empório Nobre',
    artist: 'Jazz Café Trio',
    style: 'Lounge Acústico Sofisticado para Queijos e Vinhos (100 BPM)',
    category: 'lounge_gourmet',
    playlistId: 'lounge_gourmet',
    audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
    durationSeconds: 215,
    bpm: 100,
    active: true,
  },
  {
    id: 'music-sertanejo-feira',
    title: 'Sertanejo Acústico de Supermercado',
    artist: 'Violas do Brasil',
    style: 'Viola Suave Instrumental & Clima de Feira (112 BPM)',
    category: 'brasil_sucessos',
    playlistId: 'brasil_sucessos',
    audioUrl: '/api/soundtracks/gospel_inspiracional/preview.mp3',
    durationSeconds: 200,
    bpm: 112,
    active: true,
  },
  {
    id: 'music-brasilidades-feira',
    title: 'Brasilidades & MPB de Feira Fresca',
    artist: 'Ritmos do Brasil',
    style: 'Percussão Suave & Harmonia Brasileira (110 BPM)',
    category: 'brasil_sucessos',
    playlistId: 'brasil_sucessos',
    audioUrl: '/api/soundtracks/varejo_alegre/preview.mp3',
    durationSeconds: 190,
    bpm: 110,
    active: true,
  },
  {
    id: 'music-tarde-serena',
    title: 'Tarde Serena de Compras Tranquilas',
    artist: 'Loja Conforto Ensemble',
    style: 'Ambiente Calmo para Compras sem Pressa (98 BPM)',
    category: 'tarde_calma',
    playlistId: 'tarde_calma',
    audioUrl: '/api/soundtracks/institucional_gourmet/preview.mp3',
    durationSeconds: 220,
    bpm: 98,
    active: true,
  },
  {
    id: 'music-jingle-bells-varejo',
    title: 'Jingle Bells & Clássico de Natal',
    artist: 'Orquestra de Natal Supermercado',
    style: 'Sinos Festivos, Harmonia de Natal & Ritmo Alegre (120 BPM)',
    category: 'natal_final_de_ano',
    playlistId: 'natal_final_de_ano',
    audioUrl: '/api/soundtracks/natal_jingle_bells/preview.mp3',
    durationSeconds: 195,
    bpm: 120,
    active: true,
  },
  {
    id: 'music-noite-feliz-acustico',
    title: 'Noite Feliz & Paz nas Compras',
    artist: 'Piano & Carrilhão Natalino',
    style: 'Arranjo Suave Acústico & Harpa de Natal (88 BPM)',
    category: 'natal_final_de_ano',
    playlistId: 'natal_final_de_ano',
    audioUrl: '/api/soundtracks/natal_noite_feliz/preview.mp3',
    durationSeconds: 210,
    bpm: 88,
    active: true,
  },
  {
    id: 'music-boas-festas-ano-novo',
    title: 'Boas Festas & Celebração em Família',
    artist: 'Coral & Metais de Fim de Ano',
    style: 'Arranjo Festivo & Espírito de Celebração (116 BPM)',
    category: 'natal_final_de_ano',
    playlistId: 'natal_final_de_ano',
    audioUrl: '/api/soundtracks/natal_boas_festas/preview.mp3',
    durationSeconds: 190,
    bpm: 116,
    active: true,
  },
  {
    id: 'music-magia-ceia-natal',
    title: 'Magia do Natal & Ceia Especial',
    artist: 'Sinfonia do Varejo Natalino',
    style: 'Sinos de Trenó, Cordas & Clima de Ceia (114 BPM)',
    category: 'natal_final_de_ano',
    playlistId: 'natal_final_de_ano',
    audioUrl: '/api/soundtracks/natal_magia_ceia/preview.mp3',
    durationSeconds: 205,
    bpm: 114,
    active: true,
  },
  {
    id: 'music-reveillon-sucesso',
    title: 'Vem Aí o Ano Novo & Esperança',
    artist: 'Festa de Réveillon Mix',
    style: 'Pop Festivo Otimista para Virada de Ano (122 BPM)',
    category: 'natal_final_de_ano',
    playlistId: 'natal_final_de_ano',
    audioUrl: '/api/soundtracks/reveillon_sucesso/preview.mp3',
    durationSeconds: 185,
    bpm: 122,
    active: true,
  },
];

export interface StoredAudioBinary {
  id: string;
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

const AUDIO_STORAGE_DIR = path.resolve(process.cwd(), '.locucao_audios');
if (!fs.existsSync(AUDIO_STORAGE_DIR)) {
  try {
    fs.mkdirSync(AUDIO_STORAGE_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create audio storage dir:', e);
  }
}

// In-memory audio binary storage cache
export const audioBinaryStore = new Map<string, StoredAudioBinary>();

export function saveAudioBinary(id: string, buffer: Buffer, mimeType: string, filename: string): StoredAudioBinary {
  const item: StoredAudioBinary = { id, buffer, mimeType, filename };
  audioBinaryStore.set(id, item);

  // Directly save to PostgreSQL database (PRIMARY PERSISTENCE ON VPS)
  if (typeof db !== 'undefined' && db && db.getPool()) {
    db.pgSaveAudioBinary(id, filename, mimeType, buffer).catch((err: any) =>
      console.warn(`[PostgreSQL] Falha ao salvar áudio ${id} no banco de dados:`, err)
    );
  }

  // Optional local cache fallback (silently ignored in ephemeral/stateless environments)
  try {
    const ext = filename.endsWith('.mp3') ? '.mp3' : '.wav';
    fs.writeFileSync(path.join(AUDIO_STORAGE_DIR, `${id}${ext}`), buffer);
    fs.writeFileSync(
      path.join(AUDIO_STORAGE_DIR, `${id}.meta.json`),
      JSON.stringify({ mimeType, filename })
    );
  } catch {
    // Silent ignore on read-only or stateless environments
  }

  return item;
}

export function getAudioBinary(id: string): StoredAudioBinary | undefined {
  if (audioBinaryStore.has(id)) {
    return audioBinaryStore.get(id);
  }
  try {
    // Check in server/seed_audios/ or .locucao_audios/
    const mp3Path = path.join(AUDIO_STORAGE_DIR, `${id}.mp3`);
    const wavPath = path.join(AUDIO_STORAGE_DIR, `${id}.wav`);
    const seedMp3 = path.join(process.cwd(), 'server', 'seed_audios', `${id}.mp3`);
    const seedWav = path.join(process.cwd(), 'server', 'seed_audios', `${id}.wav`);

    const targetPath = fs.existsSync(seedMp3) ? seedMp3
      : fs.existsSync(seedWav) ? seedWav
      : fs.existsSync(mp3Path) ? mp3Path
      : fs.existsSync(wavPath) ? wavPath
      : null;

    if (targetPath) {
      const buffer = fs.readFileSync(targetPath);
      let filename = `${id}.mp3`;
      let mimeType = targetPath.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';

      if (targetPath !== seedMp3 && targetPath !== seedWav) {
        const metaPath = path.join(AUDIO_STORAGE_DIR, `${id}.meta.json`);
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            if (meta.filename) filename = meta.filename;
            if (meta.mimeType) mimeType = meta.mimeType;
          } catch { }
        }
      }

      const item: StoredAudioBinary = { id, buffer, mimeType, filename };
      audioBinaryStore.set(id, item);
      return item;
    }
  } catch {
    // Ignore read errors
  }
  return undefined;
}

export async function getAudioBinaryAsync(id: string): Promise<StoredAudioBinary | undefined> {
  // Master priority for commercial landing page & showcase demos (guarantees real ElevenLabs audio)
  const isMasterSeed = id.startsWith('aud-demo') || id.startsWith('voice_') || id.startsWith('style_');
  if (isMasterSeed) {
    const seedMp3 = path.resolve(process.cwd(), 'server', 'seed_audios', `${id}.mp3`);
    if (fs.existsSync(seedMp3)) {
      const buffer = fs.readFileSync(seedMp3);
      const item: StoredAudioBinary = { id, buffer, mimeType: 'audio/mpeg', filename: `${id}.mp3` };
      audioBinaryStore.set(id, item);
      return item;
    }
  }

  // 1. Check fast in-memory store
  if (audioBinaryStore.has(id)) {
    return audioBinaryStore.get(id);
  }

  // 2. PRIMARY: Query PostgreSQL audio_binaries table directly from VPS
  if (typeof db !== 'undefined' && db && db.getPool()) {
    try {
      const fromPg = await db.pgGetAudioBinary(id);
      if (fromPg) {
        audioBinaryStore.set(id, fromPg);
        return fromPg;
      }
    } catch (err) {
      console.warn(`[PostgreSQL] Erro ao buscar áudio ${id} do banco de dados:`, err);
    }
  }

  // 3. Fallback: check seed_audios or local cache
  return getAudioBinary(id);
}

export const DEFAULT_RECHARGE_PACKAGES: RechargePackage[] = [
  {
    id: 'pacote-basico',
    name: 'Recarga Básica',
    credits: 300,
    price: 39.9,
    description: 'Aproximadamente 30 locuções comerciais',
    badge: '',
    highlighted: false,
  },
  {
    id: 'pacote-pro',
    name: 'Recarga Pro Varejo',
    credits: 1000,
    price: 89.9,
    description: 'Aproximadamente 100 locuções comerciais',
    badge: 'Melhor Custo-Benefício',
    highlighted: true,
  },
  {
    id: 'pacote-atacado',
    name: 'Recarga Atacarejo',
    credits: 2500,
    price: 179.9,
    description: 'Aproximadamente 250 locuções comerciais',
    badge: '',
    highlighted: false,
  },
];

export const DEFAULT_COMMERCIAL_PLANS: CommercialPlan[] = [
  {
    id: 'gratuito',
    name: 'Degustação (Grátis)',
    tag: 'Teste Inicial',
    subtitle: 'Perfeito para você experimentar a qualidade na prática na sua loja.',
    price: 0,
    billingPeriod: 'grátis',
    creditsAmount: 50,
    features: [
      '50 créditos de boas-vindas para testes',
      'Locuções de Ofertas comerciais narradas por IA',
      '1 Loja / 1 Computador',
      'Download imediato dos áudios em MP3',
      'Vinhetas e Sweepers: exclusivo planos Pro',
      'Avisos e Comunicados: exclusivo planos Pro',
      'Upload de áudios e músicas do PC: exclusivo Pro',
      'Transmissão simultânea em vários PCs: não incluso',
    ],
    ctaText: 'Plano Atual',
    badge: '',
    highlighted: false,
  },
  {
    id: 'pro_varejo',
    name: 'Pro Varejo',
    tag: 'Supermercados',
    subtitle: 'Ideal para mercados que trocam encartes e ofertas de açougue e hortifrúti todo dia.',
    price: 89.9,
    billingPeriod: '/mês',
    creditsAmount: 1500,
    features: [
      '1.500 créditos mensais renovados todo mês',
      '1 Loja / 1 Computador de Transmissão por vez',
      'Proteção inteligente contra transmissões simultâneas',
      'Vinhetas & Sweepers personalizadas 100% liberadas',
      'Avisos Informativos & Utilidade Pública liberados',
      'Upload de Áudios e Músicas MP3 do seu PC liberado',
      'Rádio Web ao Vivo com Auto-Ducking automático',
      'Suporte prioritário via WhatsApp',
    ],
    ctaText: 'Fazer Upgrade para Pro Varejo',
    badge: 'Mais Escolhido',
    highlighted: true,
  },
  {
    id: 'redes_atacarejo',
    name: 'Redes & Atacarejo',
    tag: 'Redes & Filiais',
    subtitle: 'Para redes com múltiplas filiais ou grande volume diário de queimas de estoque.',
    price: 189.9,
    billingPeriod: '/mês',
    creditsAmount: 5000,
    features: [
      '5.000 créditos mensais renovados todo mês',
      'Multi-Lojas: Múltiplas Lojas & Filiais Simultâneas',
      'Transmissão simultânea em vários computadores ao mesmo tempo',
      'Painel de Gestão de Filiais da Rede em tempo real',
      'Programação e campanhas independentes por loja',
      'Vinhetas, Avisos, Uploads e Recursos Pro 100% liberados',
      'Clonagem de voz personalizada da marca (sob demanda)',
      'Gerente de contas e atendimento VIP prioritário',
    ],
    ctaText: 'Fazer Upgrade para Redes & Atacarejo',
    badge: 'Potência Máxima',
    highlighted: false,
  },
];

export const DEFAULT_PAYMENT_GATEWAY: PaymentGatewayConfig = {
  provider: 'mercadopago',
  mode: (process.env.MERCADOPAGO_MODE as any) || 'production',
  isActive: true,
  mercadoPagoPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
  mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  asaasApiKey: process.env.ASAAS_API_KEY || '',
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  pixKey: process.env.PIX_KEY || 'contato@superlocucao.inforartes.com.br',
  pixKeyType: 'email',
  webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
};

export const DEFAULT_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub-alvorada-01',
    userId: 'user-alvorada',
    userName: 'Carlos Mendes',
    companyName: 'Supermercado Alvorada',
    email: 'carlos@superalvorada.com.br',
    planId: 'pro_varejo',
    planName: 'Pro Varejo',
    amount: 89,
    billingPeriod: 'mensal',
    status: 'active',
    paymentMethod: 'pix',
    gateway: 'Mercado Pago',
    currentPeriodStart: '2026-11-01T00:00:00Z',
    currentPeriodEnd: '2026-12-01T00:00:00Z',
    creditsPerCycle: 1500,
    autoRenew: true,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'sub-bompreco-02',
    userId: 'user-bompreco',
    userName: 'Mariana Silva',
    companyName: 'Supermercado Bom Preço',
    email: 'mariana@bompreco.com.br',
    planId: 'pro_varejo',
    planName: 'Pro Varejo',
    amount: 89,
    billingPeriod: 'mensal',
    status: 'active',
    paymentMethod: 'credit_card',
    gateway: 'Mercado Pago',
    currentPeriodStart: '2026-10-25T00:00:00Z',
    currentPeriodEnd: '2026-11-25T00:00:00Z',
    creditsPerCycle: 1500,
    autoRenew: true,
    createdAt: '2026-09-25T14:30:00Z',
  },
  {
    id: 'sub-atacadao-03',
    userId: 'user-atacadao',
    userName: 'Roberto Castro',
    companyName: 'Rede Atacadão do Vale (3 Filiais)',
    email: 'financeiro@atacadaodovale.com.br',
    planId: 'redes_atacarejo',
    planName: 'Redes & Atacarejo',
    amount: 199,
    billingPeriod: 'mensal',
    status: 'active',
    paymentMethod: 'pix',
    gateway: 'Asaas Recorrência',
    currentPeriodStart: '2026-11-03T00:00:00Z',
    currentPeriodEnd: '2026-12-03T00:00:00Z',
    creditsPerCycle: 5000,
    autoRenew: true,
    createdAt: '2026-11-03T09:15:00Z',
  },
];

export const DEFAULT_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'pay-tx-1001',
    userId: 'user-alvorada',
    userName: 'Carlos Mendes',
    companyName: 'Supermercado Alvorada',
    type: 'subscription',
    description: 'Renovação Mensal - Plano Pro Varejo',
    amount: 89,
    creditsAdded: 1500,
    status: 'approved',
    paymentMethod: 'pix',
    gateway: 'Mercado Pago',
    externalId: 'MP-98472918',
    paidAt: '2026-11-01T10:02:15Z',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'pay-tx-1002',
    userId: 'user-bompreco',
    userName: 'Mariana Silva',
    companyName: 'Supermercado Bom Preço',
    type: 'recharge',
    description: 'Recarga Imediata: Pacote Pro Varejo (1.000 Créditos)',
    amount: 69,
    creditsAdded: 1000,
    status: 'approved',
    paymentMethod: 'credit_card',
    gateway: 'Mercado Pago',
    externalId: 'MP-98473022',
    paidAt: '2026-11-02T16:45:00Z',
    createdAt: '2026-11-02T16:44:30Z',
  },
  {
    id: 'pay-tx-1003',
    userId: 'user-atacadao',
    userName: 'Roberto Castro',
    companyName: 'Rede Atacadão do Vale',
    type: 'subscription',
    description: 'Assinatura Inicial - Redes & Atacarejo',
    amount: 199,
    creditsAdded: 5000,
    status: 'approved',
    paymentMethod: 'pix',
    gateway: 'Asaas',
    externalId: 'ASAAS-781920',
    paidAt: '2026-11-03T09:18:22Z',
    createdAt: '2026-11-03T09:15:00Z',
  },
  {
    id: 'pay-tx-1004',
    userId: 'user-alvorada',
    userName: 'Carlos Mendes',
    companyName: 'Supermercado Alvorada',
    type: 'recharge',
    description: 'Recarga Imediata: Pacote Básico (300 Créditos)',
    amount: 29,
    creditsAdded: 300,
    status: 'pending',
    paymentMethod: 'pix',
    gateway: 'Mercado Pago (PIX QR Code)',
    externalId: 'MP-98510294',
    createdAt: '2026-11-04T18:30:00Z',
  },
];

export interface ClientLogo {
  id: string;
  name: string;
  cityState?: string;
  imageUrl?: string;
  slogan?: string;
  websiteUrl?: string;
  active: boolean;
  order: number;
  createdAt?: string;
}

export const DEFAULT_CLIENT_LOGOS: ClientLogo[] = [
  {
    id: 'logo-alvorada',
    name: 'Supermercado Alvorada',
    cityState: 'Campinas/SP',
    slogan: 'Economia e Qualidade Todo Dia',
    imageUrl: '',
    active: true,
    order: 1,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'logo-bompreco',
    name: 'Rede Bom Preço',
    cityState: 'Belo Horizonte/MG',
    slogan: 'O Menor Preço da Cidade',
    imageUrl: '',
    active: true,
    order: 2,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'logo-atacadao-central',
    name: 'Atacadão Central',
    cityState: 'Curitiba/PR',
    slogan: 'Preço de Atacado no Varejo',
    imageUrl: '',
    active: true,
    order: 3,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'logo-estrela-sul',
    name: 'Supermercado Estrela do Sul',
    cityState: 'Porto Alegre/RS',
    slogan: 'Tradição em Ofertas e Carnes',
    imageUrl: '',
    active: true,
    order: 4,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'logo-hiper-center',
    name: 'Hiper Center Varejo',
    cityState: 'São Paulo/SP',
    slogan: 'Variedade, Frescor e Economia',
    imageUrl: '',
    active: true,
    order: 5,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'logo-alianca',
    name: 'Supermercado Aliança',
    cityState: 'Goiânia/GO',
    slogan: 'Fazendo Parte da Sua Família',
    imageUrl: '',
    active: true,
    order: 6,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'logo-sao-jose',
    name: 'Empório São José',
    cityState: 'Rio de Janeiro/RJ',
    slogan: 'Padaria, Adega e Hortifrúti Selecionado',
    imageUrl: '',
    active: true,
    order: 7,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'logo-brasil-mix',
    name: 'Atacarejo Brasil Mix',
    cityState: 'Fortaleza/CE',
    slogan: 'Compre no Varejo com Preço de Atacado',
    imageUrl: '',
    active: true,
    order: 8,
    createdAt: '2026-11-01T10:00:00Z',
  },
];

interface DbData {
  users: UserProfile[];
  projects: Project[];
  creditTransactions: CreditTransaction[];
  voices: VoicePreset[];
  radioConfig?: RadioStationConfig;
  radioConfigs?: Record<string, RadioStationConfig>;
  adminSettings: {
    defaultVoiceId: string;
    creditsPerGeneration: number;
    initialCredits: number;
    elevenLabsModel: string;
    systemAnnouncement?: string;
    contactWhatsapp?: string;
    contactEmail?: string;
    rechargePackages?: RechargePackage[];
    commercialPlans?: CommercialPlan[];
    paymentGateway?: PaymentGatewayConfig;
    subscriptions?: SubscriptionItem[];
    payments?: PaymentTransaction[];
    clientLogos?: ClientLogo[];
  };
}

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-alvorada',
    name: 'Carlos Mendes',
    email: 'carlos@superalvorada.com.br',
    password: 'alvorada123',
    companyName: 'Supermercado Alvorada',
    role: 'supermarket_owner',
    plan: 'pro_varejo',
    creditsBalance: 450,
    createdAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'user-atacado',
    name: 'Juliana Castro',
    email: 'juliana@atacadaocentral.com.br',
    password: 'atacado123',
    companyName: 'Atacadão Central',
    role: 'manager',
    plan: 'redes_atacarejo',
    creditsBalance: 1200,
    createdAt: '2026-03-01T14:30:00Z'
  },
  {
    id: 'user-admin',
    name: 'Administrador Locução Super',
    email: 'admin@locucaosuper.com.br',
    password: 'admin123',
    companyName: 'Locução Super IA Matriz',
    role: 'admin',
    plan: 'redes_atacarejo',
    creditsBalance: 9999,
    createdAt: '2026-01-01T08:00:00Z'
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-quarta-carne',
    userId: 'user-alvorada',
    title: 'Quarta e Quinta da Carne & Hortifrúti',
    storeName: 'Supermercado Alvorada',
    storeCity: 'Campinas - SP',
    objective: 'Atrair clientes para o açougue e setor de hortifrúti na metade da semana',
    campaignType: 'ofertas_dia',
    style: 'energetica_supermercado',
    desiredDuration: '30s',
    tone: 'persuasivo',
    presentationFormat: 'abertura_sequencia_encerramento',
    customOpening: 'Atenção você cliente amigo do Supermercado Alvorada! É hora de economizar no nosso açougue e feirinha!',
    customClosing: 'Ofertas válidas somente hoje e amanhã ou enquanto durarem os estoques. Vem correndo pro Alvorada!',
    products: [
      {
        id: 'prod-1',
        name: 'Alcatra com Maminha Friboi',
        brand: 'Friboi',
        packaging: 'peça a vácuo',
        promotionalPrice: 36.90,
        previousPrice: 44.90,
        unit: 'kg',
        spokenPrice: 'trinta e seis reais e noventa centavos o quilo'
      },
      {
        id: 'prod-2',
        name: 'Coxa e Sobrecoxa de Frango Sadia',
        brand: 'Sadia',
        packaging: 'bandeja resfriada',
        promotionalPrice: 8.99,
        previousPrice: 12.90,
        unit: 'kg',
        spokenPrice: 'oito reais e noventa e nove centavos o quilo'
      },
      {
        id: 'prod-3',
        name: 'Tomate Italiano Selecionado',
        packaging: 'fresco da feira',
        promotionalPrice: 4.49,
        previousPrice: 6.99,
        unit: 'kg',
        spokenPrice: 'quatro reais e quarenta e nove centavos o quilo'
      }
    ],
    scripts: [
      {
        id: 'script-1',
        text: 'Atenção clientes do Supermercado Alvorada! Quarta e Quinta da Carne com preços arrasadores! Alcatra com Maminha Friboi peça a vácuo por apenas trinta e seis reais e noventa centavos o quilo! Coxa e sobrecoxa Sadia resfriada, só oito reais e noventa e nove centavos o quilo! E na feirinha, tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo! Aproveite agora mesmo no Supermercado Alvorada!',
        spokenPhoneticText: 'Atenção clientes do Supermercado Alvorada! Quarta e Quinta da Carne com preços arrasadores! Alcatra com Maminha Friboi peça a vácuo por apenas trinta e seis reais e noventa centavos o quilo! Coxa e sobrecoxa Sadia resfriada, só oito reais e noventa e nove centavos o quilo! E na feirinha, tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo! Aproveite agora mesmo no Supermercado Alvorada!',
        estimatedDurationSeconds: 28,
        wordCount: 65,
        createdAt: '2026-10-15T14:00:00Z'
      }
    ],
    currentScriptIndex: 0,
    audios: [
      {
        id: 'aud-demo-1',
        projectId: 'proj-quarta-carne',
        scriptId: 'script-1',
        title: 'Locução Completa — Quarta da Carne & Hortifrúti',
        voiceId: 'daniel-varejo',
        voiceName: 'Daniel (Varejo Enérgico)',
        provider: 'elevenlabs',
        format: 'mp3',
        durationSeconds: 28,
        audioUrl: '/api/audio/aud-demo-1.mp3',
        downloadUrl: '/api/audio/aud-demo-1.mp3?download=1',
        status: 'ready',
        creditsUsed: 10,
        createdAt: '2026-10-15T14:05:00Z',
        fileSizeBytes: 448000
      }
    ],
    status: 'ready',
    createdAt: '2026-10-15T13:50:00Z',
    updatedAt: '2026-10-15T14:05:00Z'
  },
  {
    id: 'proj-fim-semana',
    userId: 'user-alvorada',
    title: 'Super Fim de Semana de Ofertas',
    storeName: 'Supermercado Alvorada',
    storeCity: 'Campinas - SP',
    objective: 'Giro de cervejas, refrigerantes e churrasco para o final de semana',
    campaignType: 'superofertas',
    style: 'animada_promocional',
    desiredDuration: '45s',
    tone: 'festivo',
    presentationFormat: 'unico_completo',
    customOpening: 'O fim de semana chegou com tudo no Alvorada!',
    customClosing: 'Alvorada, qualidade e preço baixo todos os dias perto de você!',
    products: [
      {
        id: 'prod-4',
        name: 'Cerveja Heineken Lata 350ml',
        brand: 'Heineken',
        packaging: 'lata de trezentos e cinquenta mililitros',
        promotionalPrice: 4.89,
        previousPrice: 5.79,
        unit: 'unidade',
        spokenPrice: 'quatro reais e oitenta e nove centavos a unidade'
      },
      {
        id: 'prod-5',
        name: 'Picanha Bovina Fatiada Grill',
        brand: 'Minerva',
        packaging: 'quilo',
        promotionalPrice: 59.90,
        previousPrice: 79.90,
        unit: 'kg',
        spokenPrice: 'cinquenta e nove reais e noventa centavos o quilo'
      },
      {
        id: 'prod-6',
        name: 'Carvão Vegetal 5kg',
        brand: 'Bom Grill',
        packaging: 'saco de cinco quilos',
        promotionalPrice: 19.99,
        previousPrice: 24.90,
        unit: 'pacote',
        spokenPrice: 'dezenove reais e noventa e nove centavos o pacote'
      }
    ],
    scripts: [
      {
        id: 'script-2',
        text: 'O fim de semana chegou com tudo no Supermercado Alvorada! É hora do churrasco com economia de verdade! Picanha bovina fatiada grill por só cinquenta e nove reais e noventa centavos o quilo! Cerveja Heineken lata trezentos e cinquenta mililitros bem gelada, quatro reais e oitenta e nove centavos a unidade! E carvão vegetal cinco quilos Bom Grill por apenas dezenove reais e noventa e nove centavos! Corra para o Alvorada e garanta as suas compras!',
        spokenPhoneticText: 'O fim de semana chegou com tudo no Supermercado Alvorada! É hora do churrasco com economia de verdade! Picanha bovina fatiada grill por só cinquenta e nove reais e noventa centavos o quilo! Cerveja Heineken lata trezentos e cinquenta mililitros bem gelada, quatro reais e oitenta e nove centavos a unidade! E carvão vegetal cinco quilos Bom Grill por apenas dezenove reais e noventa e nove centavos! Corra para o Alvorada e garanta as suas compras!',
        estimatedDurationSeconds: 38,
        wordCount: 78,
        createdAt: '2026-10-14T09:00:00Z'
      }
    ],
    currentScriptIndex: 0,
    audios: [
      {
        id: 'aud-demo-2',
        projectId: 'proj-fim-semana',
        scriptId: 'script-2',
        title: 'Locução Fim de Semana Churrasco',
        voiceId: 'rodrigo-grave',
        voiceName: 'Rodrigo (Voz de Impacto)',
        provider: 'elevenlabs',
        format: 'mp3',
        durationSeconds: 38,
        audioUrl: '/api/audio/aud-demo-2.mp3',
        downloadUrl: '/api/audio/aud-demo-2.mp3?download=1',
        status: 'ready',
        creditsUsed: 10,
        createdAt: '2026-10-14T09:10:00Z',
        fileSizeBytes: 608000
      }
    ],
    status: 'ready',
    createdAt: '2026-10-14T08:45:00Z',
    updatedAt: '2026-10-14T09:10:00Z'
  }
];

const DEFAULT_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-alvorada',
    type: 'credit',
    amount: 500,
    description: 'Bônus de Boas-Vindas — Plano Pro Varejo',
    createdAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'tx-2',
    userId: 'user-alvorada',
    type: 'debit',
    amount: 10,
    description: 'Geração de Locução: Quarta e Quinta da Carne',
    referenceId: 'aud-demo-1',
    createdAt: '2026-10-15T14:05:00Z'
  },
  {
    id: 'tx-3',
    userId: 'user-alvorada',
    type: 'debit',
    amount: 10,
    description: 'Geração de Locução: Super Fim de Semana',
    referenceId: 'aud-demo-2',
    createdAt: '2026-10-14T09:10:00Z'
  }
];

function buildInitialRadioConfig(projects: Project[], user?: UserProfile): RadioStationConfig {
  const queue: RadioQueueItem[] = [];
  const seenAudioIds = new Set<string>();

  const storeName = user?.companyName || user?.name || (projects.length > 0 && projects[0].storeName) || 'Supermercado';
  const stationName = `Rádio ${storeName} FM`;

  for (const proj of projects) {
    for (const aud of proj.audios || []) {
      if (aud.status === 'ready' && !seenAudioIds.has(aud.id)) {
        seenAudioIds.add(aud.id);
        queue.push({
          id: `rq-${aud.id}`,
          audioId: aud.id,
          projectId: proj.id,
          title: aud.title || proj.title,
          audioUrl: aud.audioUrl,
          downloadUrl: aud.downloadUrl,
          durationSeconds: aud.durationSeconds || 28,
          voiceName: aud.voiceName || 'Locutor Oficial',
          campaignType: proj.campaignType || 'ofertas_dia',
          storeName: proj.storeName || storeName,
          type: 'oferta',
          active: true,
          priority: queue.length < 2 ? 'alta' : 'normal',
          addedAt: aud.createdAt || new Date().toISOString(),
        });
      }
    }
  }

  return {
    stationName,
    storeName,
    slogan: 'A rádio da economia e das melhores ofertas para a sua família!',
    isOnAir: false,
    mode: 'intervalo_tempo',
    spotsEveryNTracks: 1,
    spotsIntervalSeconds: 45,
    onlyOffersPauseSeconds: 4,
    musicVolume: 0.75,
    spotVolume: 1.0,
    duckingLevel: 0.12,
    selectedMusicCategory: 'todas',
    activePlaylistId: 'todas',
    excludedPlaylistIds: [],
    playlists: DEFAULT_RADIO_PLAYLISTS,
    autoPublishNewAudios: false,
    timeAnnouncementEnabled: false,
    timeAnnouncementInterval: '30min',
    timeAnnouncementChime: true,
    timeAnnouncementStyle: 'comercial',
    timeAnnouncementVoiceId: 'voice-marcos',
    queue,
    musicTracks: DEFAULT_RADIO_MUSIC_TRACKS,
  };
}

class Database {
  private data: DbData;
  private pool: pg.Pool | null = null;
  private activeOnlineRadios: Map<string, OnlineRadioStation> = new Map();

  constructor() {
    this.data = this.load();

    // Garantir que todos os usuários existentes possuam senha cadastrada
    let usersUpdated = false;
    this.data.users = (this.data.users || []).map(u => {
      if (!u.password) {
        usersUpdated = true;
        let pwd = '123456';
        if (u.id === 'user-admin' || u.email?.includes('admin')) {
          pwd = 'admin123';
        } else if (u.id === 'user-alvorada' || u.email?.includes('alvorada')) {
          pwd = 'alvorada123';
        } else if (u.email === 'negocionlinefree@gmail.com' || u.id === 'user-1793499635601') {
          pwd = 'leal123';
        } else if (u.id === 'user-atacado' || u.email?.includes('atacadao')) {
          pwd = 'atacado123';
        }
        return { ...u, password: pwd };
      }
      return u;
    });
    if (usersUpdated) {
      this.save();
    }

    if (!this.data.radioConfigs) {
      this.data.radioConfigs = {};
      if (this.data.radioConfig) {
        this.data.radioConfigs['user-alvorada'] = { ...this.data.radioConfig };
      }
      this.save();
    }
    if (!this.data.radioConfig) {
      this.data.radioConfig = buildInitialRadioConfig(this.data.projects);
      this.save();
    }

    if (!this.data.adminSettings) {
      this.data.adminSettings = {
        defaultVoiceId: 'daniel-varejo',
        creditsPerGeneration: 10,
        initialCredits: 50,
        elevenLabsModel: 'eleven_multilingual_v2',
        systemAnnouncement: 'Rádio Web Supermercado pronta para transmitir suas ofertas ao vivo!',
        contactWhatsapp: '5596981248000',
        contactEmail: 'contato@superlocucao.inforartes.com.br',
        rechargePackages: DEFAULT_RECHARGE_PACKAGES,
        commercialPlans: DEFAULT_COMMERCIAL_PLANS,
        paymentGateway: DEFAULT_PAYMENT_GATEWAY,
        subscriptions: DEFAULT_SUBSCRIPTIONS,
        payments: DEFAULT_PAYMENT_TRANSACTIONS,
        clientLogos: DEFAULT_CLIENT_LOGOS,
      };
      this.save();
    } else {
      let changed = false;
      if (!this.data.adminSettings.contactWhatsapp) {
        this.data.adminSettings.contactWhatsapp = '5596981248000';
        changed = true;
      }
      if (!this.data.adminSettings.contactEmail) {
        this.data.adminSettings.contactEmail = 'contato@superlocucao.inforartes.com.br';
        changed = true;
      }
      if (!this.data.adminSettings.rechargePackages || this.data.adminSettings.rechargePackages.length === 0) {
        this.data.adminSettings.rechargePackages = DEFAULT_RECHARGE_PACKAGES;
        changed = true;
      }
      if (!this.data.adminSettings.commercialPlans || this.data.adminSettings.commercialPlans.length === 0) {
        this.data.adminSettings.commercialPlans = DEFAULT_COMMERCIAL_PLANS;
        changed = true;
      }
      if (!this.data.adminSettings.paymentGateway) {
        this.data.adminSettings.paymentGateway = DEFAULT_PAYMENT_GATEWAY;
        changed = true;
      }
      if (!this.data.adminSettings.subscriptions || this.data.adminSettings.subscriptions.length === 0) {
        this.data.adminSettings.subscriptions = DEFAULT_SUBSCRIPTIONS;
        changed = true;
      }
      if (!this.data.adminSettings.payments || this.data.adminSettings.payments.length === 0) {
        this.data.adminSettings.payments = DEFAULT_PAYMENT_TRANSACTIONS;
        changed = true;
      }
      if (!this.data.adminSettings.clientLogos || this.data.adminSettings.clientLogos.length === 0) {
        this.data.adminSettings.clientLogos = DEFAULT_CLIENT_LOGOS;
        changed = true;
      }
      if (changed) this.save();
    }
  }

  public async initPostgres(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('[Database] DATABASE_URL não definida. Operando com persistência JSON local (.locucao_db.json).');
      return;
    }

    try {
      console.log('[PostgreSQL] Conectando ao banco de dados...');
      const useSsl = dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true');
      this.pool = new Pool({
        connectionString: dbUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : false
      });

      await this.pool.query('SELECT 1');
      console.log('[PostgreSQL] Conectado ao banco de dados com sucesso!');

      // Create schema tables if not exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS profiles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          company_name TEXT,
          city TEXT,
          role TEXT DEFAULT 'supermarket_owner',
          plan TEXT DEFAULT 'pro_varejo',
          status TEXT DEFAULT 'ativo',
          notes TEXT,
          credits_balance INTEGER DEFAULT 50,
          password TEXT DEFAULT '123456',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          last_login TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '123456';

        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          store_name TEXT DEFAULT '',
          store_city TEXT DEFAULT '',
          objective TEXT DEFAULT '',
          campaign_type TEXT DEFAULT 'ofertas_dia',
          style TEXT DEFAULT 'energetica_supermercado',
          desired_duration TEXT DEFAULT '30s',
          tone TEXT DEFAULT 'persuasivo',
          presentation_format TEXT DEFAULT 'abertura_sequencia_encerramento',
          custom_opening TEXT DEFAULT '',
          custom_closing TEXT DEFAULT '',
          free_instructions TEXT DEFAULT '',
          products JSONB DEFAULT '[]'::jsonb,
          scripts JSONB DEFAULT '[]'::jsonb,
          current_script_index INTEGER DEFAULT 0,
          audios JSONB DEFAULT '[]'::jsonb,
          soundtrack_id TEXT DEFAULT 'varejo_alegre',
          soundtrack_volume NUMERIC(3,2) DEFAULT 0.28,
          status TEXT DEFAULT 'draft',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS credit_transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          description TEXT NOT NULL,
          reference_id TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS voices (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          gender TEXT NOT NULL,
          description TEXT NOT NULL,
          eleven_voice_id TEXT,
          gemini_voice_name TEXT DEFAULT 'Fenrir',
          accent TEXT DEFAULT 'Português Brasileiro',
          style_tag TEXT DEFAULT 'Varejo & Supermercado',
          category TEXT DEFAULT 'premade',
          is_default BOOLEAN DEFAULT false,
          preview_url TEXT,
          sample_audio_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS admin_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          default_voice_id TEXT DEFAULT 'daniel-varejo',
          credits_per_generation INTEGER DEFAULT 5,
          initial_credits INTEGER DEFAULT 50,
          eleven_labs_model TEXT DEFAULT 'eleven_multilingual_v2',
          gemini_model TEXT DEFAULT 'gemini-3.8-flash',
          system_announcement TEXT,
          recharge_packages JSONB,
          commercial_plans JSONB,
          payment_gateway JSONB,
          subscriptions JSONB,
          payments JSONB,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS recharge_packages JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS commercial_plans JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS payment_gateway JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS subscriptions JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS payments JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT DEFAULT '5596981248000';
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'contato@superlocucao.inforartes.com.br';

        CREATE TABLE IF NOT EXISTS radio_config (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64),
          store_name TEXT,
          station_name TEXT NOT NULL DEFAULT 'Rádio Supermercado Ao Vivo',
          slogan TEXT DEFAULT '',
          is_on_air BOOLEAN DEFAULT false,
          mode TEXT DEFAULT 'intervalo_tempo',
          spots_every_n_tracks INTEGER DEFAULT 1,
          spots_interval_seconds INTEGER DEFAULT 45,
          only_offers_pause_seconds INTEGER DEFAULT 4,
          music_volume NUMERIC(3,2) DEFAULT 0.75,
          spot_volume NUMERIC(3,2) DEFAULT 1.0,
          ducking_level NUMERIC(3,2) DEFAULT 0.12,
          selected_music_category TEXT DEFAULT 'todas',
          active_playlist_id TEXT DEFAULT 'todas',
          playlists JSONB DEFAULT '[]'::jsonb,
          queue JSONB DEFAULT '[]'::jsonb,
          music_tracks JSONB DEFAULT '[]'::jsonb,
          auto_publish_new_audios BOOLEAN DEFAULT true,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE radio_config ALTER COLUMN id TYPE VARCHAR(64);
        ALTER TABLE radio_config ADD COLUMN IF NOT EXISTS user_id VARCHAR(64);
        ALTER TABLE radio_config ADD COLUMN IF NOT EXISTS store_name TEXT;

        CREATE TABLE IF NOT EXISTS audio_binaries (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          mime_type TEXT NOT NULL DEFAULT 'audio/mpeg',
          file_size INTEGER NOT NULL DEFAULT 0,
          data_base64 TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_audio_binaries_id ON audio_binaries(id);
      `);

      console.log('[PostgreSQL] Carregando dados do PostgreSQL para o cache em memória...');
      await this.pgLoadAll();

      // Somente popula dados locais se o banco PostgreSQL for 100% novo / vazio
      const usersCheck = await this.pool.query('SELECT COUNT(*) FROM profiles');
      const count = Number(usersCheck.rows[0]?.count || 0);

      if (count === 0) {
        console.log('[PostgreSQL] Banco inicial vazio. Realizando carga inicial dos dados locais...');
        for (const u of this.data.users) await this.pgSaveUser(u);
        for (const p of this.data.projects) await this.pgSaveProject(p);
        for (const tx of this.data.creditTransactions) await this.pgSaveTransaction(tx);
        for (const v of this.data.voices) await this.pgSaveVoice(v);
        if (this.data.radioConfigs) {
          for (const [uId, rc] of Object.entries(this.data.radioConfigs)) {
            await this.pgSaveRadioConfig(uId, rc);
          }
        } else if (this.data.radioConfig) {
          await this.pgSaveRadioConfig('user-alvorada', this.data.radioConfig);
        }
        if (this.data.adminSettings) await this.pgSaveAdminSettings(this.data.adminSettings);
        await this.pgLoadAll();
      } else {
        console.log(`[PostgreSQL] Banco existente detectado (${count} perfis). PostgreSQL mantido como fonte primária da verdade (configurações salvas preservadas)!`);
        // Atualiza o arquivo local em disco para refletir o PostgreSQL oficial
        this.save();
      }

      console.log(`[PostgreSQL] Sincronização concluída: ${this.data.users.length} usuários, ${this.data.projects.length} projetos.`);

      // Sincronizar todas as locuções reais (seed e locais) diretamente para o banco de dados da VPS
      await this.syncAllLocalAudiosToPg();
    } catch (err) {
      console.error('[PostgreSQL] Falha na inicialização do PostgreSQL:', err);
    }
  }

  private async pgLoadAll() {
    if (!this.pool) return;
    try {
      const usersRes = await this.pool.query('SELECT * FROM profiles');
      if (usersRes.rows.length > 0) {
        this.data.users = usersRes.rows.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone || undefined,
          companyName: r.company_name || 'Supermercado',
          city: r.city || undefined,
          role: r.role || 'supermarket_owner',
          plan: r.plan || 'pro_varejo',
          status: r.status || 'ativo',
          notes: r.notes || undefined,
          creditsBalance: r.credits_balance ?? 50,
          password: r.password || '123456',
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          lastLogin: r.last_login ? new Date(r.last_login).toISOString() : undefined,
        }));
      }

      const projRes = await this.pool.query('SELECT * FROM projects ORDER BY updated_at DESC');
      if (projRes.rows.length > 0) {
        this.data.projects = projRes.rows.map(r => ({
          id: r.id,
          userId: r.user_id,
          title: r.title,
          storeName: r.store_name,
          storeCity: r.store_city,
          objective: r.objective,
          campaignType: r.campaign_type,
          style: r.style,
          desiredDuration: r.desired_duration,
          tone: r.tone,
          presentationFormat: r.presentation_format,
          customOpening: r.custom_opening,
          customClosing: r.custom_closing,
          freeInstructions: r.free_instructions,
          products: r.products || [],
          scripts: r.scripts || [],
          currentScriptIndex: r.current_script_index ?? 0,
          audios: r.audios || [],
          soundtrackId: r.soundtrack_id,
          soundtrackVolume: Number(r.soundtrack_volume) || 0.2,
          status: r.status,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        }));
      }

      const txRes = await this.pool.query('SELECT * FROM credit_transactions ORDER BY created_at DESC LIMIT 200');
      if (txRes.rows.length > 0) {
        this.data.creditTransactions = txRes.rows.map(r => ({
          id: r.id,
          userId: r.user_id,
          type: r.type,
          amount: r.amount,
          description: r.description,
          referenceId: r.reference_id,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));
      }

      const voiceRes = await this.pool.query('SELECT * FROM voices');
      if (voiceRes.rows.length > 0) {
        this.data.voices = voiceRes.rows.map(r => ({
          id: r.id,
          name: r.name,
          gender: r.gender,
          description: r.description,
          elevenVoiceId: r.eleven_voice_id,
          geminiVoiceName: r.gemini_voice_name,
          accent: r.accent,
          styleTag: r.style_tag,
          category: r.category,
          isDefault: r.is_default,
          previewUrl: r.preview_url,
          sampleAudioUrl: r.sample_audio_url,
        }));
      }

      const adminRes = await this.pool.query('SELECT * FROM admin_settings WHERE id = 1');
      if (adminRes.rows.length > 0) {
        const a = adminRes.rows[0];
        const rechargePackages = a.recharge_packages ? (typeof a.recharge_packages === 'string' ? JSON.parse(a.recharge_packages) : a.recharge_packages) : DEFAULT_RECHARGE_PACKAGES;
        const commercialPlans = a.commercial_plans ? (typeof a.commercial_plans === 'string' ? JSON.parse(a.commercial_plans) : a.commercial_plans) : DEFAULT_COMMERCIAL_PLANS;
        const paymentGateway: PaymentGatewayConfig = a.payment_gateway ? (typeof a.payment_gateway === 'string' ? JSON.parse(a.payment_gateway) : a.payment_gateway) : DEFAULT_PAYMENT_GATEWAY;
        if (!paymentGateway.mercadoPagoAccessToken && process.env.MERCADOPAGO_ACCESS_TOKEN) {
          paymentGateway.mercadoPagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        }
        if (!paymentGateway.mercadoPagoPublicKey && process.env.MERCADOPAGO_PUBLIC_KEY) {
          paymentGateway.mercadoPagoPublicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
        }
        const subscriptions = a.subscriptions ? (typeof a.subscriptions === 'string' ? JSON.parse(a.subscriptions) : a.subscriptions) : DEFAULT_SUBSCRIPTIONS;
        const payments = a.payments ? (typeof a.payments === 'string' ? JSON.parse(a.payments) : a.payments) : DEFAULT_PAYMENT_TRANSACTIONS;

        this.data.adminSettings = {
          defaultVoiceId: a.default_voice_id || 'daniel-varejo',
          creditsPerGeneration: a.credits_per_generation ?? 10,
          initialCredits: a.initial_credits ?? 50,
          elevenLabsModel: a.eleven_labs_model || 'eleven_multilingual_v2',
          systemAnnouncement: a.system_announcement,
          contactWhatsapp: a.contact_whatsapp || this.data.adminSettings?.contactWhatsapp || '5596981248000',
          contactEmail: a.contact_email || this.data.adminSettings?.contactEmail || 'contato@superlocucao.inforartes.com.br',
          rechargePackages,
          commercialPlans,
          paymentGateway,
          subscriptions,
          payments,
        };

        if (!a.recharge_packages || !a.commercial_plans || !a.payment_gateway || !a.subscriptions || !a.payments) {
          await this.pgSaveAdminSettings(this.data.adminSettings);
        }
      } else {
        await this.pgSaveAdminSettings(this.data.adminSettings);
      }

      const radioRes = await this.pool.query('SELECT * FROM radio_config');
      if (!this.data.radioConfigs) this.data.radioConfigs = {};
      for (const rc of radioRes.rows) {
        const uId = rc.user_id || (String(rc.id) === '1' ? 'user-alvorada' : String(rc.id));
        this.data.radioConfigs[uId] = {
          stationName: rc.station_name,
          storeName: rc.store_name,
          slogan: rc.slogan,
          isOnAir: rc.is_on_air,
          mode: rc.mode,
          spotsEveryNTracks: rc.spots_every_n_tracks,
          spotsIntervalSeconds: rc.spots_interval_seconds,
          onlyOffersPauseSeconds: rc.only_offers_pause_seconds,
          musicVolume: Number(rc.music_volume) || 0.75,
          spotVolume: Number(rc.spot_volume) || 1.0,
          duckingLevel: Number(rc.ducking_level) || 0.12,
          selectedMusicCategory: rc.selected_music_category,
          activePlaylistId: rc.active_playlist_id,
          playlists: rc.playlists || DEFAULT_RADIO_PLAYLISTS,
          queue: rc.queue || [],
          musicTracks: rc.music_tracks || DEFAULT_RADIO_MUSIC_TRACKS,
          autoPublishNewAudios: rc.auto_publish_new_audios ?? false,
        };
      }
      if (this.data.radioConfigs['user-alvorada']) {
        this.data.radioConfig = this.data.radioConfigs['user-alvorada'];
      }

      this.save();
    } catch (err) {
      console.error('[PostgreSQL] Erro ao carregar dados:', err);
    }
  }

  private async pgSaveUser(u: UserProfile) {
    if (!this.pool) return;
    try {
      await this.pool.query(`
        INSERT INTO profiles (id, name, email, phone, company_name, city, role, plan, status, notes, credits_balance, password, created_at, last_login)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          company_name = EXCLUDED.company_name,
          city = EXCLUDED.city,
          role = EXCLUDED.role,
          plan = EXCLUDED.plan,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          credits_balance = EXCLUDED.credits_balance,
          password = COALESCE(EXCLUDED.password, profiles.password, '123456'),
          last_login = EXCLUDED.last_login
      `, [
        u.id, u.name, u.email, u.phone || null, u.companyName, u.city || null,
        u.role, u.plan, u.status || 'ativo', u.notes || null, u.creditsBalance,
        u.password || '123456',
        u.createdAt || new Date().toISOString(), u.lastLogin || new Date().toISOString()
      ]);
    } catch (err) {
      console.error(`[PostgreSQL] Erro ao salvar profile ${u.id}:`, err);
    }
  }

  private async pgDeleteUser(id: string) {
    if (!this.pool) return;
    try {
      await this.pool.query('DELETE FROM profiles WHERE id = $1', [id]);
    } catch (err) {
      console.error(`[PostgreSQL] Erro ao deletar profile ${id}:`, err);
    }
  }

  private async pgSaveProject(p: Project) {
    if (!this.pool) return;
    try {
      await this.pool.query(`
        INSERT INTO projects (
          id, user_id, title, store_name, store_city, objective,
          campaign_type, style, desired_duration, tone, presentation_format,
          custom_opening, custom_closing, free_instructions, products, scripts,
          current_script_index, audios, soundtrack_id, soundtrack_volume, status,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15::jsonb, $16::jsonb, $17, $18::jsonb, $19, $20, $21, $22, $23
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          store_name = EXCLUDED.store_name,
          store_city = EXCLUDED.store_city,
          objective = EXCLUDED.objective,
          campaign_type = EXCLUDED.campaign_type,
          style = EXCLUDED.style,
          desired_duration = EXCLUDED.desired_duration,
          tone = EXCLUDED.tone,
          presentation_format = EXCLUDED.presentation_format,
          custom_opening = EXCLUDED.custom_opening,
          custom_closing = EXCLUDED.custom_closing,
          free_instructions = EXCLUDED.free_instructions,
          products = EXCLUDED.products,
          scripts = EXCLUDED.scripts,
          current_script_index = EXCLUDED.current_script_index,
          audios = EXCLUDED.audios,
          soundtrack_id = EXCLUDED.soundtrack_id,
          soundtrack_volume = EXCLUDED.soundtrack_volume,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at
      `, [
        p.id, p.userId, p.title, p.storeName || '', p.storeCity || '', p.objective || '',
        p.campaignType || 'ofertas_dia', p.style || 'energetica_supermercado',
        p.desiredDuration || '30s', p.tone || 'persuasivo',
        p.presentationFormat || 'abertura_sequencia_encerramento',
        p.customOpening || '', p.customClosing || '', p.freeInstructions || '',
        JSON.stringify(p.products || []), JSON.stringify(p.scripts || []),
        p.currentScriptIndex || 0, JSON.stringify(p.audios || []),
        p.soundtrackId || 'varejo_alegre', p.soundtrackVolume || 0.28, p.status || 'draft',
        p.createdAt || new Date().toISOString(), p.updatedAt || new Date().toISOString()
      ]);
    } catch (err) {
      console.error(`[PostgreSQL] Erro ao salvar projeto ${p.id}:`, err);
    }
  }

  private async pgDeleteProject(id: string) {
    if (!this.pool) return;
    try {
      await this.pool.query('DELETE FROM projects WHERE id = $1', [id]);
    } catch (err) {
      console.error(`[PostgreSQL] Erro ao deletar projeto ${id}:`, err);
    }
  }

  private async pgSaveTransaction(tx: CreditTransaction) {
    if (!this.pool) return;
    try {
      await this.pool.query(`
        INSERT INTO credit_transactions (id, user_id, type, amount, description, reference_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [tx.id, tx.userId, tx.type, tx.amount, tx.description, tx.referenceId || null, tx.createdAt]);
    } catch (err) {
      console.error(`[PostgreSQL] Erro ao salvar transação ${tx.id}:`, err);
    }
  }

  private async pgSaveVoice(v: VoicePreset) {
    if (!this.pool) return;
    try {
      await this.pool.query(`
        INSERT INTO voices (id, name, gender, description, eleven_voice_id, gemini_voice_name, accent, style_tag, category, is_default, preview_url, sample_audio_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          gender = EXCLUDED.gender,
          description = EXCLUDED.description,
          eleven_voice_id = EXCLUDED.eleven_voice_id,
          gemini_voice_name = EXCLUDED.gemini_voice_name,
          accent = EXCLUDED.accent,
          style_tag = EXCLUDED.style_tag,
          category = EXCLUDED.category,
          is_default = EXCLUDED.is_default,
          preview_url = EXCLUDED.preview_url,
          sample_audio_url = EXCLUDED.sample_audio_url
      `, [
        v.id, v.name, v.gender, v.description, v.elevenVoiceId || null, v.geminiVoiceName || 'Fenrir',
        v.accent, v.styleTag, v.category || 'premade', v.isDefault || false, v.previewUrl || null, v.sampleAudioUrl || null
      ]);
    } catch (err) {
      console.error(`[PostgreSQL] Erro ao salvar voz ${v.id}:`, err);
    }
  }

  public async pgSaveAdminSettings(s: DbData['adminSettings']) {
    if (!this.pool) return;
    try {
      await this.pool.query(`
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS recharge_packages JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS commercial_plans JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS payment_gateway JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS subscriptions JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS payments JSONB;
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT DEFAULT '5596981248000';
        ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'contato@superlocucao.inforartes.com.br';
      `).catch(() => {});

      await this.pool.query(`
        INSERT INTO admin_settings (
          id, default_voice_id, credits_per_generation, initial_credits,
          eleven_labs_model, system_announcement, contact_whatsapp, contact_email,
          recharge_packages, commercial_plans, payment_gateway, subscriptions, payments, updated_at
        ) VALUES (
          1, $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          default_voice_id = EXCLUDED.default_voice_id,
          credits_per_generation = EXCLUDED.credits_per_generation,
          initial_credits = EXCLUDED.initial_credits,
          eleven_labs_model = EXCLUDED.eleven_labs_model,
          system_announcement = EXCLUDED.system_announcement,
          contact_whatsapp = EXCLUDED.contact_whatsapp,
          contact_email = EXCLUDED.contact_email,
          recharge_packages = EXCLUDED.recharge_packages,
          commercial_plans = EXCLUDED.commercial_plans,
          payment_gateway = EXCLUDED.payment_gateway,
          subscriptions = EXCLUDED.subscriptions,
          payments = EXCLUDED.payments,
          updated_at = NOW()
      `, [
        s.defaultVoiceId,
        s.creditsPerGeneration,
        s.initialCredits,
        s.elevenLabsModel,
        s.systemAnnouncement || null,
        s.contactWhatsapp || '5596981248000',
        s.contactEmail || 'contato@superlocucao.inforartes.com.br',
        JSON.stringify(s.rechargePackages || DEFAULT_RECHARGE_PACKAGES),
        JSON.stringify(s.commercialPlans || DEFAULT_COMMERCIAL_PLANS),
        JSON.stringify(s.paymentGateway || DEFAULT_PAYMENT_GATEWAY),
        JSON.stringify(s.subscriptions || DEFAULT_SUBSCRIPTIONS),
        JSON.stringify(s.payments || DEFAULT_PAYMENT_TRANSACTIONS)
      ]);
      console.log('[PostgreSQL] Configurações de admin, planos e recargas salvas no banco com sucesso!');
    } catch (err) {
      console.error('[PostgreSQL] Erro ao salvar admin settings:', err);
    }
  }

  private async pgSaveRadioConfig(userId: string, rc: RadioStationConfig) {
    if (!this.pool) return;
    try {
      const uId = userId || 'user-alvorada';
      await this.pool.query(`
        INSERT INTO radio_config (
          id, user_id, store_name, station_name, slogan, is_on_air, mode, spots_every_n_tracks,
          spots_interval_seconds, only_offers_pause_seconds, music_volume,
          spot_volume, ducking_level, selected_music_category, active_playlist_id,
          playlists, queue, music_tracks, auto_publish_new_audios, updated_at
        ) VALUES (
          $1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15::jsonb, $16::jsonb, $17::jsonb, $18, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          store_name = EXCLUDED.store_name,
          station_name = EXCLUDED.station_name,
          slogan = EXCLUDED.slogan,
          is_on_air = EXCLUDED.is_on_air,
          mode = EXCLUDED.mode,
          spots_every_n_tracks = EXCLUDED.spots_every_n_tracks,
          spots_interval_seconds = EXCLUDED.spots_interval_seconds,
          only_offers_pause_seconds = EXCLUDED.only_offers_pause_seconds,
          music_volume = EXCLUDED.music_volume,
          spot_volume = EXCLUDED.spot_volume,
          ducking_level = EXCLUDED.ducking_level,
          selected_music_category = EXCLUDED.selected_music_category,
          active_playlist_id = EXCLUDED.active_playlist_id,
          playlists = EXCLUDED.playlists,
          queue = EXCLUDED.queue,
          music_tracks = EXCLUDED.music_tracks,
          auto_publish_new_audios = EXCLUDED.auto_publish_new_audios,
          updated_at = NOW()
      `, [
        uId, rc.storeName || '',
        rc.stationName, rc.slogan, rc.isOnAir, rc.mode, rc.spotsEveryNTracks,
        rc.spotsIntervalSeconds, rc.onlyOffersPauseSeconds, rc.musicVolume,
        rc.spotVolume, rc.duckingLevel, rc.selectedMusicCategory, rc.activePlaylistId,
        JSON.stringify(rc.playlists || []), JSON.stringify(rc.queue || []),
        JSON.stringify(rc.musicTracks || []), rc.autoPublishNewAudios ?? false
      ]);
    } catch (err) {
      console.error(`[PostgreSQL] Erro ao salvar radio_config para ${userId}:`, err);
    }
  }

  public getPool(): pg.Pool | null {
    return this.pool;
  }

  public async pgSaveAudioBinary(id: string, filename: string, mimeType: string, buffer: Buffer): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const base64Data = buffer.toString('base64');
      await this.pool.query(`
        INSERT INTO audio_binaries (id, filename, mime_type, file_size, data_base64, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO UPDATE SET
          filename = EXCLUDED.filename,
          mime_type = EXCLUDED.mime_type,
          file_size = EXCLUDED.file_size,
          data_base64 = EXCLUDED.data_base64,
          updated_at = NOW()
      `, [id, filename, mimeType, buffer.length, base64Data]);
      return true;
    } catch (err) {
      console.error(`[PostgreSQL] Erro ao salvar áudio ${id} no banco de dados:`, err);
      return false;
    }
  }

  public async pgGetAudioBinary(id: string): Promise<StoredAudioBinary | null> {
    if (!this.pool) return null;
    try {
      const res = await this.pool.query('SELECT id, filename, mime_type, data_base64 FROM audio_binaries WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      const buffer = Buffer.from(row.data_base64, 'base64');
      return {
        id: row.id,
        filename: row.filename || `${id}.mp3`,
        mimeType: row.mime_type || 'audio/mpeg',
        buffer
      };
    } catch (err) {
      console.warn(`[PostgreSQL] Erro ao buscar áudio ${id} do banco de dados:`, err);
      return null;
    }
  }

  public async pgCountAudioBinaries(): Promise<number> {
    if (!this.pool) return 0;
    try {
      const res = await this.pool.query('SELECT count(*)::int AS cnt FROM audio_binaries');
      return res.rows[0]?.cnt || 0;
    } catch {
      return 0;
    }
  }

  public async syncAllLocalAudiosToPg(): Promise<{ total: number; uploaded: number; errors: number }> {
    if (!this.pool) {
      console.log('[PostgreSQL] Sincronização de áudios ignorada: PostgreSQL não conectado.');
      return { total: 0, uploaded: 0, errors: 0 };
    }

    const dirsToScan = [
      path.resolve(process.cwd(), 'server', 'seed_audios'),
      path.resolve(process.cwd(), '.locucao_audios')
    ];

    let total = 0;
    let uploaded = 0;
    let errors = 0;
    const seenIds = new Set<string>();

    for (const dir of dirsToScan) {
      if (!fs.existsSync(dir)) continue;
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (!file.endsWith('.mp3') && !file.endsWith('.wav')) continue;
          const id = file.replace(/\.(mp3|wav)$/i, '');
          if (seenIds.has(id)) continue;
          seenIds.add(id);

          total++;
          try {
            const filePath = path.join(dir, file);
            const buffer = fs.readFileSync(filePath);
            const mimeType = file.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';

            const check = await this.pool.query('SELECT id, file_size FROM audio_binaries WHERE id = $1', [id]);
            const isPriorityDemo = id.startsWith('aud-demo-') || id.startsWith('voice_') || id.startsWith('style_');
            if (check.rows.length === 0 || isPriorityDemo || check.rows[0].file_size !== buffer.length) {
              const ok = await this.pgSaveAudioBinary(id, file, mimeType, buffer);
              if (ok) uploaded++;
            }
          } catch (e) {
            errors++;
            console.warn(`[PostgreSQL] Erro ao sincronizar ${file}:`, e);
          }
        }
      } catch (dirErr) {
        console.warn(`[PostgreSQL] Erro ao ler pasta ${dir}:`, dirErr);
      }
    }

    if (uploaded > 0) {
      console.log(`[PostgreSQL] Sincronização automática: ${uploaded} locuções reais enviadas para o banco de dados da VPS.`);
    }
    return { total, uploaded, errors };
  }

  public async importFullDatabase(incoming: Partial<DbData>): Promise<{
    users: number;
    projects: number;
    transactions: number;
  }> {
    if (incoming.users && Array.isArray(incoming.users)) {
      this.data.users = incoming.users;
      for (const u of this.data.users) await this.pgSaveUser(u);
    }
    if (incoming.projects && Array.isArray(incoming.projects)) {
      this.data.projects = incoming.projects;
      for (const p of this.data.projects) await this.pgSaveProject(p);
    }
    if (incoming.creditTransactions && Array.isArray(incoming.creditTransactions)) {
      this.data.creditTransactions = incoming.creditTransactions;
      for (const tx of this.data.creditTransactions) await this.pgSaveTransaction(tx);
    }
    if (incoming.voices && Array.isArray(incoming.voices)) {
      this.data.voices = incoming.voices;
      for (const v of this.data.voices) await this.pgSaveVoice(v);
    }
    if (incoming.radioConfigs && typeof incoming.radioConfigs === 'object') {
      this.data.radioConfigs = incoming.radioConfigs;
      for (const [uId, rc] of Object.entries(this.data.radioConfigs)) {
        await this.pgSaveRadioConfig(uId, rc);
      }
    } else if (incoming.radioConfig) {
      this.data.radioConfig = incoming.radioConfig;
      await this.pgSaveRadioConfig('user-alvorada', this.data.radioConfig);
    }
    if (incoming.adminSettings) {
      this.data.adminSettings = incoming.adminSettings;
      await this.pgSaveAdminSettings(this.data.adminSettings);
    }

    this.save();
    return {
      users: this.data.users.length,
      projects: this.data.projects.length,
      transactions: this.data.creditTransactions.length,
    };
  }

  public async syncFullLocalDatabaseToPg(): Promise<{
    users: number;
    projects: number;
    transactions: number;
    audiosTotal: number;
    audiosUploaded: number;
  }> {
    if (!this.pool) {
      throw new Error('PostgreSQL não conectado. Configure a DATABASE_URL na VPS.');
    }

    console.log('[PostgreSQL] Iniciando sincronização completa do banco local para a VPS...');
    for (const u of this.data.users) await this.pgSaveUser(u);
    for (const p of this.data.projects) await this.pgSaveProject(p);
    for (const tx of this.data.creditTransactions) await this.pgSaveTransaction(tx);
    for (const v of this.data.voices) await this.pgSaveVoice(v);
    if (this.data.radioConfigs) {
      for (const [uId, rc] of Object.entries(this.data.radioConfigs)) {
        await this.pgSaveRadioConfig(uId, rc);
      }
    } else if (this.data.radioConfig) {
      await this.pgSaveRadioConfig('user-alvorada', this.data.radioConfig);
    }
    if (this.data.adminSettings) await this.pgSaveAdminSettings(this.data.adminSettings);

    const audiosSync = await this.syncAllLocalAudiosToPg();
    await this.pgLoadAll();

    console.log('[PostgreSQL] Sincronização completa concluída com sucesso!');
    return {
      users: this.data.users.length,
      projects: this.data.projects.length,
      transactions: this.data.creditTransactions.length,
      audiosTotal: audiosSync.total,
      audiosUploaded: audiosSync.uploaded,
    };
  }

  private load(): DbData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing db file, using defaults', e);
    }

    return {
      users: DEFAULT_USERS,
      projects: DEFAULT_PROJECTS,
      creditTransactions: DEFAULT_TRANSACTIONS,
      voices: INITIAL_VOICES,
      radioConfig: buildInitialRadioConfig(DEFAULT_PROJECTS),
      adminSettings: {
        defaultVoiceId: 'daniel-varejo',
        creditsPerGeneration: 10,
        initialCredits: 50,
        elevenLabsModel: 'eleven_multilingual_v2',
        systemAnnouncement: 'Rádio Web Supermercado pronta para transmitir suas ofertas ao vivo!',
        rechargePackages: DEFAULT_RECHARGE_PACKAGES,
        commercialPlans: DEFAULT_COMMERCIAL_PLANS,
        paymentGateway: DEFAULT_PAYMENT_GATEWAY,
        subscriptions: DEFAULT_SUBSCRIPTIONS,
        payments: DEFAULT_PAYMENT_TRANSACTIONS,
      }
    };
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {
      // Ignora silenciosamente em contêineres e ambientes stateless (Coolify / Docker)
    }
  }

  // Users
  getUsers(): UserProfile[] {
    return this.data.users;
  }

  getUser(id: string): UserProfile | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): UserProfile | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: UserProfile): UserProfile {
    this.data.users.push(user);
    this.save();
    this.pgSaveUser(user);
    return user;
  }

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    this.pgSaveUser(this.data.users[idx]);
    return this.data.users[idx];
  }

  deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    const deleted = this.data.users.length < initialLen;
    if (deleted) {
      this.save();
      this.pgDeleteUser(id);
    }
    return deleted;
  }

  updateUserCredits(userId: string, delta: number, description: string, referenceId?: string): number {
    const user = this.getUser(userId);
    if (!user) return 0;
    const current = typeof user.creditsBalance === 'number' ? user.creditsBalance : Number(user.creditsBalance) || 0;
    user.creditsBalance = Math.max(0, current + delta);
    const tx: CreditTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: delta >= 0 ? 'credit' : 'debit',
      amount: Math.abs(delta),
      description,
      referenceId,
      createdAt: new Date().toISOString()
    };
    this.data.creditTransactions.unshift(tx);
    this.save();
    this.pgSaveUser(user);
    this.pgSaveTransaction(tx);
    return user.creditsBalance;
  }

  // Projects
  getProjects(userId: string): Project[] {
    return this.data.projects.filter(p => p.userId === userId);
  }

  getAllProjects(): Project[] {
    return this.data.projects;
  }

  getProject(id: string): Project | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  saveProject(project: Project): Project {
    const idx = this.data.projects.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      this.data.projects[idx] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      this.data.projects.unshift(project);
    }
    this.save();
    this.pgSaveProject(this.data.projects[idx >= 0 ? idx : 0]);
    return project;
  }

  deleteProject(id: string, userId: string): boolean {
    const initialLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter(p => !(p.id === id && p.userId === userId));
    const deleted = this.data.projects.length < initialLen;
    if (deleted) {
      this.save();
      this.pgDeleteProject(id);
    }
    return deleted;
  }

  // Web Radio Config & Queue (Isolado por Usuário)
  getRadioConfig(userId?: string): RadioStationConfig {
    const key = userId || 'user-alvorada';
    if (!this.data.radioConfigs) {
      this.data.radioConfigs = {};
    }
    if (!this.data.radioConfigs[key]) {
      const user = this.getUser(key);
      const userProjects = this.getProjects(key);
      this.data.radioConfigs[key] = buildInitialRadioConfig(userProjects, user);
      this.save();
      this.pgSaveRadioConfig(key, this.data.radioConfigs[key]);
    }
    const config = this.data.radioConfigs[key];
    // Guarantee all default system playlists (including Natal & Final de Ano) exist
    if (!config.playlists || config.playlists.length === 0) {
      config.playlists = DEFAULT_RADIO_PLAYLISTS;
      this.save();
    } else {
      const existingPlaylistIds = new Set((config.playlists || []).map((p: any) => p.id));
      const missingPlaylists = DEFAULT_RADIO_PLAYLISTS.filter(p => !existingPlaylistIds.has(p.id));
      if (missingPlaylists.length > 0) {
        config.playlists = [...config.playlists, ...missingPlaylists];
        this.save();
      }
    }

    // Guarantee stores exist
    if (!config.stores || config.stores.length === 0) {
      const user = this.getUser(key);
      config.stores = [
        {
          id: 'store-matriz',
          name: `${config.storeName || user?.companyName || 'Supermercado'} — Loja Matriz`,
          city: user?.city || 'Centro',
          slogan: config.slogan || 'O melhor preço todo dia',
          createdAt: new Date().toISOString(),
        },
      ];
      this.save();
    }

    // Guarantee all system default music tracks (including Natal & Réveillon) exist
    if (!config.musicTracks || config.musicTracks.length <= 5) {
      const customTracks = (config.musicTracks || []).filter(t => t.isCustom);
      config.musicTracks = [...customTracks, ...DEFAULT_RADIO_MUSIC_TRACKS];
      this.save();
    } else {
      const existingTrackIds = new Set((config.musicTracks || []).map((t: any) => t.id));
      const missingTracks = DEFAULT_RADIO_MUSIC_TRACKS.filter(t => !existingTrackIds.has(t.id));
      let modified = false;

      if (missingTracks.length > 0) {
        config.musicTracks = [...config.musicTracks, ...missingTracks];
        modified = true;
      }

      config.musicTracks = config.musicTracks.map(t => {
        if (!t.playlistId) {
          modified = true;
          return { ...t, playlistId: t.category };
        }
        return t;
      });

      if (modified) this.save();
    }
    if (key === 'user-alvorada') {
      this.data.radioConfig = config;
    }
    return config;
  }

  updateRadioConfig(userId: string, updates: Partial<RadioStationConfig>): RadioStationConfig {
    const key = userId || 'user-alvorada';
    const current = this.getRadioConfig(key);
    this.data.radioConfigs![key] = {
      ...current,
      ...updates,
    };
    if (key === 'user-alvorada') {
      this.data.radioConfig = this.data.radioConfigs![key];
    }
    this.save();
    this.pgSaveRadioConfig(key, this.data.radioConfigs![key]);
    return this.data.radioConfigs![key];
  }

  updateRadioHeartbeat(data: {
    userId: string;
    userName?: string;
    companyName?: string;
    storeName?: string;
    stationName?: string;
    slogan?: string;
    isOnAir: boolean;
    currentMusicTitle?: string;
    currentSpotTitle?: string;
    isDucking?: boolean;
    spotsQueueCount?: number;
    mode?: string;
    clientIp?: string;
    sessionId?: string;
    storeId?: string;
    deviceName?: string;
    forceTakeover?: boolean;
  }): {
    station: OnlineRadioStation | null;
    conflict?: boolean;
    superseded?: boolean;
    message?: string;
    activeDevice?: string;
    plan?: string;
  } {
    const userId = data.userId || 'user-default';
    const user = this.getUser(userId);
    const userPlan = user?.plan || 'gratuito';

    // Determinar a chave da estação:
    // Para Redes & Atacarejo: chave composta por usuário + loja (permite multi-lojas simultâneas!)
    // Para Pro Varejo e Grátis: chave única por usuário (limita a 1 computador no ar por vez)
    const storeKey = (userPlan === 'redes_atacarejo' && data.storeId) ? `${userId}::${data.storeId}` : userId;

    if (!data.isOnAir) {
      const existing = this.activeOnlineRadios.get(storeKey);
      if (existing && (!data.sessionId || existing.sessionId === data.sessionId)) {
        this.activeOnlineRadios.delete(storeKey);
      }
      return { station: null, plan: userPlan };
    }

    const nowMs = Date.now();
    const nowIso = new Date().toISOString();
    const existing = this.activeOnlineRadios.get(storeKey);

    // REGRA 1: No plano Pro Varejo (e Degustação), limitar a 1 computador simultâneo
    if (userPlan !== 'redes_atacarejo') {
      const isExistingAlive = Boolean(existing && existing.isOnAir && (nowMs - new Date(existing.lastHeartbeat).getTime() < 18000));

      // Conflito de sessão: Outro computador já está tocando
      if (isExistingAlive && existing?.sessionId && data.sessionId && existing.sessionId !== data.sessionId) {
        if (!data.forceTakeover) {
          return {
            station: existing,
            conflict: true,
            activeDevice: existing.deviceName || 'Outro Computador da Loja',
            message: `A Rádio Web já está sendo reproduzida em outro computador (${existing.deviceName || 'Outro terminal'}). O plano Pro Varejo é licenciado para 1 computador por vez. Para transmitir em múltiplas lojas e computadores simultaneamente, faça upgrade para o plano Redes & Atacarejo.`,
            plan: userPlan,
          };
        }
      }

      // Sessão sobreposta por outro computador (forceTakeover feito por outro dispositivo)
      if (existing && existing.sessionId && data.sessionId && existing.sessionId !== data.sessionId && isExistingAlive) {
        return {
          station: existing,
          superseded: true,
          message: 'A transmissão da rádio foi transferida para outro computador da loja.',
          plan: userPlan,
        };
      }
    }

    const radioCfg = this.getRadioConfig(userId);
    let effectiveStoreName = data.storeName;
    if (!effectiveStoreName && data.storeId && radioCfg.stores) {
      const foundStore = radioCfg.stores.find(s => s.id === data.storeId);
      if (foundStore) effectiveStoreName = foundStore.name;
    }
    if (!effectiveStoreName) {
      effectiveStoreName = user?.companyName || existing?.storeName || radioCfg.storeName || 'Supermercado';
    }

    const station: OnlineRadioStation = {
      id: storeKey,
      userId,
      userName: data.userName || user?.name || existing?.userName || 'Operador da Loja',
      companyName: data.companyName || user?.companyName || existing?.companyName || 'Supermercado',
      storeName: effectiveStoreName,
      stationName: data.stationName || existing?.stationName || radioCfg.stationName || 'Rádio Supermercado Ao Vivo',
      slogan: data.slogan || existing?.slogan || radioCfg.slogan || '',
      isOnAir: true,
      currentMusicTitle: data.currentMusicTitle,
      currentSpotTitle: data.currentSpotTitle,
      isDucking: Boolean(data.isDucking),
      spotsQueueCount: data.spotsQueueCount ?? (existing?.spotsQueueCount || radioCfg.queue?.length || 0),
      mode: data.mode || existing?.mode || radioCfg.mode || 'intervalo_tempo',
      lastHeartbeat: nowIso,
      startedAt: existing?.startedAt || nowIso,
      clientIp: data.clientIp || existing?.clientIp,
      sessionId: data.sessionId,
      storeId: data.storeId,
      deviceName: data.deviceName,
    };

    this.activeOnlineRadios.set(storeKey, station);
    return { station, plan: userPlan };
  }

  addRadioStore(userId: string, store: { name: string; city?: string; slogan?: string }): { config: RadioStationConfig; store: RadioStoreBranch } {
    const key = userId || 'user-alvorada';
    const config = this.getRadioConfig(key);
    const newStore: RadioStoreBranch = {
      id: `store-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: store.name.trim(),
      city: store.city?.trim() || '',
      slogan: store.slogan?.trim() || config.slogan || '',
      createdAt: new Date().toISOString(),
    };
    config.stores = [...(config.stores || []), newStore];
    this.save();
    this.pgSaveRadioConfig(key, config);
    return { config, store: newStore };
  }

  updateRadioStore(userId: string, storeId: string, updates: Partial<RadioStoreBranch>): { config: RadioStationConfig; store: RadioStoreBranch } | null {
    const key = userId || 'user-alvorada';
    const config = this.getRadioConfig(key);
    const idx = (config.stores || []).findIndex(s => s.id === storeId);
    if (idx < 0) return null;
    config.stores![idx] = { ...config.stores![idx], ...updates };
    this.save();
    this.pgSaveRadioConfig(key, config);
    return { config, store: config.stores![idx] };
  }

  deleteRadioStore(userId: string, storeId: string): RadioStationConfig {
    const key = userId || 'user-alvorada';
    const config = this.getRadioConfig(key);
    config.stores = (config.stores || []).filter(s => s.id !== storeId);
    this.save();
    this.pgSaveRadioConfig(key, config);
    return config;
  }

  getOnlineRadios(): OnlineRadioStation[] {
    const now = Date.now();
    const list: OnlineRadioStation[] = [];
    for (const [key, station] of this.activeOnlineRadios.entries()) {
      const elapsed = now - new Date(station.lastHeartbeat).getTime();
      // If no heartbeat for > 25 seconds, consider radio offline
      if (elapsed > 25000 || !station.isOnAir) {
        this.activeOnlineRadios.delete(key);
      } else {
        list.push(station);
      }
    }
    return list;
  }

  addMusicTrack(userIdOrTrack: string | RadioMusicTrack, trackMaybe?: RadioMusicTrack): RadioStationConfig {
    const key = typeof userIdOrTrack === 'string' ? userIdOrTrack : 'user-alvorada';
    const track = typeof userIdOrTrack === 'string' ? trackMaybe! : userIdOrTrack;
    const config = this.getRadioConfig(key);
    config.musicTracks = [track, ...config.musicTracks];
    this.save();
    this.pgSaveRadioConfig(key, config);
    return config;
  }

  removeMusicTrack(userIdOrId: string, trackIdMaybe?: string): RadioStationConfig {
    const key = trackIdMaybe !== undefined ? userIdOrId : 'user-alvorada';
    const id = trackIdMaybe !== undefined ? trackIdMaybe : userIdOrId;
    const config = this.getRadioConfig(key);
    config.musicTracks = config.musicTracks.filter(t => t.id !== id);
    this.save();
    this.pgSaveRadioConfig(key, config);
    return config;
  }

  updateMusicTrack(userIdOrId: string, idOrUpdates: string | Partial<RadioMusicTrack>, updatesMaybe?: Partial<RadioMusicTrack>): RadioStationConfig {
    const key = updatesMaybe !== undefined ? (userIdOrId as string) : 'user-alvorada';
    const id = updatesMaybe !== undefined ? (idOrUpdates as string) : (userIdOrId as string);
    const updates = updatesMaybe !== undefined ? updatesMaybe : (idOrUpdates as Partial<RadioMusicTrack>);
    const config = this.getRadioConfig(key);
    config.musicTracks = config.musicTracks.map(t => (t.id === id ? { ...t, ...updates } : t));
    this.save();
    this.pgSaveRadioConfig(key, config);
    return config;
  }

  addPlaylist(userIdOrPlaylist: string | RadioPlaylist, playlistMaybe?: RadioPlaylist): RadioStationConfig {
    const key = typeof userIdOrPlaylist === 'string' ? userIdOrPlaylist : 'user-alvorada';
    const playlist = typeof userIdOrPlaylist === 'string' ? playlistMaybe! : userIdOrPlaylist;
    const config = this.getRadioConfig(key);
    const existing = config.playlists || [];
    if (!existing.some(p => p.id === playlist.id)) {
      config.playlists = [...existing, playlist];
      this.save();
      this.pgSaveRadioConfig(key, config);
    }
    return config;
  }

  deletePlaylist(userIdOrId: string, playlistIdMaybe?: string): RadioStationConfig {
    const key = playlistIdMaybe !== undefined ? userIdOrId : 'user-alvorada';
    const id = playlistIdMaybe !== undefined ? playlistIdMaybe : userIdOrId;
    const config = this.getRadioConfig(key);
    config.playlists = (config.playlists || []).filter(p => p.id !== id);
    // Reassign tracks in deleted playlist to pop_varejo
    config.musicTracks = config.musicTracks.map(t =>
      t.playlistId === id ? { ...t, playlistId: 'pop_varejo', category: 'pop_varejo' } : t
    );
    if (config.activePlaylistId === id) {
      config.activePlaylistId = 'todas';
    }
    this.save();
    this.pgSaveRadioConfig(key, config);
    return config;
  }

  addAudioToRadioQueue(
    userIdOrAudio: string | AudioGenerationItem,
    audioOrMeta?: AudioGenerationItem | {
      campaignType?: string;
      storeName?: string;
      type?: 'oferta' | 'vinheta' | 'aviso';
      priority?: 'alta' | 'normal';
    },
    metaMaybe?: {
      campaignType?: string;
      storeName?: string;
      type?: 'oferta' | 'vinheta' | 'aviso';
      priority?: 'alta' | 'normal';
    }
  ): RadioQueueItem {
    const key = typeof userIdOrAudio === 'string' ? userIdOrAudio : 'user-alvorada';
    const audio = (typeof userIdOrAudio === 'string' ? audioOrMeta : userIdOrAudio) as AudioGenerationItem;
    const meta = (typeof userIdOrAudio === 'string' ? metaMaybe : audioOrMeta) as any;

    const config = this.getRadioConfig(key);
    const existingIdx = config.queue.findIndex(q => q.audioId === audio.id);

    const queueItem: RadioQueueItem = {
      id: existingIdx >= 0 ? config.queue[existingIdx].id : `rq-${audio.id}`,
      audioId: audio.id,
      projectId: audio.projectId,
      title: audio.title,
      audioUrl: audio.audioUrl,
      downloadUrl: audio.downloadUrl,
      durationSeconds: audio.durationSeconds || 25,
      voiceName: audio.voiceName || 'Locutor Oficial',
      campaignType: meta?.campaignType || 'ofertas_dia',
      storeName: meta?.storeName || config.storeName || 'Supermercado',
      type: meta?.type || 'oferta',
      active: true,
      priority: meta?.priority || 'normal',
      addedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      config.queue[existingIdx] = queueItem;
    } else {
      config.queue.unshift(queueItem);
    }

    this.save();
    this.pgSaveRadioConfig(key, config);
    return queueItem;
  }

  removeRadioQueueItem(userIdOrId: string, idOrAudioIdMaybe?: string): RadioStationConfig {
    const key = idOrAudioIdMaybe !== undefined ? userIdOrId : 'user-alvorada';
    const idOrAudioId = idOrAudioIdMaybe !== undefined ? idOrAudioIdMaybe : userIdOrId;
    const config = this.getRadioConfig(key);
    config.queue = config.queue.filter(q => q.id !== idOrAudioId && q.audioId !== idOrAudioId);
    this.save();
    this.pgSaveRadioConfig(key, config);
    return config;
  }

  // Voices
  getVoices(): VoicePreset[] {
    return this.data.voices;
  }

  updateVoices(voices: VoicePreset[]) {
    this.data.voices = voices;
    this.save();
    for (const v of voices) this.pgSaveVoice(v);
  }

  // Transactions
  getTransactions(userId: string): CreditTransaction[] {
    return this.data.creditTransactions.filter(t => t.userId === userId);
  }

  // Admin
  getAdminMetrics(): any {
    const allAudios = this.data.projects.flatMap(p =>
      p.audios.map(a => ({
        ...a,
        projectId: p.id,
        projectTitle: p.title,
        storeName: p.storeName || 'Supermercado',
      }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalCreditsBalance = this.data.users.reduce((acc, u) => acc + (u.creditsBalance || 0), 0);
    const radioConfig = this.getRadioConfig();
    const onlineStations = this.getOnlineRadios();
    const isBroadcasting = onlineStations.length > 0 || radioConfig.isOnAir;

    return {
      totalUsers: this.data.users.length,
      activeUsers: this.data.users.filter(u => u.status === 'ativo').length,
      blockedUsers: this.data.users.filter(u => u.status === 'bloqueado').length,
      totalProjects: this.data.projects.length,
      totalAudiosGenerated: allAudios.length,
      totalCreditsBalance,
      totalCreditsUsed: this.data.creditTransactions
        .filter(t => t.type === 'debit')
        .reduce((acc, t) => acc + t.amount, 0),
      radioStats: {
        queueCount: radioConfig.queue.length,
        stationName: radioConfig.stationName,
        isBroadcasting,
        defaultIntervalSec: radioConfig.spotsIntervalSeconds,
        musicTracksCount: radioConfig.musicTracks?.length || 0,
        onlineStationsCount: onlineStations.length,
        onlineStations,
      },
      postgresConnected: Boolean(this.pool),
      elevenLabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY'),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10 && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'),
      recentAudios: allAudios.slice(0, 25),
      recentTransactions: this.data.creditTransactions.slice(0, 25),
      users: this.data.users,
      settings: this.data.adminSettings
    };
  }

  getAdminSettings(): DbData['adminSettings'] {
    return this.data.adminSettings;
  }

  updateAdminSettings(settings: Partial<DbData['adminSettings']>) {
    this.data.adminSettings = { ...this.data.adminSettings, ...settings };
    this.save();
    this.pgSaveAdminSettings(this.data.adminSettings);
    return this.data.adminSettings;
  }

  // Client Logos (Supermercados Parceiros / Carrossel)
  getClientLogos(): ClientLogo[] {
    if (!this.data.adminSettings.clientLogos || this.data.adminSettings.clientLogos.length === 0) {
      this.data.adminSettings.clientLogos = DEFAULT_CLIENT_LOGOS;
      this.save();
    }
    return this.data.adminSettings.clientLogos;
  }

  saveClientLogos(logos: ClientLogo[]): ClientLogo[] {
    this.data.adminSettings.clientLogos = logos;
    this.save();
    this.pgSaveAdminSettings(this.data.adminSettings);
    return this.data.adminSettings.clientLogos;
  }

  // Subscriptions & Payments
  getSubscriptions(): SubscriptionItem[] {
    return this.data.adminSettings.subscriptions || DEFAULT_SUBSCRIPTIONS;
  }

  updateSubscriptionStatus(id: string, status: 'active' | 'past_due' | 'canceled' | 'trial'): SubscriptionItem | null {
    const list = this.data.adminSettings.subscriptions || DEFAULT_SUBSCRIPTIONS;
    const item = list.find(s => s.id === id);
    if (!item) return null;
    item.status = status;
    this.data.adminSettings.subscriptions = list;
    this.save();
    this.pgSaveAdminSettings(this.data.adminSettings);
    return item;
  }

  getPaymentTransactions(): PaymentTransaction[] {
    return this.data.adminSettings.payments || DEFAULT_PAYMENT_TRANSACTIONS;
  }

  // Gera automaticamente faturas de renovação 10 dias antes do vencimento
  generateUpcomingInvoices(): PaymentTransaction[] {
    const subs = this.data.adminSettings.subscriptions || DEFAULT_SUBSCRIPTIONS;
    const payments = this.data.adminSettings.payments || DEFAULT_PAYMENT_TRANSACTIONS;
    const now = Date.now();
    const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
    const generated: PaymentTransaction[] = [];

    for (const sub of subs) {
      // Ignora planos gratuitos, degustação ou assinaturas canceladas
      if (!sub || sub.status !== 'active' || sub.planId === 'gratuito' || sub.planId === 'degustacao') {
        continue;
      }

      const user = sub.userId ? this.getUser(sub.userId) : null;
      const endPeriodStr = sub.currentPeriodEnd || sub.nextBillingDate;
      if (!endPeriodStr) continue;

      const dueDateMs = new Date(endPeriodStr).getTime();
      if (isNaN(dueDateMs)) continue;

      // Se faltarem 10 dias ou menos para o vencimento (ou se já estiver no período de vencimento)
      const diffMs = dueDateMs - now;
      if (diffMs <= tenDaysMs) {
        const dueDateIso = new Date(dueDateMs).toISOString().slice(0, 10);

        // Verifica se já existe uma fatura de renovação gerada para este ciclo
        const alreadyExists = payments.some(p => {
          const isUserMatch = p.userId === sub.userId || (user && p.clientEmail?.toLowerCase() === user.email.toLowerCase());
          if (!isUserMatch) return false;
          if (p.type !== 'subscription') return false;

          // Se tiver a mesma dueDate ou se foi criada há menos de 20 dias com status pendente para o mesmo plano
          if (p.dueDate && p.dueDate.slice(0, 10) === dueDateIso) return true;
          if (p.status === 'pending' && p.planId === sub.planId) return true;
          return false;
        });

        if (!alreadyExists) {
          const finalAmount = Number(sub.amount ?? sub.price ?? (sub.planId === 'redes_atacarejo' ? 189.9 : 89.9));
          const credits = sub.creditsPerCycle || (sub.planId === 'redes_atacarejo' ? 5000 : 1500);
          const txId = 'FAT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          const dueDateFormatted = new Date(dueDateMs).toLocaleDateString('pt-BR');

          const pixCopiaECola = `00020126580014BR.GOV.BCB.PIX0136superlocucao@inforartes.com.br5204000053039865405${finalAmount.toFixed(2)}5802BR5916SUPER LOCUCAO IA6009SAO PAULO62140510${txId}6304`;
          const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixCopiaECola)}`;

          const newInvoice: PaymentTransaction = {
            id: txId,
            userId: sub.userId,
            userName: sub.userName || user?.name || 'Lojista',
            companyName: sub.companyName || user?.companyName || 'Supermercado',
            clientName: sub.clientName || sub.userName || user?.name || 'Lojista',
            clientEmail: sub.email || user?.email || '',
            type: 'subscription',
            planId: sub.planId,
            itemName: sub.planName || (sub.planId === 'redes_atacarejo' ? 'Redes & Atacarejo' : 'Pro Varejo'),
            description: `Renovação de Assinatura - ${sub.planName || 'Mensal'} (Vencimento: ${dueDateFormatted})`,
            amount: finalAmount,
            creditsAdded: credits,
            creditsAmount: credits,
            status: 'pending',
            paymentMethod: 'pix',
            method: 'pix',
            gateway: sub.gateway || 'Mercado Pago',
            dueDate: new Date(dueDateMs).toISOString(),
            pixCopiaECola,
            pixQrCodeUrl,
            createdAt: new Date().toISOString(),
          };

          payments.unshift(newInvoice);
          generated.push(newInvoice);
        }
      }
    }

    if (generated.length > 0) {
      this.data.adminSettings.payments = payments;
      this.save();
      this.pgSaveAdminSettings(this.data.adminSettings).catch(console.warn);
    }

    return generated;
  }

  createPaymentTransaction(tx: PaymentTransaction): PaymentTransaction {
    const list = this.data.adminSettings.payments || DEFAULT_PAYMENT_TRANSACTIONS;
    const idx = list.findIndex(t => t.id === tx.id);
    if (idx >= 0) {
      list[idx] = tx;
    } else {
      list.unshift(tx);
    }
    this.data.adminSettings.payments = list;
    this.save();
    this.pgSaveAdminSettings(this.data.adminSettings);
    return tx;
  }

  confirmPaymentTransaction(id: string): PaymentTransaction | null {
    const list = this.data.adminSettings.payments || DEFAULT_PAYMENT_TRANSACTIONS;
    const tx = list.find(t => t.id === id);
    if (!tx) return null;

    if (tx.status !== 'approved') {
      tx.status = 'approved';
      tx.paidAt = new Date().toISOString();
      if (tx.creditsAdded && tx.creditsAdded > 0) {
        this.updateUserCredits(
          tx.userId,
          tx.creditsAdded,
          `Pagamento Confirmado: ${tx.description} (R$ ${tx.amount})`
        );
      }

      // Se for pagamento de assinatura / upgrade de plano
      if (tx.planId) {
        const rawPlan = tx.planId === 'degustacao' ? 'gratuito' : tx.planId;
        const targetPlan = rawPlan as 'gratuito' | 'pro_varejo' | 'redes_atacarejo';
        this.updateUser(tx.userId, { plan: targetPlan });

        const user = this.getUser(tx.userId);
        const subList = this.data.adminSettings.subscriptions || DEFAULT_SUBSCRIPTIONS;
        const existingIdx = subList.findIndex(s => s.userId === tx.userId);

        // Se já houver assinatura com vigência futura, prorroga +30 dias a partir do vencimento atual
        let newEndPeriod: Date;
        if (existingIdx >= 0 && subList[existingIdx].currentPeriodEnd) {
          const currentEndMs = new Date(subList[existingIdx].currentPeriodEnd).getTime();
          if (!isNaN(currentEndMs) && currentEndMs > Date.now()) {
            newEndPeriod = new Date(currentEndMs + 30 * 24 * 60 * 60 * 1000);
          } else {
            newEndPeriod = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          }
        } else {
          newEndPeriod = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        const newSub: SubscriptionItem = {
          id: existingIdx >= 0 ? subList[existingIdx].id : `sub-${Date.now()}`,
          userId: tx.userId,
          userName: user?.name || tx.userName,
          companyName: user?.companyName || tx.companyName,
          email: user?.email || tx.clientEmail || '',
          planId: targetPlan,
          planName: tx.itemName || (targetPlan === 'redes_atacarejo' ? 'Redes & Atacarejo' : 'Pro Varejo'),
          amount: tx.amount,
          billingPeriod: '/mês',
          status: 'active',
          paymentMethod: tx.paymentMethod || 'pix',
          gateway: tx.gateway || 'Mercado Pago',
          currentPeriodStart: existingIdx >= 0 ? (subList[existingIdx].currentPeriodStart || new Date().toISOString()) : new Date().toISOString(),
          currentPeriodEnd: newEndPeriod.toISOString(),
          creditsPerCycle: tx.creditsAdded || (targetPlan === 'redes_atacarejo' ? 5000 : 1500),
          autoRenew: true,
          createdAt: existingIdx >= 0 ? subList[existingIdx].createdAt : new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          subList[existingIdx] = newSub;
        } else {
          subList.unshift(newSub);
        }
        this.data.adminSettings.subscriptions = subList;
      }

      this.data.adminSettings.payments = list;
      this.save();
      this.pgSaveAdminSettings(this.data.adminSettings);
    }
    return tx;
  }

  refundPaymentTransaction(id: string): PaymentTransaction | null {
    const list = this.data.adminSettings.payments || DEFAULT_PAYMENT_TRANSACTIONS;
    const tx = list.find(t => t.id === id);
    if (!tx) return null;

    tx.status = 'refunded';
    this.data.adminSettings.payments = list;
    this.save();
    this.pgSaveAdminSettings(this.data.adminSettings);
    return tx;
  }

  getGatewayConfig(): PaymentGatewayConfig {
    return this.data.adminSettings.paymentGateway || DEFAULT_PAYMENT_GATEWAY;
  }

  updateGatewayConfig(config: Partial<PaymentGatewayConfig>): PaymentGatewayConfig {
    this.data.adminSettings.paymentGateway = {
      ...(this.data.adminSettings.paymentGateway || DEFAULT_PAYMENT_GATEWAY),
      ...config,
    };
    this.save();
    this.pgSaveAdminSettings(this.data.adminSettings);
    return this.data.adminSettings.paymentGateway;
  }
}

export const db = new Database();
