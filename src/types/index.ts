export type ProjectNiche =
  | 'supermercado'
  | 'farmacia'
  | 'moda'
  | 'petshop'
  | 'construcao'
  | 'beleza'
  | 'restaurante'
  | 'autopecas'
  | 'otica'
  | 'geral';
export type NicheType = ProjectNiche;

export type CampaignType =
  | 'ofertas_dia'
  | 'ofertas_semana'
  | 'superofertas'
  | 'quarta_carne'
  | 'festival_hortifruti'
  | 'queima_estoque'
  | 'inauguracao'
  | 'aniversario'
  | 'black_friday'
  | 'datas_comemorativas'
  | 'divulgacao_produtos'
  | 'institucional'
  | 'personalizada';

export type LocutionStyle =
  | 'energetica_supermercado'
  | 'animada_promocional'
  | 'natural_amigavel'
  | 'urgente_oportunidade'
  | 'elegante_institucional'
  | 'popular_descontraida';

export type LocutionTone =
  | 'persuasivo'
  | 'alegre'
  | 'direto'
  | 'familiar'
  | 'festivo'
  | 'inspirador'
  | 'solene'
  | 'urgente'
  | 'confiante';

export type PresentationFormat =
  | 'unico_completo'
  | 'bloco_por_produto'
  | 'abertura_sequencia_encerramento'
  | 'individual_por_produto';

export type DesiredDuration = '15s' | '30s' | '45s' | '60s' | 'custom';

export type SalesUnit =
  | 'unidade'
  | 'kg'
  | 'g'
  | 'litro'
  | 'ml'
  | 'pacote'
  | 'caixa'
  | 'bandeja'
  | 'duzia'
  | 'fardo'
  | 'outro';

export type SoundtrackId =
  | 'sem_trilha'
  | 'varejo_alegre'
  | 'batida_comercial'
  | 'black_friday_urgente'
  | 'acustico_hortifruti'
  | 'institucional_gourmet'
  | 'natal_fim_de_ano';

export interface SoundtrackOption {
  id: SoundtrackId;
  name: string;
  category: string;
  bpm: number;
  description: string;
  previewUrl: string;
  isPopular?: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  brand?: string;
  packaging?: string;
  promotionalPrice: number;
  previousPrice?: number;
  unit: SalesUnit | string;
  notes?: string;
  spokenPrice?: string; // e.g. "vinte e quatro reais e noventa e nove centavos"
}

export interface ScriptVersion {
  id: string;
  text: string;
  spokenPhoneticText?: string;
  estimatedDurationSeconds: number;
  wordCount: number;
  createdAt: string;
  note?: string;
}

export interface AudioGenerationItem {
  id: string;
  projectId: string;
  scriptId?: string;
  productId?: string;
  productName?: string;
  title: string;
  voiceId: string;
  voiceName: string;
  soundtrackId?: SoundtrackId;
  soundtrackName?: string;
  soundtrackVolume?: number;
  provider: 'elevenlabs' | 'gemini_tts' | 'studio_synthesizer';
  format: 'mp3' | 'wav';
  durationSeconds: number;
  audioUrl: string;
  downloadUrl: string;
  status: 'processing' | 'ready' | 'failed';
  creditsUsed: number;
  createdAt: string;
  fileSizeBytes?: number;
  errorMessage?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  niche?: ProjectNiche;
  storeName?: string;
  storeCity?: string;
  objective?: string;
  campaignType: CampaignType;
  style: LocutionStyle;
  desiredDuration: DesiredDuration;
  tone: LocutionTone;
  presentationFormat: PresentationFormat;
  soundtrackId?: SoundtrackId;
  soundtrackVolume?: number; // 0 to 1, default 0.20 (20%)
  customOpening?: string;
  customClosing?: string;
  urgencyText?: string;
  freeInstructions?: string;
  products: ProductItem[];
  scripts: ScriptVersion[];
  currentScriptIndex: number;
  audios: AudioGenerationItem[];
  status: 'draft' | 'scripted' | 'ready' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface VoicePreset {
  id: string;
  name: string;
  gender: 'masculino' | 'feminino';
  description: string;
  sampleAudioUrl?: string;
  previewUrl?: string;
  elevenVoiceId: string;
  geminiVoiceName?: string;
  accent: string;
  styleTag: string;
  tone?: string;
  category?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  companyName?: string;
  niche?: ProjectNiche;
  city?: string;
  role: 'supermarket_owner' | 'manager' | 'admin';
  plan: 'gratuito' | 'pro_varejo' | 'redes_atacarejo';
  status?: 'ativo' | 'bloqueado';
  notes?: string;
  creditsBalance: number;
  createdAt: string;
  lastLogin?: string;
}

export type User = UserProfile;

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'debit' | 'credit' | 'bonus';
  amount: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers?: number;
  blockedUsers?: number;
  totalProjects: number;
  totalAudiosGenerated: number;
  totalCreditsUsed: number;
  totalCreditsBalance?: number;
  radioStats?: {
    queueCount: number;
    stationName: string;
    isBroadcasting: boolean;
    defaultIntervalSec: number;
    musicTracksCount?: number;
    onlineStationsCount?: number;
    onlineStations?: OnlineRadioStation[];
  };
  postgresConnected?: boolean;
  elevenLabsConfigured: boolean;
  elevenLabsApiKeyMasked?: string;
  elevenLabsApiKey?: string;
  elevenLabsSubscription?: {
    tier: string;
    characterCount: number;
    characterLimit: number;
    percentUsed: number;
  };
  elevenLabsVoicesCount?: number;
  geminiConfigured: boolean;
  geminiApiKeyMasked?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  recentTransactions: CreditTransaction[];
  recentAudios?: any[];
  users?: UserProfile[];
  settings?: any;
}

