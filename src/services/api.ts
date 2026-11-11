import {
  User,
  Project,
  ProductItem,
  VoicePreset,
  AudioGenerationItem,
  CreditTransaction,
  AdminMetrics,
  SoundtrackOption,
  SoundtrackId,
  NicheType,
  RadioStationConfig,
  RadioQueueItem,
  RadioPlaylist,
  RadioMusicTrack,
  RechargePackage,
  CommercialPlan,
  PaymentGatewayConfig,
  SubscriptionItem,
  PaymentTransaction,
  OnlineRadioStation,
  RadioStoreBranch,
  ClientLogo,
} from '../types';

const STORAGE_USER_KEY = 'superlocucao_user_id';

export function getActiveUserId(): string | null {
  return localStorage.getItem(STORAGE_USER_KEY);
}

export function setActiveUserId(id: string) {
  localStorage.setItem(STORAGE_USER_KEY, id);
}

export function clearActiveUserId() {
  localStorage.removeItem(STORAGE_USER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const userId = getActiveUserId() || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(userId ? { 'x-user-id': userId } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Erro na comunicação com o servidor';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  getMe: () => request<{ user: User }>('/auth/me'),
  loginDemo: (demoId?: string) =>
    request<{ user: User; token: string }>('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ demoId }),
    }),
  switchDemo: (demoId?: string) =>
    request<{ user: User; token: string }>('/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ demoId }),
    }),
  login: (email: string, password?: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, companyName: string, password?: string) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, companyName, password }),
    }),

  // Projects
  getProjects: () => request<{ projects: Project[] }>('/projects'),
  getProject: (id: string) => request<{ project: Project }>(`/projects/${id}`),
  createProject: (data: Partial<Project>) =>
    request<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  saveProject: (data: Partial<Project>) => {
    if (data.id) {
      return request<{ project: Project }>(`/projects/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }).catch(() =>
        request<{ project: Project }>('/projects', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    }
    return request<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateProject: (id: string, data: Partial<Project>) =>
    request<{ project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    request<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
  duplicateProject: (id: string) =>
    request<{ project: Project }>(`/projects/${id}/duplicate`, {
      method: 'POST',
    }),

  // AI Services
  parseProducts: (text: string, niche?: NicheType) =>
    request<{ products: ProductItem[] }>('/ai/parse-products', {
      method: 'POST',
      body: JSON.stringify({ text, niche }),
    }),
  generateScript: (params: any) =>
    request<{
      text: string;
      spokenPhoneticText?: string;
      estimatedDurationSec?: number;
      estimatedDurationSeconds: number;
      wordCount: number;
    }>('/ai/generate-script', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  refineScript: (currentText: string, action: string, instruction?: string, products?: ProductItem[], niche?: NicheType) =>
    request<{ text: string }>('/ai/refine-script', {
      method: 'POST',
      body: JSON.stringify({ currentText, action, instruction, products, niche }),
    }),

  // Voices & Audio
  getVoices: () => request<{ voices: VoicePreset[]; hasElevenKey: boolean }>('/voices'),
  getSoundtracks: () => request<{ soundtracks: SoundtrackOption[] }>('/soundtracks'),
  generateAudio: (params: {
    projectId?: string;
    scriptText: string;
    voiceId: string;
    title?: string;
    productId?: string;
    productName?: string;
    soundtrackId?: SoundtrackId;
    soundtrackVolume?: number;
    publishToRadio?: boolean;
    radioPriority?: 'alta' | 'normal';
    storeName?: string;
    productCount?: number;
  }) =>
    request<{ audio: AudioGenerationItem; radioQueueItem?: RadioQueueItem | null; creditsBalance: number }>('/audio/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  generateBatchAudios: (params: {
    projectId?: string;
    products: ProductItem[];
    voiceId: string;
    storeName?: string;
    soundtrackId?: SoundtrackId;
    soundtrackVolume?: number;
    publishToRadio?: boolean;
  }) =>
    request<{ audios: AudioGenerationItem[]; creditsBalance: number }>('/audio/generate-batch', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  downloadZip: async (audioIds: string[], zipName?: string): Promise<Blob> => {
    const userId = getActiveUserId();
    const res = await fetch('/api/audio/download-zip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {}),
      },
      body: JSON.stringify({ audioIds, zipName }),
    });
    if (!res.ok) {
      throw new Error('Erro ao gerar pacote ZIP de áudios');
    }
    return res.blob();
  },

  // Web Radio Supermercado
  getRadio: () =>
    request<{
      config: RadioStationConfig;
      availableAudios: (AudioGenerationItem & { storeName?: string; projectTitle?: string })[];
    }>('/radio'),
  updateRadioConfig: (data: Partial<RadioStationConfig>) =>
    request<{ config: RadioStationConfig }>('/radio', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  addAudioToRadioQueue: (params: {
    audio: AudioGenerationItem;
    storeName?: string;
    type?: RadioQueueItem['type'];
    priority?: RadioQueueItem['priority'];
  }) =>
    request<{ queueItem: RadioQueueItem; config: RadioStationConfig }>('/radio/queue', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  removeRadioQueueItem: (id: string) =>
    request<{ config: RadioStationConfig }>(`/radio/queue/${id}`, {
      method: 'DELETE',
    }),
  uploadAudioToRadioQueue: (params: {
    fileName: string;
    fileBase64: string;
    title?: string;
    type?: RadioQueueItem['type'];
    priority?: RadioQueueItem['priority'];
    storeName?: string;
    durationSeconds?: number;
  }) =>
    request<{ queueItem: RadioQueueItem; config: RadioStationConfig }>('/radio/queue/upload', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  uploadRadioMusic: (params: {
    fileName: string;
    fileBase64: string;
    title?: string;
    artist?: string;
    playlistId?: string;
    durationSeconds?: number;
  }) =>
    request<{ track: RadioMusicTrack; config: RadioStationConfig }>('/radio/music/upload', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  createRadioPlaylist: (data: { name: string; description?: string; icon?: string; color?: string }) =>
    request<{ playlist: RadioPlaylist; config: RadioStationConfig }>('/radio/playlists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteRadioPlaylist: (id: string) =>
    request<{ config: RadioStationConfig }>(`/radio/playlists/${id}`, {
      method: 'DELETE',
    }),
  deleteRadioMusicTrack: (id: string) =>
    request<{ config: RadioStationConfig }>(`/radio/music/${id}`, {
      method: 'DELETE',
    }),
  updateRadioMusicTrack: (id: string, updates: Partial<RadioMusicTrack>) =>
    request<{ config: RadioStationConfig }>(`/radio/music/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  createRadioFlashSpot: (params: {
    title: string;
    scriptText: string;
    storeName?: string;
    voiceId: string;
    soundtrackId?: SoundtrackId;
    soundtrackVolume?: number;
    type?: RadioQueueItem['type'];
    priority?: RadioQueueItem['priority'];
    addToQueue?: boolean;
  }) =>
    request<{
      audio: AudioGenerationItem;
      queueItem?: RadioQueueItem | null;
      config: RadioStationConfig;
      creditsBalance: number;
    }>('/radio/flash', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  requestTimeAnnouncement: (params?: {
    style?: 'comercial' | 'padrao' | 'curto';
    voiceId?: string;
    storeName?: string;
    stationName?: string;
    hours?: number;
    minutes?: number;
  }) =>
    request<{
      success: boolean;
      audioUrl: string;
      durationSeconds: number;
      scriptText: string;
      formattedTime: string;
    }>('/radio/time-announcement', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),
  sendRadioHeartbeat: (params: {
    isOnAir: boolean;
    storeName?: string;
    stationName?: string;
    slogan?: string;
    currentMusicTitle?: string | null;
    currentSpotTitle?: string | null;
    isDucking?: boolean;
    spotsQueueCount?: number;
    mode?: string;
    sessionId?: string;
    storeId?: string;
    deviceName?: string;
    forceTakeover?: boolean;
  }) =>
    request<{
      success: boolean;
      isOnAir: boolean;
      station: OnlineRadioStation | null;
      onlineCount: number;
      conflict?: boolean;
      superseded?: boolean;
      message?: string;
      activeDevice?: string;
      plan?: string;
    }>('/radio/heartbeat', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  getOnlineRadioStations: () =>
    request<{ count: number; stations: OnlineRadioStation[] }>('/radio/online-stations'),
  createRadioStore: (store: { name: string; city?: string; slogan?: string }) =>
    request<{ config: RadioStationConfig; store: RadioStoreBranch }>('/radio/stores', {
      method: 'POST',
      body: JSON.stringify(store),
    }),
  updateRadioStore: (id: string, updates: Partial<RadioStoreBranch>) =>
    request<{ config: RadioStationConfig; store: RadioStoreBranch }>(`/radio/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteRadioStore: (id: string) =>
    request<{ config: RadioStationConfig }>(`/radio/stores/${id}`, {
      method: 'DELETE',
    }),

  // Credits
  getCreditsHistory: () =>
    request<{ creditsBalance: number; transactions: CreditTransaction[] }>('/credits/history'),
  getUserInvoices: () =>
    request<{
      invoices: PaymentTransaction[];
      subscription?: SubscriptionItem | null;
      stats?: {
        totalPaid: number;
        paidCount: number;
        pendingCount: number;
      };
    }>('/user/invoices'),
  rechargeCredits: (packageId: string, amount: number) =>
    request<{ success: boolean; creditsBalance: number; message: string }>('/credits/recharge', {
      method: 'POST',
      body: JSON.stringify({ packageId, amount }),
    }),
  createCheckout: (params: { packageId?: string; planId?: string; paymentMethod?: 'pix' | 'credit_card' | 'boleto' | 'mercadopago' | string }) =>
    request<{
      success: boolean;
      transactionId: string;
      pkg?: RechargePackage;
      plan?: CommercialPlan;
      isSubscription?: boolean;
      amount: number;
      credits: number;
      paymentMethod: string;
      pixCopiaECola: string;
      pixQrCodeUrl: string;
      boletoCode: string;
      checkoutUrl?: string;
    }>('/credits/checkout', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  getInvoiceCheckoutUrl: (invoiceId: string) =>
    request<{
      success: boolean;
      checkoutUrl: string;
      transactionId: string;
    }>(`/invoices/${invoiceId}/checkout-url`, {
      method: 'POST',
    }),
  confirmCheckout: (transactionId: string) =>
    request<{
      success: boolean;
      user?: User;
      plan?: string;
      creditsBalance: number;
      creditsAdded: number;
      message: string;
      transaction: any;
    }>('/credits/confirm-checkout', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    }),
  getPublicSettings: () =>
    request<{
      systemAnnouncement: string;
      creditsPerGeneration: number;
      initialCredits: number;
      defaultVoiceId: string;
      contactWhatsapp?: string;
      contactEmail?: string;
      rechargePackages?: RechargePackage[];
      commercialPlans?: CommercialPlan[];
    }>('/settings'),

  // Admin
  getAdminMetrics: () => request<AdminMetrics>('/admin/metrics'),
  saveElevenLabsKey: (apiKey: string) =>
    request<{ success: boolean; message: string; voicesCount: number }>('/admin/elevenlabs/key', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    }),
  updateElevenLabsKey: (apiKey: string) =>
    request<{ success: boolean; message: string; voicesCount: number }>('/admin/elevenlabs/key', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    }),
  saveGeminiKey: (apiKey: string) =>
    request<{ success: boolean; message: string }>('/admin/gemini/key', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    }),
  updateGeminiKey: (apiKey: string) =>
    request<{ success: boolean; message: string }>('/admin/gemini/key', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    }),
  syncElevenLabsVoices: () =>
    request<{ success: boolean; message: string; voicesCount: number }>('/admin/elevenlabs/sync', {
      method: 'POST',
    }),
  updateAdminSettings: (settings: any) =>
    request<{ settings: any }>('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),

  // Admin - Users / Clients
  getAdminUsers: () => request<{ users: any[] }>('/admin/users'),
  createAdminUser: (data: Partial<User>) =>
    request<{ success: boolean; user: User }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAdminUser: (id: string, data: Partial<User>) =>
    request<{ success: boolean; user: User }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAdminUser: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  adjustAdminUserCredits: (id: string, amount: number, reason?: string) =>
    request<{ success: boolean; creditsBalance: number; message: string }>(`/admin/users/${id}/credits`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    }),
  adjustUserCredits: (id: string, amount: number, reason?: string) =>
    request<{ success: boolean; creditsBalance: number; message: string }>(`/admin/users/${id}/credits`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    }),

  // Admin - Subscriptions & Payments
  getAdminSubscriptions: () =>
    request<{ subscriptions: SubscriptionItem[]; stats: any }>('/admin/subscriptions'),
  updateSubscriptionStatus: (id: string, status: string) =>
    request<{ success: boolean; subscription: SubscriptionItem }>(`/admin/subscriptions/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  getAdminPayments: () =>
    request<{ payments: PaymentTransaction[]; stats: any }>('/admin/payments'),
  confirmAdminPayment: (id: string) =>
    request<{ success: boolean; message: string; payment: PaymentTransaction }>(`/admin/payments/${id}/confirm`, {
      method: 'POST',
    }),
  refundAdminPayment: (id: string) =>
    request<{ success: boolean; message: string; payment: PaymentTransaction }>(`/admin/payments/${id}/refund`, {
      method: 'POST',
    }),
  getAdminGateway: () =>
    request<{ gateway: PaymentGatewayConfig }>('/admin/gateway'),
  saveAdminGateway: (gateway: PaymentGatewayConfig) =>
    request<{ success: boolean; message: string; gateway: PaymentGatewayConfig }>('/admin/gateway', {
      method: 'POST',
      body: JSON.stringify(gateway),
    }),
  getDatabaseAudiosStats: () =>
    request<{ pgConnected: boolean; pgCount: number; localCount: number; seedCount: number }>('/admin/database/audios-stats'),
  syncDatabaseAudios: () =>
    request<{ success: boolean; message: string; uploaded: number; total: number; errors: number }>('/admin/database/sync-audios', {
      method: 'POST',
    }),

  // Client Logos (Supermercados Parceiros / Carrossel)
  getClientLogos: () => request<{ logos: ClientLogo[] }>('/client-logos'),
  getAdminClientLogos: () => request<{ logos: ClientLogo[] }>('/admin/client-logos'),
  createAdminClientLogo: (data: Partial<ClientLogo>) =>
    request<{ success: boolean; logo: ClientLogo; message?: string }>('/admin/client-logos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAdminClientLogo: (id: string, data: Partial<ClientLogo>) =>
    request<{ success: boolean; logo: ClientLogo; message?: string }>(`/admin/client-logos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAdminClientLogo: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/client-logos/${id}`, {
      method: 'DELETE',
    }),
  uploadAdminClientLogo: (fileBase64: string, fileName: string) =>
    request<{ success: boolean; imageUrl: string; message?: string }>('/admin/client-logos/upload', {
      method: 'POST',
      body: JSON.stringify({ fileBase64, fileName }),
    }),
};
