import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, ShieldCheck, Users, Radio, Volume2, Zap, CheckCircle2, Server,
  Settings, AlertCircle, Eye, EyeOff, RefreshCw, Key, Sparkles, Check,
  Search, Filter, Plus, Edit2, Trash2, Coins, Building2, Mail, Phone,
  MapPin, Calendar, Clock, Lock, Unlock, ArrowUpRight, ArrowDownRight,
  TrendingUp, Award, UserCheck, UserX, BarChart3, ChevronRight, X,
  Play, Pause, LogIn, ExternalLink, Activity, Database, Cpu, HelpCircle,
  AlertTriangle, FileText, Download, Sliders, Layers, CreditCard,
  Wallet, QrCode, DollarSign, CheckSquare, Copy, Link, Send,
  Music, Mic, Wifi, WifiOff, Store, LogOut, ArrowLeft
} from 'lucide-react';
import { api } from '../services/api.ts';
import {
  AdminMetrics, User, RechargePackage, CommercialPlan,
  PaymentGatewayConfig, SubscriptionItem, PaymentTransaction, OnlineRadioStation
} from '../types/index.ts';

interface ClientItem {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  companyName?: string;
  city?: string;
  role: 'supermarket_owner' | 'manager' | 'admin';
  plan: 'gratuito' | 'pro_varejo' | 'redes_atacarejo';
  status: 'ativo' | 'bloqueado';
  creditsBalance: number;
  creditsUsed?: number;
  projectsCount?: number;
  audiosCount?: number;
  notes?: string;
  createdAt: string;
  lastActivity?: string;
}

