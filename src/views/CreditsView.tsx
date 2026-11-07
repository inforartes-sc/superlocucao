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
  Crown,
  Building2,
  Store,
  FileText,
  Printer,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, CreditTransaction, RechargePackage, CommercialPlan, PaymentTransaction, SubscriptionItem } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CreditsViewProps {
  user: UserProfile | null;
  onRefreshUser: () => void;
}

export const CreditsView: React.FC<CreditsViewProps> = ({ user, onRefreshUser }) => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [billingTab, setBillingTab] = useState<'plans' | 'packages' | 'invoices'>(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.sessionStorage.getItem('credits_initial_tab') : null;
      if (saved === 'invoices' || saved === 'packages' || saved === 'plans') {
        window.sessionStorage.removeItem('credits_initial_tab');
        return saved;
      }
    } catch {}
    return 'plans';
  });

  // Invoices & Subscription Management State
  const [invoices, setInvoices] = useState<PaymentTransaction[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionItem | null>(null);
  const [invoicesStats, setInvoicesStats] = useState<{ totalPaid: number; paidCount: number; pendingCount: number }>({
    totalPaid: 0,
    paidCount: 0,
    pendingCount: 0,
  });
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<PaymentTransaction | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<PaymentTransaction | null>(null);
  const [confirmingInvoicePayment, setConfirmingInvoicePayment] = useState(false);
  const [copiedInvoicePix, setCopiedInvoicePix] = useState(false);

  const [commercialPlans, setCommercialPlans] = useState<CommercialPlan[]>([
    {
      id: 'gratuito',
      name: 'Degustação (Grátis)',
      tag: 'Teste Inicial',
      subtitle: 'Perfeito para você experimentar a qualidade na prática na sua loja.',
      price: 0,
      billingPeriod: 'grátis',
      creditsAmount: 50,
      features: [
        '50 créditos de boas-vindas para testes',
        'Locuções de Ofertas comerciais narradas por IA',
        '1 Loja / 1 Computador',
        'Download imediato dos áudios em MP3',
        'Vinhetas e Sweepers: exclusivo planos Pro',
        'Avisos e Comunicados: exclusivo planos Pro',
        'Upload de áudios e músicas do PC: exclusivo Pro',
        'Transmissão simultânea em vários PCs: não incluso',
      ],
      ctaText: 'Plano Grátis',
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
        '1.500 créditos mensais renovados todo mês',
        '1 Loja / 1 Computador de Transmissão por vez',
        'Proteção inteligente contra transmissões simultâneas',
        'Vinhetas & Sweepers personalizadas 100% liberadas',
        'Avisos Informativos & Utilidade Pública liberados',
        'Upload de Áudios e Músicas MP3 do seu PC liberado',
        'Rádio Web ao Vivo com Auto-Ducking automático',
        'Suporte prioritário via WhatsApp',
      ],
      ctaText: 'Fazer Upgrade para Pro Varejo',
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
        '5.000 créditos mensais renovados todo mês',
        'Multi-Lojas: Múltiplas Lojas & Filiais Simultâneas',
        'Transmissão simultânea em vários computadores ao mesmo tempo',
        'Painel de Gestão de Filiais da Rede em tempo real',
        'Programação e campanhas independentes por filial',
        'Vinhetas, Avisos, Uploads e Recursos Pro 100% liberados',
        'Clonagem de voz personalizada da marca (sob demanda)',
        'Gerente de contas e atendimento VIP prioritário',
      ],
      ctaText: 'Fazer Upgrade para Redes & Atacarejo',
      badge: 'Potência Máxima',
      highlighted: false,
    },
  ]);

  const [packages, setPackages] = useState<RechargePackage[]>([
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

  // Checkout modal states
  const [selectedPkg, setSelectedPkg] = useState<RechargePackage | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<CommercialPlan | null>(null);
  const [checkoutData, setCheckoutData] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [isInitializingCheckout, setIsInitializingCheckout] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [successCreditsAdded, setSuccessCreditsAdded] = useState<number>(0);
  const [successPlanName, setSuccessPlanName] = useState<string>('');
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

  const loadInvoices = () => {
    setLoadingInvoices(true);
    api
      .getUserInvoices()
      .then((res) => {
        if (res && res.invoices) {
          setInvoices(res.invoices);
          setSubscription(res.subscription || null);
          if (res.stats) setInvoicesStats(res.stats);
        }
      })
      .catch(console.warn)
      .finally(() => setLoadingInvoices(false));
  };

  useEffect(() => {
    loadHistory();
    loadInvoices();

    api
      .getPublicSettings()
      .then((res) => {
        if (res.rechargePackages && res.rechargePackages.length > 0) {
          setPackages(res.rechargePackages);
        }
        if (res.commercialPlans && res.commercialPlans.length > 0) {
          setCommercialPlans(res.commercialPlans);
        }
      })
      .catch(console.warn);
  }, [user?.creditsBalance, user?.plan]);

  // Open Checkout for Recharge Package
  const handleOpenCheckout = async (pkg: RechargePackage) => {
    setSelectedPkg(pkg);
    setSelectedPlan(null);
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

  // Open Checkout for Plan Upgrade
  const handleOpenPlanCheckout = async (plan: CommercialPlan) => {
    if (plan.price === 0) return;
    setSelectedPlan(plan);
    setSelectedPkg(null);
    setPaymentSuccess(false);
    setSuccessCreditsAdded(0);
    setPaymentMethod('pix');
    setCopiedPix(false);
    setCopiedBoleto(false);
    setIsInitializingCheckout(true);

    try {
      const checkoutRes = await api.createCheckout({
        planId: plan.id,
        paymentMethod: 'pix',
      });
      setCheckoutData(checkoutRes);
    } catch (e: any) {
      console.error('Erro ao gerar checkout de plano:', e);
      alert(`Não foi possível iniciar o pagamento do plano: ${e.message}`);
      setSelectedPlan(null);
    } finally {
      setIsInitializingCheckout(false);
    }
  };

  // Switch payment method and update checkout
  const handleChangePaymentMethod = async (method: 'pix' | 'credit_card' | 'boleto') => {
    setPaymentMethod(method);
    if (!selectedPkg && !selectedPlan) return;
    try {
      const payload: any = { paymentMethod: method };
      if (selectedPlan) payload.planId = selectedPlan.id;
      if (selectedPkg) payload.packageId = selectedPkg.id;
      const checkoutRes = await api.createCheckout(payload);
      setCheckoutData(checkoutRes);
    } catch (e) {
      console.warn(e);
    }
  };

  // Confirm payment and credit user account / upgrade plan
  const handleConfirmPayment = async () => {
    if (!checkoutData?.transactionId) return;
    setIsConfirmingPayment(true);

    try {
      const res = await api.confirmCheckout(checkoutData.transactionId);
      const credits = res.creditsAdded || selectedPlan?.creditsAmount || selectedPkg?.credits || 0;
      setSuccessCreditsAdded(credits);
      setSuccessPlanName(selectedPlan?.name || '');
      setPaymentSuccess(true);
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 6000);

      // Refresh user balance and plan in parent view & navigation bar
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
    setSelectedPlan(null);
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
          De 1 a 5 produtos o consumo é de 10 créditos (a partir do 5º produto, +2 créditos por produto adicional). Adicione créditos avulsos com liberação instantânea via Pix ou Cartão.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Current Balance Banner */}
      <div className="bg-gradient-to-r from-[#142B4A] via-blue-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 shadow-xl relative overflow-hidden">
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

        {/* Current Plan Indicator & Switch Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Plano Atual da Sua Conta</span>
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">
              {user?.plan === 'redes_atacarejo'
                ? 'Redes & Atacarejo'
                : user?.plan === 'pro_varejo'
                ? 'Pro Varejo'
                : 'Degustação (Grátis)'}
            </h3>
            <span className="text-[11px] text-blue-200">
              {user?.plan === 'redes_atacarejo'
                ? 'Múltiplas lojas simultâneas • 5.000 créditos'
                : user?.plan === 'pro_varejo'
                ? '1 Computador • 1.500 créditos/mês'
                : '50 créditos de teste • Recursos básicos'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setBillingTab('plans')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alterar Plano / Upgrade</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector: Planos de Assinatura vs Recargas Avulsas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setBillingTab('plans')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
            billingTab === 'plans'
              ? 'bg-[#142B4A] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Planos de Assinatura Mensal</span>
        </button>

        <button
          type="button"
          onClick={() => setBillingTab('packages')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
            billingTab === 'packages'
              ? 'bg-[#142B4A] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Pacotes de Recarga Avulsa</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setBillingTab('invoices');
            loadInvoices();
          }}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
            billingTab === 'invoices'
              ? 'bg-[#142B4A] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-500" />
          <span>Minhas Faturas & Assinatura</span>
          {invoices.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              invoicesStats.pendingCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {invoicesStats.pendingCount > 0 ? `${invoicesStats.pendingCount} pendente` : invoices.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PLANOS DE ASSINATURA */}
      {billingTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span>Escolha ou Altere o Seu Plano de Assinatura</span>
              </h2>
              <p className="text-xs text-slate-500">
                O pagamento é processado via Pix ou Cartão. Os créditos mensais e recursos do novo plano são liberados no mesmo instante.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {commercialPlans.map((plan) => {
              const isCurrent =
                user?.plan === plan.id ||
                (user?.plan === 'gratuito' && (plan.id === 'gratuito' || plan.id === 'degustacao'));
              const isPro = plan.id === 'pro_varejo';
              const isHigh = isPro || plan.highlighted;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-6 flex flex-col justify-between relative transition hover:shadow-xl ${
                    isCurrent
                      ? 'border-2 border-slate-400 shadow-md ring-4 ring-slate-100'
                      : isHigh
                      ? 'border-2 border-orange-500 shadow-lg ring-4 ring-orange-500/10'
                      : 'border border-slate-200 shadow-sm'
                  }`}
                >
                  {/* Badge */}
                  {isCurrent ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                      Seu Plano Atual
                    </div>
                  ) : plan.badge ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                      {plan.badge}
                    </div>
                  ) : null}

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      {plan.tag || plan.name}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[36px]">
                      {plan.subtitle}
                    </p>

                    {/* Price Formatted */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">Grátis</span>
                      ) : (
                        <>
                          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                            R$ {Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{plan.billingPeriod || '/mês'}</span>
                        </>
                      )}
                    </div>

                    {/* Credits Included Pill */}
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold w-full justify-center">
                      <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500 shrink-0" />
                      <span>{plan.creditsAmount.toLocaleString('pt-BR')} créditos {plan.price === 0 ? 'iniciais' : '/mês'}</span>
                    </div>

                    {/* Detailed Features List */}
                    <div className="mt-5 space-y-2.5 text-xs">
                      {plan.features.map((feat, i) => {
                        const isBlocked = feat.startsWith('❌') || feat.includes('exclusivo') || feat.includes('não incluso');
                        const cleanFeat = feat.replace(/^✅\s*|^❌\s*/, '');

                        return (
                          <div key={i} className="flex items-start gap-2 leading-relaxed">
                            {isBlocked ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            <span className={isBlocked ? 'text-slate-400 line-through' : 'text-slate-700'}>
                              {cleanFeat}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Button Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {isCurrent ? (
                      <div className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs text-center border border-slate-200 cursor-default">
                        Plano Ativo no Momento
                      </div>
                    ) : plan.price === 0 ? (
                      <div className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs text-center">
                        Degustação Gratuita
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenPlanCheckout(plan)}
                        className={`w-full py-3.5 font-black rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                          isHigh
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 shadow-orange-500/25'
                            : 'bg-[#142B4A] hover:bg-[#1a3760] text-white'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Fazer Upgrade para {plan.name.replace(/\s*\(.*?\)/, '')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PACOTES DE RECARGA AVULSA */}
      {billingTab === 'packages' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pacotes de Recarga Imediata
              </h2>
              <p className="text-xs text-slate-500">
                Precisa de créditos adicionais sem alterar sua mensalidade? Escolha um pacote avulso e pague via Pix ou Cartão.
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
      )}

      {/* TAB 3: MINHAS FATURAS & ASSINATURA */}
      {billingTab === 'invoices' && (() => {
        const pendingRenewalInvoice = invoices.find(i => i.status === 'pending' && i.type === 'subscription');
        const daysToDueDate = pendingRenewalInvoice?.dueDate
          ? Math.ceil((new Date(pendingRenewalInvoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        return (
        <div className="space-y-6">
          {/* Alerta de Fatura Gerada (10 dias antes do vencimento) */}
          {pendingRenewalInvoice && (
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border-2 border-amber-500/50 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
                  <AlertTriangle className="w-6 h-6 text-zinc-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 border border-amber-500/30">
                      Fatura de Renovação Disponível
                    </span>
                    {daysToDueDate !== null && (
                      <span className="text-xs font-extrabold text-amber-800">
                        {daysToDueDate > 0 ? `Vence em ${daysToDueDate} ${daysToDueDate === 1 ? 'dia' : 'dias'}` : daysToDueDate === 0 ? 'Vence Hoje!' : 'Vencida'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    Sua fatura do plano {pendingRenewalInvoice.itemName || 'Mensal'} no valor de R$ {Number(pendingRenewalInvoice.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} já está gerada!
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {pendingRenewalInvoice.dueDate ? `Vencimento em ${new Date(pendingRenewalInvoice.dueDate).toLocaleDateString('pt-BR')}. ` : ''}
                    Efetue o pagamento via PIX para garantir a renovação automática e o crédito de +{(pendingRenewalInvoice.creditsAdded || pendingRenewalInvoice.creditsAmount || 1500).toLocaleString('pt-BR')} créditos.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoiceForPayment(pendingRenewalInvoice)}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-zinc-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 self-stretch sm:self-auto"
              >
                <QrCode className="w-4 h-4" />
                <span>Pagar Fatura com PIX</span>
              </button>
            </div>
          )}

          {/* Card: Assinatura Atual do Lojista */}
          <div className="bg-gradient-to-br from-[#142B4A] via-[#10223b] to-[#0a1628] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Sua Assinatura Atual
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">
                  {subscription?.planName || (user?.plan === 'redes_atacarejo' ? 'Redes & Atacarejo' : user?.plan === 'pro_varejo' ? 'Pro Varejo' : 'Degustação (Grátis)')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {user?.companyName ? `Assinatura vinculada ao ${user.companyName}` : 'Plano de locução e rádio web comercial'}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-3xl font-black text-white">
                  R$ {Number(subscription?.amount ?? (user?.plan === 'redes_atacarejo' ? 189.9 : user?.plan === 'pro_varejo' ? 89.9 : 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-slate-300 ml-1">/mês</span>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {subscription?.status === 'active' ? 'Assinatura Ativa' : user?.plan !== 'gratuito' ? 'Ativa' : 'Plano Gratuito'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
              <div>
                <span className="text-slate-400 block">Créditos por Renovação:</span>
                <span className="text-sm font-extrabold text-amber-400">
                  +{user?.plan === 'redes_atacarejo' ? '5.000' : user?.plan === 'pro_varejo' ? '1.500' : '50'} créditos/mês
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Próxima Renovação:</span>
                <span className="text-sm font-extrabold text-white">
                  {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR') : 'Renovação Mensal Automática'}
                </span>
              </div>
              <div className="sm:text-right flex items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBillingTab('plans')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs transition cursor-pointer"
                >
                  Alterar Plano / Upgrade
                </button>
              </div>
            </div>
          </div>

          {/* Cards de Métricas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Faturado & Pago</span>
              <div className="text-2xl font-black text-emerald-700">
                R$ {Number(invoicesStats.totalPaid || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400">{invoicesStats.paidCount} fatura(s) paga(s)</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">Faturas Pendentes</span>
              <div className={`text-2xl font-black ${invoicesStats.pendingCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {invoicesStats.pendingCount}
              </div>
              <span className="text-[11px] text-slate-400">
                {invoicesStats.pendingCount > 0 ? 'Aguardando pagamento PIX' : 'Em dia (nenhuma fatura pendente)'}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">Histórico de Faturas</span>
              <div className="text-2xl font-black text-slate-900">
                {invoices.length}
              </div>
              <span className="text-[11px] text-slate-400">Faturas emitidas registradas</span>
            </div>
          </div>

          {/* Tabela de Faturas */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Histórico de Faturas & Comprovantes</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {invoices.length} faturas
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Gerencie todas as faturas geradas, acompanhe comprovantes e pague pendências via PIX.
                </p>
              </div>

              <button
                type="button"
                onClick={loadInvoices}
                disabled={loadingInvoices}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer self-start sm:self-auto"
              >
                {loadingInvoices ? 'Atualizando...' : 'Atualizar Faturas'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Fatura</th>
                    <th className="py-3 px-4">Descrição / Plano</th>
                    <th className="py-3 px-4">Emissão</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Método</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Nenhuma fatura registrada ainda na sua conta.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => {
                      const isApproved = inv.status === 'approved';
                      const isPending = inv.status === 'pending';

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            #{inv.id.replace(/^pay-tx-/, '').replace(/^SUB-/, '')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">
                              {inv.itemName || inv.description}
                            </span>
                            {(inv.creditsAdded || inv.creditsAmount) ? (
                              <span className="text-[11px] font-bold text-emerald-600 block">
                                +{(inv.creditsAdded || inv.creditsAmount)?.toLocaleString('pt-BR')} créditos
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">
                            {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            {inv.dueDate ? (
                              <div>
                                <span className="font-bold text-slate-800">{new Date(inv.dueDate).toLocaleDateString('pt-BR')}</span>
                                {isPending && (() => {
                                  const diffDays = Math.ceil((new Date(inv.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                  if (diffDays > 0 && diffDays <= 10) {
                                    return <span className="block text-[10px] font-bold text-amber-600">Vence em {diffDays} {diffDays === 1 ? 'dia' : 'dias'}</span>;
                                  } else if (diffDays === 0) {
                                    return <span className="block text-[10px] font-extrabold text-red-600">Vence hoje!</span>;
                                  } else if (diffDays < 0) {
                                    return <span className="block text-[10px] font-extrabold text-red-600">Vencida</span>;
                                  }
                                  return null;
                                })()}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {(inv.method === 'pix' || inv.paymentMethod === 'pix') ? '⚡ PIX' : '💳 Cartão'}
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900">
                            R$ {Number(inv.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isApproved ? 'Paga' : isPending ? 'Pendente' : 'Cancelada'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForPayment(inv)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-zinc-950 rounded-xl font-black text-xs transition cursor-pointer shadow-md inline-flex items-center gap-1.5"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Pagar PIX</span>
                              </button>
                            )}

                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForReceipt(inv)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                                <span>Ver Recibo</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );
      })()}

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
      {(selectedPkg || selectedPlan) && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#142B4A] to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  {selectedPlan ? <Crown className="w-5 h-5 text-amber-400" /> : <CreditCard className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    {selectedPlan ? 'Upgrade de Plano de Assinatura' : 'Pagamento & Liberação de Créditos'}
                  </h3>
                  <p className="text-xs text-blue-200">
                    {selectedPlan
                      ? 'Após confirmação do pagamento, seu plano e créditos são atualizados na hora.'
                      : 'Após confirmação do pagamento, os créditos caem na sua conta imediatamente.'}
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
                    {selectedPlan ? <Sparkles className="w-10 h-10 stroke-[2.5]" /> : <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      {selectedPlan ? 'Upgrade Concluído com Sucesso!' : 'Pagamento Aprovado Instantaneamente'}
                    </span>
                    <h4 className="text-2xl font-black text-slate-900 mt-2">
                      {selectedPlan
                        ? `Parabéns! Você agora é ${successPlanName || selectedPlan.name}!`
                        : `+${successCreditsAdded.toLocaleString('pt-BR')} Créditos Adicionados!`}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {selectedPlan
                        ? `+${successCreditsAdded.toLocaleString('pt-BR')} créditos mensais foram adicionados e todos os recursos do plano já estão desbloqueados na sua conta.`
                        : 'Seu saldo foi atualizado com sucesso. Você já pode gerar dezenas de locuções de ofertas profissionais.'}
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
                    <span>Concluir & Aproveitar Recursos</span>
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
                  {/* Selected Item Banner (Plan or Package) */}
                  {selectedPlan ? (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-black text-orange-600">Upgrade de Plano</span>
                        <h4 className="text-base font-black text-slate-900">{selectedPlan.name}</h4>
                        <p className="text-xs text-slate-500">{selectedPlan.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-orange-600">
                          R$ {Number(selectedPlan.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          <span className="text-xs font-normal text-slate-500">{selectedPlan.billingPeriod || '/mês'}</span>
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                          <Zap className="w-3 h-3 fill-emerald-600" />
                          <span>+{selectedPlan.creditsAmount.toLocaleString('pt-BR')} créditos/mês</span>
                        </div>
                      </div>
                    </div>
                  ) : selectedPkg ? (
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
                  ) : null}

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
                              {selectedPlan
                                ? `Já Paguei via Pix — Ativar Plano ${selectedPlan.name} Agora`
                                : `Já Paguei via Pix — Liberar ${selectedPkg?.credits.toLocaleString('pt-BR') || ''} Créditos Agora`}
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
                              Pagar R$ {Number((selectedPlan?.price ?? selectedPkg?.price) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedPlan ? 'e Ativar Plano' : 'e Liberar Créditos'}
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

      {/* MODAL DE RECIBO / COMPROVANTE OFICIAL DA FATURA */}
      {selectedInvoiceForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Recibo */}
            <div className="px-6 py-5 bg-[#142B4A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-zinc-950 font-black">
                  <Receipt className="w-5 h-5 text-zinc-950" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Comprovante de Pagamento</h3>
                  <p className="text-xs text-slate-300">SuperLocução Varejo IA • Documento de Quitação</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForReceipt(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Recibo */}
            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
              {/* Badge de Confirmação */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-extrabold text-emerald-950 text-sm block">FATURA PAGA & LIQUIDADA</span>
                    <span className="text-[11px] text-emerald-700 block">Créditos liberados em conta imediatamente</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  #{selectedInvoiceForReceipt.id.replace(/^pay-tx-/, '').replace(/^SUB-/, '')}
                </span>
              </div>

              {/* Informações da Loja e Cliente */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Dados do Lojista
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supermercado:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInvoiceForReceipt.companyName || user?.companyName || 'Supermercado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Responsável:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInvoiceForReceipt.userName || user?.name || 'Lojista'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">E-mail:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInvoiceForReceipt.clientEmail || user?.email || '-'}
                  </span>
                </div>
              </div>

              {/* Informações do Item Comprado */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Discriminação do Serviço / Pacote
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInvoiceForReceipt.itemName || selectedInvoiceForReceipt.description}
                  </span>
                </div>
                {(selectedInvoiceForReceipt.creditsAdded || selectedInvoiceForReceipt.creditsAmount) ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Créditos Adicionados:</span>
                    <span className="font-extrabold text-emerald-600">
                      +{(selectedInvoiceForReceipt.creditsAdded || selectedInvoiceForReceipt.creditsAmount)?.toLocaleString('pt-BR')} créditos
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-slate-500">Forma de Pagamento:</span>
                  <span className="font-bold text-slate-900">
                    {(selectedInvoiceForReceipt.method === 'pix' || selectedInvoiceForReceipt.paymentMethod === 'pix') ? '⚡ PIX Instantâneo' : '💳 Cartão de Crédito'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Data e Hora:</span>
                  <span className="font-mono text-slate-700">
                    {selectedInvoiceForReceipt.paidAt
                      ? new Date(selectedInvoiceForReceipt.paidAt).toLocaleString('pt-BR')
                      : selectedInvoiceForReceipt.createdAt
                      ? new Date(selectedInvoiceForReceipt.createdAt).toLocaleString('pt-BR')
                      : '-'}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-black text-slate-900">VALOR TOTAL:</span>
                <span className="text-2xl font-black text-slate-900">
                  R$ {Number(selectedInvoiceForReceipt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Ações */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Imprimir Comprovante</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#1a3760] text-white text-xs font-bold transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGAMENTO PIX DA FATURA */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 bg-[#142B4A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-zinc-950 font-black shadow-md">
                  <QrCode className="w-5 h-5 text-zinc-950" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Pagar Fatura via PIX</h3>
                  <p className="text-xs text-slate-300">
                    Fatura #{selectedInvoiceForPayment.id.replace(/^pay-tx-/, '').replace(/^SUB-/, '')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-slate-700 text-xs">
              {/* Resumo do Pedido */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-600">Descrição:</span>
                  <span className="font-black text-slate-900">{selectedInvoiceForPayment.itemName || selectedInvoiceForPayment.description}</span>
                </div>
                {selectedInvoiceForPayment.dueDate && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Data de Vencimento:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {new Date(selectedInvoiceForPayment.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                {(selectedInvoiceForPayment.creditsAdded || selectedInvoiceForPayment.creditsAmount) ? (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Créditos Inclusos:</span>
                    <span className="font-extrabold text-amber-600">
                      +{(selectedInvoiceForPayment.creditsAdded || selectedInvoiceForPayment.creditsAmount)?.toLocaleString('pt-BR')} créditos/mês
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between items-center text-base pt-2 border-t border-slate-200">
                  <span className="font-black text-slate-800">Total a Pagar:</span>
                  <span className="font-black text-2xl text-emerald-600">
                    R$ {Number(selectedInvoiceForPayment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <img
                    src={selectedInvoiceForPayment.pixQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(selectedInvoiceForPayment.pixCopiaECola || '')}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <div className="text-center space-y-1">
                  <span className="font-bold text-slate-800 block text-xs">Abra o app do seu banco e escaneie o código QR</span>
                  <span className="text-[11px] text-slate-500 block">Renovação e liberação automática dos créditos após o pagamento</span>
                </div>
              </div>

              {/* Copia e Cola */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">
                  Ou pague pelo PIX Copia e Cola
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedInvoiceForPayment.pixCopiaECola || ''}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedInvoiceForPayment.pixCopiaECola) {
                        navigator.clipboard.writeText(selectedInvoiceForPayment.pixCopiaECola);
                        setCopiedInvoicePix(true);
                        setTimeout(() => setCopiedInvoicePix(false), 3000);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      copiedInvoicePix
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {copiedInvoicePix ? (
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

              {/* Botão de Confirmação */}
              <button
                type="button"
                onClick={async () => {
                  setConfirmingInvoicePayment(true);
                  try {
                    const res = await api.confirmCheckout(selectedInvoiceForPayment.id);
                    if (res && res.success) {
                      await loadInvoices();
                      onRefreshUser();
                      const paidInvoice: PaymentTransaction = {
                        ...selectedInvoiceForPayment,
                        status: 'approved',
                        paidAt: new Date().toISOString(),
                      };
                      setSelectedInvoiceForPayment(null);
                      setSelectedInvoiceForReceipt(paidInvoice);
                    } else {
                      alert('Não foi possível confirmar automaticamente. Caso já tenha pago, o sistema atualizará assim que o banco enviar o comprovante.');
                    }
                  } catch (err: any) {
                    alert(`Erro ao validar pagamento: ${err.message || 'Tente novamente.'}`);
                  } finally {
                    setConfirmingInvoicePayment(false);
                  }
                }}
                disabled={confirmingInvoicePayment}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                {confirmingInvoicePayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirmando pagamento no banco...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Já Efetuei o Pagamento (Confirmar Quitação)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
