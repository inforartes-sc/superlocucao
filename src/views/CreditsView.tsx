import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  CreditCard,
  QrCode,
  Receipt,
  X,
  Lock,
  Sparkles,
  Loader2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { UserProfile, CreditTransaction, RechargePackage } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CreditsViewProps {
  user: UserProfile | null;
  onRefreshUser: () => void;
}

export const CreditsView: React.FC<CreditsViewProps> = ({ user, onRefreshUser }) => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [packages, setPackages] = useState<RechargePackage[]>([
    {
      id: 'pacote-basico',
      name: 'Pacote Básico',
      credits: 300,
      price: 29.9,
      description: 'Aproximadamente 30 locuções comerciais',
      badge: '',
      highlighted: false,
    },
    {
      id: 'pacote-pro',
      name: 'Pacote Pro Varejo',
      credits: 1000,
      price: 69.9,
      description: 'Aproximadamente 100 locuções comerciais',
      badge: 'Melhor Custo-Benefício',
      highlighted: true,
    },
    {
      id: 'pacote-atacado',
      name: 'Pacote Atacarejo',
      credits: 3000,
      price: 147.9,
      description: 'Aproximadamente 300 locuções comerciais',
      badge: '',
      highlighted: false,
    },
  ]);

  // Checkout modal states
  const [selectedPkg, setSelectedPkg] = useState<RechargePackage | null>(null);
  const [checkoutData, setCheckoutData] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [isInitializingCheckout, setIsInitializingCheckout] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [successCreditsAdded, setSuccessCreditsAdded] = useState<number>(0);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedBoleto, setCopiedBoleto] = useState(false);

  // Credit card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Top banner success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadHistory = () => {
    api
      .getCreditsHistory()
      .then((res) => {
        setTransactions(res.transactions);
      })
      .catch(console.warn);
  };

  useEffect(() => {
    loadHistory();

    api
      .getPublicSettings()
      .then((res) => {
        if (res.rechargePackages && res.rechargePackages.length > 0) {
          setPackages(res.rechargePackages);
        }
      })
      .catch(console.warn);
  }, [user?.creditsBalance]);

  // Open Checkout Modal and initialize transaction with payment details
  const handleOpenCheckout = async (pkg: RechargePackage) => {
    setSelectedPkg(pkg);
    setPaymentSuccess(false);
    setSuccessCreditsAdded(0);
    setPaymentMethod('pix');
    setCopiedPix(false);
    setCopiedBoleto(false);
    setIsInitializingCheckout(true);

    try {
      const checkoutRes = await api.createCheckout({
        packageId: pkg.id,
        paymentMethod: 'pix',
      });
      setCheckoutData(checkoutRes);
    } catch (e: any) {
      console.error('Erro ao gerar checkout:', e);
      alert(`Não foi possível iniciar o checkout: ${e.message}`);
      setSelectedPkg(null);
    } finally {
      setIsInitializingCheckout(false);
    }
  };

  // Switch payment method and update checkout
  const handleChangePaymentMethod = async (method: 'pix' | 'credit_card' | 'boleto') => {
    setPaymentMethod(method);
    if (!selectedPkg) return;
    try {
      const checkoutRes = await api.createCheckout({
        packageId: selectedPkg.id,
        paymentMethod: method,
      });
      setCheckoutData(checkoutRes);
    } catch (e) {
      console.warn(e);
    }
  };

  // Confirm payment and credit user account
  const handleConfirmPayment = async () => {
    if (!checkoutData?.transactionId) return;
    setIsConfirmingPayment(true);

    try {
      const res = await api.confirmCheckout(checkoutData.transactionId);
      setSuccessCreditsAdded(res.creditsAdded || selectedPkg?.credits || 0);
      setPaymentSuccess(true);
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 6000);

      // Refresh user balance in parent view & navigation bar
      onRefreshUser();

      // Refresh transactions table
      loadHistory();
    } catch (e: any) {
      alert(`Erro ao confirmar pagamento: ${e.message}`);
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handleCopyPix = () => {
    if (checkoutData?.pixCopiaECola) {
      navigator.clipboard.writeText(checkoutData.pixCopiaECola);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const handleCopyBoleto = () => {
    if (checkoutData?.boletoCode) {
      navigator.clipboard.writeText(checkoutData.boletoCode);
      setCopiedBoleto(true);
      setTimeout(() => setCopiedBoleto(false), 2500);
    }
  };

  const handleCloseModal = () => {
    setSelectedPkg(null);
    setCheckoutData(null);
    setPaymentSuccess(false);
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
          De 1 a 5 produtos o consumo é de 5 créditos (a partir do 5º produto, +1 crédito por produto adicional). Adicione créditos avulsos com liberação instantânea via Pix ou Cartão.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
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
            Equivalente a cerca de <strong>{Math.floor((user?.creditsBalance ?? 0) / 5)}</strong> locuções completas de encartes de ofertas em áudio de estúdio.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Créditos nunca expiram durante vigência da conta</span>
        </div>
      </div>

      {/* Credit Packages Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pacotes de Recarga Imediata
            </h2>
            <p className="text-xs text-slate-500">
              Escolha um pacote e realize o pagamento via Pix ou Cartão para liberar os créditos na mesma hora.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isHigh = pkg.highlighted || Boolean(pkg.badge);
            const formattedPrice = Number(pkg.price || 0).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 flex flex-col justify-between relative transition hover:shadow-lg ${
                  isHigh ? 'border-2 border-blue-600 shadow-md ring-4 ring-blue-500/10' : 'border border-slate-200 shadow-sm'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-sm">
                    {pkg.badge}
                  </div>
                )}
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isHigh ? 'text-blue-600' : 'text-slate-400'}`}>
                    {pkg.name}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {pkg.credits.toLocaleString('pt-BR')} Créditos
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>
                  
                  {/* Price Formatted with 2 decimals */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      R$ {formattedPrice}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">pagamento único</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenCheckout(pkg)}
                  className={`mt-6 w-full py-3.5 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                    isHigh
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40'
                      : 'bg-[#142B4A] hover:bg-[#1a3760] text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>Adicionar {pkg.credits.toLocaleString('pt-BR')} Créditos</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit Transactions Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Extrato Detalhado de Consumo</h3>
            <p className="text-xs text-slate-500">Histórico de recargas pagas e deduções de locuções geradas.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {transactions.length} registros
          </span>
        </div>

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
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Nenhuma movimentação de créditos registrada ainda.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isDebit = tx.type === 'debit';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition">
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
                        className={`py-3 px-4 text-right font-extrabold ${
                          isDebit ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isDebit ? `-${tx.amount}` : `+${tx.amount}`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECKOUT & PAYMENT MODAL */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#142B4A] to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    Pagamento & Liberação de Créditos
                  </h3>
                  <p className="text-xs text-blue-200">
                    Após confirmação do pagamento, os créditos caem na sua conta imediatamente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5">
              {paymentSuccess ? (
                /* SUCCESS STATE */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Pagamento Aprovado Instantaneamente
                    </span>
                    <h4 className="text-2xl font-black text-slate-900 mt-2">
                      +{successCreditsAdded.toLocaleString('pt-BR')} Créditos Adicionados!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Seu saldo foi atualizado com sucesso. Você já pode gerar dezenas de locuções de ofertas profissionais.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-xs mx-auto text-left space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Novo Saldo Total</div>
                    <div className="text-2xl font-extrabold text-blue-900">
                      {(user?.creditsBalance ?? 0) + successCreditsAdded} créditos
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                  >
                    <span>Concluir & Criar Minhas Locuções</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : isInitializingCheckout ? (
                /* LOADING STATE */
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Preparando checkout de pagamento seguro...</p>
                  <p className="text-xs text-slate-400">Conectando ao gateway e gerando QR Code Pix...</p>
                </div>
              ) : (
                /* CHECKOUT FORM */
                <>
                  {/* Selected Package Banner */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Pacote Selecionado</span>
                      <h4 className="text-sm font-bold text-slate-900">{selectedPkg.name}</h4>
                      <p className="text-xs text-slate-500">{selectedPkg.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-blue-900">
                        R$ {Number(selectedPkg.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Zap className="w-3 h-3 fill-emerald-600" />
                        <span>+{selectedPkg.credits.toLocaleString('pt-BR')} créditos</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      Escolha a Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleChangePaymentMethod('pix')}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          paymentMethod === 'pix'
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <QrCode className={`w-4 h-4 ${paymentMethod === 'pix' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Imediato
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">PIX</span>
                        <span className="text-[10px] text-slate-500">QR Code / Copia e Cola</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChangePaymentMethod('credit_card')}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          paymentMethod === 'credit_card'
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <CreditCard className={`w-4 h-4 ${paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            1x sem juros
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">Cartão</span>
                        <span className="text-[10px] text-slate-500">Crédito à vista</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChangePaymentMethod('boleto')}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          paymentMethod === 'boleto'
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Receipt className={`w-4 h-4 ${paymentMethod === 'boleto' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Bancário
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">Boleto</span>
                        <span className="text-[10px] text-slate-500">Compensação bancária</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: PIX PAYMENT */}
                  {paymentMethod === 'pix' && (
                    <div className="space-y-4 pt-1">
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center space-y-3">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Liberação em menos de 10 segundos</span>
                        </div>

                        {/* QR CODE */}
                        {checkoutData?.pixQrCodeUrl ? (
                          <div className="relative inline-block mx-auto p-2 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                            <img
                              src={checkoutData.pixQrCodeUrl}
                              alt="QR Code Pix"
                              className="w-44 h-44 object-contain rounded-xl mx-auto"
                            />
                          </div>
                        ) : (
                          <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-400 text-xs">
                            Gerando QR Code...
                          </div>
                        )}

                        <p className="text-xs text-slate-600">
                          Aponte a câmera do aplicativo do seu banco para o QR Code acima ou use a chave Copia e Cola.
                        </p>
                      </div>

                      {/* Pix Copia e Cola */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                          Código Pix Copia e Cola
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={checkoutData?.pixCopiaECola || '00020126580014BR.GOV.BCB.PIX...'}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              copiedPix
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            {copiedPix ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isConfirmingPayment}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                      >
                        {isConfirmingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirmando pagamento e liberando créditos...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Já Paguei via Pix — Liberar {selectedPkg.credits.toLocaleString('pt-BR')} Créditos Agora
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* TAB 2: CARTÃO DE CRÉDITO */}
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                          Número do Cartão
                        </label>
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                          Nome Impresso no Cartão
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Ex: CARLOS ALBERTO SILVA"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                            Validade
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/AA"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                            Código CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="123"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ambiente 100% Criptografado & Seguro (SSL 256-bit)</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isConfirmingPayment}
                        className="w-full mt-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                      >
                        {isConfirmingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processando pagamento com o banco...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>
                              Pagar R$ {Number(selectedPkg.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} e Liberar Créditos
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* TAB 3: BOLETO BANCÁRIO */}
                  {paymentMethod === 'boleto' && (
                    <div className="space-y-4 pt-1">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>Vencimento em 3 dias úteis</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Copie o código de barras abaixo ou utilize o número da linha digitável no aplicativo do seu banco ou internet banking.
                        </p>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                          Linha Digitável do Boleto
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={checkoutData?.boletoCode || '34191.79001 01043.510047 91020.150008 4 9876000000'}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopyBoleto}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              copiedBoleto
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            {copiedBoleto ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isConfirmingPayment}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
                      >
                        {isConfirmingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirmando pagamento do boleto...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Confirmar Pagamento do Boleto & Liberar Créditos
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
