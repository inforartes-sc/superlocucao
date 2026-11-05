import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, ShieldCheck, Users, Radio, Volume2, Zap, CheckCircle2, Server,
  Settings, AlertCircle, Eye, EyeOff, RefreshCw, Key, Sparkles, Check,
  Search, Filter, Plus, Edit2, Trash2, Coins, Building2, Mail, Phone,
  MapPin, Calendar, Clock, Lock, Unlock, ArrowUpRight, ArrowDownRight,
  TrendingUp, Award, UserCheck, UserX, BarChart3, ChevronRight, X,
  Play, Pause, LogIn, ExternalLink, Activity, Database, Cpu, HelpCircle,
  AlertTriangle, FileText, Download, Sliders, Layers
} from 'lucide-react';
import { api } from '../services/api.ts';
import { AdminMetrics, User } from '../types/index.ts';

interface ClientItem {
  id: string;
  name: string;
  email: string;
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
  const [pinError, setPinError] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'audios' | 'integrations' | 'settings'>('overview');
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
  const [formPlan, setFormPlan] = useState<'gratuito' | 'pro_varejo' | 'redes_atacarejo'>('pro_varejo');
  const [formStatus, setFormStatus] = useState<'ativo' | 'bloqueado'>('ativo');
  const [formCredits, setFormCredits] = useState<number>(50);
  const [formNotes, setFormNotes] = useState('');
  const [submittingClient, setSubmittingClient] = useState(false);

  // Form states - Credit adjustment
  const [creditAmount, setCreditAmount] = useState<number>(50);
  const [creditAction, setCreditAction] = useState<'add' | 'remove'>('add');
  const [creditReason, setCreditReason] = useState('Bônus promocional Super Admin');
  const [submittingCredits, setSubmittingCredits] = useState(false);

  // Settings
  const [systemNotice, setSystemNotice] = useState('');
  const [costPerGeneration, setCostPerGeneration] = useState<number>(5);
  const [newClientBonus, setNewClientBonus] = useState<number>(50);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const loadData = async () => {
    try {
      const [metricsRes, usersRes] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminUsers().catch(() => ({ users: [] }))
      ]);

      if (metricsRes) {
        setMetrics(metricsRes);
        setSystemNotice(metricsRes.settings?.systemAnnouncement || '');
        setCostPerGeneration(metricsRes.settings?.creditsPerGeneration ?? 5);
        setNewClientBonus(metricsRes.settings?.initialCredits ?? 50);
        setInputKey(metricsRes.elevenLabsApiKey || '');
        setInputGeminiKey(metricsRes.geminiApiKey || '');
      }

      if (usersRes && usersRes.users) {
        setClients(usersRes.users);
      }
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
    const cleanPin = adminPinInput.trim().toLowerCase();
    // Default master PINs: superadmin, admin2026, 2026, admin
    if (cleanPin === 'admin2026' || cleanPin === 'superadmin' || cleanPin === '2026' || cleanPin === 'admin' || cleanPin === '') {
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
    setFormPlan('pro_varejo');
    setFormStatus('ativo');
    setFormCredits(50);
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

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.updateAdminSettings({
        systemAnnouncement: systemNotice.trim(),
        creditsPerGeneration: Number(costPerGeneration) || 5,
        initialCredits: Number(newClientBonus) || 50,
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
              Digite a Senha Mestra ou Chave de Acesso para gerenciar clientes, servidores de IA e créditos.
            </p>
          </div>

          <form onSubmit={handleUnlockAdmin} className="space-y-4">
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Senha mestra (ex: admin2026)"
                className="w-full pl-10 pr-4 py-3 bg-[#11131a] border border-zinc-700/90 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Senha mestra incorreta. Tente novamente.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-2xl text-sm shadow-xl shadow-orange-500/25 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4 stroke-[2.5]" />
              <span>Desbloquear Console</span>
            </button>

            <button
              type="button"
              onClick={() => handleUnlockAdmin()}
              className="text-xs text-zinc-400 hover:text-orange-300 transition underline underline-offset-4 cursor-pointer"
            >
              Acesso Rápido de Administrador (1 Clique)
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
            title="Bloquear Painel Super Admin"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-[#1f2433] hover:bg-red-500/20 text-zinc-400 hover:text-red-300 border border-zinc-700/80 hover:border-red-500/40 rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bloquear</span>
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

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-[#1a1e2b]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visão Geral Executiva</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-[#1a1e2b]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Gestão de Supermercados ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'audios'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-[#1a1e2b]'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Auditoria de Áudios & Rádio</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'integrations'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-[#1a1e2b]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Motores de IA (Eleven & Gemini)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-[#1a1e2b]'
          }`}
        >
          <Settings className="w-4 h-4" />
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
      {/* TAB 3: AUDITORIA DE ÁUDIOS & RÁDIO WEB */}
      {/* ===================================================================== */}
      {activeTab === 'audios' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Radio Station Realtime Status */}
          <div className="bg-[#151822] rounded-3xl p-6 border border-zinc-700/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-black text-white text-lg">Central da Rádio Web em Loja</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ao Vivo
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                A Rádio Web com Deck Duplo sincroniza trilhas musicais e ofertas programadas nos supermercados.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-[#10121a] border border-zinc-700/80 px-4 py-2 rounded-2xl text-xs text-zinc-300">
                <span className="text-zinc-500">Fila de Spots:</span>{' '}
                <strong className="text-orange-400 font-black">{metrics?.radioStats?.queueCount || 0} ofertas</strong>
              </div>
              <div className="bg-[#10121a] border border-zinc-700/80 px-4 py-2 rounded-2xl text-xs text-zinc-300">
                <span className="text-zinc-500">Intervalo Padrão:</span>{' '}
                <strong className="text-white font-black">{metrics?.radioStats?.defaultIntervalSec || 45}s</strong>
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
                Regra ativa: <strong>5 créditos</strong> de 1 a 5 produtos (+1 por produto adicional).
              </p>
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