interface AdminViewProps {
  onNavigate?: (view: string) => void;
  onImpersonateUser?: (user: User) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate, onImpersonateUser }) => {
  // Authentication / Security PIN Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('superlocucao_admin_auth') === 'true';
  });
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'plans' | 'audios' | 'subscriptions' | 'gateway' | 'integrations' | 'settings'>('overview');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search for Clients
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'gratuito' | 'pro_varejo' | 'redes_atacarejo'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'bloqueado'>('all');

  // Audio Auditor Player State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [selectedClientForCredits, setSelectedClientForCredits] = useState<ClientItem | null>(null);

  // Form states - Client
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formPlan, setFormPlan] = useState<'gratuito' | 'pro_varejo' | 'redes_atacarejo'>('gratuito');
  const [formStatus, setFormStatus] = useState<'ativo' | 'bloqueado'>('ativo');
  const [formCredits, setFormCredits] = useState<number>(50);
  const [formPassword, setFormPassword] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submittingClient, setSubmittingClient] = useState(false);

  // Form states - Credit adjustment
  const [creditAmount, setCreditAmount] = useState<number>(50);
  const [creditAction, setCreditAction] = useState<'add' | 'remove'>('add');
  const [creditReason, setCreditReason] = useState('Bônus promocional Super Admin');
  const [submittingCredits, setSubmittingCredits] = useState(false);

  // Settings
  const [systemNotice, setSystemNotice] = useState('');
  const [costPerGeneration, setCostPerGeneration] = useState<number>(10);
  const [newClientBonus, setNewClientBonus] = useState<number>(50);
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Plans & Recharge Packages State (Editable in Super Admin)
  const [rechargePackages, setRechargePackages] = useState<RechargePackage[]>([
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
  ]);

  const [commercialPlans, setCommercialPlans] = useState<CommercialPlan[]>([
    {
      id: 'degustacao',
      name: 'Degustação',
      tag: 'Teste Inicial',
      subtitle: 'Perfeito para você experimentar a qualidade na prática na sua loja.',
      price: 0,
      billingPeriod: 'grátis',
      creditsAmount: 50,
      features: [
        '50 créditos de boas-vindas',
        'Acesso a todas as 5 vozes de varejo',
        'Downloads imediatos em MP3',
        'Acesso à Rádio Web no navegador',
      ],
      ctaText: 'Começar Grátis',
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
        '1.500 créditos mensais renovados',
        'Geração em lote com download em arquivo ZIP',
        'Rádio Web contínua com Auto-Ducking',
        '15 vinhetas personalizadas com o nome da loja',
        'Suporte prioritário via WhatsApp',
      ],
      ctaText: 'Assinar Pro Varejo',
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
        '5.000 créditos mensais',
        'Múltiplas lojas e filiais gerenciadas',
        'Clonagem de voz personalizada da marca',
        'Gerente de conta e suporte dedicado',
      ],
      ctaText: 'Falar com Consultor',
      badge: '',
      highlighted: false,
    },
  ]);

  const [savingPlans, setSavingPlans] = useState(false);
  const [plansSavedSuccess, setPlansSavedSuccess] = useState(false);

  // Subscriptions & Payments State
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [subscriptionsStats, setSubscriptionsStats] = useState<any>({ total: 0, active: 0, mrr: 0, pastDue: 0 });
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [paymentsStats, setPaymentsStats] = useState<any>({ totalTransactions: 0, approvedCount: 0, pendingCount: 0, totalRevenue: 0 });
  const [financeSubTab, setFinanceSubTab] = useState<'subscriptions' | 'payments'>('subscriptions');
  const [searchTermPayments, setSearchTermPayments] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'approved' | 'pending' | 'refunded'>('all');

  // Payment Gateway Config State
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig>({
    provider: 'mercadopago',
    mode: 'sandbox',
    isActive: true,
    mercadoPagoPublicKey: '',
    mercadoPagoAccessToken: '',
    asaasApiKey: '',
    stripePublicKey: '',
    stripeSecretKey: '',
    pixKey: 'contato@superlocucao.inforartes.com.br',
    pixKeyType: 'email',
    webhookSecret: 'whsec_superlocucao_prod_2026',
  });
  const [savingGateway, setSavingGateway] = useState(false);
  const [gatewayNotice, setGatewayNotice] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // ElevenLabs
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [syncingVoices, setSyncingVoices] = useState(false);
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  // Gemini Key
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isEditingGeminiKey, setIsEditingGeminiKey] = useState(false);
  const [inputGeminiKey, setInputGeminiKey] = useState('');
  const [savingGeminiKey, setSavingGeminiKey] = useState(false);
  const [geminiKeyNotice, setGeminiKeyNotice] = useState<string | null>(null);

  // Database Audios Sync State
  const [dbAudioStats, setDbAudioStats] = useState<{ pgConnected: boolean; pgCount: number; localCount: number; seedCount: number }>({
    pgConnected: false,
    pgCount: 0,
    localCount: 0,
    seedCount: 0,
  });
  const [syncingAudios, setSyncingAudios] = useState(false);
  const [syncAudioNotice, setSyncAudioNotice] = useState<string | null>(null);

  // Online Radio Stations Realtime State
  const [onlineRadioStations, setOnlineRadioStations] = useState<OnlineRadioStation[]>([]);

  const fetchOnlineRadios = async () => {
    try {
      const res = await api.getOnlineRadioStations();
      setOnlineRadioStations(res.stations || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (activeTab === 'audios') {
      fetchOnlineRadios();
      const interval = setInterval(fetchOnlineRadios, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [metricsRes, usersRes] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminUsers().catch(() => ({ users: [] }))
      ]);

      if (metricsRes) {
        setMetrics(metricsRes);
        if (metricsRes.radioStats?.onlineStations) {
          setOnlineRadioStations(metricsRes.radioStats.onlineStations);
        }
        setSystemNotice(metricsRes.settings?.systemAnnouncement || '');
        setCostPerGeneration(metricsRes.settings?.creditsPerGeneration ?? 10);
        setNewClientBonus(metricsRes.settings?.initialCredits ?? 50);
        setContactWhatsapp(metricsRes.settings?.contactWhatsapp || '5596981248000');
        setContactEmail(metricsRes.settings?.contactEmail || 'contato@superlocucao.inforartes.com.br');
        setInputKey(metricsRes.elevenLabsApiKey || '');
        setInputGeminiKey(metricsRes.geminiApiKey || '');

        if (metricsRes.settings?.rechargePackages && metricsRes.settings.rechargePackages.length > 0) {
          setRechargePackages(metricsRes.settings.rechargePackages);
        }
        if (metricsRes.settings?.commercialPlans && metricsRes.settings.commercialPlans.length > 0) {
          setCommercialPlans(metricsRes.settings.commercialPlans);
        }
      }

      if (usersRes && usersRes.users) {
        setClients(usersRes.users);
      }

      // Load Subscriptions, Payments and Gateway
      api.getAdminSubscriptions().then(res => {
        if (res && res.subscriptions) {
          setSubscriptions(res.subscriptions);
          setSubscriptionsStats(res.stats || {});
        }
      }).catch(console.warn);

      api.getAdminPayments().then(res => {
        if (res && res.payments) {
          setPayments(res.payments);
          setPaymentsStats(res.stats || {});
        }
      }).catch(console.warn);

      api.getAdminGateway().then(res => {
        if (res && res.gateway) {
          setGatewayConfig(res.gateway);
        }
      }).catch(console.warn);

      api.getDatabaseAudiosStats().then(stats => {
        if (stats) setDbAudioStats(stats);
      }).catch(console.warn);
    } catch (e) {
      console.warn('Falha ao carregar dados do admin:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleUnlockAdmin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = adminPinInput.trim();
    if (!cleanPin) {
      setPinError(true);
      return;
    }
    // Senhas válidas para Super Admin: admin123, admin2026, 123456, superadmin
    const validPins = ['admin123', 'admin2026', '123456', 'superadmin', 'admin'];
    if (validPins.includes(cleanPin) || validPins.includes(cleanPin.toLowerCase())) {
      sessionStorage.setItem('superlocucao_admin_auth', 'true');
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLockAdmin = () => {
    sessionStorage.removeItem('superlocucao_admin_auth');
    setIsAuthenticated(false);
    setAdminPinInput('');
  };

  const openNewClientModal = () => {
    setEditingClient(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormCity('');
    setFormPlan('gratuito');
    setFormStatus('ativo');
    setFormCredits(50);
    setFormPassword('123456');
    setFormNotes('');
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client: ClientItem) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormEmail(client.email);
    setFormPhone(client.phone || '');
    setFormCompany(client.companyName || '');
    setFormCity(client.city || '');
    setFormPlan(client.plan);
    setFormStatus(client.status || 'ativo');
    setFormCredits(client.creditsBalance);
    setFormPassword(client.password || '123456');
    setFormNotes(client.notes || '');
    setIsClientModalOpen(true);
  };

  const openCreditModal = (client: ClientItem) => {
    setSelectedClientForCredits(client);
    setCreditAmount(50);
    setCreditAction('add');
    setCreditReason('Bônus promocional Super Admin');
    setIsCreditsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      alert('Nome e E-mail são obrigatórios!');
      return;
    }

    setSubmittingClient(true);
    try {
      if (editingClient) {
        await api.updateAdminUser(editingClient.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword.trim() || undefined,
          phone: formPhone.trim(),
          companyName: formCompany.trim(),
          city: formCity.trim(),
          plan: formPlan,
          status: formStatus,
          notes: formNotes.trim()
        });
      } else {
        await api.createAdminUser({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword.trim() || '123456',
          phone: formPhone.trim(),
          companyName: formCompany.trim(),
          city: formCity.trim(),
          plan: formPlan,
          status: formStatus,
          creditsBalance: formCredits,
          notes: formNotes.trim()
        });
      }

      setIsClientModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Erro ao salvar cliente: ${err.message}`);
    } finally {
      setSubmittingClient(false);
    }
  };

  const handleDeleteClient = async (client: ClientItem) => {
    if (confirm(`Tem certeza que deseja excluir o cliente "${client.companyName || client.name}" (${client.email})?`)) {
      try {
        await api.deleteAdminUser(client.id);
        await loadData();
      } catch (err: any) {
        alert(`Erro ao excluir: ${err.message}`);
      }
    }
  };

  const handleToggleStatus = async (client: ClientItem) => {
    const newStatus = client.status === 'ativo' ? 'bloqueado' : 'ativo';
    try {
      await api.updateAdminUser(client.id, { status: newStatus });
      await loadData();
    } catch (err: any) {
      alert(`Erro ao atualizar status: ${err.message}`);
    }
  };

  const handleApplyCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForCredits || !creditAmount) return;

    setSubmittingCredits(true);
    const finalAmount = creditAction === 'add' ? Math.abs(creditAmount) : -Math.abs(creditAmount);

    try {
      await api.adjustUserCredits(selectedClientForCredits.id, finalAmount, creditReason);
      setIsCreditsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Erro ao ajustar créditos: ${err.message}`);
    } finally {
      setSubmittingCredits(false);
    }
  };

  // Handlers for Plans & Packages
  const handleUpdateRechargePackage = (id: string, field: keyof RechargePackage, value: any) => {
    setRechargePackages(prev =>
      prev.map(pkg => (pkg.id === id ? { ...pkg, [field]: value } : pkg))
    );
  };

  const handleAddRechargePackage = () => {
    const newId = `pacote-${Date.now()}`;
    const newPkg: RechargePackage = {
      id: newId,
      name: 'Novo Pacote',
      credits: 500,
      price: 49,
      description: 'Aproximadamente 50 locuções comerciais',
      badge: '',
      highlighted: false,
    };
    setRechargePackages(prev => [...prev, newPkg]);
  };

  const handleRemoveRechargePackage = (id: string) => {
    if (confirm('Tem certeza que deseja remover este pacote de recarga?')) {
      setRechargePackages(prev => prev.filter(pkg => pkg.id !== id));
    }
  };

  const handleUpdateCommercialPlan = (id: string, field: keyof CommercialPlan, value: any) => {
    setCommercialPlans(prev =>
      prev.map(plan => (plan.id === id ? { ...plan, [field]: value } : plan))
    );
  };

  const handleAddCommercialPlan = () => {
    const newId = `plano-${Date.now()}`;
    const newPlan: CommercialPlan = {
      id: newId,
      name: 'Novo Plano',
      tag: 'Supermercados',
      subtitle: 'Descrição do novo plano comercial.',
      price: 99,
      billingPeriod: '/mês',
      creditsAmount: 1000,
      features: [
        '1.000 créditos mensais inclusos',
        'Acesso à Rádio Web no navegador',
        'Downloads em MP3 de alta fidelidade',
      ],
      ctaText: 'Assinar Plano',
      badge: '',
      highlighted: false,
    };
    setCommercialPlans(prev => [...prev, newPlan]);
  };

  const handleRemoveCommercialPlan = (id: string) => {
    if (confirm('Tem certeza que deseja remover este plano da página comercial?')) {
      setCommercialPlans(prev => prev.filter(plan => plan.id !== id));
    }
  };

  const handleAddPlanFeature = (planId: string) => {
    setCommercialPlans(prev =>
      prev.map(plan => {
        if (plan.id === planId) {
          return {
            ...plan,
            features: [...plan.features, 'Novo benefício incluso no plano'],
          };
        }
        return plan;
      })
    );
  };

  const handleUpdatePlanFeature = (planId: string, featureIndex: number, text: string) => {
    setCommercialPlans(prev =>
      prev.map(plan => {
        if (plan.id === planId) {
          const updated = [...plan.features];
          updated[featureIndex] = text;
          return { ...plan, features: updated };
        }
        return plan;
      })
    );
  };

  const handleRemovePlanFeature = (planId: string, featureIndex: number) => {
    setCommercialPlans(prev =>
      prev.map(plan => {
        if (plan.id === planId) {
          return {
            ...plan,
            features: plan.features.filter((_, idx) => idx !== featureIndex),
          };
        }
        return plan;
      })
    );
  };

  const handleSaveAllPlansAndPackages = async () => {
    setSavingPlans(true);
    try {
      await api.updateAdminSettings({
        rechargePackages,
        commercialPlans,
      });
      setPlansSavedSuccess(true);
      await loadData();
      setTimeout(() => setPlansSavedSuccess(false), 3500);
    } catch (e: any) {
      alert(`Erro ao salvar planos e recargas: ${e.message}`);
    } finally {
      setSavingPlans(false);
    }
  };

  // Handlers for Subscriptions, Payments & Gateway
  const handleToggleSubStatus = async (sub: SubscriptionItem) => {
    const nextStatus = sub.status === 'active' ? 'canceled' : 'active';
    try {
      await api.updateSubscriptionStatus(sub.id, nextStatus);
      await loadData();
    } catch (e: any) {
      alert(`Erro ao atualizar assinatura: ${e.message}`);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    if (confirm('Deseja confirmar este pagamento e liberar os créditos na conta do lojista agora?')) {
      try {
        const res = await api.confirmAdminPayment(paymentId);
        alert(res.message);
        await loadData();
      } catch (e: any) {
        alert(`Erro ao confirmar pagamento: ${e.message}`);
      }
    }
  };

  const handleRefundPayment = async (paymentId: string) => {
    if (confirm('Deseja marcar este pagamento como estornado?')) {
      try {
        const res = await api.refundAdminPayment(paymentId);
        alert(res.message);
        await loadData();
      } catch (e: any) {
        alert(`Erro ao estornar pagamento: ${e.message}`);
      }
    }
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGateway(true);
    setGatewayNotice(null);
    try {
      const res = await api.saveAdminGateway(gatewayConfig);
      setGatewayNotice(res.message || 'Configurações do Gateway salvas com sucesso!');
      await loadData();
      setTimeout(() => setGatewayNotice(null), 4000);
    } catch (err: any) {
      alert(`Erro ao salvar gateway: ${err.message}`);
    } finally {
      setSavingGateway(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    const url = `${window.location.origin}/api/webhooks/payment`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleSyncAudiosToDb = async () => {
    setSyncingAudios(true);
    setSyncAudioNotice(null);
    try {
      const res = await api.syncDatabaseAudios();
      setSyncAudioNotice(res.message);
      const stats = await api.getDatabaseAudiosStats();
      if (stats) setDbAudioStats(stats);
      setTimeout(() => setSyncAudioNotice(null), 5000);
    } catch (e: any) {
      alert(`Falha ao sincronizar locuções: ${e.message}`);
    } finally {
      setSyncingAudios(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.updateAdminSettings({
        systemAnnouncement: systemNotice.trim(),
        creditsPerGeneration: Number(costPerGeneration) || 10,
        initialCredits: Number(newClientBonus) || 50,
        contactWhatsapp: contactWhatsapp.trim(),
        contactEmail: contactEmail.trim(),
      });
      setSavedSuccess(true);
      await loadData();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      alert(`Erro ao salvar: ${e.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveElevenKey = async () => {
    if (!inputKey.trim()) {
      alert('Informe a chave API');
      return;
    }
    setSavingKey(true);
    setKeyNotice(null);
    try {
      const res = await api.updateElevenLabsKey(inputKey.trim());
      setKeyNotice(res.message || 'Chave ElevenLabs salva e validada com sucesso!');
      setIsEditingKey(false);
      await loadData();
      setTimeout(() => setKeyNotice(null), 4000);
    } catch (err: any) {
      alert(`Erro ao validar chave: ${err.message}`);
    } finally {
      setSavingKey(false);
    }
  };

  const handleSyncVoices = async () => {
    setSyncingVoices(true);
    setKeyNotice(null);
    try {
      const res = await api.syncElevenLabsVoices();
      setKeyNotice(res.message || `${res.voicesCount} vozes sincronizadas com sucesso!`);
      await loadData();
      setTimeout(() => setKeyNotice(null), 4000);
    } catch (err: any) {
      alert(`Erro ao sincronizar vozes: ${err.message}`);
    } finally {
      setSyncingVoices(false);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!inputGeminiKey.trim()) {
      alert('Informe a chave API do Google Gemini');
      return;
    }
    setSavingGeminiKey(true);
    setGeminiKeyNotice(null);
    try {
      const res = await api.updateGeminiKey(inputGeminiKey.trim());
      setGeminiKeyNotice(res.message || 'Chave do Google Gemini salva e validada com sucesso!');
      setIsEditingGeminiKey(false);
      await loadData();
      setTimeout(() => setGeminiKeyNotice(null), 4000);
    } catch (err: any) {
      alert(`Erro ao validar chave do Gemini: ${err.message}`);
    } finally {
      setSavingGeminiKey(false);
    }
  };

  const handlePlayAudio = (url: string, id: string) => {
    if (!audioPlayerRef.current) return;
    if (playingAudioId === id) {
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
    } else {
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.play().catch(console.warn);
      setPlayingAudioId(id);
    }
  };

  const handleExportBackup = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      platform: 'SuperLocução Varejo IA',
      metrics,
      clientsCount: clients.length,
      clients,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `superlocucao-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered clients
  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = planFilter === 'all' || c.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || (c.status || 'ativo') === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalCreditsInCirculation = clients.reduce((acc, c) => acc + (c.creditsBalance || 0), 0);
  const activeClientsCount = clients.filter(c => (c.status || 'ativo') === 'ativo').length;
  const blockedClientsCount = clients.filter(c => c.status === 'bloqueado').length;

  // =========================================================================
  // SECURITY PIN LOCK SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#161924] border border-zinc-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-500 to-red-500 flex items-center justify-center mx-auto text-zinc-950 shadow-xl shadow-orange-500/25">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acesso Restrito</span>
            </div>
            <h2 className="text-2xl font-black text-white">Console Super Admin</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
              Digite a Senha de Super Admin para gerenciar clientes, servidores de IA, planos e créditos.
            </p>
          </div>

          <form onSubmit={handleUnlockAdmin} className="space-y-4">
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPin ? 'text' : 'password'}
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Digite a Senha de Super Admin"
                className="w-full pl-10 pr-10 py-3 bg-[#11131a] border border-zinc-700/90 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition cursor-pointer"
                title={showPin ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {pinError && (
              <p className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Senha incorreta. Digite a senha do Super Admin.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-2xl text-sm shadow-xl shadow-orange-500/25 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4 stroke-[2.5]" />
              <span>Entrar no Console Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/');
                if (onNavigate) onNavigate('landing');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-orange-400 transition cursor-pointer pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a Página Inicial</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED SUPER ADMIN VIEW
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      {/* Hidden audio element for auditing audio quality */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => setPlayingAudioId(null)}
        onError={() => setPlayingAudioId(null)}
      />

      {/* TOP EXECUTIVE BAR */}
      <div className="bg-[#151822] rounded-3xl p-5 sm:p-6 border border-zinc-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent pointer-events-none" />

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Painel Super Admin Ativo</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-[#1e2230] px-3 py-1 rounded-full border border-zinc-700/60">
              Host: <strong>{typeof window !== 'undefined' ? window.location.host : 'superlocucao'}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PostgreSQL / Nuvem Conectado
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestão Central & Motores de IA
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Administração executiva de supermercados, cotas de voz ElevenLabs, roteirizador Gemini e transmissão da Rádio Web.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap z-10">
          <button
            onClick={() => loadData()}
            title="Recarregar Métricas e Clientes"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#1f2433] hover:bg-[#282f42] text-zinc-300 hover:text-white border border-zinc-700/80 rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
            <span>Atualizar</span>
          </button>

          <button
            onClick={openNewClientModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-orange-500/25 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Supermercado</span>
          </button>

          <button
            onClick={handleLockAdmin}
            title="Sair do Console Super Admin e Bloquear"
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-white border border-red-500/30 hover:border-red-500/60 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sair do Painel Admin</span>
          </button>
        </div>
      </div>

      {/* QUICK SYSTEM STATUS BADGES BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#151822] rounded-2xl p-3.5 border border-zinc-700/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-zinc-400 uppercase font-bold truncate">ElevenLabs TTS</div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${metrics?.elevenLabsConfigured ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {metrics?.elevenLabsConfigured ? 'Conectado (Vozes Ativas)' : 'Chave Pendente'}
            </div>
          </div>
        </div>

        <div className="bg-[#151822] rounded-2xl p-3.5 border border-zinc-700/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-zinc-400 uppercase font-bold truncate">Google Gemini</div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${metrics?.geminiConfigured ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {metrics?.geminiConfigured ? 'Ativo (gemini-2.5-flash)' : 'Chave Pendente'}
            </div>
          </div>
        </div>

        <div className="bg-[#151822] rounded-2xl p-3.5 border border-zinc-700/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-zinc-400 uppercase font-bold truncate">Banco de Dados</div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              PostgreSQL + Fallback
            </div>
          </div>
        </div>

        <div className="bg-[#151822] rounded-2xl p-3.5 border border-zinc-700/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-zinc-400 uppercase font-bold truncate">Rádio Web Engine</div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Auto-Ducking 100% OK
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS - 2 ROWS, NO SCROLLBAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pb-4 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer text-center ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'bg-[#121520] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#1a1e2b] hover:border-zinc-700'
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>Visão Geral Executiva</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer text-center ${
            activeTab === 'clients'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'bg-[#121520] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#1a1e2b] hover:border-zinc-700'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Supermercados ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer text-center ${
            activeTab === 'plans'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'bg-[#121520] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#1a1e2b] hover:border-zinc-700'
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>Planos & Recargas</span>
        </button>

        <button
          onClick={() => setActiveTab('audios')}
          className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer text-center ${
            activeTab === 'audios'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'bg-[#121520] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#1a1e2b] hover:border-zinc-700'
          }`}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>Auditoria & Rádio</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer text-center ${
            activeTab === 'subscriptions'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'bg-[#121520] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#1a1e2b] hover:border-zinc-700'
          }`}
        >
          <Wallet className="w-4 h-4 shrink-0" />
          <span>Assinaturas & Pagamentos</span>
        </button>

        <button
          onClick={() => setActiveTab('gateway')}
          className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer text-center ${
            activeTab === 'gateway'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'bg-[#121520] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#1a1e2b] hover:border-zinc-700'
          }`}
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span>Gateway de Pagamento</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer text-center ${
            activeTab === 'integrations'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'bg-[#121520] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#1a1e2b] hover:border-zinc-700'
          }`}
        >
          <Server className="w-4 h-4 shrink-0" />
          <span>Motores de IA</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer text-center ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'bg-[#121520] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#1a1e2b] hover:border-zinc-700'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Configurações & Regras</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: VISÃO GERAL EXECUTIVA */}
      {/* ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#151822] rounded-3xl p-5 sm:p-6 border border-zinc-700/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
                <span className="font-bold uppercase tracking-wider">Supermercados Ativos</span>
                <div className="w-9 h-9 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">{activeClientsCount}</div>
              <div className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{clients.length} lojistas cadastrados ({blockedClientsCount} bloqueados)</span>
              </div>
            </div>

            <div className="bg-[#151822] rounded-3xl p-5 sm:p-6 border border-zinc-700/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
                <span className="font-bold uppercase tracking-wider">Campanhas Criadas</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">{metrics?.totalProjects || 0}</div>
              <div className="text-xs text-zinc-400 font-semibold mt-2 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Roteiros e encartes salvos na nuvem</span>
              </div>
            </div>

            <div className="bg-[#151822] rounded-3xl p-5 sm:p-6 border border-zinc-700/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
                <span className="font-bold uppercase tracking-wider">Locuções Geradas</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">{metrics?.totalAudiosGenerated || 0}</div>
              <div className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Áudios comerciais com trilha mixada</span>
              </div>
            </div>

            <div className="bg-[#151822] rounded-3xl p-5 sm:p-6 border border-zinc-700/80 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
                <span className="font-bold uppercase tracking-wider">Créditos em Circulação</span>
                <div className="w-9 h-9 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-yellow-400">
                {totalCreditsInCirculation.toLocaleString('pt-BR')}
              </div>
              <div className="text-xs text-zinc-400 font-semibold mt-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                <span>{metrics?.totalCreditsUsed || 0} créditos consumidos até hoje</span>
              </div>
            </div>
          </div>

          {/* AI Usage & Subscription Monitor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ElevenLabs Usage Card */}
            <div className="bg-[#151822] rounded-3xl p-6 border border-zinc-700/80 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black text-xs">
                    11
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">ElevenLabs Voice Engine</h3>
                    <p className="text-[11px] text-zinc-400">
                      Plano: <strong>{metrics?.elevenLabsSubscription?.tier || 'Pro / Scale'}</strong>
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {metrics?.elevenLabsVoicesCount || 5} vozes ativas
                </span>
              </div>

              {metrics?.elevenLabsSubscription ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span>Consumo de Caracteres:</span>
                    <strong className="text-orange-400">
                      {metrics.elevenLabsSubscription.characterCount.toLocaleString('pt-BR')} / {metrics.elevenLabsSubscription.characterLimit.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <div className="w-full h-2.5 bg-[#1f2433] rounded-full overflow-hidden border border-zinc-700/60">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, metrics.elevenLabsSubscription.percentUsed || 0)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-zinc-500 text-right">
                    {metrics.elevenLabsSubscription.percentUsed || 0}% da cota mensal utilizada
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#1b1f2c] rounded-2xl text-xs text-zinc-400 border border-zinc-700/60">
                  Chave API configurada e pronta para sintetizar locuções em alta fidelidade.
                </div>
              )}

              <button
                onClick={() => setActiveTab('integrations')}
                className="w-full py-2 bg-[#1f2433] hover:bg-[#282f42] border border-zinc-700/70 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Server className="w-3.5 h-3.5 text-orange-400" />
                <span>Gerenciar Chave & Sincronizar Vozes</span>
              </button>
            </div>

            {/* Plan Distribution Breakdown */}
            <div className="bg-[#151822] rounded-3xl p-6 border border-zinc-700/80 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Distribuição por Planos</span>
                </h3>
                <span className="text-xs text-zinc-400">{clients.length} lojistas</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      Pro Varejo (R$ 149/mês)
                    </span>
                    <strong>{clients.filter(c => c.plan === 'pro_varejo').length} lojistas</strong>
                  </div>
                  <div className="w-full h-2 bg-[#1f2433] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${(clients.filter(c => c.plan === 'pro_varejo').length / (clients.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Redes Atacarejo (R$ 399/mês)
                    </span>
                    <strong>{clients.filter(c => c.plan === 'redes_atacarejo').length} lojistas</strong>
                  </div>
                  <div className="w-full h-2 bg-[#1f2433] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(clients.filter(c => c.plan === 'redes_atacarejo').length / (clients.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                      Degustação (50 créditos grátis)
                    </span>
                    <strong>{clients.filter(c => c.plan === 'gratuito').length} lojistas</strong>
                  </div>
                  <div className="w-full h-2 bg-[#1f2433] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-500 rounded-full"
                      style={{ width: `${(clients.filter(c => c.plan === 'gratuito').length / (clients.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Receita Recorrente Estimada (MRR):</span>
                <span className="font-black text-emerald-400 text-sm">
                  R$ {(
                    clients.filter(c => c.plan === 'pro_varejo').length * 149 +
                    clients.filter(c => c.plan === 'redes_atacarejo').length * 399
                  ).toLocaleString('pt-BR')} /mês
                </span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#151822] rounded-3xl p-6 border border-zinc-700/80 shadow-lg space-y-3">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Ações Rápidas de Gestão</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Atalhos operacionais para suporte e administração central:
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={openNewClientModal}
                  className="w-full py-2.5 px-3 bg-[#1e2230] hover:bg-[#272d40] border border-zinc-700/80 rounded-xl text-xs font-bold text-white flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-400" />
                    Cadastrar Novo Supermercado
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                <button
                  onClick={() => setActiveTab('clients')}
                  className="w-full py-2.5 px-3 bg-[#1e2230] hover:bg-[#272d40] border border-zinc-700/80 rounded-xl text-xs font-bold text-white flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Injetar Créditos em Lojista
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 px-3 bg-[#1e2230] hover:bg-[#272d40] border border-zinc-700/80 rounded-xl text-xs font-bold text-white flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    Exportar Backup da Plataforma (JSON)
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Global Transactions Feed */}
          <div className="bg-[#151822] rounded-3xl p-6 border border-zinc-700/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-base">Últimas Movimentações de Créditos</h3>
                <p className="text-xs text-zinc-400">
                  Auditoria das transações de geração de áudios, bônus e recargas na plataforma.
                </p>
              </div>
              <button
                onClick={() => loadData()}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Atualizar Feed
              </button>
            </div>

            <div className="divide-y divide-zinc-800/80 overflow-hidden">
              {metrics?.recentTransactions && metrics.recentTransactions.length > 0 ? (
                metrics.recentTransactions.slice(0, 8).map((tx, idx) => (
                  <div key={tx.id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'credit'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownRight className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{tx.description}</div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                          <span>{tx.userId}</span>
                          <span>•</span>
                          <span>{new Date(tx.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount} créditos
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Nenhuma transação registrada até o momento.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: GESTÃO DE CLIENTES & SUPERMERCADOS */}
      {/* ===================================================================== */}
      {activeTab === 'clients' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Search & Filter Bar */}
          <div className="bg-[#151822] p-4 sm:p-5 rounded-3xl border border-zinc-700/80 shadow-lg flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, razão social, cidade ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-700/80 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-[#10121a] text-white placeholder-zinc-500 transition"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#10121a] border border-zinc-700/80 px-3 py-1.5 rounded-2xl text-xs text-zinc-300">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-500">Plano:</span>
                <select
                  value={planFilter}
                  onChange={(e: any) => setPlanFilter(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#151822]">Todos</option>
                  <option value="gratuito" className="bg-[#151822]">Degustação</option>
                  <option value="pro_varejo" className="bg-[#151822]">Pro Varejo</option>
                  <option value="redes_atacarejo" className="bg-[#151822]">Redes Atacarejo</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#10121a] border border-zinc-700/80 px-3 py-1.5 rounded-2xl text-xs text-zinc-300">
                <span className="text-zinc-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#151822]">Todos</option>
                  <option value="ativo" className="bg-[#151822]">Ativos</option>
                  <option value="bloqueado" className="bg-[#151822]">Bloqueados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-[#151822] rounded-3xl border border-zinc-700/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1b1f2d] text-zinc-400 font-black uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-4 px-5">Supermercado / Cliente</th>
                    <th className="py-4 px-4">Contato & Cidade</th>
                    <th className="py-4 px-4">Plano</th>
                    <th className="py-4 px-4">Saldo Créditos</th>
                    <th className="py-4 px-4">Produção</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-xs">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-[#1a1e2b] transition">
                        {/* Client Identity */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 font-black flex items-center justify-center shrink-0 text-sm shadow-sm">
                              {(client.companyName || client.name).slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-black text-white text-sm">
                                {client.companyName || client.name}
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                {client.name} {client.role === 'admin' && <span className="text-orange-400 font-bold">(Super Admin)</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact info */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <div className="text-zinc-300 flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-zinc-500" /> {client.email}
                            </div>
                            {client.phone && (
                              <div className="text-zinc-400 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-zinc-500" /> {client.phone}
                              </div>
                            )}
                            {client.city && (
                              <div className="text-zinc-500 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-zinc-500" /> {client.city}
                              </div>
                            )}
                            <div className="text-orange-400/90 font-mono text-[10px] flex items-center gap-1.5 pt-0.5">
                              <Lock className="w-3 h-3 text-orange-500/70" />
                              <span>Senha: <strong>{client.password || '123456'}</strong></span>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            client.plan === 'redes_atacarejo'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : client.plan === 'pro_varejo'
                              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                              : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700'
                          }`}>
                            {client.plan === 'redes_atacarejo' ? 'Redes Atacarejo' : client.plan === 'pro_varejo' ? 'Pro Varejo' : 'Degustação'}
                          </span>
                        </td>

                        {/* Credits */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-amber-400 text-sm">
                              {client.creditsBalance}
                            </span>
                            <button
                              onClick={() => openCreditModal(client)}
                              title="Ajustar / Injetar Créditos"
                              className="p-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Production Stats */}
                        <td className="py-4 px-4 text-zinc-400 text-[11px]">
                          <div><strong>{client.projectsCount || 0}</strong> campanhas</div>
                          <div><strong>{client.audiosCount || 0}</strong> locuções</div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleStatus(client)}
                            title="Clique para alternar status do cliente"
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                              (client.status || 'ativo') === 'ativo'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (client.status || 'ativo') === 'ativo' ? 'bg-emerald-400' : 'bg-red-400'
                            }`} />
                            {(client.status || 'ativo') === 'ativo' ? 'Ativo' : 'Bloqueado'}
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onImpersonateUser && (
                              <button
                                onClick={() => onImpersonateUser(client as any)}
                                title="Acessar painel da loja deste lojista (Suporte)"
                                className="px-2.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                              >
                                <LogIn className="w-3 h-3" />
                                <span className="hidden sm:inline">Acessar Loja</span>
                              </button>
                            )}

                            <button
                              onClick={() => openEditClientModal(client)}
                              title="Editar Dados do Lojista"
                              className="p-1.5 rounded-xl bg-[#1f2433] hover:bg-[#282f42] text-zinc-300 hover:text-white border border-zinc-700/80 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {client.id !== 'user-admin' && (
                              <button
                                onClick={() => handleDeleteClient(client)}
                                title="Excluir Lojista"
                                className="p-1.5 rounded-xl bg-[#1f2433] hover:bg-red-500/20 text-zinc-400 hover:text-red-300 border border-zinc-700/80 hover:border-red-500/40 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        Nenhum supermercado encontrado para esta busca ou filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: EDITOR DE PLANOS & PACOTES DE CRÉDITO                            */}
      {/* ===================================================================== */}
      {activeTab === 'plans' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Header Bar with Save Button */}
          <div className="bg-[#151822] rounded-3xl p-6 border border-zinc-700/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <h2 className="text-xl font-black text-white">Editor de Preços, Pacotes e Planos</h2>
              </div>
              <p className="text-xs text-zinc-400">
                Edite os valores dos pacotes de recarga de créditos (painel do cliente) e os planos de assinatura da página comercial. Todas as alterações refletem imediatamente.
              </p>
            </div>

            <button
              onClick={handleSaveAllPlansAndPackages}
              disabled={savingPlans}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{savingPlans ? 'Salvando Alterações...' : 'Salvar Todos os Planos & Pacotes'}</span>
            </button>
          </div>

          {plansSavedSuccess && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span><strong>Alterações salvas com sucesso!</strong> Os pacotes de recarga e planos comerciais foram atualizados em toda a plataforma.</span>
            </div>
          )}

          {/* SECTION 1: RECHARGE PACKAGES (CREDIT PURCHASE) */}
          <div className="bg-[#151822] rounded-3xl p-6 sm:p-8 border border-zinc-700/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-black text-white">Pacotes de Recarga Imediata (Compra de Créditos)</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pacotes exibidos no painel do cliente em &quot;Gestão de Créditos & Consumo&quot;. O cliente clica para adicionar créditos avulsos à conta.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRechargePackage}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1f2433] hover:bg-[#282f42] text-zinc-200 hover:text-white border border-zinc-700/80 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-orange-400" />
                <span>+ Adicionar Pacote de Recarga</span>
              </button>
            </div>

            {/* Editable Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rechargePackages.map((pkg, idx) => (
                <div
                  key={pkg.id || idx}
                  className={`rounded-3xl p-5 border flex flex-col justify-between space-y-4 relative transition ${
                    pkg.highlighted
                      ? 'bg-[#1a1f2e] border-orange-500/80 shadow-xl shadow-orange-500/10'
                      : 'bg-[#10121a] border-zinc-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                      Pacote #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRechargePackage(pkg.id)}
                      title="Excluir este pacote"
                      className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Nome do Pacote</label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => handleUpdateRechargePackage(pkg.id, 'name', e.target.value)}
                        placeholder="Ex: Pacote Básico"
                        className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Créditos</label>
                        <input
                          type="number"
                          min="1"
                          value={pkg.credits}
                          onChange={(e) => handleUpdateRechargePackage(pkg.id, 'credits', Number(e.target.value))}
                          className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-amber-400 font-black text-sm focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Preço (R$)</label>
                        <input
                          type="number"
                          min="0"
                          value={pkg.price}
                          onChange={(e) => handleUpdateRechargePackage(pkg.id, 'price', Number(e.target.value))}
                          className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-emerald-400 font-black text-sm focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Descrição / Equivalência</label>
                      <input
                        type="text"
                        value={pkg.description}
                        onChange={(e) => handleUpdateRechargePackage(pkg.id, 'description', e.target.value)}
                        placeholder="Ex: Aproximadamente 30 locuções comerciais"
                        className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-zinc-300 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Badge de Destaque (Opcional)</label>
                      <input
                        type="text"
                        value={pkg.badge || ''}
                        onChange={(e) => handleUpdateRechargePackage(pkg.id, 'badge', e.target.value)}
                        placeholder="Ex: MELHOR CUSTO-BENEFÍCIO"
                        className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-zinc-300 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1 text-zinc-300">
                      <input
                        type="checkbox"
                        checked={Boolean(pkg.highlighted)}
                        onChange={(e) => handleUpdateRechargePackage(pkg.id, 'highlighted', e.target.checked)}
                        className="rounded border-zinc-700 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="font-bold text-[11px]">Destacar com borda e sombra</span>
                    </label>
                  </div>

                  {/* Mini Preview Box */}
                  <div className="pt-3 border-t border-zinc-800/80 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Prévia no Painel do Cliente</span>
                    <div className="p-3 bg-white text-zinc-900 rounded-2xl shadow-sm text-left relative overflow-hidden">
                      {pkg.badge && (
                        <div className="inline-block px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full uppercase mb-1">
                          {pkg.badge}
                        </div>
                      )}
                      <div className="text-[11px] font-bold text-slate-500 uppercase">{pkg.name || 'Pacote'}</div>
                      <div className="text-lg font-black text-slate-900">{(pkg.credits || 0).toLocaleString('pt-BR')} Créditos</div>
                      <div className="text-[10px] text-slate-500">{pkg.description || 'Equivalência'}</div>
                      <div className="text-xl font-extrabold text-slate-900 mt-2">R$ {Number(pkg.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: COMMERCIAL PLANS (LANDING PAGE SUBSCRIPTIONS) */}
          <div className="bg-[#151822] rounded-3xl p-6 sm:p-8 border border-zinc-700/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-black text-white">Planos de Assinatura da Página Comercial (Landing Page)</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Planos exibidos na página comercial pública (Degustação, Pro Varejo, Redes & Atacarejo). Permite alterar títulos, preços, créditos mensais e a lista de benefícios de cada plano.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCommercialPlan}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1f2433] hover:bg-[#282f42] text-zinc-200 hover:text-white border border-zinc-700/80 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-orange-400" />
                <span>+ Adicionar Plano Comercial</span>
              </button>
            </div>

            {/* Editable Plans List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {commercialPlans.map((plan, idx) => (
                <div
                  key={plan.id || idx}
                  className={`rounded-3xl p-5 border flex flex-col justify-between space-y-5 relative transition ${
                    plan.highlighted
                      ? 'bg-[#1a1f2e] border-orange-500/80 shadow-xl shadow-orange-500/10'
                      : 'bg-[#10121a] border-zinc-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                      Plano #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCommercialPlan(plan.id)}
                      title="Excluir este plano"
                      className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Nome do Plano</label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handleUpdateCommercialPlan(plan.id, 'name', e.target.value)}
                          placeholder="Ex: Pro Varejo"
                          className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Tag Superior</label>
                        <input
                          type="text"
                          value={plan.tag || ''}
                          onChange={(e) => handleUpdateCommercialPlan(plan.id, 'tag', e.target.value)}
                          placeholder="Ex: Supermercados"
                          className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-orange-400 font-bold text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Subtítulo / Descrição Rápida</label>
                      <textarea
                        rows={2}
                        value={plan.subtitle}
                        onChange={(e) => handleUpdateCommercialPlan(plan.id, 'subtitle', e.target.value)}
                        placeholder="Ex: Ideal para mercados que trocam encartes todo dia."
                        className="w-full mt-1 p-2.5 bg-[#151822] border border-zinc-700/80 rounded-xl text-zinc-300 text-xs focus:outline-none focus:border-orange-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Preço (R$)</label>
                        <input
                          type="number"
                          min="0"
                          value={plan.price}
                          onChange={(e) => handleUpdateCommercialPlan(plan.id, 'price', Number(e.target.value))}
                          className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-emerald-400 font-black text-sm focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Período de Cobrança</label>
                        <input
                          type="text"
                          value={plan.billingPeriod}
                          onChange={(e) => handleUpdateCommercialPlan(plan.id, 'billingPeriod', e.target.value)}
                          placeholder="Ex: /mês ou grátis"
                          className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-zinc-300 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Créditos Inclusos</label>
                        <input
                          type="number"
                          min="0"
                          value={plan.creditsAmount}
                          onChange={(e) => handleUpdateCommercialPlan(plan.id, 'creditsAmount', Number(e.target.value))}
                          className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-amber-400 font-black text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Texto do Botão CTA</label>
                        <input
                          type="text"
                          value={plan.ctaText}
                          onChange={(e) => handleUpdateCommercialPlan(plan.id, 'ctaText', e.target.value)}
                          placeholder="Ex: Assinar Pro Varejo"
                          className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-zinc-300 text-xs focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase">Badge de Destaque</label>
                      <input
                        type="text"
                        value={plan.badge || ''}
                        onChange={(e) => handleUpdateCommercialPlan(plan.id, 'badge', e.target.value)}
                        placeholder="Ex: Mais Escolhido ou Recomendado"
                        className="w-full mt-1 px-3 py-2 bg-[#151822] border border-zinc-700/80 rounded-xl text-zinc-300 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1 text-zinc-300">
                      <input
                        type="checkbox"
                        checked={Boolean(plan.highlighted)}
                        onChange={(e) => handleUpdateCommercialPlan(plan.id, 'highlighted', e.target.checked)}
                        className="rounded border-zinc-700 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="font-bold text-[11px]">Destacar Card com Borda Laranja & Escala</span>
                    </label>

                    {/* Features Editor */}
                    <div className="pt-2 border-t border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Benefícios do Plano ({plan.features.length})</label>
                        <button
                          type="button"
                          onClick={() => handleAddPlanFeature(plan.id)}
                          className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Adicionar Item
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {plan.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => handleUpdatePlanFeature(plan.id, fIdx, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-[#151822] border border-zinc-700/80 rounded-lg text-white text-[11px] focus:outline-none focus:border-orange-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePlanFeature(plan.id, fIdx)}
                              className="p-1 rounded text-zinc-500 hover:text-red-400 transition cursor-pointer"
                              title="Remover benefício"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={handleSaveAllPlansAndPackages}
                disabled={savingPlans}
                className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-orange-500/25 transition cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{savingPlans ? 'Salvando...' : 'Salvar Todos os Planos & Pacotes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: AUDITORIA DE ÁUDIOS & RÁDIO WEB */}
      {/* ===================================================================== */}
      {activeTab === 'audios' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Radio Station Realtime Status & Live Radios Monitor */}
          <div className="bg-[#151822] rounded-3xl p-6 border border-zinc-700/80 shadow-lg space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${onlineRadioStations.length > 0 ? 'bg-emerald-500 animate-ping' : 'bg-zinc-600'}`} />
                  <h3 className="font-black text-white text-lg">Central da Rádio Web em Loja</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    onlineRadioStations.length > 0
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {onlineRadioStations.length > 0 ? 'Transmissão Ao Vivo Ativa' : 'Aguardando Lojas'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  A Rádio Web com Deck Duplo sincroniza trilhas musicais e ofertas programadas nos supermercados. Acompanhe em tempo real quais emissoras estão transmitindo no ar.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-[#10121a] border border-zinc-700/80 px-4 py-2 rounded-2xl text-xs text-zinc-300">
                  <span className="text-zinc-500">Rádios Online Agora:</span>{' '}
                  <strong className={`font-black ${onlineRadioStations.length > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {onlineRadioStations.length} {onlineRadioStations.length === 1 ? 'loja no ar' : 'lojas no ar'}
                  </strong>
                </div>
                <div className="bg-[#10121a] border border-zinc-700/80 px-4 py-2 rounded-2xl text-xs text-zinc-300">
                  <span className="text-zinc-500">Fila Global:</span>{' '}
                  <strong className="text-orange-400 font-black">{metrics?.radioStats?.queueCount || 0} ofertas</strong>
                </div>
                <div className="bg-[#10121a] border border-zinc-700/80 px-4 py-2 rounded-2xl text-xs text-zinc-300">
                  <span className="text-zinc-500">Intervalo Padrão:</span>{' '}
                  <strong className="text-white font-black">{metrics?.radioStats?.defaultIntervalSec || 45}s</strong>
                </div>
              </div>
            </div>

            {/* LIVE ONLINE STATIONS LIST */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Supermercados com Rádio Online no Ar ({onlineRadioStations.length})
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Monitoramento em tempo real (atualização automática a cada 4s)
                </span>
              </div>

              {onlineRadioStations.length === 0 ? (
                <div className="p-8 bg-[#10121a] border border-zinc-800/80 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 text-zinc-500 flex items-center justify-center mx-auto">
                    <WifiOff className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-300">
                    Nenhuma rádio de supermercado transmitindo no ar neste momento
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    Assim que um cliente ou operador de supermercado clicar no botão <strong className="text-orange-400 font-semibold">"Ligar Rádio da Loja Ao Vivo"</strong> dentro do painel, a emissora conectará e aparecerá aqui instantaneamente com a música que está tocando e as locuções de ofertas transmitidas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {onlineRadioStations.map((station) => (
                    <div
                      key={station.id}
                      className="bg-[#10121a] border border-emerald-500/40 hover:border-emerald-500/70 rounded-2xl p-3.5 shadow-md shadow-emerald-950/20 space-y-2.5 relative overflow-hidden transition"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

                      {/* Header of Station */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[150px]">
                                {station.storeName || 'Supermercado'}
                              </h4>
                              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-500 text-zinc-950 flex items-center gap-1 animate-pulse shrink-0">
                                <span className="w-1 h-1 rounded-full bg-zinc-950" />
                                NO AR
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 font-medium truncate max-w-[180px]">
                              {station.stationName || 'Rádio Supermercado'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-[10px] text-zinc-400 shrink-0">
                          <div className="font-bold text-emerald-400 flex items-center gap-1 justify-end">
                            <Wifi className="w-3 h-3" />
                            <span>Online</span>
                          </div>
                          <div className="text-zinc-500 font-mono text-[9px]">
                            {new Date(station.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1 truncate text-[11px]">
                          <span className="text-zinc-500">Operador:</span>
                          <strong className="text-zinc-300 font-semibold truncate max-w-[120px]">
                            {station.userName || 'Cliente'}
                          </strong>
                        </div>
                        <div className="text-zinc-500 text-[10px] shrink-0 font-medium">
                          {station.spotsQueueCount} ofertas
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sincronização de Locuções Reais no Banco de Dados (VPS) */}
          <div className="bg-[#151822] rounded-3xl p-6 border border-zinc-700/80 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-white text-base">Banco de Dados & Locuções Reais (VPS)</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    dbAudioStats.pgConnected
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {dbAudioStats.pgConnected ? 'PostgreSQL Conectado' : 'Modo Local (JSON)'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Envia todos os usuários, projetos, planos, pacotes de recarga e todas as 174 locuções reais e trilhas diretamente para o banco de dados PostgreSQL da VPS.
                </p>
              </div>

              <button
                onClick={handleSyncAudiosToDb}
                disabled={syncingAudios}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-zinc-950 font-black text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${syncingAudios ? 'animate-spin' : ''}`} />
                <span>{syncingAudios ? 'Sincronizando Banco...' : 'Sincronizar Todo o Banco & Áudios com a VPS'}</span>
              </button>
            </div>

            {syncAudioNotice && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncAudioNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 bg-[#10121a] rounded-2xl border border-zinc-800">
                <div className="text-[11px] text-zinc-400 font-bold uppercase">No Banco PostgreSQL (VPS)</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{dbAudioStats.pgCount} áudios</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Gravados na tabela audio_binaries</div>
              </div>

              <div className="p-3.5 bg-[#10121a] rounded-2xl border border-zinc-800">
                <div className="text-[11px] text-zinc-400 font-bold uppercase">Armazenamento Local</div>
                <div className="text-xl font-black text-white mt-1">{dbAudioStats.localCount} arquivos</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Pasta .locucao_audios/</div>
              </div>

              <div className="p-3.5 bg-[#10121a] rounded-2xl border border-zinc-800">
                <div className="text-[11px] text-zinc-400 font-bold uppercase">Vozes & Estilos Seed</div>
                <div className="text-xl font-black text-orange-400 mt-1">{dbAudioStats.seedCount || 14} matrizes</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Embutidos no código da VPS</div>
              </div>
            </div>
          </div>

          {/* Recent Audios Feed with Inline Player */}
          <div className="bg-[#151822] rounded-3xl p-6 border border-zinc-700/80 shadow-lg space-y-4">
            <div>
              <h3 className="font-black text-white text-base">Últimas Locuções Produzidas por Clientes</h3>
              <p className="text-xs text-zinc-400">
                Audite a qualidade de áudio, mixagem com trilha sonora e voz utilizada em tempo real.
              </p>
            </div>

            <div className="space-y-3">
              {metrics?.recentAudios && metrics.recentAudios.length > 0 ? (
                metrics.recentAudios.map((audio: any) => (
                  <div
                    key={audio.id}
                    className="p-4 bg-[#1b1f2d] hover:bg-[#202536] border border-zinc-700/70 hover:border-orange-500/40 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        onClick={() => handlePlayAudio(audio.audioUrl, audio.id)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition cursor-pointer shadow-md ${
                          playingAudioId === audio.id
                            ? 'bg-orange-500 text-zinc-950 scale-105'
                            : 'bg-[#151822] hover:bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        }`}
                      >
                        {playingAudioId === audio.id ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-white text-sm truncate">
                            {audio.title || 'Locução Comercial'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                            {audio.storeName || 'Supermercado'}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-3 flex-wrap">
                          <span>Voz: <strong>{audio.voiceId || 'Daniel'}</strong></span>
                          <span>•</span>
                          <span>Trilha: <strong>{audio.soundtrackId || 'Mix Varejo'}</strong></span>
                          <span>•</span>
                          <span>{new Date(audio.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <a
                        href={audio.downloadUrl || audio.audioUrl}
                        download
                        className="px-3 py-1.5 rounded-xl bg-[#151822] hover:bg-[#252b3d] text-zinc-300 hover:text-white border border-zinc-700/70 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-400" />
                        <span>Baixar MP3</span>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-zinc-500">
                  Nenhum áudio produzido recentemente.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: MOTORES DE IA & CHAVES DE API */}
      {/* ===================================================================== */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 animate-in fade-in">
          {/* ElevenLabs Integration Card */}
          <div className="bg-[#151822] rounded-3xl p-6 sm:p-8 border border-zinc-700/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-lg">
                  11
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">ElevenLabs Voice Engine</h3>
                  <p className="text-xs text-zinc-400">
                    Sintetizador neural de vozes humanas para anúncios de varejo em alta fidelidade.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncVoices}
                  disabled={syncingVoices}
                  className="px-3.5 py-2 rounded-xl bg-[#1f2433] hover:bg-[#282f42] border border-zinc-700/80 text-zinc-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${syncingVoices ? 'animate-spin' : ''}`} />
                  <span>{syncingVoices ? 'Sincronizando...' : 'Sincronizar Vozes'}</span>
                </button>
              </div>
            </div>

            {keyNotice && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{keyNotice}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Chave da API ElevenLabs (ELEVENLABS_API_KEY)
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value);
                      setIsEditingKey(true);
                    }}
                    placeholder="Cole sua chave da ElevenLabs aqui..."
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-zinc-700/80 text-xs sm:text-sm bg-[#10121a] text-white focus:outline-none focus:border-orange-500 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={handleSaveElevenKey}
                  disabled={savingKey || !inputKey.trim()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black text-xs sm:text-sm transition shadow-lg shadow-orange-500/20 cursor-pointer shrink-0"
                >
                  {savingKey ? 'Validando...' : 'Salvar Chave'}
                </button>
              </div>
            </div>
          </div>

          {/* Google Gemini Integration Card */}
          <div className="bg-[#151822] rounded-3xl p-6 sm:p-8 border border-zinc-700/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Google Gemini Roteirizador</h3>
                  <p className="text-xs text-zinc-400">
                    Inteligência artificial para elaboração de textos comerciais, ofertas e gatilhos de supermercado.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Modelo: gemini-2.5-flash
              </span>
            </div>

            {geminiKeyNotice && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{geminiKeyNotice}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Chave da API Gemini (GEMINI_API_KEY)
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={inputGeminiKey}
                    onChange={(e) => {
                      setInputGeminiKey(e.target.value);
                      setIsEditingGeminiKey(true);
                    }}
                    placeholder="Cole sua chave do Google Gemini aqui..."
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-zinc-700/80 text-xs sm:text-sm bg-[#10121a] text-white focus:outline-none focus:border-orange-500 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition cursor-pointer"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={handleSaveGeminiKey}
                  disabled={savingGeminiKey || !inputGeminiKey.trim()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black text-xs sm:text-sm transition shadow-lg shadow-orange-500/20 cursor-pointer shrink-0"
                >
                  {savingGeminiKey ? 'Validando...' : 'Salvar Chave'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: ASSINATURAS E PAGAMENTOS */}
      {/* ===================================================================== */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#161924] border border-zinc-700/80 rounded-3xl shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Financeiro & Faturamento</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Gestão de Assinaturas & Pagamentos
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Acompanhe o faturamento, controle assinaturas recorrentes e aprove pagamentos PIX/Cartão manualmente se necessário.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFinanceSubTab('subscriptions')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                  financeSubTab === 'subscriptions'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-lg shadow-orange-500/20'
                    : 'bg-[#10121a] text-zinc-300 hover:text-white border border-zinc-700/80 hover:bg-zinc-800'
                }`}
              >
                <span>📜 Assinaturas & Contratos ({subscriptions.length})</span>
              </button>
              <button
                onClick={() => setFinanceSubTab('payments')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                  financeSubTab === 'payments'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-lg shadow-orange-500/20'
                    : 'bg-[#10121a] text-zinc-300 hover:text-white border border-zinc-700/80 hover:bg-zinc-800'
                }`}
              >
                <span>🧾 Faturas & Transações PIX ({payments.length})</span>
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 bg-[#161924] border border-zinc-700/80 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                <span>MRR (Receita Recorrente)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                R$ {Number(subscriptionsStats.mrr || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span>●</span> {subscriptionsStats.active || 0} assinaturas ativas gerando receita
              </div>
            </div>

            <div className="p-5 bg-[#161924] border border-zinc-700/80 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                <span>Total Faturado (Geral)</span>
                <DollarSign className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                R$ {Number(paymentsStats.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-zinc-400">
                {paymentsStats.approvedCount || 0} transações aprovadas
              </div>
            </div>

            <div className="p-5 bg-[#161924] border border-zinc-700/80 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                <span>Pagamentos Pendentes</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {paymentsStats.pendingCount || 0}
              </div>
              <div className="text-[11px] text-zinc-400">
                Aguardando confirmação PIX ou compensação
              </div>
            </div>

            <div className="p-5 bg-[#161924] border border-zinc-700/80 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                <span>Gateway Ativo</span>
                <QrCode className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                {gatewayConfig.provider === 'mercadopago' ? 'Mercado Pago' : gatewayConfig.provider === 'asaas' ? 'Asaas' : gatewayConfig.provider === 'stripe' ? 'Stripe' : 'PIX Direto'}
              </div>
              <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${gatewayConfig.mode === 'production' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>Modo: {gatewayConfig.mode === 'production' ? 'Produção (Ao Vivo)' : 'Sandbox (Testes)'}</span>
              </div>
            </div>
          </div>

          {/* Sub Tab: Subscriptions */}
          {financeSubTab === 'subscriptions' && (
            <div className="p-6 bg-[#161924] border border-zinc-700/80 rounded-3xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Contratos e Assinaturas de Lojistas</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {subscriptions.length} ativas
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">Planos comerciais recorrentes ativos no sistema.</p>
                </div>

                <button
                  onClick={() => setFinanceSubTab('payments')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#10121a] hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Ver Faturas & Transações ({payments.length})</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] font-black uppercase text-zinc-400 tracking-wider">
                      <th className="py-3 px-4">Supermercado / Cliente</th>
                      <th className="py-3 px-4">Plano Contratado</th>
                      <th className="py-3 px-4">Valor Mensal</th>
                      <th className="py-3 px-4">Próxima Cobrança</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400">
                          Nenhuma assinatura registrada ainda.
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#10121a]/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">
                              {sub.companyName || sub.userName || sub.clientName || 'Supermercado'}
                            </div>
                            <div className="text-zinc-400 text-[11px]">
                              {sub.email || sub.clientEmail || '-'} {sub.userName ? `• ${sub.userName}` : ''}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-200">
                            {sub.planName}
                          </td>
                          <td className="py-3.5 px-4 font-black text-emerald-400">
                            R$ {Number(sub.amount ?? sub.price ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </td>
                          <td className="py-3.5 px-4 text-zinc-300">
                            {(sub.currentPeriodEnd || sub.nextBillingDate) ? new Date(sub.currentPeriodEnd || sub.nextBillingDate!).toLocaleDateString('pt-BR') : 'Mensal Automático'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              sub.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : sub.status === 'past_due'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                              {sub.status === 'active' ? 'Ativa' : sub.status === 'past_due' ? 'Vencida' : 'Cancelada'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleToggleSubStatus(sub)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                                sub.status === 'active'
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 border border-emerald-500/30'
                              }`}
                            >
                              {sub.status === 'active' ? 'Cancelar' : 'Reativar'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Tab: Payments */}
          {financeSubTab === 'payments' && (
            <div className="p-6 bg-[#161924] border border-zinc-700/80 rounded-3xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Faturas & Transações de Pagamento (PIX)</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {payments.length} registradas
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">Histórico de compras de recargas de créditos e pagamentos de planos.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFinanceSubTab('subscriptions')}
                    className="px-3 py-1.5 rounded-xl bg-[#10121a] hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Ver Assinaturas ({subscriptions.length})</span>
                  </button>

                  <select
                    value={paymentStatusFilter}
                    onChange={(e: any) => setPaymentStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="approved">Aprovados</option>
                    <option value="pending">Pendentes</option>
                    <option value="refunded">Estornados</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] font-black uppercase text-zinc-400 tracking-wider">
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Item Comprado</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4">Valor</th>
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ação Super Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {payments
                      .filter(p => paymentStatusFilter === 'all' || p.status === paymentStatusFilter)
                      .map((pay) => (
                        <tr key={pay.id} className="hover:bg-[#10121a]/60 transition">
                          <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                            {pay.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">
                              {pay.companyName || pay.clientName || pay.userName || 'Supermercado'}
                            </div>
                            <div className="text-zinc-400 text-[11px]">
                              {pay.clientEmail || (pay as any).email || '-'} {pay.userName ? `• ${pay.userName}` : ''}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-zinc-200">{pay.itemName || pay.description}</span>
                            {(pay.creditsAdded || pay.creditsAmount) ? (
                              <div className="text-amber-400 text-[11px]">+{pay.creditsAdded || pay.creditsAmount} créditos</div>
                            ) : null}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-300 uppercase text-[11px]">
                            {(pay.method === 'pix' || pay.paymentMethod === 'pix') ? '⚡ PIX' : (pay.method === 'credit_card' || pay.paymentMethod === 'credit_card') ? '💳 Cartão' : '📄 Boleto'}
                          </td>
                          <td className="py-3.5 px-4 font-black text-white">
                            R$ {Number(pay.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                            {pay.createdAt ? new Date(pay.createdAt).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              pay.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : pay.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                              {pay.status === 'approved' ? 'Aprovado' : pay.status === 'pending' ? 'Pendente' : 'Estornado'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {pay.status === 'pending' && (
                              <button
                                onClick={() => handleConfirmPayment(pay.id)}
                                title="Confirmar pagamento e creditar lojista"
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-black text-xs transition cursor-pointer shadow-md inline-flex items-center gap-1.5"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>Confirmar PIX</span>
                              </button>
                            )}
                            {pay.status === 'approved' && (
                              <button
                                onClick={() => handleRefundPayment(pay.id)}
                                title="Estornar transação"
                                className="px-2.5 py-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs transition cursor-pointer"
                              >
                                Estornar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: GATEWAY DE PAGAMENTO */}
      {/* ===================================================================== */}
      {activeTab === 'gateway' && (
        <form onSubmit={handleSaveGateway} className="space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#161924] border border-zinc-700/80 rounded-3xl shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Checkout & Gateways</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Integração do Gateway de Pagamento
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Conecte seu Mercado Pago, Asaas, Stripe ou Chave PIX direta para processar vendas de planos e recargas.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingGateway}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{savingGateway ? 'Salvando Gateway...' : 'Salvar Configurações'}</span>
            </button>
          </div>

          {gatewayNotice && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{gatewayNotice}</span>
            </div>
          )}

          {/* Gateway Selector Cards */}
          <div className="p-6 bg-[#161924] border border-zinc-700/80 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-base font-black text-white">Escolha o Gateway Principal</h3>
            <p className="text-xs text-zinc-400">Selecione qual provedor processará os pagamentos de recargas e planos.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {[
                { id: 'mercadopago', title: 'Mercado Pago', desc: 'PIX Instantâneo, Cartão de Crédito e Boleto (Ideal para Brasil)', badge: 'Recomendado' },
                { id: 'asaas', title: 'Asaas', desc: 'Especialista em assinaturas recorrentes, PIX e emissão de NFe', badge: 'Recorrência' },
                { id: 'stripe', title: 'Stripe', desc: 'Cartões internacionais, assinaturas globais e máxima estabilidade', badge: 'Global' },
                { id: 'pix_manual', title: 'PIX Direto / Manual', desc: 'Receba na sua chave bancária com liberação manual de comprovante', badge: 'Zero Taxa' }
              ].map((prov) => {
                const isSelected = gatewayConfig.provider === prov.id;
                return (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setGatewayConfig({ ...gatewayConfig, provider: prov.id as any })}
                    className={`p-4 rounded-2xl text-left transition border cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 text-white shadow-lg shadow-orange-500/10'
                        : 'bg-[#10121a] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isSelected ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {prov.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                      </div>
                      <div className="font-black text-sm text-white">{prov.title}</div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{prov.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Environment Mode: Sandbox vs Production */}
          <div className="p-6 bg-[#161924] border border-zinc-700/80 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-base font-black text-white">Ambiente de Execução</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setGatewayConfig({ ...gatewayConfig, mode: 'sandbox' })}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  gatewayConfig.mode === 'sandbox'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#10121a] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-white">Modo Sandbox (Testes)</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Use credenciais de teste para simular pagamentos sem cobrança real.</div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  gatewayConfig.mode === 'sandbox' ? 'border-amber-400 bg-amber-400' : 'border-zinc-700'
                }`}>
                  {gatewayConfig.mode === 'sandbox' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                </div>
              </div>

              <div
                onClick={() => setGatewayConfig({ ...gatewayConfig, mode: 'production' })}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  gatewayConfig.mode === 'production'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-[#10121a] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-white">Modo Produção (Ao Vivo)</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Processamento real de transações financeiras e depósitos bancários.</div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  gatewayConfig.mode === 'production' ? 'border-emerald-400 bg-emerald-400' : 'border-zinc-700'
                }`}>
                  {gatewayConfig.mode === 'production' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                </div>
              </div>
            </div>
          </div>

          {/* Credential Inputs based on selected provider */}
          <div className="p-6 bg-[#161924] border border-zinc-700/80 rounded-3xl shadow-xl space-y-5">
            <h3 className="text-base font-black text-white">Credenciais da API</h3>

            {gatewayConfig.provider === 'mercadopago' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Mercado Pago Public Key ({gatewayConfig.mode})</label>
                  <input
                    type="text"
                    value={gatewayConfig.mercadoPagoPublicKey || ''}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, mercadoPagoPublicKey: e.target.value })}
                    placeholder={gatewayConfig.mode === 'sandbox' ? 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' : 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}
                    className="w-full px-4 py-3 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Mercado Pago Access Token ({gatewayConfig.mode})</label>
                  <input
                    type="password"
                    value={gatewayConfig.mercadoPagoAccessToken || ''}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, mercadoPagoAccessToken: e.target.value })}
                    placeholder={gatewayConfig.mode === 'sandbox' ? 'TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : 'APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                    className="w-full px-4 py-3 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {gatewayConfig.provider === 'asaas' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Asaas API Key ({gatewayConfig.mode})</label>
                  <input
                    type="password"
                    value={gatewayConfig.asaasApiKey || ''}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, asaasApiKey: e.target.value })}
                    placeholder="$aact_YTU5YTE0M2M6N2Zl..."
                    className="w-full px-4 py-3 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {gatewayConfig.provider === 'stripe' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Stripe Publishable Key ({gatewayConfig.mode})</label>
                  <input
                    type="text"
                    value={gatewayConfig.stripePublicKey || ''}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, stripePublicKey: e.target.value })}
                    placeholder={gatewayConfig.mode === 'sandbox' ? 'pk_test_...' : 'pk_live_...'}
                    className="w-full px-4 py-3 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Stripe Secret Key ({gatewayConfig.mode})</label>
                  <input
                    type="password"
                    value={gatewayConfig.stripeSecretKey || ''}
                    onChange={(e) => setGatewayConfig({ ...gatewayConfig, stripeSecretKey: e.target.value })}
                    placeholder={gatewayConfig.mode === 'sandbox' ? 'sk_test_...' : 'sk_live_...'}
                    className="w-full px-4 py-3 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {/* PIX Direto / Backup Chave PIX */}
            <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-zinc-300">Chave PIX da Empresa (Para recebimentos diretos)</label>
                <input
                  type="text"
                  value={gatewayConfig.pixKey || ''}
                  onChange={(e) => setGatewayConfig({ ...gatewayConfig, pixKey: e.target.value })}
                  placeholder="sua-chave-pix@email.com"
                  className="w-full px-4 py-3 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tipo da Chave</label>
                <select
                  value={gatewayConfig.pixKeyType || 'email'}
                  onChange={(e: any) => setGatewayConfig({ ...gatewayConfig, pixKeyType: e.target.value })}
                  className="w-full px-4 py-3 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="email">E-mail</option>
                  <option value="cnpj">CNPJ / CPF</option>
                  <option value="phone">Telefone Celular</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Webhook Configuration Card */}
          <div className="p-6 bg-[#161924] border border-zinc-700/80 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-orange-400" />
              <h3 className="text-base font-black text-white">Notificação Automática via Webhook</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Copie este endpoint e cole no painel do seu gateway (Mercado Pago / Asaas / Stripe). Quando o cliente pagar via PIX ou Cartão, o sistema receberá o aviso instantaneamente e liberará os créditos na conta do supermercado.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">URL do Webhook do SuperLocução</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/payment`}
                    className="flex-1 px-4 py-3 bg-[#10121a] border border-zinc-700/80 rounded-xl text-orange-400 font-mono text-xs select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhookUrl}
                    className="px-4 py-3 bg-[#10121a] hover:bg-zinc-800 border border-zinc-700/80 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWebhook ? 'Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Chave Secreta do Webhook (Webhook Secret)</label>
                <input
                  type="text"
                  value={gatewayConfig.webhookSecret || ''}
                  onChange={(e) => setGatewayConfig({ ...gatewayConfig, webhookSecret: e.target.value })}
                  placeholder="whsec_xxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: CONFIGURAÇÕES GLOBAIS & REGRAS COMERCIAIS */}
      {/* ===================================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-[#151822] rounded-3xl p-6 sm:p-8 border border-zinc-700/80 shadow-xl space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-xl font-black text-white">Parâmetros Gerais da Plataforma</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Defina as regras de consumo, bônus de novos lojistas e avisos em massa para todos os clientes.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Configurações salvas e aplicadas com sucesso para toda a plataforma!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Bônus de Cadastro Grátis (Créditos de Boas-Vindas)
              </label>
              <input
                type="number"
                min="0"
                value={newClientBonus}
                onChange={(e) => setNewClientBonus(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-700/80 bg-[#10121a] text-white text-sm focus:outline-none focus:border-orange-500 transition"
              />
              <p className="text-[11px] text-zinc-500">
                Padrão atual: <strong>50 créditos</strong> concedidos no primeiro cadastro.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Custo Base de Geração (1 a 5 Produtos)
              </label>
              <input
                type="number"
                min="1"
                value={costPerGeneration}
                onChange={(e) => setCostPerGeneration(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-700/80 bg-[#10121a] text-white text-sm focus:outline-none focus:border-orange-500 transition"
              />
              <p className="text-[11px] text-zinc-500">
                Regra ativa: <strong>10 créditos</strong> de 1 a 5 produtos (+2 por produto adicional).
              </p>
            </div>
          </div>

          {/* Configuração de Canais de Contato (WhatsApp & E-mail) */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-4">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Canais Oficiais de Atendimento & Contato</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Público / Lojistas
                </span>
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure o WhatsApp e o E-mail oficial utilizados no botão flutuante "Fale Conosco", no rodapé e no modal de atendimento comercial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  WhatsApp de Atendimento & Suporte
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    placeholder="Ex: 5596981248000 ou (96) 98124-8000"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-700/80 bg-[#10121a] text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Pode digitar com ou sem máscara. O sistema converte automaticamente para o link do WhatsApp.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  E-mail Oficial para Contato
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-orange-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Ex: contato@superlocucao.inforartes.com.br"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-700/80 bg-[#10121a] text-white text-sm focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  E-mail institucional exibido para envio de dúvidas e propostas de grandes redes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Aviso Global do Sistema (Exibido no topo do painel de todos os clientes)
            </label>
            <textarea
              rows={3}
              value={systemNotice}
              onChange={(e) => setSystemNotice(e.target.value)}
              placeholder="Ex: Estamos realizando melhorias de infraestrutura. Todas as rádios continuam no ar normalmente!"
              className="w-full p-4 rounded-2xl border border-zinc-700/80 bg-[#10121a] text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition resize-none placeholder-zinc-600"
            />
            <p className="text-[11px] text-zinc-500">
              Deixe em branco se não houver comunicados ou avisos de manutenção para exibir.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-zinc-800 flex-wrap gap-4">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-3 bg-[#1e2230] hover:bg-[#272d40] border border-zinc-700/80 text-zinc-300 hover:text-white rounded-2xl text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Baixar Backup Completo (JSON)</span>
            </button>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-orange-500/25 transition cursor-pointer"
            >
              {savingSettings ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CRIAR OU EDITAR CLIENTE */}
      {/* ===================================================================== */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161924] border border-zinc-700/80 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <span>{editingClient ? 'Editar Supermercado' : 'Novo Supermercado / Cliente'}</span>
              </h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Razão Social / Nome Fantasia *</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Ex: Supermercado Alvorada"
                    className="w-full px-3 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Nome do Responsável *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full px-3 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">E-mail Comercial *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="carlos@alvorada.com.br"
                    className="w-full px-3 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Cidade / UF</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="São Paulo - SP"
                    className="w-full px-3 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-orange-400" />
                    <span>Senha de Acesso *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Ex: alvorada123 ou 123456"
                    className="w-full px-3 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Plano de Assinatura</label>
                  <select
                    value={formPlan}
                    onChange={(e: any) => setFormPlan(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="gratuito">Degustação (50 créditos)</option>
                    <option value="pro_varejo">Pro Varejo (R$ 149/mês)</option>
                    <option value="redes_atacarejo">Redes Atacarejo (R$ 399/mês)</option>
                  </select>
                </div>
              </div>

              {!editingClient && (
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Saldo Inicial de Créditos</label>
                  <input
                    type="number"
                    min="0"
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Status da Conta</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="radio"
                      name="status"
                      checked={formStatus === 'ativo'}
                      onChange={() => setFormStatus('ativo')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span>Ativo (Acesso Liberado)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="radio"
                      name="status"
                      checked={formStatus === 'bloqueado'}
                      onChange={() => setFormStatus('bloqueado')}
                      className="text-red-500 focus:ring-red-500"
                    />
                    <span>Bloqueado</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Observações Internas (Super Admin)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Cliente fechou contrato semestral via WhatsApp."
                  className="w-full p-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2.5 bg-[#10121a] hover:bg-zinc-800 text-zinc-300 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingClient}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black rounded-xl transition cursor-pointer shadow-md"
                >
                  {submittingClient ? 'Salvando...' : editingClient ? 'Salvar Alterações' : 'Criar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: AJUSTAR CRÉDITOS */}
      {/* ===================================================================== */}
      {isCreditsModalOpen && selectedClientForCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161924] border border-zinc-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>Ajustar Créditos</span>
              </h3>
              <button
                onClick={() => setIsCreditsModalOpen(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#10121a] rounded-2xl border border-zinc-700/70 text-xs">
              <div className="text-zinc-400">Cliente Selecionado:</div>
              <div className="font-black text-white text-sm">
                {selectedClientForCredits.companyName || selectedClientForCredits.name}
              </div>
              <div className="text-amber-400 font-bold mt-1">
                Saldo atual: {selectedClientForCredits.creditsBalance} créditos
              </div>
            </div>

            <form onSubmit={handleApplyCredits} className="space-y-4 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCreditAction('add')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
                    creditAction === 'add'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                      : 'bg-[#10121a] text-zinc-400 border border-zinc-700'
                  }`}
                >
                  + Adicionar Créditos
                </button>
                <button
                  type="button"
                  onClick={() => setCreditAction('remove')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
                    creditAction === 'remove'
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                      : 'bg-[#10121a] text-zinc-400 border border-zinc-700'
                  }`}
                >
                  - Remover / Estornar
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Quantidade de Créditos</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white font-black text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Motivo da Movimentação</label>
                <input
                  type="text"
                  required
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="Ex: Bônus de fidelidade, recarga PIX manual..."
                  className="w-full px-3.5 py-2.5 bg-[#10121a] border border-zinc-700/80 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreditsModalOpen(false)}
                  className="px-4 py-2.5 bg-[#10121a] hover:bg-zinc-800 text-zinc-300 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingCredits || creditAmount <= 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black rounded-xl transition cursor-pointer shadow-md"
                >
                  {submittingCredits ? 'Aplicando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
