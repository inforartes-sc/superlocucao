import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Volume2,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Download,
  CheckCircle2,
  Radio,
  Store,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  Headphones,
  Music,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Award,
  Sliders,
  DollarSign,
  Check,
  X as CloseIcon,
  Loader2,
  LogIn,
  UserPlus,
  SkipForward,
  RotateCcw,
  VolumeX,
  ArrowUp,
} from 'lucide-react';
import { downloadAudioMp3 } from '../utils/downloadAudio.ts';
import { playSupermarketChime } from '../utils/soundboard.ts';
import { api } from '../services/api.ts';
import { CommercialPlan } from '../types/index.ts';

interface LandingViewProps {
  onStartCreating: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartCreating,
  onOpenLogin,
  onOpenRegister,
}) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [downloadingAudioId, setDownloadingAudioId] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

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
      price: 89,
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
      price: 199,
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

  useEffect(() => {
    api.getPublicSettings().then((res) => {
      if (res && res.commercialPlans && res.commercialPlans.length > 0) {
        setCommercialPlans(res.commercialPlans);
      }
    }).catch(console.warn);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // =========================================================================
  // REAL INTERACTIVE LIVE RADIO WEB DEMO ENGINE
  // =========================================================================
  const [isRadioOnAir, setIsRadioOnAir] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  const [activeSpotIndex, setActiveSpotIndex] = useState(0);
  const [isSpotSpeaking, setIsSpotSpeaking] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [musicVolume, setMusicVolume] = useState(0.70);
  const [spotCurrentTime, setSpotCurrentTime] = useState(0);
  const [spotDuration, setSpotDuration] = useState(28);

  const radioMusicRef = useRef<HTMLAudioElement | null>(null);
  const radioSpotRef = useRef<HTMLAudioElement | null>(null);
  const duckIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const radioDemoOffers = [
    {
      id: 'carne',
      title: 'Quarta da Carne — Alcatra Friboi R$ 36,90 kg',
      sector: 'Açougue & Carnes',
      badge: '🥩 Oferta Açougue',
      voiceName: 'Daniel (Varejo Enérgico)',
      audioUrl: '/api/audio/aud-demo-1.mp3',
      durationSeconds: 28,
      script: 'Atenção clientes do Supermercado! Quarta da Carne com Alcatra Friboi por apenas trinta e seis reais e noventa centavos o quilo! Coxa e sobrecoxa Sadia só oito reais e noventa e nove centavos!',
    },
    {
      id: 'hortifruti',
      title: 'Festival de Hortifrúti — Tomate & Banana R$ 3,99 kg',
      sector: 'Hortifrúti Fresco',
      badge: '🍎 Feirinha do Dia',
      voiceName: 'Carolina (Vendedora Amigável)',
      audioUrl: '/api/audio/aud-demo-3.mp3',
      durationSeconds: 25,
      script: 'Tem feirinha fresca hoje no nosso supermercado! Banana-caturra selecionada por apenas três reais e noventa e nove centavos o quilo! Tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo!',
    },
    {
      id: 'churrasco',
      title: 'Super Fim de Semana — Picanha & Cerveja Heineken',
      sector: 'Churrasco & Bebidas',
      badge: '🍺 Queima de Estoque',
      voiceName: 'Rodrigo (Voz de Impacto Grave)',
      audioUrl: '/api/audio/aud-demo-2.mp3',
      durationSeconds: 38,
      script: 'O fim de semana chegou com tudo no Supermercado Alvorada! Picanha bovina fatiada grill por só cinquenta e nove reais e noventa centavos o quilo! Cerveja Heineken lata bem gelada, quatro reais e oitenta e nove centavos!',
    },
    {
      id: 'institucional',
      title: 'Clube de Vantagens — Ative seu CPF no Caixa',
      sector: 'Institucional & Loja',
      badge: '📢 Comunicado Loja',
      voiceName: 'Marcos (Institucional)',
      audioUrl: '/api/audio/voice_marcos-institucional.mp3',
      durationSeconds: 22,
      script: 'Você já é cadastrado no nosso Clube de Vantagens? Informe seu CPF no caixa para ativar ofertas exclusivas direto no leitor. Cadastre-se gratuitamente no balcão de atendimento.',
    },
  ];

  // Smooth Volume Fader for Auto-Ducking
  const fadeMusicVolume = useCallback((targetVol: number, durationMs = 350) => {
    if (!radioMusicRef.current) return;
    if (duckIntervalRef.current) clearInterval(duckIntervalRef.current);
    const audio = radioMusicRef.current;
    const startVol = audio.volume;
    const diff = targetVol - startVol;
    const steps = 15;
    const stepTime = durationMs / steps;
    let step = 0;

    duckIntervalRef.current = window.setInterval(() => {
      step++;
      const current = startVol + diff * (step / steps);
      audio.volume = Math.max(0, Math.min(1, current));
      if (step >= steps) {
        clearInterval(duckIntervalRef.current!);
        duckIntervalRef.current = null;
      }
    }, stepTime);
  }, []);

  const triggerRadioSpot = useCallback((index?: number) => {
    const chosenIndex = typeof index === 'number' ? index : activeSpotIndex;
    const offer = radioDemoOffers[chosenIndex];
    if (!offer || !radioSpotRef.current || !radioMusicRef.current) return;

    // Pausa sample de áudio da vitrine se estiver tocando
    if (sampleAudioRef.current) {
      sampleAudioRef.current.pause();
      setPlayingAudioId(null);
    }

    // Se a rádio estiver desligada, liga a rádio
    if (!isRadioOnAir) {
      setIsRadioOnAir(true);
      radioMusicRef.current.volume = musicVolume;
      radioMusicRef.current.play().catch(console.warn);
    }

    // Aplica o Auto-Ducking na música: diminui para 12% suavemente
    setIsDucking(true);
    setIsSpotSpeaking(true);
    fadeMusicVolume(0.12, 350);

    const spotEl = radioSpotRef.current;
    spotEl.src = offer.audioUrl;
    spotEl.currentTime = 0;
    spotEl.volume = 1.0;
    spotEl.play().catch(console.warn);
  }, [activeSpotIndex, fadeMusicVolume, isRadioOnAir, musicVolume, radioDemoOffers]);

  const handleSpotEnded = useCallback(() => {
    setIsDucking(false);
    setIsSpotSpeaking(false);
    setSpotCurrentTime(0);
    // Restaura suavemente o volume da música ambiente para 70%
    fadeMusicVolume(musicVolume, 500);
    // Avança para a próxima oferta na fila da rádio
    setActiveSpotIndex(prev => (prev + 1) % radioDemoOffers.length);
    // Reinicia a contagem regressiva para a próxima oferta
    setCountdown(20);
  }, [fadeMusicVolume, musicVolume, radioDemoOffers.length]);

  const toggleRadioOnAir = () => {
    if (isRadioOnAir) {
      // Desligar
      if (radioMusicRef.current) radioMusicRef.current.pause();
      if (radioSpotRef.current) radioSpotRef.current.pause();
      setIsRadioOnAir(false);
      setIsDucking(false);
      setIsSpotSpeaking(false);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    } else {
      // Pausa sample de áudio da vitrine se estiver tocando
      if (sampleAudioRef.current) {
        sampleAudioRef.current.pause();
        setPlayingAudioId(null);
      }
      // Ligar
      if (radioMusicRef.current) {
        radioMusicRef.current.volume = musicVolume;
        radioMusicRef.current.play().catch(console.warn);
      }
      setIsRadioOnAir(true);
      setCountdown(15);
    }
  };

  const handleTriggerChime = () => {
    if (!isRadioOnAir) {
      toggleRadioOnAir();
    }
    // Aplica ducking na música
    setIsDucking(true);
    fadeMusicVolume(0.12, 200);
    playSupermarketChime(0.8);
    setTimeout(() => {
      if (!isSpotSpeaking) {
        setIsDucking(false);
        fadeMusicVolume(musicVolume, 400);
      }
    }, 2200);
  };

  // Contagem regressiva automática quando a rádio está no ar
  useEffect(() => {
    if (!isRadioOnAir || isSpotSpeaking) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          triggerRadioSpot();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isRadioOnAir, isSpotSpeaking, triggerRadioSpot]);

  // Cleanup de áudios ao desmontar o componente
  useEffect(() => {
    return () => {
      if (duckIntervalRef.current) clearInterval(duckIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (radioMusicRef.current) radioMusicRef.current.pause();
      if (radioSpotRef.current) radioSpotRef.current.pause();
      if (sampleAudioRef.current) sampleAudioRef.current.pause();
    };
  }, []);

  // Vitrine de Spots de Áudio Individuais
  const demoSpots = [
    {
      id: 'demo-carne',
      title: 'Quarta da Carne & Açougue',
      tag: 'Açougue & Carnes',
      badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
      voice: 'Daniel (Varejo Enérgico)',
      duration: '28s',
      url: '/api/audio/aud-demo-1.mp3',
      text: 'Atenção clientes do Supermercado! Quarta da Carne com Alcatra Friboi por apenas trinta e seis reais e noventa centavos o quilo! Coxa e sobrecoxa Sadia só oito reais e noventa e nove centavos!',
    },
    {
      id: 'demo-fim-semana',
      title: 'Super Fim de Semana de Ofertas',
      tag: 'Churrasco & Bebidas',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      voice: 'Rodrigo (Voz de Impacto Grave)',
      duration: '38s',
      url: '/api/audio/aud-demo-2.mp3',
      text: 'O fim de semana chegou com tudo no Supermercado Alvorada! Picanha bovina fatiada grill por só cinquenta e nove reais e noventa centavos o quilo! Cerveja Heineken lata bem gelada, quatro reais e oitenta e nove centavos!',
    },
    {
      id: 'demo-hortifruti',
      title: 'Festival de Hortifrúti & Feirinha',
      tag: 'Hortifrúti Fresco',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      voice: 'Carolina (Vendedora Amigável)',
      duration: '25s',
      url: '/api/audio/aud-demo-3.mp3',
      text: 'Tem feirinha fresca hoje no nosso supermercado! Banana-caturra selecionada por apenas três reais e noventa e nove centavos o quilo! Tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo!',
    },
    {
      id: 'demo-institucional',
      title: 'Comunicado Clube de Descontos',
      tag: 'Clube & Fidelidade',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      voice: 'Marcos (Institucional & Sóbrio)',
      duration: '22s',
      url: '/api/audio/voice_marcos-institucional.mp3',
      text: 'Você já é cadastrado no nosso Clube de Vantagens? Informe seu CPF no caixa para ativar ofertas exclusivas direto no leitor. Cadastre-se gratuitamente no balcão de atendimento.',
    },
  ];

  const handleDownloadDemo = async (url: string, id: string, name: string) => {
    setDownloadingAudioId(id);
    await downloadAudioMp3(url, `${name}.mp3`, () => {});
    setTimeout(() => setDownloadingAudioId(null), 1200);
  };

  const handleTogglePlay = (id: string, url: string) => {
    // Pausa a rádio web se estiver tocando
    if (isRadioOnAir) {
      toggleRadioOnAir();
    }

    if (playingAudioId === id) {
      if (sampleAudioRef.current) {
        sampleAudioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      if (sampleAudioRef.current) {
        sampleAudioRef.current.src = url;
        sampleAudioRef.current.play().catch(console.warn);
      }
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentOffer = radioDemoOffers[activeSpotIndex];

  const faqs = [
    {
      q: 'Como coloco as locuções e a rádio para tocar no meu supermercado?',
      a: 'Você tem total flexibilidade: pode deixar a Rádio Web do SuperLocução tocando diretamente no computador conectado ao amplificador da sua loja (com música contínua e locuções automáticas) ou pode baixar os arquivos gerados em formato MP3 de alta qualidade para tocar em pendrive, caixa amplificada ou qualquer tocador de áudio.',
    },
    {
      q: 'A inteligência artificial lê centavos e quilos corretamente para varejo?',
      a: 'Sim! Nosso motor de linguagem foi treinado especificamente para a linguagem comercial de supermercados brasileiros. Valores como "R$ 24,90" são pronunciados naturalmente como "vinte e quatro reais e noventa centavos", e unidades como "kg" ou "un" viram "o quilo" ou "a unidade", sem voz robótica.',
    },
    {
      q: 'O que é o sistema de Rádio Web com Deck Duplo?',
      a: 'É uma tecnologia que roda no navegador da sua loja. O Deck 1 toca trilhas musicais instrumentais animadas sem parar (sem anúncios de concorrentes). Quando chega o momento de divulgar uma oferta, o Deck 2 entra no ar e reduz o volume da música suavemente (Auto-Ducking), voltando ao volume normal assim que o anúncio termina.',
    },
    {
      q: 'Posso gerar vinhetas com o nome do meu próprio supermercado?',
      a: 'Com certeza! A plataforma vem com 15 modelos de vinhetas e sweepers pré-programados para supermercados (Açougue, Hortifrúti, Padaria, Carrinho Cheio, Clube). Basta informar o nome da sua loja e todas as vinhetas são personalizadas instantaneamente.',
    },
    {
      q: 'Preciso pagar para testar?',
      a: 'Não! Ao criar sua conta você recebe 50 créditos gratuitos imediatamente de boas-vindas para criar roteiros, gerar anúncios com voz profissional e testar na prática a qualidade dentro da sua loja.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0e1118] text-zinc-100 selection:bg-orange-500 selection:text-white flex flex-col font-sans">
      {/* Audio Engine for Sample Showcase */}
      <audio ref={sampleAudioRef} onEnded={() => setPlayingAudioId(null)} />

      {/* Audio Engine for Dual-Deck Live Radio Web Demo */}
      <audio
        ref={radioMusicRef}
        src="/api/soundtracks/varejo_alegre/preview.mp3"
        loop
        preload="auto"
      />
      <audio
        ref={radioSpotRef}
        preload="auto"
        onTimeUpdate={() => setSpotCurrentTime(radioSpotRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setSpotDuration(radioSpotRef.current?.duration || 28)}
        onEnded={handleSpotEnded}
      />

      {/* ===================================================================== */}
      {/* 1. TOP COMMERCIAL FIXED HEADER                                        */}
      {/* ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#12141c]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition shrink-0">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl text-white tracking-tight">
                  Super<span className="text-orange-500">Locução</span>
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  Varejo IA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Locução Comercial & Rádio Web para Supermercados
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-zinc-300">
            <button
              onClick={() => scrollToSection('radioweb')}
              className="hover:text-orange-400 transition cursor-pointer flex items-center gap-1.5 text-orange-400 bg-orange-500/10 border border-orange-500/25 px-3 py-1.5 rounded-full"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Ouvir a Rádio</span>
            </button>
            <button
              onClick={() => scrollToSection('recursos')}
              className="hover:text-orange-400 transition cursor-pointer"
            >
              Recursos
            </button>
            <button
              onClick={() => scrollToSection('amostras')}
              className="hover:text-orange-400 transition cursor-pointer"
            >
              Amostras de Voz
            </button>
            <button
              onClick={() => scrollToSection('comparativo')}
              className="hover:text-orange-400 transition cursor-pointer"
            >
              Comparativo
            </button>
            <button
              onClick={() => scrollToSection('planos')}
              className="hover:text-orange-400 transition cursor-pointer"
            >
              Planos & Preços
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onOpenLogin}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-zinc-300 hover:text-white bg-[#1a1d27] hover:bg-[#232734] border border-zinc-700/80 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-4 h-4 text-orange-400" />
              <span>Entrar</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black text-zinc-950 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-md shadow-orange-500/25 transition cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-zinc-950" />
              <span>Testar Grátis</span>
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Header Spacer */}
      <div className="h-16 sm:h-18 shrink-0 pointer-events-none" aria-hidden="true" />

      {/* ===================================================================== */}
      {/* 2. HERO SECTION                                                       */}
      {/* ===================================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-24">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>Tecnologia de Inteligência Artificial para Supermercados & Atacarejos</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Locuções de Ofertas e{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                Rádio Web Ao Vivo
              </span>{' '}
              para o seu Supermercado
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl text-zinc-300 leading-relaxed font-normal max-w-2xl mx-auto">
              Transforme encartes e mensagens do WhatsApp em anúncios profissionais em 15 segundos. Transmita música ambiente contínua na sua loja com vinhetas automáticas e auto-ducking inteligente.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              <button
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-2xl shadow-xl shadow-orange-500/25 transition flex items-center justify-center gap-2.5 text-base cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Criar Minha Locução Grátis</span>
                <ArrowRight className="w-5 h-5 text-zinc-950" />
              </button>

              <button
                onClick={() => scrollToSection('radioweb')}
                className="w-full sm:w-auto px-7 py-4 bg-[#181b24] hover:bg-[#222633] border border-orange-500/50 text-white font-bold rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-base cursor-pointer group"
              >
                <Radio className="w-5 h-5 text-orange-400 group-hover:animate-pulse" />
                <span>Ouvir Demonstração da Rádio Real</span>
              </button>
            </div>

            {/* Quick Metrics Trust Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs font-bold text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>50 Créditos de Boas-Vindas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pronúncia Correta de Preços & Centavos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pronto em 15 Segundos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Rádio Web com Deck Duplo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. SEÇÃO PRINCIPAL: DEMONSTRAÇÃO REAL DA RÁDIO WEB DA LOJA             */}
      {/* ===================================================================== */}
      <section id="radioweb" className="py-16 sm:py-24 bg-[#111318] border-y border-zinc-800 relative">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-gradient-to-r from-orange-500/10 via-red-500/10 to-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 inline-flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Demonstração Interativa em Tempo Real
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Experimente a Rádio Web da sua Loja em Ação
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Ligue a rádio abaixo para ouvir a música ambiente da loja. Clique em <strong>"Disparar Oferta"</strong> para ver e ouvir a mágica do <strong>Auto-Ducking</strong>: a música abaixa suavemente sozinha e o locutor anuncia a promoção com clareza cristalina!
            </p>
          </div>

          {/* ================================================================= */}
          {/* THE REAL BROADCAST CONSOLE SIMULATOR                              */}
          {/* ================================================================= */}
          <div className="max-w-5xl mx-auto bg-[#181b24] rounded-3xl border border-zinc-700/80 shadow-2xl overflow-hidden">
            {/* Top Console Bar */}
            <div className="p-5 sm:p-7 border-b border-zinc-700/70 bg-[#161822] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                    isRadioOnAir
                      ? 'bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 text-white shadow-xl shadow-red-600/30'
                      : 'bg-[#1f2330] border border-zinc-700 text-zinc-400'
                  }`}
                >
                  <Radio className={`w-7 h-7 ${isRadioOnAir ? 'animate-pulse' : ''}`} />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                        isRadioOnAir
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-xs'
                          : 'bg-[#1f2330] text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isRadioOnAir ? 'bg-red-500 animate-ping' : 'bg-zinc-500'
                        }`}
                      />
                      {isRadioOnAir ? 'NO AR • TRANSMITINDO AO VIVO NA LOJA' : 'RÁDIO DESLIGADA (CLIQUE PARA OUVIR)'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                      🏪 Rádio Supermercado Modelo
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400">
                    {isRadioOnAir
                      ? 'Música ambiente ativa nas caixas de som com intercalação automática de ofertas'
                      : 'Clique no botão laranja para ligar a transmissão e testar na prática'}
                  </p>
                </div>
              </div>

              {/* Main Actions */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={toggleRadioOnAir}
                  className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition cursor-pointer shrink-0 ${
                    isRadioOnAir
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600'
                      : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:from-orange-400 hover:to-amber-400 text-zinc-950 shadow-orange-500/30 hover:scale-[1.02]'
                  }`}
                >
                  {isRadioOnAir ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>PAUSAR RÁDIO</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>LIGAR RÁDIO DA LOJA AO VIVO</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => triggerRadioSpot()}
                  disabled={isSpotSpeaking}
                  className="px-4 py-3 rounded-2xl bg-[#242938] hover:bg-[#2d3447] disabled:opacity-50 text-orange-300 hover:text-white border border-orange-500/40 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shrink-0"
                  title="Disparar a locução imediatamente e ouvir a música abaixar de volume"
                >
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span>Disparar Oferta Agora</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerChime}
                  className="px-3.5 py-3 rounded-2xl bg-[#1f2330] hover:bg-[#282f42] text-amber-300 border border-zinc-700/80 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  title="Tocar gongo clássico de chamada de loja (Ding-Dong)"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Ding-Dong</span>
                </button>
              </div>
            </div>

            {/* Dual Decks Grid */}
            <div className="p-4 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 bg-[#181b24]">
              {/* DECK 1: MÚSICA AMBIENTE */}
              <div className="lg:col-span-5 rounded-2xl bg-[#1e222e] border border-zinc-700/80 p-5 flex flex-col justify-between space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <Music className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                        Deck 1 • Música da Loja
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">
                        {isDucking
                          ? '🔉 Auto-Ducking Ativo (Volume: 12%)'
                          : isRadioOnAir
                          ? '🎵 Tocando Som Ambiente (Volume: 70%)'
                          : 'Pronto para tocar'}
                      </span>
                    </div>
                  </div>

                  {/* Equalizer VU Bar */}
                  {isRadioOnAir && (
                    <div className="flex items-end gap-1 h-6 shrink-0">
                      <span className={`w-1 bg-emerald-400 rounded-full animate-bounce ${isDucking ? 'h-2' : 'h-5'}`} />
                      <span className={`w-1 bg-emerald-400 rounded-full animate-pulse ${isDucking ? 'h-2' : 'h-6'}`} />
                      <span className={`w-1 bg-emerald-400 rounded-full animate-bounce ${isDucking ? 'h-1.5' : 'h-4'}`} />
                      <span className={`w-1 bg-emerald-400 rounded-full animate-pulse ${isDucking ? 'h-2' : 'h-5'}`} />
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#141620] border border-zinc-700/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Manhã de Compras & Ofertas</p>
                      <p className="text-xs text-zinc-400">Pop Varejo Hit Alegre • 124 BPM</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Instrumental
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Nivelador Inteligente:</span>
                    <span className="text-emerald-400 font-bold">Ativo (+8.0 dB)</span>
                  </div>
                </div>

                <div className="p-3 bg-[#141620] rounded-xl border border-zinc-700/70 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Volume Ambiente:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {isDucking ? '12% (Reduzido p/ fala)' : `${Math.round(musicVolume * 100)}% (Normal)`}
                  </span>
                </div>
              </div>

              {/* DECK 2: LOCUTOR DE OFERTAS & AUTO-DUCKING */}
              <div className="lg:col-span-7 rounded-2xl bg-[#1e222e] border border-orange-500/40 p-5 flex flex-col justify-between space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSpotSpeaking
                          ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/30 animate-pulse'
                          : 'bg-orange-500/15 border border-orange-500/30 text-orange-400'
                      }`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-orange-300/80 block">
                        Deck 2 • Locutor de Ofertas & Comunicados
                      </span>
                      <span className="text-xs font-bold text-white">
                        {isSpotSpeaking
                          ? '📢 LOCUÇÃO NO AR AGORA (MÚSICA REDUZIDA)!'
                          : isRadioOnAir
                          ? `⏱️ Próxima oferta entra em ${countdown} segundos`
                          : 'Aguardando início da rádio'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerRadioSpot()}
                    disabled={isSpotSpeaking}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-zinc-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Tocar Oferta Agora</span>
                  </button>
                </div>

                {/* Offer Monitor Box */}
                <div
                  className={`p-4 rounded-xl border transition-all shadow-sm ${
                    isSpotSpeaking
                      ? 'bg-orange-500/15 border-orange-500/50 shadow-inner'
                      : 'bg-[#141620] border border-zinc-700/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-orange-500 text-zinc-950">
                          {isSpotSpeaking ? 'FALANDO AGORA' : 'PRÓXIMA NA GRADE'}
                        </span>
                        <span className="text-[11px] text-zinc-400">{currentOffer.sector}</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white truncate">
                        {currentOffer.title}
                      </h4>
                      <p className="text-xs text-orange-200/80">
                        Locutor(a): <strong>{currentOffer.voiceName}</strong>
                      </p>
                    </div>

                    {isSpotSpeaking && (
                      <div className="flex items-end gap-1 h-7 shrink-0">
                        <span className="w-1.5 bg-orange-400 rounded-full animate-bounce h-6" />
                        <span className="w-1.5 bg-amber-400 rounded-full animate-pulse h-4" />
                        <span className="w-1.5 bg-red-400 rounded-full animate-bounce h-7" />
                        <span className="w-1.5 bg-orange-400 rounded-full animate-pulse h-5" />
                      </div>
                    )}
                  </div>

                  {/* Progress bar while speaking */}
                  {isSpotSpeaking && (
                    <div className="mt-3 space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-200"
                          style={{
                            width: `${
                              spotDuration > 0 ? Math.min(100, (spotCurrentTime / spotDuration) * 100) : 50
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-orange-300 font-mono">
                        <span>{Math.floor(spotCurrentTime)}s</span>
                        <span>{Math.floor(spotDuration)}s</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Offer Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase text-zinc-400">
                    Escolha uma oferta para testar o som:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {radioDemoOffers.map((offer, idx) => (
                      <button
                        key={offer.id}
                        type="button"
                        onClick={() => {
                          setActiveSpotIndex(idx);
                          triggerRadioSpot(idx);
                        }}
                        className={`p-2 rounded-xl text-left border text-xs font-semibold transition cursor-pointer flex flex-col justify-between ${
                          activeSpotIndex === idx
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                            : 'bg-[#141620] hover:bg-zinc-800 text-zinc-300 border-zinc-700/80'
                        }`}
                      >
                        <span className="font-bold text-[11px] truncate">{offer.badge}</span>
                        <span className="text-[10px] text-zinc-400">{offer.durationSeconds}s</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Educational Live Explanation Bar */}
            <div className="p-4 sm:p-5 bg-[#141620] border-t border-zinc-700/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span>
                  <strong>Como funciona:</strong> A música nunca corta bruscamente. O sistema reduz o volume sozinho (Auto-Ducking) para que todos os clientes escutem a oferta com nitidez total.
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenRegister}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-xl text-xs whitespace-nowrap cursor-pointer shrink-0 shadow-md"
              >
                Ativar Rádio no Meu Supermercado
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. RECURSOS EXCLUSIVOS PARA SUPERMERCADOS                             */}
      {/* ===================================================================== */}
      <section id="recursos" className="py-20 bg-[#12141c] border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Poder Total no Ponto de Venda
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Tudo o que seu supermercado precisa para vender mais
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Chega de depender de locutor externo ou gastar fortunas todo mês. Controle o som da sua loja com autonomia total.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Estúdio IA */}
            <div className="bg-[#181b24] p-6 rounded-2xl border border-zinc-700/80 hover:border-orange-500/40 transition-all shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white">Estúdio com IA de Varejo</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Basta colar sua lista de ofertas copiada do encarte ou WhatsApp. A IA monta um roteiro persuasivo e converte números em leitura falada impecável.
                </p>
              </div>
              <ul className="text-xs text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Roteiros de açougue, hortifrúti e padaria
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Geração em lote (1 áudio por produto)
                </li>
              </ul>
            </div>

            {/* Card 2: Rádio Web Deck Duplo */}
            <div className="bg-[#181b24] p-6 rounded-2xl border border-orange-500/40 transition-all shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-xl bg-orange-500 text-zinc-950 font-black text-[10px] uppercase">
                Exclusivo
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white">Rádio Web da Loja</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Sistema de transmissão ao vivo com Deck Duplo: música ambiente contínua com Auto-Ducking automático (o volume abaixa sozinho na hora da oferta).
                </p>
              </div>
              <ul className="text-xs text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Playlists comerciais por tema (Pop, Acústico, Sertanejo)
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Grade de ofertas por dia da semana
                </li>
              </ul>
            </div>

            {/* Card 3: Soundboard & Microfone */}
            <div className="bg-[#181b24] p-6 rounded-2xl border border-zinc-700/80 hover:border-orange-500/40 transition-all shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white">Mesa de Efeitos & Avisos</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Dispare o clássico gongo "Ding-Dong", sirenes de oferta relâmpago, avisos de placas de carro no estacionamento e comunicados de fechamento da loja.
                </p>
              </div>
              <ul className="text-xs text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Gongo tradicional de supermercado
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Avisos de estacionamento e fechamento
                </li>
              </ul>
            </div>

            {/* Card 4: 15 Vinhetas Prontas */}
            <div className="bg-[#181b24] p-6 rounded-2xl border border-zinc-700/80 hover:border-orange-500/40 transition-all shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Music className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white">15 Vinhetas da Loja</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Modelos prontos de vinhetas institucionais e carimbos curtos de 5 segundos que colocam o nome do seu supermercado em destaque sonoro.
                </p>
              </div>
              <ul className="text-xs text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Personalizadas com o nome da sua loja
                </li>
                <li className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Inclusão automática na grade da rádio
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. VITRINE DE AMOSTRAS DE VOZ                                         */}
      {/* ===================================================================== */}
      <section id="amostras" className="py-20 bg-[#0e1118]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Qualidade Sonora Profissional
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ouça amostras reais de Locuções Comerciais
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Vozes em português brasileiro com sotaque natural, cadência vendedora e mixagem profissional com trilhas de fundo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {demoSpots.map(spot => (
              <div
                key={spot.id}
                className="bg-[#181b24] rounded-2xl p-5 sm:p-6 border border-zinc-700/80 hover:border-orange-500/40 transition-all shadow-lg flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${spot.badgeColor}`}
                    >
                      {spot.tag}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {spot.duration}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base sm:text-lg mb-1">{spot.title}</h3>
                  <p className="text-xs text-zinc-400 mb-3">Locutor: {spot.voice}</p>

                  <p className="text-xs text-zinc-300 italic bg-[#12141c] p-3.5 rounded-xl border border-zinc-700/60 leading-relaxed">
                    "{spot.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => handleTogglePlay(spot.id, spot.url)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-xl text-xs transition cursor-pointer shadow-md"
                  >
                    {playingAudioId === spot.id ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Ouvir Locução</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadDemo(spot.url, spot.id, `locucao-${spot.id}`)}
                    disabled={downloadingAudioId === spot.id}
                    className="p-2 text-zinc-400 hover:text-white bg-[#12141c] hover:bg-zinc-800 border border-zinc-700/70 rounded-xl transition cursor-pointer"
                    title="Baixar MP3 de demonstração"
                  >
                    {downloadingAudioId === spot.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. COMPARATIVO (LOCUTOR TRADICIONAL VS SUPERLOCUÇÃO)                  */}
      {/* ===================================================================== */}
      <section id="comparativo" className="py-20 bg-[#12141c] border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Economia e Velocidade
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Locutor Tradicional vs. SuperLocução Varejo IA
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Veja por que supermercados de todo o Brasil estão migrando para a nossa solução.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-[#181b24] rounded-3xl border border-zinc-700/80 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-3 bg-[#141620] p-4 text-xs font-bold uppercase tracking-wider border-b border-zinc-800 text-zinc-400">
              <div>Critério</div>
              <div className="text-center text-zinc-400">Locutor Tradicional</div>
              <div className="text-center text-orange-400 font-black">SuperLocução Varejo IA</div>
            </div>

            <div className="divide-y divide-zinc-800 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-white">Tempo de entrega</div>
                <div className="text-center text-zinc-400">De 6 a 24 horas</div>
                <div className="text-center text-emerald-400 font-bold">15 segundos imediato</div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-[#141620]/40">
                <div className="font-bold text-white">Custo por locução</div>
                <div className="text-center text-zinc-400">R$ 40 a R$ 120 por áudio</div>
                <div className="text-center text-emerald-400 font-bold">Centavos por áudio</div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-white">Disponibilidade</div>
                <div className="text-center text-zinc-400">Horário comercial / dias úteis</div>
                <div className="text-center text-emerald-400 font-bold">24h / 7 dias por semana</div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-[#141620]/40">
                <div className="font-bold text-white">Rádio Web de Loja Inclusa</div>
                <div className="text-center text-red-400 font-bold">Não inclusa (contrato à parte)</div>
                <div className="text-center text-emerald-400 font-bold">Inclusa na plataforma</div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-white">Alteração de preço de última hora</div>
                <div className="text-center text-zinc-400">Cobrança de nova gravação</div>
                <div className="text-center text-emerald-400 font-bold">Regeneração em 5 segundos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. PLANOS & PREÇOS                                                    */}
      {/* ===================================================================== */}
      <section id="planos" className="py-20 bg-[#0e1118]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Transparência Total
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Planos dimensionados para o porte da sua loja
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Escolha o plano ideal para suas promoções diárias. Comece grátis e cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {commercialPlans.map((plan) => {
              const isHigh = plan.highlighted || Boolean(plan.badge);
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative transition-all duration-300 ${
                    isHigh
                      ? 'bg-gradient-to-b from-[#1e222e] to-[#181b24] border-2 border-orange-500 shadow-2xl scale-[1.02]'
                      : 'bg-[#181b24] border border-zinc-700/80 hover:border-zinc-600'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 text-[11px] font-black rounded-full uppercase tracking-wider shadow">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    {plan.tag && (
                      <span className={`text-xs font-black uppercase tracking-wider ${isHigh ? 'text-orange-400' : 'text-zinc-400'}`}>
                        {plan.tag}
                      </span>
                    )}
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    <p className={`text-xs ${isHigh ? 'text-zinc-300' : 'text-zinc-400'}`}>
                      {plan.subtitle}
                    </p>
                    <div className="pt-2">
                      <span className="text-4xl font-black text-white">R$ {plan.price}</span>
                      <span className="text-xs text-zinc-400 ml-1">{plan.billingPeriod}</span>
                    </div>

                    <ul className={`space-y-2.5 text-xs pt-4 border-t border-zinc-800 ${isHigh ? 'text-zinc-200' : 'text-zinc-300'}`}>
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${isHigh ? 'text-orange-400' : 'text-emerald-400'}`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={onOpenRegister}
                    className={`w-full py-3.5 font-black rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-lg ${
                      isHigh
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 shadow-orange-500/25'
                        : 'bg-[#242938] hover:bg-[#2d3447] text-white border border-zinc-700/80'
                    }`}
                  >
                    {plan.ctaText || 'Começar Grátis'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8. DEPOIMENTOS                                                        */}
      {/* ===================================================================== */}
      <section className="py-20 bg-[#12141c] border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Depoimentos Reais
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              O que dizem os supermercados parceiros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-[#181b24] p-6 rounded-2xl border border-zinc-700/80 space-y-4 shadow-md">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                “Antes a gente pagava R$ 80 por áudio e demorava 2 dias para o locutor entregar. Hoje eu monto a oferta da quarta-feira em 1 minuto na abertura da loja. O açougue vendeu 30% a mais.”
              </p>
              <div className="pt-2 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-black text-orange-400 text-xs">
                  CM
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Carlos Mendes</div>
                  <div className="text-[11px] text-zinc-400">Supermercado Alvorada • Campinas/SP</div>
                </div>
              </div>
            </div>

            <div className="bg-[#181b24] p-6 rounded-2xl border border-zinc-700/80 space-y-4 shadow-md">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                “A Rádio Web da loja é sensacional! A música fica tocando o dia todo e abaixa sozinha quando solta a oferta. Os clientes elogiaram o clima da loja que ficou muito mais profissional.”
              </p>
              <div className="pt-2 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-xs">
                  JC
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Juliana Castro</div>
                  <div className="text-[11px] text-zinc-400">Atacadão Central • Curitiba/PR</div>
                </div>
              </div>
            </div>

            <div className="bg-[#181b24] p-6 rounded-2xl border border-zinc-700/80 space-y-4 shadow-md">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                “Muito simples de usar. Copio o encarte do WhatsApp, colo na plataforma e em 15 segundos o áudio já está tocando nas caixas do mercado. Não troco por nada.”
              </p>
              <div className="pt-2 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-xs">
                  RS
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Roberto Souza</div>
                  <div className="text-[11px] text-zinc-400">Rede Bom Preço • Belo Horizonte/MG</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 9. FAQ DE PERGUNTAS FREQUENTES                                        */}
      {/* ===================================================================== */}
      <section id="duvidas" className="py-20 bg-[#0e1118]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Tire Suas Dúvidas
            </span>
            <h2 className="text-3xl font-black text-white">Perguntas Frequentes</h2>
            <p className="text-sm text-zinc-400">
              Tudo o que você precisa saber sobre o SuperLocução Varejo IA.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#181b24] rounded-2xl border border-zinc-700/80 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-white text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/40 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-orange-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 10. FOOTER COMERCIAL COMPLETO                                         */}
      {/* ===================================================================== */}
      <footer className="bg-[#0b0d13] text-zinc-400 py-16 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-zinc-950 font-black">
                <Volume2 className="w-5 h-5 text-zinc-950" />
              </div>
              <div>
                <span className="font-black text-lg text-white">
                  Super<span className="text-orange-500">Locução</span>
                </span>
                <span className="text-[10px] font-bold uppercase ml-2 px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  Varejo IA
                </span>
                <p className="text-xs text-zinc-500 mt-0.5">
                  A solução completa de locução e rádio web para o comércio varejista.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-[#181b24] hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer"
              >
                Entrar no Painel
              </button>
              <button
                onClick={onOpenRegister}
                className="px-5 py-2 rounded-xl text-xs font-black text-zinc-950 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 transition cursor-pointer"
              >
                Criar Conta Grátis
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
            <p>© {new Date().getFullYear()} SuperLocução Varejo IA. Todos os direitos reservados.</p>
            <p>Desenvolvido para Supermercados, Hipermercados, Atacarejos e Redes de Varejo.</p>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 shadow-2xl shadow-orange-500/40 border border-amber-300/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
          title="Voltar ao início da página"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-5 h-5 text-zinc-950 stroke-[3]" />
        </button>
      )}
    </div>
  );
};
