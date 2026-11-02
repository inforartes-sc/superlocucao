import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, ArrowDownLeft, ArrowUpRight, PlusCircle, ShieldCheck } from 'lucide-react';
import { UserProfile, CreditTransaction } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CreditsViewProps {
  user: UserProfile | null;
  onRefreshUser: () => void;
}

export const CreditsView: React.FC<CreditsViewProps> = ({ user, onRefreshUser }) => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isRecharging, setIsRecharging] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getCreditsHistory().then((res) => {
      setTransactions(res.transactions);
    }).catch(console.warn);
  }, [user?.creditsBalance]);

  const handleRecharge = async (packageId: string, amount: number) => {
    setIsRecharging(true);
    try {
      const res = await api.rechargeCredits(packageId, amount);
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 4000);
      onRefreshUser();
    } catch (e: any) {
      alert(`Erro na recarga: ${e.message}`);
    } finally {
      setIsRecharging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Gestão de Créditos & Consumo</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
          Planos e Saldo de Créditos
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cada locução gerada consome 10 créditos. Faça recargas ou alterne seu plano mensal.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Current Balance Banner */}
      <div className="bg-gradient-to-r from-[#142B4A] to-blue-900 text-white rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 shadow-xl">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
            Saldo Atual Disponível
          </span>
          <div className="text-4xl sm:text-5xl font-extrabold mt-1 flex items-baseline gap-2">
            <span>{user?.creditsBalance ?? 0}</span>
            <span className="text-lg font-normal text-blue-300">créditos</span>
          </div>
          <p className="text-xs text-blue-200 mt-2">
            Equivalente a cerca de <strong>{Math.floor((user?.creditsBalance ?? 0) / 10)}</strong> locuções completas em MP3.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Créditos nunca expiram durante vigência da conta</span>
        </div>
      </div>

      {/* Credit Packages Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Pacotes de Recarga Imediata
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Pacote Básico</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">300 Créditos</h3>
              <p className="text-xs text-slate-500 mt-1">Aproximadamente 30 locuções comerciais</p>
              <div className="mt-4 text-3xl font-extrabold text-slate-900">R$ 29</div>
            </div>
            <button
              onClick={() => handleRecharge('pacote-basico', 300)}
              disabled={isRecharging}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Adicionar 300 Créditos
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-blue-600 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              Melhor Custo-Benefício
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-blue-600">Pacote Pro Varejo</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">1.000 Créditos</h3>
              <p className="text-xs text-slate-500 mt-1">Aproximadamente 100 locuções comerciais</p>
              <div className="mt-4 text-3xl font-extrabold text-slate-900">R$ 69</div>
            </div>
            <button
              onClick={() => handleRecharge('pacote-pro', 1000)}
              disabled={isRecharging}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Adicionar 1.000 Créditos
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Pacote Atacarejo</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">3.000 Créditos</h3>
              <p className="text-xs text-slate-500 mt-1">Aproximadamente 300 locuções comerciais</p>
              <div className="mt-4 text-3xl font-extrabold text-slate-900">R$ 149</div>
            </div>
            <button
              onClick={() => handleRecharge('pacote-atacado', 3000)}
              disabled={isRecharging}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Adicionar 3.000 Créditos
            </button>
          </div>
        </div>
      </div>

      {/* Credit Transactions Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Extrato Detalhado de Consumo</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Operação / Descrição</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4 text-right">Créditos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isDebit = tx.type === 'debit';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(tx.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isDebit
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isDebit ? 'Débito' : 'Crédito'}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        isDebit ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {isDebit ? `-${tx.amount}` : `+${tx.amount}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

