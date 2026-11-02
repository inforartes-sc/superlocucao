import React, { useState } from 'react';
import { Radio, X, User, Lock, Mail, Store, ArrowRight } from 'lucide-react';
import { api } from '../services/api.ts';
import { UserProfile } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(name, email, companyName);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = async (demoId: string) => {
    setLoading(true);
    try {
      const res = await api.switchDemo(demoId);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar conta demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#142B4A] to-blue-600 flex items-center justify-center text-white shadow-md">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-lg text-[#142B4A]">Locução Super IA</div>
            <div className="text-xs text-slate-500">Sistema de som comercial de ofertas</div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Fazer Login
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Seu Nome
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Carlos Mendes"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome do Estabelecimento
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Supermercado Alvorada"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              E-mail Profissional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@supermercado.com.br"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{mode === 'login' ? 'Entrar no Sistema' : 'Cadastrar e Ganhar 500 Créditos'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Fast Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Ou acesse diretamente com uma conta de teste:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectDemo('user-alvorada')}
              className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 transition text-left cursor-pointer"
            >
              🛒 Supermercado Alvorada
            </button>
            <button
              onClick={() => handleSelectDemo('user-atacado')}
              className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 transition text-left cursor-pointer"
            >
              📦 Atacadão Central
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
