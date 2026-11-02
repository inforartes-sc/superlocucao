import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;
import {
  Project, UserProfile, CreditTransaction, VoicePreset, AudioGenerationItem,
  RadioStationConfig, RadioQueueItem, RadioMusicTrack, RadioPlaylist
} from '../src/types/index.ts';

const DB_FILE = path.resolve(process.cwd(), '.locucao_db.json');

export const INITIAL_VOICES: VoicePreset[] = [
  {
    id: 'daniel-varejo',
    name: 'Daniel (Varejo Enérgico)',
    gender: 'masculino',
    description: 'Voz comercial clássica de supermercado, vibrante e persuasiva. Ideal para ofertas relâmpago.',
    elevenVoiceId: 'ErXwobaYiN019PkySvjV',
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
    elevenVoiceId: '21m00Tcm4TlvDq8ikWAM',
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
    elevenVoiceId: 'pNInz6obpgDQGcFmaJgB',
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
    elevenVoiceId: 'EXAVITQu4vr4xnSDxMaL',
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
    elevenVoiceId: 'VR6AewLTigWG4xSOukaG',
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
  try {
    const ext = filename.endsWith('.mp3') ? '.mp3' : '.wav';
    fs.writeFileSync(path.join(AUDIO_STORAGE_DIR, `${id}${ext}`), buffer);
    fs.writeFileSync(
      path.join(AUDIO_STORAGE_DIR, `${id}.meta.json`),
      JSON.stringify({ mimeType, filename })
    );
  } catch (err) {
    console.warn('Failed to persist audio binary to disk:', err);
  }
  return item;
}

export function getAudioBinary(id: string): StoredAudioBinary | undefined {
  if (audioBinaryStore.has(id)) {
    return audioBinaryStore.get(id);
  }
  try {
    const mp3Path = path.join(AUDIO_STORAGE_DIR, `${id}.mp3`);
    const wavPath = path.join(AUDIO_STORAGE_DIR, `${id}.wav`);
    const targetPath = fs.existsSync(mp3Path) ? mp3Path : fs.existsSync(wavPath) ? wavPath : null;

    if (targetPath) {
      const buffer = fs.readFileSync(targetPath);
      let filename = `${id}.mp3`;
      let mimeType = 'audio/mpeg';

      const metaPath = path.join(AUDIO_STORAGE_DIR, `${id}.meta.json`);
      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
          if (meta.filename) filename = meta.filename;
          if (meta.mimeType) mimeType = meta.mimeType;
        } catch { }
      }

      const item: StoredAudioBinary = { id, buffer, mimeType, filename };
      audioBinaryStore.set(id, item);
      return item;
    }
  } catch (err) {
    console.warn('Error reading audio binary from disk:', err);
  }
  return undefined;
}

interface DbData {
  users: UserProfile[];
  projects: Project[];
  creditTransactions: CreditTransaction[];
  voices: VoicePreset[];
  radioConfig?: RadioStationConfig;
  adminSettings: {
    defaultVoiceId: string;
    creditsPerGeneration: number;
    initialCredits: number;
    elevenLabsModel: string;
    systemAnnouncement?: string;
  };
}

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-alvorada',
    name: 'Carlos Mendes',
    email: 'carlos@superalvorada.com.br',
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

function buildInitialRadioConfig(projects: Project[]): RadioStationConfig {
  const queue: RadioQueueItem[] = [];
  const seenAudioIds = new Set<string>();

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
          storeName: proj.storeName || 'Supermercado',
          type: 'oferta',
          active: true,
          priority: queue.length < 2 ? 'alta' : 'normal',
          addedAt: aud.createdAt || new Date().toISOString(),
        });
      }
    }
  }

  return {
    stationName: 'Rádio Supermercado Alvorada FM',
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
    playlists: DEFAULT_RADIO_PLAYLISTS,
    autoPublishNewAudios: true,
    queue,
    musicTracks: DEFAULT_RADIO_MUSIC_TRACKS,
  };
}

class Database {
  private data: DbData;
  private pool: pg.Pool | null = null;

