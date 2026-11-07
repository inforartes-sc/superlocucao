import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { RadioStationConfig, RadioQueueItem, RadioMusicTrack, RadioPlaylist, AudioGenerationItem, RadioStoreBranch } from '../types';
import { api } from '../services/api';
import { Radio, Zap, Pause, SkipForward, Megaphone, ArrowUpRight, Gauge } from 'lucide-react';
import { attachVoiceNormalizer, attachMusicNormalizer, BroadcastVoiceProcessor } from '../utils/audioNormalizer';

export interface BroadcastLogEntry {
  id: string;
  time: string;
  title: string;
  category: 'oferta' | 'musica' | 'sistema';
  detail?: string;
}

export const RADIO_ON_AIR_STORAGE_KEY = 'superlocucao_radio_is_on_air';
export const RADIO_PLAYBACK_STATE_KEY = 'superlocucao_radio_playback_state';

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

export const DEFAULT_FALLBACK_RADIO_CONFIG: RadioStationConfig = {
  stationName: 'Rádio Supermercado Ao Vivo',
  storeName: 'Supermercado Alvorada',
  slogan: 'As melhores ofertas do dia no ar para você economizar de verdade!',
  isOnAir: false,
  mode: 'intervalo_tempo',
  spotsEveryNTracks: 1,
  offerEveryNSongs: 1,
  spotsIntervalSeconds: 45,
  offerIntervalSeconds: 45,
  onlyOffersPauseSeconds: 5,
  musicVolume: 0.75,
  spotVolume: 1.0,
  voiceVolume: 1.0,
  duckingLevel: 0.12,
  selectedMusicCategory: 'todas',
  activePlaylistId: 'todas',
  playlists: DEFAULT_RADIO_PLAYLISTS,
  autoPublishNewAudios: true,
  queue: [
    {
      id: 'rq-default-1',
      audioId: 'aud-demo-1',
      projectId: 'proj-demo-1',
      title: 'Quarta da Carne — Ofertas Campeãs no Açougue',
      audioUrl: '/api/audio/aud-demo-1.mp3',
      downloadUrl: '/api/audio/aud-demo-1.mp3?download=1',
      durationSeconds: 28,
      voiceName: 'Daniel (Varejo Enérgico)',
      campaignType: 'quarta_carne',
      storeName: 'Supermercado Alvorada',
      type: 'oferta',
      active: true,
      priority: 'alta',
      playCount: 0,
      addedAt: new Date().toISOString(),
    },
    {
      id: 'rq-default-2',
      audioId: 'aud-demo-2',
      projectId: 'proj-demo-2',
      title: 'Festival de Hortifrúti — Direto da Roça',
      audioUrl: '/api/audio/aud-demo-2.mp3',
      downloadUrl: '/api/audio/aud-demo-2.mp3?download=1',
      durationSeconds: 26,
      voiceName: 'Carolina (Simpática & Natural)',
      campaignType: 'festival_hortifruti',
      storeName: 'Supermercado Alvorada',
      type: 'oferta',
      active: true,
      priority: 'normal',
      playCount: 0,
      addedAt: new Date().toISOString(),
    },
    {
      id: 'rq-default-3',
      audioId: 'aud-demo-3',
      projectId: 'proj-demo-3',
      title: 'Superofertas do Fim de Semana — Cerveja & Churrasco',
      audioUrl: '/api/audio/aud-demo-3.mp3',
      downloadUrl: '/api/audio/aud-demo-3.mp3?download=1',
      durationSeconds: 30,
      voiceName: 'Rodrigo (Impacto Ofertas)',
      campaignType: 'ofertas_semana',
      storeName: 'Supermercado Alvorada',
      type: 'relampago',
      active: true,
      priority: 'alta',
      playCount: 0,
      addedAt: new Date().toISOString(),
    },
  ],
  musicTracks: [
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
  ],
};

function getRadioStorageKey(): string {
  const userId = localStorage.getItem('superlocucao_user_id') || 'guest';
  return `superlocucao_radio_config_${userId}`;
}

