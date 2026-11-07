import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Zap,
  Sparkles,
  QrCode,
  CreditCard,
  Receipt,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Crown,
  Lock,
  Loader2,
  Building2,
  Store,
  Radio,
  Radio as RadioIcon,
} from 'lucide-react';
import { CommercialPlan, UserProfile } from '../types';
import { api } from '../services/api';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onPlanUpgraded: (newPlan: string, creditsAdded: number) => void;
  preSelectedPlanId?: string;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  onPlanUpgraded,
  preSelectedPlanId,
}) => {
  const [plans, setPlans] = useState<CommercialPlan[]>([
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

  // Checkout states
  const [selectedPlan, setSelectedPlan] = useState<CommercialPlan | null>(null);
  const [step, setStep] = useState<'select' | 'checkout' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [checkoutData, setCheckoutData] = useState<any | null>(null);
  const [isInitializingCheckout, setIsInitializingCheckout] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [successCreditsAdded, setSuccessCreditsAdded] = useState(0);
  const [successPlanName, setSuccessPlanName] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedBoleto, setCopiedBoleto] = useState(false);

  // Credit card form dummy states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getPublicSettings().then((res) => {
        if (res.commercialPlans && res.commercialPlans.length > 0) {
          setPlans(res.commercialPlans);
        }
      }).catch(console.warn);

      if (preSelectedPlanId) {
        const found = plans.find(
          (p) => p.id === preSelectedPlanId || (preSelectedPlanId === 'degustacao' && p.id === 'gratuito')
        );
        if (found && found.price > 0) {
          handleSelectPlan(found);
          return;
        }
      }
      setStep('select');
      setSelectedPlan(null);
      setCheckoutData(null);
    }
  }, [isOpen, preSelectedPlanId]);

  if (!isOpen) return null;

  const currentPlanId = user?.plan || 'gratuito';

  const handleSelectPlan = async (plan: CommercialPlan) => {
    if (plan.price === 0) return; // Free plan
    setSelectedPlan(plan);
    setPaymentMethod('pix');
    setCopiedPix(false);
    setCopiedBoleto(false);
    setIsInitializingCheckout(true);
    setStep('checkout');

    try {
      const res = await api.createCheckout({
        planId: plan.id,
        paymentMethod: 'mercadopago',
      });
      if (res && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setCheckoutData(res);
    } catch (err: any) {
      console.error('Erro ao iniciar checkout de plano:', err);
      alert(`Não foi possível iniciar o pagamento do plano: ${err.message}`);
      setStep('select');
      setSelectedPlan(null);
    } finally {
      setIsInitializingCheckout(false);
    }
  };

  const handleChangePaymentMethod = async (method: 'pix' | 'credit_card' | 'boleto') => {
    setPaymentMethod(method);
    if (!selectedPlan) return;
    try {
      const res = await api.createCheckout({
        planId: selectedPlan.id,
        paymentMethod: method,
      });
      setCheckoutData(res);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleConfirmPayment = async () => {
    if (!checkoutData?.transactionId) return;
    setIsConfirmingPayment(true);

    try {
      const res = await api.confirmCheckout(checkoutData.transactionId);
      const credits = res.creditsAdded || selectedPlan?.creditsAmount || 0;
      const planName = selectedPlan?.name || (res.plan === 'redes_atacarejo' ? 'Redes & Atacarejo' : 'Pro Varejo');

      setSuccessCreditsAdded(credits);
      setSuccessPlanName(planName);
      setStep('success');

      // Notify parent to refresh user profile & balance
      onPlanUpgraded(res.plan || selectedPlan?.id || 'pro_varejo', credits);
    } catch (err: any) {
      alert(`Erro ao confirmar pagamento: ${err.message}`);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#10131d] border border-zinc-800 rounded-3xl max-w-5xl w-full text-white shadow-2xl overflow-hidden my-auto relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: SELECT PLAN */}
        {step === 'select' && (
          <div className="p-5 sm:p-8 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                <span>Planos de Assinatura SuperLocução IA</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Escolha o Plano Ideal para a Sua Loja
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Faça upgrade instantâneo para desbloquear vinhetas automáticas, comunicados de rádio, uploads do seu computador e transmissão em múltiplas lojas.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {plans.map((p) => {
                const isCurrent =
                  user?.plan === p.id ||
                  (user?.plan === 'gratuito' && (p.id === 'gratuito' || p.id === 'degustacao'));
                const isPro = p.id === 'pro_varejo';
                const isRedes = p.id === 'redes_atacarejo';
                const isHigh = isPro || p.highlighted;

                return (
                  <div
                    key={p.id}
                    className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition relative ${
                      isCurrent
                        ? 'bg-zinc-900/90 border-2 border-zinc-600 shadow-md'
                        : isHigh
                        ? 'bg-gradient-to-b from-orange-950/40 via-zinc-900 to-zinc-900 border-2 border-orange-500 shadow-xl shadow-orange-950/30 ring-4 ring-orange-500/10'
                        : 'bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 shadow-sm'
                    }`}
                  >
                    {/* Badge */}
                    {isCurrent ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-zinc-700 text-zinc-200 text-[10px] font-black uppercase tracking-wider rounded-full shadow">
                        Seu Plano Atual
                      </div>
                    ) : p.badge ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                        {p.badge}
                      </div>
                    ) : null}

                    <div>
                      {/* Tag / Category */}
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-400">
                        {p.tag || p.name}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-white mt-1">
                        {p.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed min-h-[36px]">
                        {p.subtitle}
                      </p>

                      {/* Price Section */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/80">
                        <div className="flex items-baseline gap-1">
                          {p.price === 0 ? (
                            <span className="text-3xl font-black text-white">Grátis</span>
                          ) : (
                            <>
                              <span className="text-xs font-semibold text-zinc-400">R$</span>
                              <span className="text-3xl sm:text-4xl font-black text-white">
                                {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-zinc-400 font-medium">{p.billingPeriod || '/mês'}</span>
                            </>
                          )}
                        </div>
                        {p.price > 0 && (
                          <p className="text-xs text-orange-400 font-bold mt-1 tracking-wide">
                            Apenas R$ {(Number(p.price) / 30).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por dia
                          </p>
                        )}
                      </div>

                      {/* Credits Highlight Pill */}
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-bold w-full justify-center">
                        <Zap className="w-3.5 h-3.5 fill-orange-400 text-orange-400 shrink-0" />
                        <span>{p.creditsAmount.toLocaleString('pt-BR')} créditos {p.price === 0 ? 'de teste' : '/mês'}</span>
                      </div>

                      {/* Features List */}
                      <div className="mt-5 space-y-2.5 text-xs">
                        {p.features.map((feat, i) => {
                          const isBlocked = feat.startsWith('❌') || feat.includes('exclusivo') || feat.includes('não incluso');
                          const cleanFeat = feat.replace(/^✅\s*|^❌\s*/, '');

                          return (
                            <div key={i} className="flex items-start gap-2 leading-relaxed">
                              {isBlocked ? (
                                <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              <span className={isBlocked ? 'text-zinc-500 line-through decoration-zinc-600' : 'text-zinc-200'}>
                                {cleanFeat}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-3 border-t border-zinc-800">
                      {isCurrent ? (
                        <div className="w-full py-3 rounded-xl bg-zinc-800/80 text-zinc-400 font-bold text-xs text-center border border-zinc-700/60 cursor-default">
                          Plano Ativo no Momento
                        </div>
                      ) : p.price === 0 ? (
                        <div className="w-full py-3 rounded-xl bg-zinc-800/60 text-zinc-500 font-bold text-xs text-center">
                          Degustação Gratuita
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectPlan(p)}
                          className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                            isHigh
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 shadow-orange-500/25'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                          }`}
                        >
                          <Zap className="w-4 h-4 fill-current" />
                          <span>Fazer Upgrade para {p.name.replace(/\s*\(.*?\)/, '')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom guarantee */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-zinc-400 border-t border-zinc-800/60">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Liberação imediata e automática após o pagamento</span>
              </span>
              <span>•</span>
              <span>Cancele ou altere seu plano quando quiser sem multas</span>
              <span>•</span>
              <span>Suporte técnico via WhatsApp incluso</span>
            </div>
          </div>
        )}

        {/* STEP 2: CHECKOUT MODAL */}
        {step === 'checkout' && selectedPlan && (
          <div className="p-5 sm:p-8 space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                ← Voltar e escolher outro plano
              </button>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Etapa 2 de 2: Pagamento Seguro
              </span>
            </div>

            {isInitializingCheckout ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
                <h4 className="text-base font-bold text-white">Preparando checkout de pagamento seguro...</h4>
                <p className="text-xs text-zinc-400">Conectando ao gateway e gerando QR Code Pix...</p>
              </div>
            ) : (
              <>
                {/* Selected Plan Summary Card */}
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 rounded-2xl p-4 border border-orange-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-orange-400">Plano Selecionado</span>
                    <h4 className="text-base sm:text-lg font-black text-white">{selectedPlan.name}</h4>
                    <p className="text-xs text-zinc-400">{selectedPlan.subtitle}</p>
                  </div>
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <div className="text-2xl font-black text-orange-400">
                      R$ {Number(selectedPlan.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <span className="text-xs font-normal text-zinc-400">{selectedPlan.billingPeriod || '/mês'}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
                      <Zap className="w-3 h-3 fill-emerald-400" />
                      <span>+{selectedPlan.creditsAmount.toLocaleString('pt-BR')} créditos/mês</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector Tabs */}
                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleChangePaymentMethod('pix')}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'pix'
                          ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <QrCode className={`w-4 h-4 ${paymentMethod === 'pix' ? 'text-orange-400' : 'text-zinc-500'}`} />
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          Imediato
                        </span>
                      </div>
                      <span className="text-xs font-black text-white">PIX</span>
                      <span className="text-[10px] text-zinc-400">QR Code Instantâneo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangePaymentMethod('credit_card')}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'credit_card'
                          ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <CreditCard className={`w-4 h-4 ${paymentMethod === 'credit_card' ? 'text-orange-400' : 'text-zinc-500'}`} />
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          Cartão
                        </span>
                      </div>
                      <span className="text-xs font-black text-white">Cartão de Crédito</span>
                      <span className="text-[10px] text-zinc-400">Aprovação imediata</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangePaymentMethod('boleto')}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'boleto'
                          ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Receipt className={`w-4 h-4 ${paymentMethod === 'boleto' ? 'text-orange-400' : 'text-zinc-500'}`} />
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          Bancário
                        </span>
                      </div>
                      <span className="text-xs font-black text-white">Boleto</span>
                      <span className="text-[10px] text-zinc-400">Compensação bancária</span>
                    </button>
                  </div>
                </div>

                {/* PIX TAB */}
                {paymentMethod === 'pix' && (
                  <div className="space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center space-y-3">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Liberação automática em menos de 10 segundos</span>
                      </div>

                      {/* QR CODE */}
                      {checkoutData?.pixQrCodeUrl ? (
                        <div className="relative inline-block mx-auto p-2 bg-white rounded-2xl border-2 border-zinc-700 shadow-lg">
                          <img
                            src={checkoutData.pixQrCodeUrl}
                            alt="QR Code Pix"
                            className="w-40 h-40 object-contain rounded-xl mx-auto"
                          />
                        </div>
                      ) : (
                        <div className="w-40 h-40 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto text-zinc-500 text-xs">
                          Gerando QR Code...
                        </div>
                      )}

                      <p className="text-xs text-zinc-300">
                        Aponte a câmera do app do seu banco para o QR Code acima ou use a chave Copia e Cola abaixo:
                      </p>

                      {/* Pix Copia e Cola Input with Button */}
                      {checkoutData?.pixCopiaECola && (
                        <div className="flex items-center gap-2 max-w-lg mx-auto">
                          <input
                            type="text"
                            readOnly
                            value={checkoutData.pixCopiaECola}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-mono select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              copiedPix
                                ? 'bg-emerald-500 text-zinc-950'
                                : 'bg-orange-500 hover:bg-orange-400 text-zinc-950'
                            }`}
                          >
                            {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedPix ? 'Copiado!' : 'Copiar Pix'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CREDIT CARD TAB */}
                {paymentMethod === 'credit_card' && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Transação criptografada de ponta a ponta</span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Nome Impresso no Cartão</label>
                      <input
                        type="text"
                        placeholder="Nome como consta no cartão"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Validade</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* BOLETO TAB */}
                {paymentMethod === 'boleto' && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 text-center space-y-3">
                    <Receipt className="w-10 h-10 text-orange-400 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Linha Digitável do Boleto</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Pague no seu banco ou lotérica. A compensação ocorre em até 1 dia útil.
                      </p>
                    </div>

                    {checkoutData?.boletoCode && (
                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-2 max-w-lg mx-auto">
                        <span className="font-mono text-xs text-zinc-300 break-all">{checkoutData.boletoCode}</span>
                        <button
                          type="button"
                          onClick={handleCopyBoleto}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 rounded-lg text-xs font-black shrink-0 transition cursor-pointer"
                        >
                          {copiedBoleto ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm Payment Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={isConfirmingPayment}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-2xl text-sm transition cursor-pointer shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {isConfirmingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Verificando e Ativando Plano...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>
                          {paymentMethod === 'pix'
                            ? 'Já realizei o Pix / Ativar Meu Plano Agora'
                            : 'Confirmar Pagamento e Ativar Plano'}
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-zinc-500 mt-2">
                    Após confirmação, todos os recursos do plano são liberados imediatamente na sua conta.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3: SUCCESS CELEBRATION */}
        {step === 'success' && (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Upgrade Concluído com Sucesso!
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Parabéns! Você agora é {successPlanName}!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                O pagamento foi identificado e o seu plano foi atualizado no sistema. Todos os recursos já estão desbloqueados para você usar!
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm mx-auto text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Novo Plano Ativo:</span>
                <span className="font-bold text-orange-400 uppercase">{successPlanName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Créditos Liberados:</span>
                <span className="font-bold text-emerald-400">+{successCreditsAdded.toLocaleString('pt-BR')} créditos</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
                <span className="text-zinc-400">Status dos Recursos:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  100% Liberados
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-xl text-sm transition cursor-pointer shadow-lg shadow-orange-500/25 inline-flex items-center gap-2"
            >
              <span>Concluir & Aproveitar Recursos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

