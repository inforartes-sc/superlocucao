import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Radio, Volume2, Zap, CheckCircle2, Server,
  Settings, AlertCircle, Eye, EyeOff, RefreshCw, Key, Sparkles, Check,
  Search, Filter, Plus, Edit2, Trash2, Coins, Building2, Mail, Phone,
  MapPin, Calendar, Clock, Lock, Unlock, ArrowUpRight, ArrowDownRight,
  TrendingUp, Award, UserCheck, UserX, BarChart3, ChevronRight, X
} from 'lucide-react';
import { api } from '../services/api.ts';

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
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'overview' | 'integrations' | 'settings'>('clients');
  const [metrics, setMetrics] = useState<any>(null);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'gratuito' | 'pro_varejo' | 'redes_atacarejo'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'bloqueado'>('all');

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
  const [formCredits, setFormCredits] = useState<number>(500);
  const [formNotes, setFormNotes] = useState('');
  const [submittingClient, setSubmittingClient] = useState(false);

  // Form states - Credit adjustment
  const [creditAmount, setCreditAmount] = useState<number>(100);
  const [creditAction, setCreditAction] = useState<'add' | 'remove'>('add');
  const [creditReason, setCreditReason] = useState('Recarga bônus promocional');
  const [submittingCredits, setSubmittingCredits] = useState(false);

  // Settings
  const [systemNotice, setSystemNotice] = useState('');
  const [costPerGeneration, setCostPerGeneration] = useState<number>(10);
  const [newClientBonus, setNewClientBonus] = useState<number>(500);
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
        setCostPerGeneration(metricsRes.settings?.creditsPerGeneration ?? 10);
        setNewClientBonus(metricsRes.settings?.initialCredits ?? 500);
        setInputKey(metricsRes.elevenLabsApiKey || '');
        setInputGeminiKey(metricsRes.geminiApiKey || '');
      }

      if (usersRes && usersRes.users) {
        setClients(usersRes.users);
      }
    } catch (e) {
      console.warn('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewClientModal = () => {
    setEditingClient(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormCity('');
    setFormPlan('pro_varejo');
    setFormStatus('ativo');
    setFormCredits(500);
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
    setCreditAmount(100);
    setCreditAction('add');
    setCreditReason('Bônus de fidelidade varejo');
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
        creditsPerGeneration: Number(costPerGeneration) || 10,
        initialCredits: Number(newClientBonus) || 500,
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mb-3"></div>
        <p className="font-medium text-slate-700">Carregando painel administrativo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold tracking-wide">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>PORTAL ADMINISTRATIVO ISOLADO</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Link exclusivo: <strong>{window.location.origin}/admin</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
            Gestão de Clientes & Plataforma
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Painel restrito para administração de lojistas, saldos de créditos e monitoramento de consumo de IA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <span>Ir para Área do Cliente</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={openNewClientModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente / Supermercado</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-200 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Clientes Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{activeClientsCount}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> {clients.length} lojistas cadastrados
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Campanhas Criadas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{metrics?.totalProjects || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Ofertas salvas na nuvem</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Locuções Geradas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{metrics?.totalAudiosGenerated || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Áudios comerciais mixados</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-200 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold">Créditos em Circulação</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-700">{totalCreditsInCirculation.toLocaleString('pt-BR')}</div>
          <div className="text-xs text-slate-500 mt-1">{metrics?.totalCreditsUsed || 0} créditos consumidos</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeTab === 'clients'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Gestão de Clientes ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeTab === 'integrations'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Integrações (ElevenLabs & Gemini)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações do Sistema</span>
        </button>
      </div>

      {/* TAB 1: CLIENTS MANAGEMENT */}
      {activeTab === 'clients' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filters Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar cliente por nome, supermercado, e-mail ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-purple-500 bg-slate-50/50"
              />
            </div>

            {/* Select Plan */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Plano:</span>
                <select
                  value={planFilter}
                  onChange={(e: any) => setPlanFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-purple-500 cursor-pointer"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="pro_varejo">Pro Varejo</option>
                  <option value="redes_atacarejo">Redes & Atacarejo</option>
                  <option value="gratuito">Gratuito / Degustação</option>
                </select>
              </div>

              {/* Select Status */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-purple-500 cursor-pointer"
                >
                  <option value="all">Todos os Status</option>
                  <option value="ativo">Apenas Ativos</option>
                  <option value="bloqueado">Apenas Bloqueados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Clientes & Lojistas Cadastrados
                </h3>
                <p className="text-xs text-slate-500">
                  Mostrando {filteredClients.length} de {clients.length} clientes
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">Cliente / Supermercado</th>
                    <th className="py-3.5 px-4">Contato</th>
                    <th className="py-3.5 px-4">Plano</th>
                    <th className="py-3.5 px-4">Saldo Créditos</th>
                    <th className="py-3.5 px-4">Campanhas / Áudios</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((client) => {
                    const isBlocked = client.status === 'bloqueado';
                    return (
                      <tr key={client.id} className="hover:bg-slate-50/70 transition">
                        {/* Company & Name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                              {(client.companyName || client.name).slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{client.companyName || 'Supermercado'}</span>
                                {client.city && (
                                  <span className="text-[11px] font-normal text-slate-400">
                                    • {client.city}
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-xs font-medium">
                                {client.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="text-slate-700 font-mono text-[11px] flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{client.email}</span>
                            </div>
                            {client.phone && (
                              <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{client.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            client.plan === 'redes_atacarejo'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : client.plan === 'pro_varejo'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {client.plan === 'redes_atacarejo' ? 'Redes & Atacarejo' : client.plan === 'pro_varejo' ? 'Pro Varejo' : 'Degustação'}
                          </span>
                        </td>

                        {/* Credits Balance */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-amber-700">
                              {client.creditsBalance}
                            </span>
                            <button
                              onClick={() => openCreditModal(client)}
                              title="Adicionar ou debitar créditos"
                              className="p-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                            >
                              <Coins className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {client.creditsUsed ? (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {client.creditsUsed} gastos
                            </div>
                          ) : null}
                        </td>

                        {/* Projects / Audios */}
                        <td className="py-4 px-4 text-slate-600">
                          <div className="font-semibold text-slate-800">
                            {client.projectsCount || 0} campanhas
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {client.audiosCount || 0} áudios gerados
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(client)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-1 mx-auto ${
                              isBlocked
                                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <Lock className="w-3 h-3" /> Bloqueado
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" /> Ativo
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditClientModal(client)}
                              title="Editar dados do cliente"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {client.id !== 'user-admin' && (
                              <button
                                onClick={() => handleDeleteClient(client)}
                                title="Excluir cliente"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Nenhum cliente encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-600" />
              <span>Motores de Inteligência Artificial & Voz</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Controle das chaves API dos provedores de síntese e geração de roteiros de supermercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gemini Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-sm text-slate-900">Google Gemini API (Geração de Texto)</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      metrics?.geminiConfigured
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {metrics?.geminiConfigured ? 'Conectado' : 'Chave Pendente'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Responsável pelo leitor de encartes, listas de compras e gerador automático de roteiros de varejo com conversão de unidades por extenso.
                </p>
              </div>

              {/* Gemini API Key Box */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Chave Gemini (AI Studio):</span>
                  {!isEditingGeminiKey && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                      >
                        {showGeminiKey ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> <span>Exibir</span>
                          </>
                        )}
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setIsEditingGeminiKey(true)}
                        className="text-purple-600 hover:text-purple-800 cursor-pointer"
                      >
                        Alterar
                      </button>
                    </div>
                  )}
                </div>

                {isEditingGeminiKey ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputGeminiKey}
                      onChange={(e) => setInputGeminiKey(e.target.value)}
                      placeholder="Cole sua chave AIzaSy..."
                      className="flex-1 text-xs font-mono px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGeminiKey}
                      disabled={savingGeminiKey}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      {savingGeminiKey ? 'Validando...' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputGeminiKey(metrics?.geminiApiKey || '');
                        setIsEditingGeminiKey(false);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="font-mono text-xs text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 truncate select-all">
                    {showGeminiKey
                      ? (metrics?.geminiApiKey || 'Nenhuma chave configurada')
                      : (metrics?.geminiApiKeyMasked || '••••••••••••••••••••••••••••••••')}
                  </div>
                )}
              </div>

              {/* Gemini Model Info */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Modelo ativo: <strong className="text-slate-800">{metrics?.geminiModel || 'gemini-2.5-flash (alta velocidade)'}</strong>
                </span>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Google AI Studio
                </span>
              </div>

              {geminiKeyNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{geminiKeyNotice}</span>
                </div>
              )}
            </div>

            {/* ElevenLabs Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-sm text-slate-900">ElevenLabs Oficial</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      metrics?.elevenLabsConfigured
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {metrics?.elevenLabsConfigured ? 'Chave Conectada' : 'Chave Pendente'}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Locução com vozes neurais brasileiras e locutores reais de varejo.
                </p>
              </div>

              {/* API Key Box */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Chave ElevenLabs:</span>
                  {!isEditingKey && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                      >
                        {showApiKey ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> <span>Exibir</span>
                          </>
                        )}
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setIsEditingKey(true)}
                        className="text-purple-600 hover:text-purple-800 cursor-pointer"
                      >
                        Alterar
                      </button>
                    </div>
                  )}
                </div>

                {isEditingKey ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder="Cole sua chave sk_..."
                      className="flex-1 text-xs font-mono px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-purple-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveElevenKey}
                      disabled={savingKey}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      {savingKey ? 'Validando...' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputKey(metrics?.elevenLabsApiKey || '');
                        setIsEditingKey(false);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="font-mono text-xs text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 truncate select-all">
                    {showApiKey
                      ? (metrics?.elevenLabsApiKey || 'Nenhuma chave configurada')
                      : (metrics?.elevenLabsApiKeyMasked || '••••••••••••••••••••••••••••••••')}
                  </div>
                )}
              </div>

              {/* Sync voices button */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Vozes em Português ativas: <strong>{metrics?.elevenLabsVoicesCount || 0} vozes</strong>
                </span>
                <button
                  type="button"
                  onClick={handleSyncVoices}
                  disabled={syncingVoices}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingVoices ? 'animate-spin' : ''}`} />
                  <span>{syncingVoices ? 'Sincronizando...' : 'Sincronizar Vozes'}</span>
                </button>
              </div>

              {keyNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{keyNotice}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span>Configurações Globais da Plataforma</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Defina avisos do sistema, custos padrão e políticas de créditos para todos os clientes.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Aviso do Sistema (Exibido no Topo do Estúdio para os Clientes)
              </label>
              <textarea
                value={systemNotice}
                onChange={(e) => setSystemNotice(e.target.value)}
                rows={3}
                placeholder="Ex: Novas vozes comerciais brasileiras adicionadas ao estúdio!"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-purple-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Custo por Locução Gerada
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={costPerGeneration}
                    onChange={(e) => setCostPerGeneration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 text-base font-extrabold text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-purple-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">créditos por áudio</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Débito automático ao gerar spot ou locução no estúdio.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Bônus de Cadastro Novo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    step="50"
                    value={newClientBonus}
                    onChange={(e) => setNewClientBonus(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-28 text-base font-extrabold text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-purple-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">créditos iniciais</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Saldo concedido para novos clientes testarem a plataforma.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
              >
                {savingSettings ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Configurações salvas com sucesso!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR OU EDITAR CLIENTE */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {editingClient ? 'Editar Cliente' : 'Novo Cliente / Supermercado'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingClient ? 'Atualize as informações cadastrais e plano' : 'Cadastre um novo estabelecimento para utilizar a plataforma'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do Estabelecimento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Supermercado Alvorada"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Campinas - SP"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Mendes"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (19) 99876-5432"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: contato@superalvorada.com.br"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plano
                  </label>
                  <select
                    value={formPlan}
                    onChange={(e: any) => setFormPlan(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-500 bg-white cursor-pointer"
                  >
                    <option value="pro_varejo">Pro Varejo</option>
                    <option value="redes_atacarejo">Redes & Atacarejo</option>
                    <option value="gratuito">Degustação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-500 bg-white cursor-pointer"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>

                {!editingClient && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Créditos Iniciais
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formCredits}
                      onChange={(e) => setFormCredits(Number(e.target.value))}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações / Notas Internas
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações sobre o cliente, rede de lojas, horários de anúncio..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingClient}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-sm cursor-pointer"
                >
                  {submittingClient ? 'Salvando...' : editingClient ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUSTAR CRÉDITOS */}
      {isCreditsModalOpen && selectedClientForCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Ajustar Saldo de Créditos
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">
                    {selectedClientForCredits.companyName || selectedClientForCredits.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreditsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-800 font-semibold">Saldo Atual:</span>
                <div className="text-xl font-extrabold text-amber-900">
                  {selectedClientForCredits.creditsBalance} créditos
                </div>
              </div>
              <Coins className="w-6 h-6 text-amber-600" />
            </div>

            <form onSubmit={handleApplyCredits} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreditAction('add')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    creditAction === 'add'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Adicionar (+)
                </button>
                <button
                  type="button"
                  onClick={() => setCreditAction('remove')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    creditAction === 'remove'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" /> Debitar (-)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantidade de Créditos
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full text-sm font-extrabold px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo / Descrição do Ajuste
                </label>
                <input
                  type="text"
                  required
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="Ex: Bônus de fidelidade, Recarga via Pix, etc."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreditsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingCredits}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-sm cursor-pointer"
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
