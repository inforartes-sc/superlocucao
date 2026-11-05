import React, { useState, useEffect } from 'react';
import {
  Volume2,
  X,
  User,
  Lock,
  Mail,
  Store,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Radio,
  Building2,
  Loader2,
} from 'lucide-react';
import { api, setActiveUserId } from '../services/api.ts';
import { User as UserType } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        setActiveUserId(res.user.id);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(name, email, companyName, password);
        setActiveUserId(res.user.id);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = async (demoId: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.loginDemo(demoId);
      setActiveUserId(res.user.id);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar conta de teste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#181b24] text-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-700/80 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-white tracking-tight">
                Super<span className="text-orange-500">Locução</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                Varejo IA
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {mode === 'login' ? 'Acesse seu painel comercial' : 'Crie sua conta e ganhe 50 créditos'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#12141c] p-1 rounded-xl mb-5 border border-zinc-700/60">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'login'
                ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Entrar na Minha Conta
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'register'
                ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Criar Conta Grátis
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/15 text-red-300 border border-red-500/30 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Seu Nome
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Carlos Mendes"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#12141c] border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Nome do Supermercado / Loja
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Supermercado Alvorada"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#12141c] border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              E-mail Profissional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contato@supermercado.com.br"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#12141c] border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#12141c] border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Você receberá <strong>50 créditos grátis</strong> para criar seus primeiros anúncios de áudio imediatamente.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-zinc-950 font-black rounded-xl text-sm shadow-xl shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar no Painel do Supermercado' : 'Cadastrar e Começar Grátis'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick Selector */}
        <div className="mt-5 pt-4 border-t border-zinc-800">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 text-center">
            Ou acesse direto com uma conta de teste:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectDemo('user-alvorada')}
              disabled={loading}
              className="p-2.5 bg-[#12141c] hover:bg-zinc-800/80 border border-zinc-700/80 hover:border-orange-500/40 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white transition text-left cursor-pointer flex flex-col"
            >
              <span className="font-bold text-white flex items-center gap-1">
                <span>🛒</span>
                <span className="truncate">Sp. Alvorada</span>
              </span>
              <span className="text-[10px] text-zinc-400">Carlos Mendes</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('user-atacado')}
              disabled={loading}
              className="p-2.5 bg-[#12141c] hover:bg-zinc-800/80 border border-zinc-700/80 hover:border-orange-500/40 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white transition text-left cursor-pointer flex flex-col"
            >
              <span className="font-bold text-white flex items-center gap-1">
                <span>📦</span>
                <span className="truncate">Atacadão Central</span>
              </span>
              <span className="text-[10px] text-zinc-400">Juliana Castro</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