function loadInitialRadioConfig(): RadioStationConfig {
  try {
    const raw = localStorage.getItem(getRadioStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.stationName && Array.isArray(parsed.queue) && Array.isArray(parsed.musicTracks)) {
        const customTracks = (parsed.musicTracks || []).filter((t: any) => t.isCustom);
        
        // Merge playlists to ensure new system playlists (like Natal & Final de Ano) are always present
        const existingPlaylistIds = new Set((parsed.playlists || []).map((p: any) => p.id));
        const missingDefaultPlaylists = DEFAULT_RADIO_PLAYLISTS.filter(p => !existingPlaylistIds.has(p.id));
        const finalPlaylists = [...(parsed.playlists || []), ...missingDefaultPlaylists];

        // Merge music tracks to guarantee new festive tracks are available
        const existingTrackIds = new Set((parsed.musicTracks || []).map((t: any) => t.id));
        const missingDefaultTracks = DEFAULT_FALLBACK_RADIO_CONFIG.musicTracks.filter(t => !existingTrackIds.has(t.id));
        const finalTracks = [...(parsed.musicTracks || []), ...missingDefaultTracks];

        return {
          ...DEFAULT_FALLBACK_RADIO_CONFIG,
          ...parsed,
          playlists: finalPlaylists,
          activePlaylistId: parsed.activePlaylistId || 'todas',
          queue: parsed.queue.length > 0 ? parsed.queue : DEFAULT_FALLBACK_RADIO_CONFIG.queue,
          musicTracks: finalTracks,
        };
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_FALLBACK_RADIO_CONFIG;
}

interface RadioContextValue {
  config: RadioStationConfig;
  availableAudios: (AudioGenerationItem & { storeName?: string; projectTitle?: string })[];
  isOnAir: boolean;
  isDucking: boolean;
  currentMusic: RadioMusicTrack | null;
  currentSpot: RadioQueueItem | null;
  nextSpot: RadioQueueItem | null;
  countdownSeconds: number;
  songsSinceLastSpot: number;
  spotCurrentTime: number;
  spotDuration: number;
  musicCurrentTime: number;
  musicDuration: number;
  broadcastLogs: BroadcastLogEntry[];
  vocalBoostDb: number;
  isVocalLevelerEnabled: boolean;
  toggleVocalLeveler: () => void;
  musicBoostDb: number;
  isMusicLevelerEnabled: boolean;
  toggleMusicLeveler: () => void;
  triggerManualDucking: (enable: boolean) => void;
  isLiveMicActive: boolean;
  setLiveMicActive: (active: boolean) => void;
  loading: boolean;
  refreshRadioData: () => Promise<void>;
  updateConfig: (partial: Partial<RadioStationConfig>) => Promise<void>;
  toggleOnAir: () => void;
  restartRadio: () => void;
  autoplayBlocked: boolean;
  resumeAutoplay: () => void;
  playSpotNow: (item?: RadioQueueItem) => void;
  stopCurrentSpot: () => void;
  skipMusicTrack: () => void;
  publishAudioToRadio: (
    audio: AudioGenerationItem,
    options?: {
      storeName?: string;
      type?: RadioQueueItem['type'];
      priority?: RadioQueueItem['priority'];
      playImmediately?: boolean;
    }
  ) => Promise<RadioQueueItem | null>;
  removeQueueItem: (id: string) => Promise<void>;
  moveQueueItem: (id: string, direction: 'up' | 'down') => Promise<void>;
  updateQueueItem: (id: string, updates: Partial<RadioQueueItem>) => Promise<void>;
  toggleQueueItemActive: (id: string) => Promise<void>;
  toggleQueueItemPriority: (id: string) => Promise<void>;
  addCustomMusicFiles: (files: FileList) => void;
  uploadCustomMusic: (
    file: File,
    options: {
      title?: string;
      artist?: string;
      playlistId?: string;
    }
  ) => Promise<RadioMusicTrack>;
  createCustomPlaylist: (data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => Promise<RadioPlaylist>;
  deleteCustomPlaylist: (id: string) => Promise<void>;
  deleteMusicTrack: (id: string) => Promise<void>;
  updateMusicTrack: (id: string, updates: Partial<RadioMusicTrack>) => Promise<void>;
  setActivePlaylist: (playlistId: string) => Promise<void>;
  playMusicTrackNow: (track: RadioMusicTrack) => void;
  uploadSpotAudioFile: (
    file: File,
    options?: {
      title?: string;
      type?: RadioQueueItem['type'];
      priority?: RadioQueueItem['priority'];
    }
  ) => Promise<RadioQueueItem | null>;
  sessionConflict: { message: string; activeDevice?: string } | null;
  clearSessionConflict: () => void;
  takeoverRadioSession: () => Promise<void>;
  supersededMessage: string | null;
  clearSupersededMessage: () => void;
  activeStoreId: string;
  setActiveStoreId: (storeId: string) => void;
  createRadioStore: (store: { name: string; city?: string; slogan?: string }) => Promise<void>;
  updateRadioStore: (id: string, updates: Partial<RadioStoreBranch>) => Promise<void>;
  deleteRadioStore: (id: string) => Promise<void>;
}

const RadioContext = createContext<RadioContextValue | undefined>(undefined);

export const useRadio = (): RadioContextValue => {
  const ctx = useContext(RadioContext);
  if (!ctx) {
    throw new Error('useRadio must be used within a RadioBroadcastProvider');
  }
  return ctx;
};

interface ProviderProps {
  children: React.ReactNode;
  activeView: string;
  onNavigateToRadio: () => void;
}

export const RadioBroadcastProvider: React.FC<ProviderProps> = ({
  children,
  activeView,
  onNavigateToRadio,
}) => {
  const [config, setConfig] = useState<RadioStationConfig>(() => loadInitialRadioConfig());
  const [availableAudios, setAvailableAudios] = useState<
    (AudioGenerationItem & { storeName?: string; projectTitle?: string })[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOnAir, setIsOnAir] = useState<boolean>(() => {
    try {
      return localStorage.getItem(RADIO_ON_AIR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [isDucking, setIsDucking] = useState<boolean>(false);
  const [currentMusic, setCurrentMusic] = useState<RadioMusicTrack | null>(null);
  const [currentSpot, setCurrentSpot] = useState<RadioQueueItem | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(30);
  const [songsSinceLastSpot, setSongsSinceLastSpot] = useState<number>(0);
  const [spotCurrentTime, setSpotCurrentTime] = useState<number>(0);
  const [spotDuration, setSpotDuration] = useState<number>(0);
  const [musicCurrentTime, setMusicCurrentTime] = useState<number>(0);
  const [musicDuration, setMusicDuration] = useState<number>(0);
  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastLogEntry[]>([]);
  const [vocalBoostDb, setVocalBoostDb] = useState<number>(0);
  const [isVocalLevelerEnabled, setIsVocalLevelerEnabled] = useState<boolean>(true);
  const [musicBoostDb, setMusicBoostDb] = useState<number>(0);
  const [isMusicLevelerEnabled, setIsMusicLevelerEnabled] = useState<boolean>(true);
  const [isLiveMicActive, setIsLiveMicActive] = useState<boolean>(false);
  const [sessionConflict, setSessionConflict] = useState<{ message: string; activeDevice?: string } | null>(null);
  const [supersededMessage, setSupersededMessage] = useState<string | null>(null);
  const [activeStoreId, setActiveStoreIdState] = useState<string>(() => {
    return localStorage.getItem('superlocucao_active_store_id') || 'store-matriz';
  });

  const getRadioSessionId = useCallback(() => {
    let sId = localStorage.getItem('superlocucao_radio_session_id');
    if (!sId) {
      sId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('superlocucao_radio_session_id', sId);
    }
    return sId;
  }, []);

  const getRadioDeviceName = useCallback(() => {
    let d = localStorage.getItem('superlocucao_radio_device_name');
    if (!d) {
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      d = isMobile ? 'Dispositivo Móvel' : 'Computador da Loja';
    }
    return d;
  }, []);
  const spotNormalizerRef = useRef<BroadcastVoiceProcessor | null>(null);
  const musicNormalizerRef = useRef<BroadcastVoiceProcessor | null>(null);

  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const spotAudioRef = useRef<HTMLAudioElement | null>(null);
  const spotIndexRef = useRef<number>(0);
  const musicIndexRef = useRef<number>(0);
  const fadeIntervalRef = useRef<number | null>(null);
  const configRef = useRef<RadioStationConfig>(config);
  const isOnAirRef = useRef<boolean>(isOnAir);
  const currentSpotRef = useRef<RadioQueueItem | null>(null);
  const currentMusicRef = useRef<RadioMusicTrack | null>(null);
  const isLiveMicActiveRef = useRef<boolean>(false);
  const lastStateSaveRef = useRef<number>(0);
  const countdownSecondsRef = useRef<number>(30);

  configRef.current = config;
  isOnAirRef.current = isOnAir;
  currentSpotRef.current = currentSpot;
  currentMusicRef.current = currentMusic;
  isLiveMicActiveRef.current = isLiveMicActive;
  countdownSecondsRef.current = countdownSeconds;

  const persistConfigLocally = useCallback((cfg: RadioStationConfig) => {
    try {
      localStorage.setItem(getRadioStorageKey(), JSON.stringify(cfg));
    } catch {
      // ignore
    }
  }, []);

  const appendLog = useCallback((title: string, category: BroadcastLogEntry['category'], detail?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setBroadcastLogs(prev => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: timeStr,
        title,
        category,
        detail,
      },
      ...prev.slice(0, 39),
    ]);
  }, []);

  const refreshRadioData = useCallback(async () => {
    try {
      const res = await api.getRadio();
      if (res && res.config && res.config.stationName) {
        // Guarantee system playlists & tracks are merged even on frontend
        const existingPlaylistIds = new Set((res.config.playlists || []).map((p: any) => p.id));
        const missingDefaultPlaylists = DEFAULT_RADIO_PLAYLISTS.filter(p => !existingPlaylistIds.has(p.id));
        const finalPlaylists = [...(res.config.playlists || []), ...missingDefaultPlaylists];

        const existingTrackIds = new Set((res.config.musicTracks || []).map((t: any) => t.id));
        const missingDefaultTracks = DEFAULT_FALLBACK_RADIO_CONFIG.musicTracks.filter(t => !existingTrackIds.has(t.id));
        const finalTracks = [...(res.config.musicTracks || []), ...missingDefaultTracks];

        const mergedConfig = {
          ...res.config,
          playlists: finalPlaylists,
          musicTracks: finalTracks
        };

        setConfig(mergedConfig);
        persistConfigLocally(mergedConfig);
        setAvailableAudios(res.availableAudios || []);
        if (!isOnAirRef.current) {
          setCountdownSeconds(res.config.spotsIntervalSeconds || res.config.offerIntervalSeconds || 45);
        }
        return;
      }
    } catch {
      // Fallback: load availableAudios from /api/projects so it works even if server wasn't restarted
    }

    try {
      const projRes = await api.getProjects();
      const audios = (projRes.projects || []).flatMap(p =>
        (p.audios || [])
          .filter(a => a.status === 'ready')
          .map(a => ({
            ...a,
            storeName: p.storeName || configRef.current.storeName || 'Supermercado',
            projectTitle: p.title,
          }))
      );
      setAvailableAudios(audios);
    } catch (e) {
      console.warn('Erro ao sincronizar projetos para a Rádio Web:', e);
    } finally {
      setLoading(false);
    }
  }, [persistConfigLocally]);

  useEffect(() => {
    refreshRadioData();
  }, [refreshRadioData]);

  // Smooth volume fader for background music deck (fade-in / fade-out suave sem corte brusco)
  const fadeMusicVolume = useCallback((targetVolume: number, durationMs = 650) => {
    const audio = musicAudioRef.current;
    if (!audio) return;
    if (fadeIntervalRef.current) {
      window.clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    const clampedTarget = Math.max(0, Math.min(1, targetVolume));
    const startVolume = audio.volume;
    const diff = clampedTarget - startVolume;
    const setVol = (v: number) => {
      audio.volume = v;
      if (musicNormalizerRef.current) {
        musicNormalizerRef.current.setUserVolume(v);
      }
    };

    if (Math.abs(diff) < 0.005 || durationMs <= 0) {
      setVol(clampedTarget);
      return;
    }
    const stepTime = 16; // 60fps curva suave
    const steps = Math.max(4, Math.floor(durationMs / stepTime));
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      const linearProgress = Math.min(1, currentStep / steps);
      // Curva smoothstep para transição ultra suave da música
      const smoothProgress = linearProgress * linearProgress * (3 - 2 * linearProgress);
      setVol(Math.max(0, Math.min(1, startVolume + diff * smoothProgress)));
      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          window.clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        setVol(clampedTarget);
      }
    }, stepTime);
  }, []);

  // Helper: verifica se a locução está programada para tocar no dia da semana atual (0=Dom, 1=Seg..6=Sáb)
  const isScheduledForDay = (item: RadioQueueItem, dayOfWeek: number = new Date().getDay()) => {
    if (!item.daysOfWeek || !Array.isArray(item.daysOfWeek) || item.daysOfWeek.length === 0) {
      return true; // Padrão: toca todos os dias da semana
    }
    return item.daysOfWeek.includes(dayOfWeek);
  };

  // Compute active queue and next spot (considering day of week and optional repeatIntervalMinutes)
  const activeQueue = (config?.queue || []).filter(item => item.active && isScheduledForDay(item));
  const nextSpot = (() => {
    if (activeQueue.length === 0) return null;
    const now = Date.now();
    // 1. Due timed items
    const dueTimed = activeQueue.filter(item => {
      if (!item.repeatIntervalMinutes || item.repeatIntervalMinutes <= 0) return false;
      if (!item.lastPlayedAt) return true;
      const elapsedMin = (now - new Date(item.lastPlayedAt).getTime()) / (1000 * 60);
      return elapsedMin >= item.repeatIntervalMinutes;
    });
    if (dueTimed.length > 0) {
      return dueTimed[0];
    }
    // 2. Normal rotation pool (items without fixed repeat interval)
    const normalItems = activeQueue.filter(item => !item.repeatIntervalMinutes || item.repeatIntervalMinutes <= 0);
    const pool = normalItems.length > 0 ? normalItems : activeQueue;

    const highPriority = pool.filter(item => item.priority === 'alta');
    const regularPriority = pool.filter(item => item.priority !== 'alta');

    if (highPriority.length > 0 && regularPriority.length > 0) {
      const weightedPool: RadioQueueItem[] = [];
      let hIdx = 0;
      let rIdx = 0;
      while (hIdx < highPriority.length || rIdx < regularPriority.length) {
        if (hIdx < highPriority.length) weightedPool.push(highPriority[hIdx++]);
        if (rIdx < regularPriority.length) weightedPool.push(regularPriority[rIdx++]);
      }
      return weightedPool[spotIndexRef.current % weightedPool.length];
    }
    return pool[spotIndexRef.current % pool.length];
  })();

  // Start or switch background music track
  const playMusicTrack = useCallback(
    (track?: RadioMusicTrack, initialSeekTime: number = 0) => {
      const cfg = configRef.current;
      if (!cfg || cfg.mode === 'somente_ofertas') {
        if (musicAudioRef.current) {
          musicAudioRef.current.pause();
        }
        setCurrentMusic(null);
        return;
      }

      const tracks = (cfg.musicTracks || []).filter(t => t.active);
      if (tracks.length === 0) return;

      // Filter by active playlist if one is selected and not 'todas'
      let candidateTracks = tracks;
      if (cfg.activePlaylistId && cfg.activePlaylistId !== 'todas') {
        const filtered = tracks.filter(
          t => t.playlistId === cfg.activePlaylistId || t.category === cfg.activePlaylistId
        );
        if (filtered.length > 0) {
          candidateTracks = filtered;
        }
      }

      const chosen = track || candidateTracks[musicIndexRef.current % candidateTracks.length];
      if (!track) {
        musicIndexRef.current = (musicIndexRef.current + 1) % candidateTracks.length;
      }
      setCurrentMusic(chosen);
      currentMusicRef.current = chosen;

      const audio = musicAudioRef.current;
      if (!audio) return;

      audio.src = chosen.audioUrl;
      if (initialSeekTime > 0) {
        try {
          audio.currentTime = initialSeekTime;
        } catch {}
      }
      const targetVol = currentSpotRef.current ? cfg.duckingLevel : cfg.musicVolume;
      audio.volume = targetVol;

      if (!musicNormalizerRef.current) {
        musicNormalizerRef.current = attachMusicNormalizer(audio, {
          initialUserVolume: targetVol,
          enabled: isMusicLevelerEnabled,
          onGainChange: (gain) => setMusicBoostDb(gain),
        });
      }
      if (musicNormalizerRef.current) {
        if (musicNormalizerRef.current.audioContext.state === 'suspended') {
          musicNormalizerRef.current.audioContext.resume().catch(() => {});
        }
        musicNormalizerRef.current.setNormalizerEnabled(isMusicLevelerEnabled);
        musicNormalizerRef.current.resetAgcForNewTrack();
        musicNormalizerRef.current.setUserVolume(targetVol);
      }
      audio
        .play()
        .then(() => {
          setAutoplayBlocked(false);
          appendLog(`Trilha Musical: ${chosen.title}`, 'musica', chosen.style || chosen.artist);
        })
        .catch(err => {
          console.warn('Autoplay bloqueado ou falha na música ambiente:', err);
          setAutoplayBlocked(true);

          const unlock = () => {
            if (isOnAirRef.current && musicAudioRef.current && musicAudioRef.current.paused) {
              musicAudioRef.current.play().then(() => {
                setAutoplayBlocked(false);
              }).catch(() => {});
            }
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('keydown', unlock);
          };
          window.addEventListener('click', unlock, { passive: true });
          window.addEventListener('touchstart', unlock, { passive: true });
          window.addEventListener('keydown', unlock, { passive: true });
        });
    },
    [appendLog, isMusicLevelerEnabled]
  );

  // Monitora e persiste o progresso do deck de música para restaurar sem parar em recarregamentos (F5)
  const handleMusicTimeUpdate = useCallback(() => {
    const audio = musicAudioRef.current;
    if (!audio) return;
    setMusicCurrentTime(audio.currentTime);

    const now = Date.now();
    if (isOnAirRef.current && currentMusicRef.current && now - lastStateSaveRef.current > 1500) {
      lastStateSaveRef.current = now;
      try {
        localStorage.setItem(
          RADIO_PLAYBACK_STATE_KEY,
          JSON.stringify({
            trackId: currentMusicRef.current.id,
            currentTime: audio.currentTime,
            countdown: countdownSecondsRef.current,
            updatedAt: now,
          })
        );
      } catch {}
    }
  }, []);

  // Restaura automaticamente a transmissão contínua caso o usuário recarregue a página com a rádio no ar
  const hasRestoredOnAirRef = useRef<boolean>(false);
  useEffect(() => {
    if (hasRestoredOnAirRef.current) return;
    hasRestoredOnAirRef.current = true;

    let wasOnAir = false;
    try {
      wasOnAir = localStorage.getItem(RADIO_ON_AIR_STORAGE_KEY) === 'true';
    } catch {}

    if (!wasOnAir) return;

    setIsOnAir(true);
    isOnAirRef.current = true;

    let savedTrackId: string | null = null;
    let savedTime = 0;
    let savedCountdown = 30;

    try {
      const rawState = localStorage.getItem(RADIO_PLAYBACK_STATE_KEY);
      if (rawState) {
        const parsed = JSON.parse(rawState);
        savedTrackId = parsed.trackId || null;
        savedTime = Number(parsed.currentTime) || 0;
        if (typeof parsed.countdown === 'number' && parsed.countdown > 0) {
          savedCountdown = parsed.countdown;
        }
      }
    } catch {}

    setCountdownSeconds(savedCountdown);

    const cfg = configRef.current;
    if (cfg && cfg.mode !== 'somente_ofertas') {
      const tracks = (cfg.musicTracks || []).filter(t => t.active);
      let candidateTracks = tracks;
      if (cfg.activePlaylistId && cfg.activePlaylistId !== 'todas') {
        const filtered = tracks.filter(
          t => t.playlistId === cfg.activePlaylistId || t.category === cfg.activePlaylistId
        );
        if (filtered.length > 0) candidateTracks = filtered;
      }

      let chosenTrack = candidateTracks.find(t => t.id === savedTrackId);
      if (!chosenTrack && candidateTracks.length > 0) {
        chosenTrack = candidateTracks[0];
        savedTime = 0;
      }

      if (chosenTrack) {
        playMusicTrack(chosenTrack, savedTime);
        appendLog('Rádio Web mantida NO AR após atualização da página', 'sistema', chosenTrack.title);
      }
    }
  }, [appendLog, playMusicTrack]);

  // Trigger an offer voiceover spot with Auto-Ducking
  const playSpotNow = useCallback(
    async (specificItem?: RadioQueueItem) => {
      if (isLiveMicActiveRef.current) {
        return;
      }
      const cfg = configRef.current;
      if (!cfg) return;

      const currentDay = new Date().getDay();
      const activeItems = (cfg.queue || []).filter(item => {
        if (!item.active) return false;
        if (!item.daysOfWeek || !Array.isArray(item.daysOfWeek) || item.daysOfWeek.length === 0) return true;
        return item.daysOfWeek.includes(currentDay);
      });
      if (!specificItem && activeItems.length === 0) return;

      let chosen: RadioQueueItem;
      if (specificItem) {
        chosen = specificItem;
      } else {
        const now = Date.now();
        // 1. Check for items with timed repeatIntervalMinutes that are due
        const dueTimed = activeItems.filter(item => {
          if (!item.repeatIntervalMinutes || item.repeatIntervalMinutes <= 0) return false;
          if (!item.lastPlayedAt) return true;
          const elapsedMin = (now - new Date(item.lastPlayedAt).getTime()) / (1000 * 60);
          return elapsedMin >= item.repeatIntervalMinutes;
        });

        if (dueTimed.length > 0) {
          // Sort due items by priority (alta first), then oldest played
          dueTimed.sort((a, b) => {
            if (a.priority === 'alta' && b.priority !== 'alta') return -1;
            if (b.priority === 'alta' && a.priority !== 'alta') return 1;
            const aLast = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0;
            const bLast = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0;
            return aLast - bLast;
          });
          chosen = dueTimed[0];
        } else {
          // 2. Normal rotation pool (items without fixed repeat interval)
          const normalItems = activeItems.filter(item => !item.repeatIntervalMinutes || item.repeatIntervalMinutes <= 0);
          const pool = normalItems.length > 0 ? normalItems : activeItems;

          const highPriority = pool.filter(item => item.priority === 'alta');
          const regularPriority = pool.filter(item => item.priority !== 'alta');

          if (highPriority.length > 0 && regularPriority.length > 0) {
            const weightedPool: RadioQueueItem[] = [];
            let hIdx = 0;
            let rIdx = 0;
            while (hIdx < highPriority.length || rIdx < regularPriority.length) {
              if (hIdx < highPriority.length) weightedPool.push(highPriority[hIdx++]);
              if (rIdx < regularPriority.length) weightedPool.push(regularPriority[rIdx++]);
            }
            chosen = weightedPool[spotIndexRef.current % weightedPool.length];
            spotIndexRef.current = (spotIndexRef.current + 1) % weightedPool.length;
          } else {
            chosen = pool[spotIndexRef.current % pool.length];
            spotIndexRef.current = (spotIndexRef.current + 1) % Math.max(1, pool.length);
          }
        }
      }

      const spotAudio = spotAudioRef.current;
      if (!spotAudio) return;

      // Ensure station is marked On Air if user manually fires a spot
      if (!isOnAirRef.current) {
        setIsOnAir(true);
        isOnAirRef.current = true;
        if (cfg.mode !== 'somente_ofertas' && (!musicAudioRef.current?.src || musicAudioRef.current.paused)) {
          playMusicTrack();
        }
      }

      // Suave fade-out de saída na música ambiente ANTES de soltar a voz
      setIsDucking(true);
      const isMusicPlaying = Boolean(
        musicAudioRef.current &&
        !musicAudioRef.current.paused &&
        musicAudioRef.current.currentTime > 0
      );

      // Inicia o fade suave de saída da música ambiente para o nível de ducking
      fadeMusicVolume(cfg.duckingLevel ?? 0.12, 650);

      // Aguarda 400ms para a música baixar suavemente antes da locução começar
      if (isMusicPlaying) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      setCurrentSpot(chosen);
      currentSpotRef.current = chosen;

      spotAudio.src = chosen.audioUrl;
      // Connect / refresh intelligent vocal leveler & compressor
      if (!spotNormalizerRef.current) {
        spotNormalizerRef.current = attachVoiceNormalizer(spotAudio, {
          initialUserVolume: cfg.voiceVolume ?? cfg.spotVolume ?? 1.0,
          enabled: isVocalLevelerEnabled,
          onGainChange: (gain) => setVocalBoostDb(gain),
        });
      }
      if (spotNormalizerRef.current) {
        if (spotNormalizerRef.current.audioContext.state === 'suspended') {
          spotNormalizerRef.current.audioContext.resume().catch(() => {});
        }
        spotNormalizerRef.current.setNormalizerEnabled(isVocalLevelerEnabled);
        spotNormalizerRef.current.resetAgcForNewTrack();
        spotNormalizerRef.current.setUserVolume(cfg.voiceVolume ?? cfg.spotVolume ?? 1.0);
      }
      spotAudio.volume = 1.0;
      spotAudio
        .play()
        .then(() => {
          appendLog(
            `Locução no Ar: ${chosen.title}`,
            'oferta',
            `${chosen.voiceName} • ${chosen.storeName || cfg.storeName || cfg.stationName}`
          );
        })
        .catch(err => {
          console.error('Erro ao reproduzir locução na Rádio Web:', err);
          setIsDucking(false);
          setCurrentSpot(null);
          fadeMusicVolume(cfg.musicVolume, 500);
        });
    },
    [appendLog, fadeMusicVolume, playMusicTrack]
  );

  const triggerManualDucking = useCallback(
    (enable: boolean) => {
      const cfg = configRef.current;
      if (!cfg) return;
      if (enable) {
        setIsDucking(true);
        fadeMusicVolume(cfg.duckingLevel ?? 0.12, 350);
      } else {
        setIsDucking(false);
        fadeMusicVolume(cfg.musicVolume ?? 0.75, 500);
      }
    },
    [fadeMusicVolume]
  );

  const setLiveMicActive = useCallback(
    (active: boolean) => {
      setIsLiveMicActive(active);
      isLiveMicActiveRef.current = active;
      const cfg = configRef.current;
      if (!cfg) return;

      if (active) {
        // Interrompe imediatamente qualquer locução que esteja no ar para não colidir com a voz ao vivo
        if (spotAudioRef.current) {
          spotAudioRef.current.pause();
          spotAudioRef.current.currentTime = 0;
        }
        setCurrentSpot(null);
        currentSpotRef.current = null;
        // Aplica ducking na música ambiente para a fala no microfone sobressair
        setIsDucking(true);
        fadeMusicVolume(cfg.duckingLevel ?? 0.12, 300);
      } else {
        // Microfone desligado: restaura a música ambiente ao volume normal suavemente
        setIsDucking(false);
        fadeMusicVolume(cfg.musicVolume ?? 0.75, 500);
        setCountdownSeconds(
          cfg.mode === 'somente_ofertas' ? 4 : cfg.spotsIntervalSeconds || cfg.offerIntervalSeconds || 45
        );
      }
    },
    [fadeMusicVolume]
  );

  const stopCurrentSpot = useCallback(() => {
    const cfg = configRef.current;
    if (spotAudioRef.current) {
      spotAudioRef.current.pause();
      spotAudioRef.current.currentTime = 0;
    }
    setCurrentSpot(null);
    currentSpotRef.current = null;
    setIsDucking(false);
    if (cfg) {
      fadeMusicVolume(cfg.musicVolume, 600);
      setCountdownSeconds(cfg.spotsIntervalSeconds || cfg.offerIntervalSeconds || 45);
    }
  }, [fadeMusicVolume]);

  const skipMusicTrack = useCallback(() => {
    playMusicTrack();
  }, [playMusicTrack]);

  // Toggle Radio On Air / Off Air (Somente para quando o usuário clicar explicitamente para parar)
  const toggleOnAir = useCallback(() => {
    const cfg = configRef.current;
    if (!cfg) return;

    if (isOnAirRef.current) {
      setIsOnAir(false);
      isOnAirRef.current = false;
      try {
        localStorage.setItem(RADIO_ON_AIR_STORAGE_KEY, 'false');
        localStorage.removeItem(RADIO_PLAYBACK_STATE_KEY);
      } catch {}
      setAutoplayBlocked(false);
      setIsDucking(false);
      setCurrentSpot(null);
      currentSpotRef.current = null;
      if (musicAudioRef.current) musicAudioRef.current.pause();
      if (spotAudioRef.current) spotAudioRef.current.pause();
      appendLog('Transmissão da Rádio Web pausada pelo usuário', 'sistema');

      // Notifica o backend imediatamente da pausa solicitada pelo usuário
      api.sendRadioHeartbeat({
        isOnAir: false,
        storeName: cfg.storeName,
        stationName: cfg.stationName,
        slogan: cfg.slogan,
        currentMusicTitle: null,
        currentSpotTitle: null,
        isDucking: false,
        spotsQueueCount: (cfg.queue || []).filter(q => q.active).length,
        mode: cfg.mode,
        sessionId: getRadioSessionId(),
        deviceName: getRadioDeviceName(),
        storeId: activeStoreId,
      }).catch(() => {});
    } else {
      setIsOnAir(true);
      isOnAirRef.current = true;
      try {
        localStorage.setItem(RADIO_ON_AIR_STORAGE_KEY, 'true');
      } catch {}
      setAutoplayBlocked(false);
      appendLog(`Rádio Web NO AR — ${cfg.stationName}`, 'sistema', cfg.slogan);

      // A primeira locução só inicia após 30 segundos que a rádio estiver no ar
      setCountdownSeconds(30);

      if (cfg.mode !== 'somente_ofertas') {
        playMusicTrack();
      }
    }
  }, [appendLog, playMusicTrack, getRadioSessionId, getRadioDeviceName, activeStoreId]);

  // Reiniciar a programação da rádio a qualquer momento
  const restartRadio = useCallback(() => {
    const cfg = configRef.current;
    if (!cfg) return;

    if (spotAudioRef.current) {
      spotAudioRef.current.pause();
      spotAudioRef.current.currentTime = 0;
    }
    setCurrentSpot(null);
    currentSpotRef.current = null;
    setIsDucking(false);

    setIsOnAir(true);
    isOnAirRef.current = true;
    try {
      localStorage.setItem(RADIO_ON_AIR_STORAGE_KEY, 'true');
    } catch {}
    setAutoplayBlocked(false);

    spotIndexRef.current = 0;
    musicIndexRef.current = 0;
    setSongsSinceLastSpot(0);
    setCountdownSeconds(30);

    if (cfg.mode !== 'somente_ofertas') {
      const tracks = (cfg.musicTracks || []).filter(t => t.active);
      let candidateTracks = tracks;
      if (cfg.activePlaylistId && cfg.activePlaylistId !== 'todas') {
        const filtered = tracks.filter(
          t => t.playlistId === cfg.activePlaylistId || t.category === cfg.activePlaylistId
        );
        if (filtered.length > 0) candidateTracks = filtered;
      }

      if (candidateTracks.length > 0) {
        const chosen = candidateTracks[0];
        playMusicTrack(chosen, 0);
      }
    }

    appendLog('Rádio Web reiniciada do início da programação', 'sistema', cfg.stationName);
  }, [appendLog, playMusicTrack]);

  // Desbloqueio de autoplay no primeiro toque/clique caso o navegador tenha pausado
  const resumeAutoplay = useCallback(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.play().then(() => {
        setAutoplayBlocked(false);
      }).catch(err => {
        console.warn('Erro ao liberar som da rádio:', err);
      });
    } else {
      setAutoplayBlocked(false);
    }
  }, []);

  // Countdown timer for automatic offer scheduling
  useEffect(() => {
    if (!isOnAir || !config) return;

    const timer = window.setInterval(() => {
      if (currentSpotRef.current || isLiveMicActiveRef.current) return;

      if (config.mode === 'intervalo_tempo' || config.mode === 'somente_ofertas') {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            playSpotNow();
            return config.mode === 'somente_ofertas'
              ? 4
              : config.spotsIntervalSeconds || config.offerIntervalSeconds || 45;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isOnAir, config, playSpotNow]);

  // Keep live volume adjustments synced to audio decks
  useEffect(() => {
    if (!config) return;
    if (spotAudioRef.current) {
      spotAudioRef.current.volume = Math.max(0, Math.min(1, config.voiceVolume ?? config.spotVolume ?? 1.0));
    }
    if (musicAudioRef.current) {
      const targetVol = isDucking ? config.duckingLevel : config.musicVolume;
      if (musicNormalizerRef.current) {
        musicNormalizerRef.current.setUserVolume(targetVol);
      }
      musicAudioRef.current.volume = Math.max(0, Math.min(1, targetVol));
    }
  }, [config?.voiceVolume, config?.spotVolume, config?.musicVolume, config?.duckingLevel, isDucking]);

  // Heartbeat to report real-time online status and manage session concurrency
  useEffect(() => {
    const sendPing = async (online: boolean, forceTakeover: boolean = false) => {
      const cfg = configRef.current;
      const sId = getRadioSessionId();
      const dName = getRadioDeviceName();
      try {
        const res = await api.sendRadioHeartbeat({
          isOnAir: online,
          storeName: cfg.storeName,
          stationName: cfg.stationName,
          slogan: cfg.slogan,
          currentMusicTitle: currentMusic ? currentMusic.title : null,
          currentSpotTitle: currentSpot ? currentSpot.title : null,
          isDucking,
          spotsQueueCount: (cfg.queue || []).filter(q => q.active).length,
          mode: cfg.mode,
          sessionId: sId,
          deviceName: dName,
          storeId: activeStoreId,
          forceTakeover,
        });

        if (res.conflict) {
          if (musicAudioRef.current) musicAudioRef.current.pause();
          if (spotAudioRef.current) spotAudioRef.current.pause();
          setIsOnAir(false);
          setSessionConflict({
            message: res.message || 'A Rádio Web já está tocando em outro computador.',
            activeDevice: res.activeDevice,
          });
        } else if (res.superseded) {
          if (musicAudioRef.current) musicAudioRef.current.pause();
          if (spotAudioRef.current) spotAudioRef.current.pause();
          setIsOnAir(false);
          setSupersededMessage(res.message || 'A transmissão da rádio foi transferida para outro computador da loja.');
        }
      } catch {
        // ignore connection hiccup
      }
    };

    if (isOnAir) {
      sendPing(true);

      const intervalId = window.setInterval(() => {
        sendPing(true);
      }, 6000);

      // Não enviamos sendPing(false) no beforeunload/pagehide para que atualizações de página (F5 / reload)
      // não interrompam a rádio. A rádio só para quando o usuário clicar para parar no botão.
      return () => {
        window.clearInterval(intervalId);
      };
    } else {
      sendPing(false);
    }
  }, [isOnAir, currentMusic?.title, currentSpot?.title, isDucking, activeStoreId, getRadioDeviceName, getRadioSessionId]);

  const takeoverRadioSession = useCallback(async () => {
    setSessionConflict(null);
    setSupersededMessage(null);
    setIsOnAir(true);
    const cfg = configRef.current;
    const sId = getRadioSessionId();
    const dName = getRadioDeviceName();
    try {
      await api.sendRadioHeartbeat({
        isOnAir: true,
        storeName: cfg.storeName,
        stationName: cfg.stationName,
        slogan: cfg.slogan,
        currentMusicTitle: currentMusic ? currentMusic.title : null,
        currentSpotTitle: currentSpot ? currentSpot.title : null,
        isDucking,
        spotsQueueCount: (cfg.queue || []).filter(q => q.active).length,
        mode: cfg.mode,
        sessionId: sId,
        deviceName: dName,
        storeId: activeStoreId,
        forceTakeover: true,
      });
      if (musicAudioRef.current && configRef.current.musicTracks.length > 0) {
        musicAudioRef.current.play().catch(() => {});
      }
    } catch {
      // ignore
    }
  }, [activeStoreId, currentMusic, currentSpot, isDucking, getRadioDeviceName, getRadioSessionId]);

  // Update config on state, localStorage & server
  const updateConfig = useCallback(
    async (partial: Partial<RadioStationConfig>) => {
      const merged: RadioStationConfig = {
        ...configRef.current,
        ...partial,
      };
      setConfig(merged);
      persistConfigLocally(merged);

      const newInterval = partial.spotsIntervalSeconds || partial.offerIntervalSeconds;
      if (newInterval && !currentSpotRef.current) {
        setCountdownSeconds(newInterval);
      }

      try {
        const res = await api.updateRadioConfig(partial);
        if (res && res.config) {
          setConfig(res.config);
          persistConfigLocally(res.config);
        }
      } catch {
        // Saved locally even if server route wasn't reloaded yet
      }
    },
    [persistConfigLocally]
  );

  const setActiveStoreId = useCallback((storeId: string) => {
    setActiveStoreIdState(storeId);
    localStorage.setItem('superlocucao_active_store_id', storeId);
    const found = configRef.current.stores?.find(s => s.id === storeId);
    if (found) {
      updateConfig({ storeName: found.name });
    }
  }, [updateConfig]);

  const createRadioStore = useCallback(async (storeData: { name: string; city?: string; slogan?: string }) => {
    const res = await api.createRadioStore(storeData);
    setConfig(res.config);
    persistConfigLocally(res.config);
    setActiveStoreId(res.store.id);
  }, [persistConfigLocally, setActiveStoreId]);

  const updateRadioStore = useCallback(async (id: string, updates: Partial<RadioStoreBranch>) => {
    const res = await api.updateRadioStore(id, updates);
    setConfig(res.config);
    persistConfigLocally(res.config);
  }, [persistConfigLocally]);

  const deleteRadioStore = useCallback(async (id: string) => {
    const res = await api.deleteRadioStore(id);
    setConfig(res.config);
    persistConfigLocally(res.config);
    if (activeStoreId === id && res.config.stores && res.config.stores.length > 0) {
      setActiveStoreId(res.config.stores[0].id);
    }
  }, [activeStoreId, persistConfigLocally, setActiveStoreId]);

  // Publish any generated or library audio to the Web Radio queue
  const publishAudioToRadio = useCallback(
    async (
      audio: AudioGenerationItem,
      options?: {
        storeName?: string;
        type?: RadioQueueItem['type'];
        priority?: RadioQueueItem['priority'];
        playImmediately?: boolean;
      }
    ): Promise<RadioQueueItem | null> => {
      const fallbackItem: RadioQueueItem = {
        id: `rq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        audioId: audio.id,
        projectId: audio.projectId,
        title: audio.title || 'Oferta do Supermercado',
        audioUrl: audio.audioUrl,
        downloadUrl: audio.downloadUrl,
        durationSeconds: audio.durationSeconds || 25,
        voiceName: audio.voiceName || 'Locutor Comercial',
        storeName: options?.storeName || configRef.current.storeName || 'Supermercado',
        type: options?.type || 'oferta',
        active: true,
        priority: options?.priority || 'normal',
        playCount: 0,
        addedAt: new Date().toISOString(),
      };

      let finalItem = fallbackItem;

      try {
        const res = await api.addAudioToRadioQueue({
          audio,
          storeName: options?.storeName,
          type: options?.type || 'oferta',
          priority: options?.priority || 'normal',
        });
        if (res && res.config && res.queueItem) {
          setConfig(res.config);
          persistConfigLocally(res.config);
          finalItem = res.queueItem;
        } else {
          throw new Error('Fallback local queue');
        }
      } catch {
        const currentQueue = configRef.current.queue || [];
        const existingIdx = currentQueue.findIndex(q => q.audioId === audio.id);
        let nextQueue: RadioQueueItem[];
        if (existingIdx !== -1) {
          nextQueue = currentQueue.map((q, i) =>
            i === existingIdx ? { ...q, active: true, priority: options?.priority || q.priority } : q
          );
          finalItem = nextQueue[existingIdx];
        } else {
          nextQueue = [fallbackItem, ...currentQueue];
        }
        const nextCfg = { ...configRef.current, queue: nextQueue };
        setConfig(nextCfg);
        persistConfigLocally(nextCfg);
      }

      appendLog(
        `Nova locução adicionada à grade: ${audio.title}`,
        'sistema',
        options?.priority === 'alta' ? 'Prioridade Alta' : 'Rotação Normal'
      );

      if (options?.playImmediately && finalItem) {
        setTimeout(() => {
          playSpotNow(finalItem);
        }, 150);
      }

      return finalItem;
    },
    [appendLog, persistConfigLocally, playSpotNow]
  );

  const removeQueueItem = useCallback(
    async (id: string) => {
      const nextQueue = (configRef.current.queue || []).filter(q => q.id !== id);
      const nextCfg = { ...configRef.current, queue: nextQueue };
      setConfig(nextCfg);
      persistConfigLocally(nextCfg);

      try {
        const res = await api.removeRadioQueueItem(id);
        if (res && res.config) {
          setConfig(res.config);
          persistConfigLocally(res.config);
        }
      } catch {
        // already removed locally
      }
    },
    [persistConfigLocally]
  );

  const moveQueueItem = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const q = [...(configRef.current.queue || [])];
      const index = q.findIndex(item => item.id === id);
      if (index < 0) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= q.length) return;

      const [movedItem] = q.splice(index, 1);
      q.splice(targetIndex, 0, movedItem);

      await updateConfig({ queue: q });
    },
    [updateConfig]
  );

  const updateQueueItem = useCallback(
    async (id: string, updates: Partial<RadioQueueItem>) => {
      const updatedQueue = (configRef.current.queue || []).map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      await updateConfig({ queue: updatedQueue });
    },
    [updateConfig]
  );

  const toggleQueueItemActive = useCallback(
    async (id: string) => {
      const updatedQueue = config.queue.map(item =>
        item.id === id ? { ...item, active: !item.active } : item
      );
      await updateConfig({ queue: updatedQueue });
    },
    [config.queue, updateConfig]
  );

  const toggleQueueItemPriority = useCallback(
    async (id: string) => {
      const updatedQueue = config.queue.map(item =>
        item.id === id
          ? { ...item, priority: item.priority === 'alta' ? ('normal' as const) : ('alta' as const) }
          : item
      );
      await updateConfig({ queue: updatedQueue });
    },
    [config.queue, updateConfig]
  );

  const addCustomMusicFiles = useCallback(
    (files: FileList) => {
      if (!config || files.length === 0) return;
      const newTracks: RadioMusicTrack[] = Array.from(files).map((file, idx) => ({
        id: `custom-music-${Date.now()}-${idx}`,
        title: file.name.replace(/\.(mp3|wav|ogg|m4a)$/i, ''),
        artist: 'MP3 Próprio da Loja',
        style: 'MP3 Próprio da Loja',
        category: 'pop_varejo',
        audioUrl: URL.createObjectURL(file),
        durationSeconds: 180,
        active: true,
      }));
      const updatedTracks = [...newTracks, ...config.musicTracks];
      const nextCfg = { ...config, musicTracks: updatedTracks };
      setConfig(nextCfg);
      persistConfigLocally(nextCfg);
      appendLog(`${newTracks.length} música(s) local(is) carregada(s) na programação`, 'sistema');
    },
    [config, appendLog, persistConfigLocally]
  );

  const playMusicTrackNow = useCallback(
    (track: RadioMusicTrack) => {
      playMusicTrack(track);
    },
    [playMusicTrack]
  );

  const uploadCustomMusic = useCallback(
    async (
      file: File,
      options: {
        title?: string;
        artist?: string;
        playlistId?: string;
      }
    ) => {
      try {
        let durationSeconds = 180;
        try {
          const testAudio = new Audio(URL.createObjectURL(file));
          await new Promise<void>((resolve) => {
            testAudio.onloadedmetadata = () => {
              if (testAudio.duration && !isNaN(testAudio.duration)) {
                durationSeconds = Math.round(testAudio.duration);
              }
              resolve();
            };
            testAudio.onerror = () => resolve();
            setTimeout(resolve, 1500);
          });
        } catch {}

        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await api.uploadRadioMusic({
          fileName: file.name,
          fileBase64,
          title: options.title || file.name.replace(/\.(mp3|wav|ogg|m4a|aac)$/i, ''),
          artist: options.artist || 'Música da Loja',
          playlistId: options.playlistId || 'pop_varejo',
          durationSeconds,
        });

        setConfig(res.config);
        persistConfigLocally(res.config);
        appendLog(`Música "${res.track.title}" adicionada à playlist`, 'musica');
        return res.track;
      } catch (err: any) {
        console.error('Falha ao enviar música para a playlist:', err);
        appendLog(`Erro ao carregar música: ${err.message}`, 'sistema');
        throw err;
      }
    },
    [appendLog, persistConfigLocally]
  );

  const createCustomPlaylist = useCallback(
    async (data: { name: string; description?: string; icon?: string; color?: string }) => {
      const res = await api.createRadioPlaylist(data);
      setConfig(res.config);
      persistConfigLocally(res.config);
      appendLog(`Nova playlist criada: ${res.playlist.name}`, 'sistema');
      return res.playlist;
    },
    [appendLog, persistConfigLocally]
  );

  const deleteCustomPlaylist = useCallback(
    async (id: string) => {
      const res = await api.deleteRadioPlaylist(id);
      setConfig(res.config);
      persistConfigLocally(res.config);
      appendLog('Playlist removida', 'sistema');
    },
    [appendLog, persistConfigLocally]
  );

  const deleteMusicTrack = useCallback(
    async (id: string) => {
      const res = await api.deleteRadioMusicTrack(id);
      setConfig(res.config);
      persistConfigLocally(res.config);
      appendLog('Música removida da programação', 'sistema');
    },
    [appendLog, persistConfigLocally]
  );

  const updateMusicTrack = useCallback(
    async (id: string, updates: Partial<RadioMusicTrack>) => {
      const res = await api.updateRadioMusicTrack(id, updates);
      setConfig(res.config);
      persistConfigLocally(res.config);
    },
    [persistConfigLocally]
  );

  const setActivePlaylist = useCallback(
    async (playlistId: string) => {
      await updateConfig({ activePlaylistId: playlistId });
      const plName = (config?.playlists || []).find(p => p.id === playlistId)?.name || 'Todas as Playlists';
      appendLog(`Playlist ativa alterada para: ${plName}`, 'sistema');
    },
    [config?.playlists, updateConfig, appendLog]
  );

  const uploadSpotAudioFile = useCallback(
    async (
      file: File,
      options?: {
        title?: string;
        type?: RadioQueueItem['type'];
        priority?: RadioQueueItem['priority'];
      }
    ) => {
      try {
        let durationSeconds = 25;
        try {
          const testAudio = new Audio(URL.createObjectURL(file));
          await new Promise<void>((resolve) => {
            testAudio.onloadedmetadata = () => {
              if (testAudio.duration && !isNaN(testAudio.duration)) {
                durationSeconds = Math.round(testAudio.duration);
              }
              resolve();
            };
            testAudio.onerror = () => resolve();
            setTimeout(resolve, 1500);
          });
        } catch {}

        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await api.uploadAudioToRadioQueue({
          fileName: file.name,
          fileBase64,
          title: options?.title || file.name.replace(/\.(mp3|wav|ogg|m4a|aac)$/i, ''),
          type: options?.type || 'oferta',
          priority: options?.priority || 'normal',
          storeName: config?.storeName || 'Supermercado',
          durationSeconds,
        });

        setConfig(res.config);
        persistConfigLocally(res.config);
        appendLog(`Áudio "${res.queueItem.title}" do computador adicionado à grade`, 'oferta');
        return res.queueItem;
      } catch (err: any) {
        console.error('Falha ao enviar áudio para a rádio:', err);
        appendLog(`Erro ao carregar áudio do computador: ${err.message}`, 'sistema');
        throw err;
      }
    },
    [config?.storeName, appendLog, persistConfigLocally]
  );

  // Handlers for hidden <audio> elements
  const handleSpotEnded = () => {
    const cfg = configRef.current;
    const finishedSpot = currentSpotRef.current;

    if (finishedSpot && cfg) {
      const updatedQueue = cfg.queue.map(q =>
        q.id === finishedSpot.id
          ? { ...q, playCount: (q.playCount || 0) + 1, lastPlayedAt: new Date().toISOString() }
          : q
      );
      const nextCfg = { ...cfg, queue: updatedQueue };
      setConfig(nextCfg);
      persistConfigLocally(nextCfg);
      api.updateRadioConfig({ queue: updatedQueue }).catch(() => {});
    }

    setCurrentSpot(null);
    currentSpotRef.current = null;
    setSpotCurrentTime(0);
    setIsDucking(false);

    if (cfg) {
      fadeMusicVolume(cfg.musicVolume, 750);
      setCountdownSeconds(
        cfg.mode === 'somente_ofertas' ? 4 : cfg.spotsIntervalSeconds || cfg.offerIntervalSeconds || 45
      );
    }
  };

  const handleMusicEnded = () => {
    const cfg = configRef.current;
    if (!cfg || !isOnAirRef.current) return;

    if (isLiveMicActiveRef.current) {
      // Microfone ao vivo ativo: reproduz apenas a música ambiente, sem disparar locuções
      playMusicTrack();
      return;
    }

    if (cfg.mode === 'intercalado_musicas') {
      const nextCount = songsSinceLastSpot + 1;
      if (nextCount >= (cfg.spotsEveryNTracks || cfg.offerEveryNSongs || 1)) {
        setSongsSinceLastSpot(0);
        playMusicTrack();
        setTimeout(() => playSpotNow(), 1200);
        return;
      }
      setSongsSinceLastSpot(nextCount);
    }

    playMusicTrack();
  };

  return (
    <RadioContext.Provider
      value={{
        config,
        availableAudios,
        isOnAir,
        isDucking,
        currentMusic,
        currentSpot,
        nextSpot,
        countdownSeconds,
        songsSinceLastSpot,
        spotCurrentTime,
        spotDuration,
        musicCurrentTime,
        musicDuration,
        broadcastLogs,
        loading,
        refreshRadioData,
        updateConfig,
        toggleOnAir,
        restartRadio,
        autoplayBlocked,
        resumeAutoplay,
        playSpotNow,
        stopCurrentSpot,
        skipMusicTrack,
        publishAudioToRadio,
        removeQueueItem,
        moveQueueItem,
        updateQueueItem,
        toggleQueueItemActive,
        toggleQueueItemPriority,
        addCustomMusicFiles,
        uploadCustomMusic,
        createCustomPlaylist,
        deleteCustomPlaylist,
        deleteMusicTrack,
        updateMusicTrack,
        setActivePlaylist,
        playMusicTrackNow,
        uploadSpotAudioFile,
        sessionConflict,
        clearSessionConflict: () => setSessionConflict(null),
        takeoverRadioSession,
        supersededMessage,
        clearSupersededMessage: () => setSupersededMessage(null),
        activeStoreId,
        setActiveStoreId,
        createRadioStore,
        updateRadioStore,
        deleteRadioStore,
        vocalBoostDb,
        isVocalLevelerEnabled,
        triggerManualDucking,
        isLiveMicActive,
        setLiveMicActive,
        toggleVocalLeveler: () => {
          setIsVocalLevelerEnabled(prev => {
            const next = !prev;
            if (spotNormalizerRef.current) {
              spotNormalizerRef.current.setNormalizerEnabled(next);
            }
            return next;
          });
        },
        musicBoostDb,
        isMusicLevelerEnabled,
        toggleMusicLeveler: () => {
          setIsMusicLevelerEnabled(prev => {
            const next = !prev;
            if (musicNormalizerRef.current) {
              musicNormalizerRef.current.setNormalizerEnabled(next);
            }
            return next;
          });
        },
      }}
    >
      {/* Hidden Dual-Deck Audio Engines */}
      <audio
        ref={musicAudioRef}
        onTimeUpdate={handleMusicTimeUpdate}
        onLoadedMetadata={() => setMusicDuration(musicAudioRef.current?.duration || 0)}
        onEnded={handleMusicEnded}
        preload="auto"
      />
      <audio
        ref={spotAudioRef}
        crossOrigin="anonymous"
        onTimeUpdate={() => setSpotCurrentTime(spotAudioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setSpotDuration(spotAudioRef.current?.duration || 0)}
        onEnded={handleSpotEnded}
        preload="auto"
      />

      {children}
    </RadioContext.Provider>
  );
};