  constructor() {
    this.data = this.load();
    if (!this.data.radioConfig) {
      this.data.radioConfig = buildInitialRadioConfig(this.data.projects);
      this.save();
    } else if (!this.data.radioConfig.musicTracks || this.data.radioConfig.musicTracks.length === 0) {
      this.data.radioConfig.musicTracks = DEFAULT_RADIO_MUSIC_TRACKS;
      this.save();
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
      this.pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: false }
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
          credits_balance INTEGER DEFAULT 500,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          last_login TIMESTAMPTZ DEFAULT NOW()
        );

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
          soundtrack_id TEXT DEFAULT 'sem_trilha',
          soundtrack_volume NUMERIC(3,2) DEFAULT 0.20,
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
          credits_per_generation INTEGER DEFAULT 10,
          initial_credits INTEGER DEFAULT 500,
          eleven_labs_model TEXT DEFAULT 'eleven_multilingual_v2',
          gemini_model TEXT DEFAULT 'gemini-3.8-flash',
          system_announcement TEXT,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS radio_config (
          id INTEGER PRIMARY KEY DEFAULT 1,
          station_name TEXT NOT NULL DEFAULT 'Rádio Supermercado Alvorada FM',
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
      `);

      const { rows } = await this.pool.query('SELECT count(*)::int AS cnt FROM profiles');
      const count = rows[0]?.cnt || 0;

      if (count === 0) {
        console.log('[PostgreSQL] Base vazia. Semeando dados iniciais no PostgreSQL...');
        for (const u of this.data.users) await this.pgSaveUser(u);
        for (const p of this.data.projects) await this.pgSaveProject(p);
        for (const v of this.data.voices) await this.pgSaveVoice(v);
        for (const tx of this.data.creditTransactions) await this.pgSaveTransaction(tx);
        if (this.data.radioConfig) await this.pgSaveRadioConfig(this.data.radioConfig);
        if (this.data.adminSettings) await this.pgSaveAdminSettings(this.data.adminSettings);
        console.log('[PostgreSQL] Dados iniciais salvos com sucesso no PostgreSQL!');
      } else {
        console.log('[PostgreSQL] Carregando dados do PostgreSQL para o cache em memória...');
        await this.pgLoadAll();
        console.log(`[PostgreSQL] Sincronização concluída: ${this.data.users.length} usuários, ${this.data.projects.length} projetos.`);
      }
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
          creditsBalance: r.credits_balance ?? 500,
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
        this.data.adminSettings = {
          defaultVoiceId: a.default_voice_id || 'daniel-varejo',
          creditsPerGeneration: a.credits_per_generation ?? 10,
          initialCredits: a.initial_credits ?? 500,
          elevenLabsModel: a.eleven_labs_model || 'eleven_multilingual_v2',
          systemAnnouncement: a.system_announcement,
        };
      }

      const radioRes = await this.pool.query('SELECT * FROM radio_config WHERE id = 1');
      if (radioRes.rows.length > 0) {
        const rc = radioRes.rows[0];
        this.data.radioConfig = {
          stationName: rc.station_name,
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
          autoPublishNewAudios: rc.auto_publish_new_audios ?? true,
        };
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
        INSERT INTO profiles (id, name, email, phone, company_name, city, role, plan, status, notes, credits_balance, created_at, last_login)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
          last_login = EXCLUDED.last_login
      `, [
        u.id, u.name, u.email, u.phone || null, u.companyName, u.city || null,
        u.role, u.plan, u.status || 'ativo', u.notes || null, u.creditsBalance,
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
        p.soundtrackId || 'sem_trilha', p.soundtrackVolume || 0.2, p.status || 'draft',
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

  private async pgSaveAdminSettings(s: DbData['adminSettings']) {
    if (!this.pool) return;
    try {
      await this.pool.query(`
        INSERT INTO admin_settings (id, default_voice_id, credits_per_generation, initial_credits, eleven_labs_model, system_announcement, updated_at)
        VALUES (1, $1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO UPDATE SET
          default_voice_id = EXCLUDED.default_voice_id,
          credits_per_generation = EXCLUDED.credits_per_generation,
          initial_credits = EXCLUDED.initial_credits,
          eleven_labs_model = EXCLUDED.eleven_labs_model,
          system_announcement = EXCLUDED.system_announcement,
          updated_at = NOW()
      `, [s.defaultVoiceId, s.creditsPerGeneration, s.initialCredits, s.elevenLabsModel, s.systemAnnouncement || null]);
    } catch (err) {
      console.error('[PostgreSQL] Erro ao salvar admin settings:', err);
    }
  }

  private async pgSaveRadioConfig(rc: RadioStationConfig) {
    if (!this.pool) return;
    try {
      await this.pool.query(`
        INSERT INTO radio_config (
          id, station_name, slogan, is_on_air, mode, spots_every_n_tracks,
          spots_interval_seconds, only_offers_pause_seconds, music_volume,
          spot_volume, ducking_level, selected_music_category, active_playlist_id,
          playlists, queue, music_tracks, auto_publish_new_audios, updated_at
        ) VALUES (
          1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13::jsonb, $14::jsonb, $15::jsonb, $16, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
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
        rc.stationName, rc.slogan, rc.isOnAir, rc.mode, rc.spotsEveryNTracks,
        rc.spotsIntervalSeconds, rc.onlyOffersPauseSeconds, rc.musicVolume,
        rc.spotVolume, rc.duckingLevel, rc.selectedMusicCategory, rc.activePlaylistId,
        JSON.stringify(rc.playlists || []), JSON.stringify(rc.queue || []),
        JSON.stringify(rc.musicTracks || []), rc.autoPublishNewAudios ?? true
      ]);
    } catch (err) {
      console.error('[PostgreSQL] Erro ao salvar radio_config:', err);
    }
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
        initialCredits: 500,
        elevenLabsModel: 'eleven_multilingual_v2',
        systemAnnouncement: 'Rádio Web Supermercado pronta para transmitir suas ofertas ao vivo!'
      }
    };
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db file:', e);
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
    user.creditsBalance += delta;
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

  // Web Radio Config & Queue
  getRadioConfig(): RadioStationConfig {
    if (!this.data.radioConfig) {
      this.data.radioConfig = buildInitialRadioConfig(this.data.projects);
      this.save();
    }
    // Guarantee playlists exist
    if (!this.data.radioConfig.playlists || this.data.radioConfig.playlists.length === 0) {
      this.data.radioConfig.playlists = DEFAULT_RADIO_PLAYLISTS;
      this.save();
    }
    // Guarantee rich default tracks exist if legacy config had 5 or fewer
    if (!this.data.radioConfig.musicTracks || this.data.radioConfig.musicTracks.length <= 5) {
      const customTracks = (this.data.radioConfig.musicTracks || []).filter(t => t.isCustom);
      this.data.radioConfig.musicTracks = [...customTracks, ...DEFAULT_RADIO_MUSIC_TRACKS];
      this.save();
    } else {
      let modified = false;
      this.data.radioConfig.musicTracks = this.data.radioConfig.musicTracks.map(t => {
        if (!t.playlistId) {
          modified = true;
          return { ...t, playlistId: t.category };
        }
        return t;
      });
      if (modified) this.save();
    }
    return this.data.radioConfig;
  }

  updateRadioConfig(updates: Partial<RadioStationConfig>): RadioStationConfig {
    const current = this.getRadioConfig();
    this.data.radioConfig = {
      ...current,
      ...updates,
    };
    this.save();
    this.pgSaveRadioConfig(this.data.radioConfig);
    return this.data.radioConfig;
  }

  addMusicTrack(track: RadioMusicTrack): RadioStationConfig {
    const config = this.getRadioConfig();
    config.musicTracks = [track, ...config.musicTracks];
    this.save();
    this.pgSaveRadioConfig(config);
    return config;
  }

  removeMusicTrack(id: string): RadioStationConfig {
    const config = this.getRadioConfig();
    config.musicTracks = config.musicTracks.filter(t => t.id !== id);
    this.save();
    this.pgSaveRadioConfig(config);
    return config;
  }

  updateMusicTrack(id: string, updates: Partial<RadioMusicTrack>): RadioStationConfig {
    const config = this.getRadioConfig();
    config.musicTracks = config.musicTracks.map(t => (t.id === id ? { ...t, ...updates } : t));
    this.save();
    this.pgSaveRadioConfig(config);
    return config;
  }

  addPlaylist(playlist: RadioPlaylist): RadioStationConfig {
    const config = this.getRadioConfig();
    const existing = config.playlists || [];
    if (!existing.some(p => p.id === playlist.id)) {
      config.playlists = [...existing, playlist];
      this.save();
      this.pgSaveRadioConfig(config);
    }
    return config;
  }

  deletePlaylist(id: string): RadioStationConfig {
    const config = this.getRadioConfig();
    config.playlists = (config.playlists || []).filter(p => p.id !== id);
    // Reassign tracks in deleted playlist to pop_varejo
    config.musicTracks = config.musicTracks.map(t =>
      t.playlistId === id ? { ...t, playlistId: 'pop_varejo', category: 'pop_varejo' } : t
    );
    if (config.activePlaylistId === id) {
      config.activePlaylistId = 'todas';
    }
    this.save();
    this.pgSaveRadioConfig(config);
    return config;
  }

  addAudioToRadioQueue(
    audio: AudioGenerationItem,
    meta?: {
      campaignType?: string;
      storeName?: string;
      type?: 'oferta' | 'vinheta' | 'aviso';
      priority?: 'alta' | 'normal';
    }
  ): RadioQueueItem {
    const config = this.getRadioConfig();
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
      storeName: meta?.storeName || 'Supermercado',
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
    this.pgSaveRadioConfig(config);
    return queueItem;
  }

  removeRadioQueueItem(idOrAudioId: string): RadioStationConfig {
    const config = this.getRadioConfig();
    config.queue = config.queue.filter(q => q.id !== idOrAudioId && q.audioId !== idOrAudioId);
    this.save();
    this.pgSaveRadioConfig(config);
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
    const allAudios = this.data.projects.flatMap(p => p.audios);
    return {
      totalUsers: this.data.users.length,
      totalProjects: this.data.projects.length,
      totalAudiosGenerated: allAudios.length,
      totalCreditsUsed: this.data.creditTransactions
        .filter(t => t.type === 'debit')
        .reduce((acc, t) => acc + t.amount, 0),
      elevenLabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'YOUR_ELEVENLABS_API_KEY'),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10 && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'),
      recentTransactions: this.data.creditTransactions.slice(0, 10),
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
}

export const db = new Database();