export interface RechargePackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  badge?: string;
  highlighted?: boolean;
}

export interface CommercialPlan {
  id: string;
  name: string;
  tag?: string;
  subtitle: string;
  price: number;
  billingPeriod: string;
  creditsAmount: number;
  features: string[];
  ctaText: string;
  badge?: string;
  highlighted?: boolean;
}

export interface PaymentGatewayConfig {
  provider: 'mercadopago' | 'asaas' | 'stripe' | 'pix_direto';
  mode: 'sandbox' | 'production';
  isActive: boolean;
  mercadoPagoPublicKey?: string;
  mercadoPagoAccessToken?: string;
  asaasApiKey?: string;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  pixKey?: string;
  pixKeyType?: 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  webhookSecret?: string;
}

export interface SubscriptionItem {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  email: string;
  clientName?: string;
  clientEmail?: string;
  planId: string;
  planName: string;
  amount: number;
  price?: number;
  billingPeriod: string;
  status: 'active' | 'past_due' | 'canceled' | 'trial';
  paymentMethod: 'pix' | 'credit_card' | 'boleto' | 'manual';
  gateway: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate?: string;
  creditsPerCycle: number;
  autoRenew: boolean;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  clientName?: string;
  clientEmail?: string;
  type: 'subscription' | 'recharge';
  planId?: string;
  description: string;
  itemName?: string;
  amount: number;
  creditsAdded?: number;
  creditsAmount?: number;
  status: 'approved' | 'pending' | 'refunded' | 'failed';
  paymentMethod: 'pix' | 'credit_card' | 'boleto' | 'manual';
  method?: string;
  gateway: string;
  externalId?: string;
  paidAt?: string;
  dueDate?: string;
  pixCopiaECola?: string;
  pixQrCodeUrl?: string;
  checkoutUrl?: string;
  createdAt: string;
}

export interface RadioQueueItem {
  id: string;
  audioId: string;
  projectId?: string;
  title: string;
  audioUrl: string;
  downloadUrl?: string;
  durationSeconds: number;
  voiceName: string;
  voiceId?: string;
  campaignType?: string;
  storeName?: string;
  type: 'oferta' | 'vinheta' | 'aviso' | 'relampago' | 'comunicado';
  active: boolean;
  priority: 'alta' | 'normal';
  playCount?: number;
  lastPlayedAt?: string;
  repeatIntervalMinutes?: number; // Opcional: tocar a cada X minutos (ex: 5, 10, 15, 30, 60 min)
  daysOfWeek?: number[]; // [0, 1, 2, 3, 4, 5, 6] onde 0=Domingo, 1=Segunda, ..., 6=Sábado. Se indefinido ou vazio, toca todos os dias.
  addedAt: string;
}

export interface RadioPlaylist {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isCustom?: boolean;
}

export interface RadioMusicTrack {
  id: string;
  title: string;
  artist: string;
  style?: string;
  category: string;
  playlistId?: string;
  audioUrl: string;
  durationSeconds: number;
  bpm?: number;
  active: boolean;
  isCustom?: boolean;
}

export interface RadioStoreBranch {
  id: string;
  name: string;
  city?: string;
  slogan?: string;
  isOnline?: boolean;
  currentSong?: string;
  currentSpot?: string;
  lastHeartbeat?: string;
  createdAt?: string;
}

export interface RadioStationConfig {
  stationName: string;
  storeName?: string;
  slogan: string;
  isOnAir: boolean;
  mode: 'intervalo_tempo' | 'intercalado_musicas' | 'somente_ofertas';
  spotsEveryNTracks: number;
  offerEveryNSongs?: number;
  spotsIntervalSeconds: number;
  offerIntervalSeconds?: number;
  onlyOffersPauseSeconds: number;
  musicVolume: number;
  spotVolume: number;
  voiceVolume?: number;
  duckingLevel: number;
  selectedMusicCategory: string;
  activePlaylistId?: string;
  excludedPlaylistIds?: string[];
  playlists?: RadioPlaylist[];
  autoPublishNewAudios: boolean;
  timeAnnouncementEnabled?: boolean;
  timeAnnouncementInterval?: '15min' | '30min' | '60min' | 'manual_only';
  timeAnnouncementChime?: boolean;
  timeAnnouncementStyle?: 'comercial' | 'padrao' | 'curto';
  timeAnnouncementVoiceId?: string;
  queue: RadioQueueItem[];
  musicTracks: RadioMusicTrack[];
  stores?: RadioStoreBranch[];
  activeStoreId?: string;
}

export interface OnlineRadioStation {
  id: string;
  userId: string;
  userName?: string;
  companyName?: string;
  storeName: string;
  stationName: string;
  slogan?: string;
  isOnAir: boolean;
  currentMusicTitle?: string;
  currentSpotTitle?: string;
  isDucking?: boolean;
  spotsQueueCount: number;
  mode?: string;
  lastHeartbeat: string;
  startedAt: string;
  clientIp?: string;
  sessionId?: string;
  storeId?: string;
  deviceName?: string;
}

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

export * from './campaigns.ts';
