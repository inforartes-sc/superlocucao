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
  Menu,
  MessageSquare,
  Scale,
} from 'lucide-react';
import { downloadAudioMp3 } from '../utils/downloadAudio.ts';
import { playSupermarketChime } from '../utils/soundboard.ts';
import { api } from '../services/api.ts';
import { CommercialPlan, ClientLogo } from '../types/index.ts';
import { ContactModal } from '../components/ContactModal.tsx';
import { LegalModal } from '../components/LegalModal.tsx';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('Dúvidas sobre os Planos & Rádio Web');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

  const [commercialPlans, setCommercialPlans] = useState<CommercialPlan[]>([
    {
      id: 'degustacao',
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
        '1.500 créditos mensais renovados todo mês',
        '1 Loja / 1 Computador de Transmissão por vez',
        'Proteção inteligente contra transmissões simultâneas',
        'Vinhetas & Sweepers personalizadas 100% liberadas',
        'Avisos Informativos & Utilidade Pública liberados',
        'Upload de Áudios e Músicas MP3 do seu PC liberado',
        'Rádio Web ao Vivo com Auto-Ducking automático',
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
        '5.000 créditos mensais renovados todo mês',
        'Multi-Lojas: Múltiplas Lojas & Filiais Simultâneas',
        'Transmissão simultânea em vários computadores ao mesmo tempo',
        'Painel de Gestão de Filiais da Rede em tempo real',
        'Programação e campanhas independentes por filial',
        'Vinhetas, Avisos, Uploads e Recursos Pro 100% liberados',
        'Clonagem de voz personalizada da marca (sob demanda)',
        'Gerente de contas e atendimento VIP prioritário',
      ],
      ctaText: 'Falar com Consultor',
      badge: '',
      highlighted: false,
    },
  ]);

  const [publicWhatsapp, setPublicWhatsapp] = useState('');
  const [publicEmail, setPublicEmail] = useState('');

  // Supermarket Client Logos (Carrossel Contínuo)
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([
    {
      id: 'logo-alvorada',
      name: 'Supermercado Alvorada',
      cityState: 'Campinas/SP',
      slogan: 'Economia e Qualidade Todo Dia',
      active: true,
      order: 1,
    },
    {
      id: 'logo-bompreco',
      name: 'Rede Bom Preço',
      cityState: 'Belo Horizonte/MG',
      slogan: 'O Menor Preço da Cidade',
      active: true,
      order: 2,
    },
    {
      id: 'logo-atacadao-central',
      name: 'Atacadão Central',
      cityState: 'Curitiba/PR',
      slogan: 'Preço de Atacado no Varejo',
      active: true,
      order: 3,
    },
    {
      id: 'logo-estrela-sul',
      name: 'Supermercado Estrela do Sul',
      cityState: 'Porto Alegre/RS',
      slogan: 'Tradição em Ofertas e Carnes',
      active: true,
      order: 4,
    },
    {
      id: 'logo-hiper-center',
      name: 'Hiper Center Varejo',
      cityState: 'São Paulo/SP',
      slogan: 'Variedade, Frescor e Economia',
      active: true,
      order: 5,
    },
    {
      id: 'logo-alianca',
      name: 'Supermercado Aliança',
      cityState: 'Goiânia/GO',
      slogan: 'Fazendo Parte da Sua Família',
      active: true,
      order: 6,
    },
    {
      id: 'logo-sao-jose',
      name: 'Empório São José',
      cityState: 'Rio de Janeiro/RJ',
      slogan: 'Padaria, Adega e Hortifrúti',
      active: true,
      order: 7,
    },
    {
      id: 'logo-brasil-mix',
      name: 'Atacarejo Brasil Mix',
      cityState: 'Fortaleza/CE',
      slogan: 'Varejo com Preço de Atacado',
      active: true,
      order: 8,
    },
  ]);

  useEffect(() => {
    api.getPublicSettings().then((res) => {
      if (res && res.commercialPlans && res.commercialPlans.length > 0) {
        setCommercialPlans(res.commercialPlans);
      }
      if (res && res.contactWhatsapp) {
        setPublicWhatsapp(res.contactWhatsapp);
      }
      if (res && res.contactEmail) {
        setPublicEmail(res.contactEmail);
      }
    }).catch(console.warn);

    api.getClientLogos().then((res) => {
      if (res && res.logos && res.logos.length > 0) {
        setClientLogos(res.logos);
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
      audioUrl: '/api/audio/aud-demo-1.mp3?v=eleven',
      durationSeconds: 28,
      script: 'Atenção clientes do Supermercado! Quarta da Carne com Alcatra Friboi por apenas trinta e seis reais e noventa centavos o quilo! Coxa e sobrecoxa Sadia só oito reais e noventa e nove centavos!',
    },
    {
      id: 'hortifruti',
      title: 'Festival de Hortifrúti — Tomate & Banana R$ 3,99 kg',
      sector: 'Hortifrúti Fresco',
      badge: '🍎 Feirinha do Dia',
      voiceName: 'Carolina (Vendedora Amigável)',
      audioUrl: '/api/audio/aud-demo-3.mp3?v=eleven',
      durationSeconds: 25,
      script: 'Tem feirinha fresca hoje no nosso supermercado! Banana-caturra selecionada por apenas três reais e noventa e nove centavos o quilo! Tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo!',
    },
    {
      id: 'churrasco',
      title: 'Super Fim de Semana — Picanha & Cerveja Heineken',
      sector: 'Churrasco & Bebidas',
      badge: '🍺 Queima de Estoque',
      voiceName: 'Rodrigo (Voz de Impacto Grave)',
      audioUrl: '/api/audio/aud-demo-2.mp3?v=eleven',
      durationSeconds: 38,
      script: 'O fim de semana chegou com tudo no Supermercado Alvorada! Picanha bovina fatiada grill por só cinquenta e nove reais e noventa centavos o quilo! Cerveja Heineken lata bem gelada, quatro reais e oitenta e nove centavos!',
    },
    {
      id: 'institucional',
      title: 'Clube de Vantagens — Ative seu CPF no Caixa',
      sector: 'Institucional & Loja',
      badge: '📢 Comunicado Loja',
      voiceName: 'Marcos (Institucional)',
      audioUrl: '/api/audio/voice_marcos-institucional.mp3?v=eleven',
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
      setCountdown(30);
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

  // Vitrine de Spots de Áudio Individuais (Vozes e textos exclusivos diferentes da rádio)
  const demoSpots = [
    {
      id: 'demo-padaria',
      title: 'Pão Quentinho & Fornada da Padaria',
      tag: 'Padaria & Confeitaria',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      voice: 'Mariana (Voz Jovem & Dinâmica)',
      duration: '16s',
      url: '/api/audio/aud-vitrine-padaria.mp3',
      text: 'Atenção clientes! Tem fornada fresquinha saindo agora na nossa padaria! Pão francês crocante quentinho a toda hora, além de bolos caseiros e salgados com preços especiais. Venha sentir esse aroma irresistível no setor de panificação!',
    },
    {
      id: 'demo-atacarejo',
      title: 'Queima de Estoque & Limpeza',
      tag: 'Mega Queima & Atacarejo',
      badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
      voice: 'Rodrigo (Voz de Impacto & Atacarejo)',
      duration: '20s',
      url: '/api/audio/aud-vitrine-atacarejo.mp3',
      text: 'Atenção: começou a grande queima de estoque em toda a mercearia e limpeza! Arroz cinco quilos, óleo de soja e sabão em pó com preços de atacado para você encher o carrinho e pagar muito menos! É por tempo limitado, aproveite!',
    },
    {
      id: 'demo-adega',
      title: 'Especial Adega & Vinhos Nobres',
      tag: 'Adega & Linha Gourmet',
      badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      voice: 'Will (Locução Premium & Gourmet)',
      duration: '16s',
      url: '/api/audio/aud-vitrine-adega.mp3',
      text: 'Aprecie os melhores momentos com a nossa seleção exclusiva de vinhos nacionais, importados e queijos nobres. Visite o nosso espaço gourmet e descubra rótulos selecionados com descontos especiais para harmonizar com o seu jantar de hoje.',
    },
    {
      id: 'demo-app',
      title: 'Baixe o App & Cupons no Caixa',
      tag: 'App & Clube Digital',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      voice: 'Roberta (Moderna & Comunicativa)',
      duration: '15s',
      url: '/api/audio/aud-vitrine-app.mp3',
      text: 'Você já baixou o aplicativo da nossa rede? Baixe agora no seu celular, ative os cupons de desconto exclusivos e receba ofertas direto no caixa. Economizar de verdade é simples, rápido e direto na tela do seu celular!',
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
    {
      q: 'Como funciona a questão do ECAD e dos Direitos Autorais na loja?',
      a: 'A plataforma SuperLocução Varejo IA fornece infraestrutura tecnológica de software e IA para criação de anúncios comerciais, contando com trilhas sonoras instrumentais de produção (Royalty-Free) com direitos de uso liberados para as locuções. A execução pública de música ambiente no espaço físico do estabelecimento comercial é de responsabilidade de cada lojista ou supermercado contratante, cabendo ao estabelecimento o enquadramento e eventual recolhimento junto ao ECAD quando aplicável ao seu espaço físico.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0e1118] text-zinc-100 selection:bg-orange-500 selection:text-white flex flex-col font-sans overflow-x-hidden">
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Identity */}
          <div
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition shrink-0">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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
              <p className="text-[11px] text-zinc-400 hidden sm:block max-w-[205px] truncate">
                Locução Comercial & Rádio Web
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-zinc-300">
            <button
              onClick={() => scrollToSection('radioweb')}
              className="hover:text-orange-400 transition cursor-pointer flex items-center gap-2 text-orange-400 bg-orange-500/10 border border-orange-500/25 px-3.5 py-1.5 rounded-full text-sm font-bold"
            >
              <Radio className="w-4 h-4 animate-pulse" />
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-bold text-zinc-300 hover:text-white bg-[#1a1d27] hover:bg-[#232734] border border-zinc-700/80 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Entrar</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="hidden sm:inline-flex px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black text-zinc-950 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-md shadow-orange-500/25 transition cursor-pointer items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-zinc-950 shrink-0" />
              <span>Testar Grátis</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              className="lg:hidden p-2 rounded-xl bg-[#1a1d27] hover:bg-[#232734] text-zinc-300 hover:text-white border border-zinc-700/80 transition cursor-pointer flex items-center justify-center shrink-0"
            >
              {mobileMenuOpen ? (
                <CloseIcon className="w-5 h-5 text-orange-400" />
              ) : (
                <Menu className="w-5 h-5 text-zinc-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#12141c]/98 border-t border-zinc-800/90 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('radioweb');
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-bold text-orange-400 bg-orange-500/10 border border-orange-500/25 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-orange-400 animate-pulse shrink-0" />
                  <span>Ouvir a Rádio Web</span>
                </div>
                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-500 text-zinc-950">
                  Ao Vivo
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('recursos');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer text-left"
              >
                <Sparkles className="w-5 h-5 text-orange-400 shrink-0" />
                <span>Recursos & IA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('amostras');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer text-left"
              >
                <Volume2 className="w-5 h-5 text-orange-400 shrink-0" />
                <span>Amostras de Voz dos Locutores</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('comparativo');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer text-left"
              >
                <TrendingUp className="w-5 h-5 text-orange-400 shrink-0" />
                <span>Comparativo de Custos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('planos');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer text-left"
              >
                <DollarSign className="w-5 h-5 text-orange-400 shrink-0" />
                <span>Planos & Preços</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection('duvidas');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer text-left"
              >
                <HelpCircle className="w-5 h-5 text-orange-400 shrink-0" />
                <span>Perguntas Frequentes (FAQ)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactSubject('Dúvidas sobre os Planos & Rádio Web');
                  setIsContactModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition cursor-pointer text-left"
              >
                <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Fale Conosco / Contato</span>
              </button>
            </nav>

            <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition cursor-pointer"
              >
                <UserPlus className="w-5 h-5 text-zinc-950 shrink-0" />
                <span>Testar Grátis com 50 Créditos</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Fixed Header Spacer */}
      <div className="h-16 sm:h-18 shrink-0 pointer-events-none" aria-hidden="true" />

      {/* ===================================================================== */}
      {/* 2. HERO SECTION                                                       */}
      {/* ===================================================================== */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-12 sm:pb-16 lg:pt-18 lg:pb-24">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs sm:text-xs font-bold shadow-sm max-w-full">
              <Sparkles className="w-4 h-4 text-orange-400 animate-pulse shrink-0" />
              <span className="leading-snug">Tecnologia de Inteligência Artificial para Varejo</span>
            </div>

            {/* Headline */}
            <h1 className="text-[28px] sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2] sm:leading-[1.15]">
              Locuções de Ofertas e{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                Rádio Web Ao Vivo
              </span>{' '}
              para o seu Supermercado
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl text-zinc-200 leading-relaxed font-normal max-w-2xl mx-auto">
              Transforme encartes e mensagens do WhatsApp em anúncios profissionais em 15 segundos. Transmita música ambiente contínua na sua loja com vinhetas automáticas e auto-ducking inteligente.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-2xl shadow-xl shadow-orange-500/25 transition flex items-center justify-center gap-2.5 text-base sm:text-base cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Criar Minha Locução Grátis</span>
                <ArrowRight className="w-5 h-5 text-zinc-950 shrink-0" />
              </button>

              <button
                onClick={() => scrollToSection('radioweb')}
                className="w-full sm:w-auto px-6 sm:px-7 py-4 sm:py-4 bg-[#181b24] hover:bg-[#222633] border border-orange-500/50 text-white font-bold rounded-2xl transition shadow-lg flex items-center justify-center gap-2 text-base sm:text-base cursor-pointer group"
              >
                <Radio className="w-5 h-5 text-orange-400 group-hover:animate-pulse shrink-0" />
                <span>Ouvir Demonstração da Rádio Real</span>
              </button>
            </div>

            {/* Quick Metrics Trust Bar */}
            <div className="pt-3 sm:pt-6 flex flex-wrap items-center justify-center gap-3.5 sm:gap-8 text-xs sm:text-xs font-bold text-zinc-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>50 Créditos Grátis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Preços por Extenso</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pronto em 15s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Rádio Web Deck Duplo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. SEÇÃO PRINCIPAL: DEMONSTRAÇÃO REAL DA RÁDIO WEB DA LOJA             */}
      {/* ===================================================================== */}
      <section id="radioweb" className="py-16 sm:py-24 bg-[#111318] border-y border-zinc-800 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-gradient-to-r from-orange-500/10 via-red-500/10 to-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
            <span className="text-xs sm:text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 inline-flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Demonstração Interativa em Tempo Real
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Experimente a Rádio Web da sua Loja em Ação
            </h2>
            <p className="text-base sm:text-base text-zinc-200 max-w-2xl mx-auto leading-relaxed">
              Ligue a rádio abaixo para ouvir a música ambiente da loja. Clique em <strong>"Disparar Oferta"</strong> para ver e ouvir a mágica do <strong>Auto-Ducking</strong>: a música abaixa suavemente sozinha e o locutor anuncia a promoção com clareza cristalina!
            </p>
          </div>

          {/* ================================================================= */}
          {/* THE REAL BROADCAST CONSOLE SIMULATOR                              */}
          {/* ================================================================= */}
          <div className="max-w-5xl mx-auto bg-[#181b24] rounded-3xl border border-zinc-700/80 shadow-2xl overflow-hidden">
            {/* Top Console Bar */}
            <div className="p-4 sm:p-7 border-b border-zinc-700/70 bg-[#161822] flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                    isRadioOnAir
                      ? 'bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 text-white shadow-xl shadow-red-600/30'
                      : 'bg-[#1f2330] border border-zinc-700 text-zinc-400'
                  }`}
                >
                  <Radio className={`w-6 h-6 sm:w-7 sm:h-7 ${isRadioOnAir ? 'animate-pulse' : ''}`} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
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
                      {isRadioOnAir ? 'NO AR • AO VIVO NA LOJA' : 'RÁDIO DESLIGADA'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-xs sm:text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                      🏪 Supermercado Modelo
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300">
                    {isRadioOnAir
                      ? 'Música ambiente ativa nas caixas com Auto-Ducking'
                      : 'Clique no botão abaixo para ligar a transmissão ao vivo'}
                  </p>
                </div>
              </div>

              {/* Main Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={toggleRadioOnAir}
                  className={`w-full sm:w-auto px-5 sm:px-5 py-3.5 sm:py-3 rounded-2xl font-black text-sm sm:text-sm flex items-center justify-center gap-2 shadow-xl transition cursor-pointer text-center ${
                    isRadioOnAir
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600'
                      : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:from-orange-400 hover:to-amber-400 text-zinc-950 shadow-orange-500/30 hover:scale-[1.02]'
                  }`}
                >
                  {isRadioOnAir ? (
                    <>
                      <Pause className="w-4 h-4 fill-current shrink-0" />
                      <span>PAUSAR RÁDIO</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current shrink-0" />
                      <span>LIGAR RÁDIO DA LOJA AO VIVO</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => triggerRadioSpot()}
                    disabled={isSpotSpeaking}
                    className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-[#242938] hover:bg-[#2d3447] disabled:opacity-50 text-orange-300 hover:text-white border border-orange-500/40 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md text-center"
                    title="Disparar a locução imediatamente e ouvir a música abaixar de volume"
                  >
                    <Zap className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Disparar Oferta</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerChime}
                    className="px-4 py-3 rounded-2xl bg-[#1f2330] hover:bg-[#282f42] text-amber-300 border border-zinc-700/80 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                    title="Tocar gongo clássico de chamada de loja (Ding-Dong)"
                  >
                    <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Ding-Dong</span>
                  </button>
                </div>
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
                      <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                        Deck 1 • Música da Loja
                      </span>
                      <span className="text-xs sm:text-sm text-emerald-400 font-bold">
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
                      <p className="text-base font-bold text-white">Manhã de Compras & Ofertas</p>
                      <p className="text-xs sm:text-sm text-zinc-300">Pop Varejo Hit Alegre • 124 BPM</p>
                    </div>
                    <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Instrumental
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs sm:text-sm text-zinc-300">
                    <span>Nivelador Inteligente:</span>
                    <span className="text-emerald-400 font-bold">Ativo (+8.0 dB)</span>
                  </div>
                </div>

                <div className="p-3 bg-[#141620] rounded-xl border border-zinc-700/70 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-zinc-300">Volume Ambiente:</span>
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
                      <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-orange-300/80 block">
                        Deck 2 • Locutor de Ofertas & Comunicados
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white">
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
                    className="px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-zinc-950 text-xs sm:text-sm font-black flex items-center gap-1.5 transition cursor-pointer"
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
                        <span className="px-2 py-0.5 rounded text-xs font-black uppercase bg-orange-500 text-zinc-950">
                          {isSpotSpeaking ? (
                            <>
                              <span className="sm:hidden">NO AR</span>
                              <span className="hidden sm:inline">FALANDO AGORA</span>
                            </>
                          ) : (
                            <>
                              <span className="sm:hidden">PRÓXIMA</span>
                              <span className="hidden sm:inline">PRÓXIMA NA GRADE</span>
                            </>
                          )}
                        </span>
                        <span className="text-xs text-zinc-300">{currentOffer.sector}</span>
                      </div>
                      <h4 className="text-base sm:text-base font-bold text-white truncate">
                        {currentOffer.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-orange-200/90">
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
                      <div className="flex justify-between text-xs text-orange-300 font-mono">
                        <span>{Math.floor(spotCurrentTime)}s</span>
                        <span>{Math.floor(spotDuration)}s</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Offer Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-zinc-300">
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
                        className={`p-2.5 rounded-xl text-left border text-xs sm:text-sm font-semibold transition cursor-pointer flex flex-col justify-between min-h-[4.75rem] ${
                          activeSpotIndex === idx
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                            : 'bg-[#141620] hover:bg-zinc-800 text-zinc-300 border-zinc-700/80'
                        }`}
                      >
                        <span className="font-bold text-xs leading-snug line-clamp-2">{offer.badge}</span>
                        <span className="text-[11px] text-zinc-400 mt-1">{offer.durationSeconds}s</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Educational Live Explanation Bar */}
            <div className="p-4 sm:p-5 bg-[#141620] border-t border-zinc-700/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-200">
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
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-xl text-xs sm:text-sm whitespace-nowrap cursor-pointer shrink-0 shadow-md text-center"
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
            <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full">
              Poder Total no Ponto de Venda
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Tudo o que seu supermercado precisa para vender mais
            </h2>
            <p className="text-base sm:text-base text-zinc-300">
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
                <h3 className="font-bold text-lg sm:text-xl text-white">Estúdio com IA de Varejo</h3>
                <p className="text-sm sm:text-sm text-zinc-300 leading-relaxed">
                  Basta colar sua lista de ofertas copiada do encarte ou WhatsApp. A IA monta um roteiro persuasivo e converte números em leitura falada impecável.
                </p>
              </div>
              <ul className="text-xs sm:text-sm text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-1.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Roteiros de açougue, hortifrúti e padaria
                </li>
                <li className="flex items-center gap-1.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Geração em lote (1 áudio por produto)
                </li>
              </ul>
            </div>

            {/* Card 2: Rádio Web Deck Duplo */}
            <div className="bg-[#181b24] p-6 rounded-2xl border border-orange-500/40 transition-all shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-xl bg-orange-500 text-zinc-950 font-black text-xs uppercase">
                Exclusivo
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-white">Rádio Web da Loja</h3>
                <p className="text-sm sm:text-sm text-zinc-300 leading-relaxed">
                  Sistema de transmissão ao vivo com Deck Duplo: música ambiente contínua com Auto-Ducking automático (o volume abaixa sozinho na hora da oferta).
                </p>
              </div>
              <ul className="text-xs sm:text-sm text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-1.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Playlists comerciais por tema (Pop, Acústico, Sertanejo)
                </li>
                <li className="flex items-center gap-1.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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
                <h3 className="font-bold text-lg sm:text-xl text-white">Mesa de Efeitos & Avisos</h3>
                <p className="text-sm sm:text-sm text-zinc-300 leading-relaxed">
                  Dispare o clássico gongo "Ding-Dong", sirenes de oferta relâmpago, avisos de placas de carro no estacionamento e comunicados de fechamento da loja.
                </p>
              </div>
              <ul className="text-xs sm:text-sm text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-1.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Gongo tradicional de supermercado
                </li>
                <li className="flex items-center gap-1.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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
                <h3 className="font-bold text-lg sm:text-xl text-white">15 Vinhetas da Loja</h3>
                <p className="text-sm sm:text-sm text-zinc-300 leading-relaxed">
                  Modelos prontos de vinhetas institucionais e carimbos curtos de 5 segundos que colocam o nome do seu supermercado em destaque sonoro.
                </p>
              </div>
              <ul className="text-xs sm:text-sm text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-1.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Personalizadas com o nome da sua loja
                </li>
                <li className="flex items-center gap-1.5 text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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
            <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full">
              Qualidade Sonora Profissional
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Ouça amostras reais de Locuções Comerciais
            </h2>
            <p className="text-base sm:text-base text-zinc-300">
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
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${spot.badgeColor}`}
                    >
                      {spot.tag}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {spot.duration}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-lg sm:text-lg mb-1">{spot.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mb-3">Locutor: {spot.voice}</p>

                  <p className="text-sm text-zinc-200 italic bg-[#12141c] p-3.5 rounded-xl border border-zinc-700/60 leading-relaxed">
                    "{spot.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => handleTogglePlay(spot.id, spot.url)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md"
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
            <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full">
              Economia e Velocidade
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Locutor Tradicional vs. SuperLocução Varejo IA
            </h2>
            <p className="text-base sm:text-base text-zinc-300">
              Veja por que supermercados de todo o Brasil estão migrando para a nossa solução.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-[#181b24] rounded-3xl border border-zinc-700/80 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="grid grid-cols-3 bg-[#141620] p-4 text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-zinc-800 text-zinc-300">
                  <div>Critério</div>
                  <div className="text-center text-zinc-400">Locutor Tradicional</div>
                  <div className="text-center text-orange-400 font-black">SuperLocução Varejo IA</div>
                </div>

                <div className="divide-y divide-zinc-800 text-sm sm:text-sm">
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
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. PLANOS & PREÇOS                                                    */}
      {/* ===================================================================== */}
      <section id="planos" className="py-20 bg-[#0e1118]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full">
              Transparência Total
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Planos dimensionados para o porte da sua loja
            </h2>
            <p className="text-base sm:text-base text-zinc-300">
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
                      ? 'bg-gradient-to-b from-[#1e222e] to-[#181b24] border-2 border-orange-500 shadow-2xl md:scale-[1.02]'
                      : 'bg-[#181b24] border border-zinc-700/80 hover:border-zinc-600'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 text-xs font-black rounded-full uppercase tracking-wider shadow">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    {plan.tag && (
                      <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isHigh ? 'text-orange-400' : 'text-zinc-400'}`}>
                        {plan.tag}
                      </span>
                    )}
                    <h3 className="text-2xl sm:text-3xl font-black text-white">{plan.name}</h3>
                    <p className={`text-sm ${isHigh ? 'text-zinc-200' : 'text-zinc-300'}`}>
                      {plan.subtitle}
                    </p>
                    <div className="pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">R$ {Number(plan.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-xs sm:text-sm text-zinc-400 ml-1">{plan.billingPeriod}</span>
                      </div>
                      {Number(plan.price || 0) > 0 ? (
                        <p className="text-xs text-orange-400 font-bold mt-1.5 tracking-wide">
                          Apenas R$ {(Number(plan.price || 0) / 30).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por dia
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-400 font-medium mt-1.5 tracking-wide">
                          100% gratuito para começar
                        </p>
                      )}
                    </div>

                    <ul className={`space-y-3 text-sm pt-4 border-t border-zinc-800 ${isHigh ? 'text-zinc-100' : 'text-zinc-200'}`}>
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2.5">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${isHigh ? 'text-orange-400' : 'text-emerald-400'}`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={onOpenRegister}
                    className={`w-full py-4 font-black rounded-xl text-sm sm:text-base transition cursor-pointer shadow-lg ${
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
            <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full">
              Depoimentos Reais
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
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
              <p className="text-sm sm:text-base text-zinc-200 italic leading-relaxed">
                “Antes a gente pagava R$ 80 por áudio e demorava 2 dias para o locutor entregar. Hoje eu monto a oferta da quarta-feira em 1 minuto na abertura da loja. O açougue vendeu 30% a mais.”
              </p>
              <div className="pt-2 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-black text-orange-400 text-sm">
                  CM
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Carlos Mendes</div>
                  <div className="text-xs text-zinc-300">Supermercado Alvorada • Campinas/SP</div>
                </div>
              </div>
            </div>

            <div className="bg-[#181b24] p-6 rounded-2xl border border-zinc-700/80 space-y-4 shadow-md">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-zinc-200 italic leading-relaxed">
                “A Rádio Web da loja é sensacional! A música fica tocando o dia todo e abaixa sozinha quando solta a oferta. Os clientes elogiaram o clima da loja que ficou muito mais profissional.”
              </p>
              <div className="pt-2 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-sm">
                  JC
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Juliana Castro</div>
                  <div className="text-xs text-zinc-300">Atacadão Central • Curitiba/PR</div>
                </div>
              </div>
            </div>

            <div className="bg-[#181b24] p-6 rounded-2xl border border-zinc-700/80 space-y-4 shadow-md">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-zinc-200 italic leading-relaxed">
                “Muito simples de usar. Copio o encarte do WhatsApp, colo na plataforma e em 15 segundos o áudio já está tocando nas caixas do mercado. Não troco por nada.”
              </p>
              <div className="pt-2 border-t border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-sm">
                  RS
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Roberto Souza</div>
                  <div className="text-xs text-zinc-300">Rede Bom Preço • Belo Horizonte/MG</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8.5. CARROSSEL DE LOGOS DE SUPERMERCADOS CLIENTES (FULL-WIDTH)       */}
      {/* ===================================================================== */}
      <section className="w-full bg-[#0a0d14] border-y border-zinc-800/80 py-10 sm:py-12 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Store className="w-3.5 h-3.5 text-orange-400" />
            <span>Supermercados que Confiam</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Redes e Supermercados que Usam o SuperLocução
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto mt-1.5">
            Mais de 500+ lojas ativas aumentando as vendas no ponto de venda com locução IA diária e rádio web profissional no ar.
          </p>
        </div>

        {/* Faixa Horizontal de Ponta a Ponta com Efeito Carrossel Infinito */}
        <div className="relative w-full overflow-hidden">
          {/* Sombras suaves nas laterais para transição elegante */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-r from-[#0a0d14] via-[#0a0d14]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-l from-[#0a0d14] via-[#0a0d14]/80 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-logos flex items-center gap-4 py-2">
            {[...clientLogos, ...clientLogos].map((logo, idx) => (
              <div
                key={`${logo.id}-${idx}`}
                className="bg-[#121522]/90 hover:bg-[#181c2e] border border-zinc-800 hover:border-orange-500/50 rounded-2xl px-5 py-3.5 flex items-center gap-4 transition-all duration-300 shadow-lg shadow-black/40 shrink-0 min-w-[270px] max-w-[340px] group cursor-default"
                title={logo.slogan ? `${logo.name} — "${logo.slogan}"` : logo.name}
              >
                {/* Logo Imagem Real ou Emblema Vetorial de Varejo */}
                {logo.imageUrl ? (
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-zinc-700/60 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={logo.imageUrl}
                      alt={logo.name}
                      className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-orange-600/30 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-105 group-hover:border-orange-400 transition duration-300 shadow-sm">
                    <Store className="w-5 h-5 text-orange-400" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <span className="font-bold text-sm text-white group-hover:text-orange-400 transition truncate block leading-snug">
                    {logo.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-400 truncate">
                    {logo.slogan ? (
                      <span className="truncate italic text-zinc-300/90 text-[11px]">“{logo.slogan}”</span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold">Cliente Verificado</span>
                    )}
                    {logo.cityState && (
                      <span className="text-[10px] text-zinc-500 shrink-0 font-medium">• {logo.cityState}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 9. FAQ DE PERGUNTAS FREQUENTES                                        */}
      {/* ===================================================================== */}
      <section id="duvidas" className="py-20 bg-[#0e1118]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs sm:text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full">
              Tire Suas Dúvidas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas Frequentes</h2>
            <p className="text-base text-zinc-300">
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
                    className="w-full p-5 text-left font-bold text-white text-base sm:text-base flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/40 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-orange-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-zinc-200 leading-relaxed border-t border-zinc-800/60">
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
                <span className="font-black text-xl text-white">
                  Super<span className="text-orange-500">Locução</span>
                </span>
                <span className="text-xs font-bold uppercase ml-2 px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  Varejo IA
                </span>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                  A solução completa de locução e rádio web para o comércio varejista.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setContactSubject('Contato pelo Rodapé do Site');
                  setIsContactModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm font-bold text-zinc-300 hover:text-white bg-[#181b24] hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fale Conosco</span>
              </button>
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm font-bold text-zinc-300 hover:text-white bg-[#181b24] hover:bg-zinc-800 border border-zinc-700/80 transition cursor-pointer text-center"
              >
                Entrar no Painel
              </button>
              <button
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-black text-zinc-950 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 transition cursor-pointer text-center"
              >
                Criar Conta Grátis
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-850 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 gap-4 text-center md:text-left">
            <div className="space-y-1">
              <p>© {new Date().getFullYear()} SuperLocução Varejo IA. Todos os direitos reservados.</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed md:max-w-2xl">
                A plataforma fornece tecnologia SaaS para automação de locuções e rádio web comercial.<br className="hidden md:block" />
                A execução pública musical no espaço físico é de responsabilidade<br className="hidden md:block" />
                do estabelecimento comercial contratante (Lei 9.610/98).
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLegalModalTab('terms');
                  setIsLegalModalOpen(true);
                }}
                className="text-zinc-400 hover:text-orange-400 transition cursor-pointer underline underline-offset-4"
              >
                Termos de Uso & Responsabilidades
              </button>
              <span className="text-zinc-600">•</span>
              <button
                type="button"
                onClick={() => {
                  setLegalModalTab('privacy');
                  setIsLegalModalOpen(true);
                }}
                className="text-zinc-400 hover:text-orange-400 transition cursor-pointer underline underline-offset-4"
              >
                Políticas de Privacidade (LGPD)
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal & Privacy Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* Floating WhatsApp / Contact Button */}
      <button
        type="button"
        onClick={() => {
          setContactSubject('Contato via Botão Flutuante do Site');
          setIsContactModalOpen(true);
        }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs sm:text-sm shadow-2xl shadow-emerald-500/40 border border-emerald-300/40 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
        title="Fale Conosco no WhatsApp"
        aria-label="Fale Conosco"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-950 fill-current" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
        </div>
        <span className="tracking-tight">Fale Conosco</span>
      </button>

      {/* Floating Scroll to Top Button (Stacked above contact button) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-18 sm:bottom-22 right-4 sm:right-6 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-zinc-900/95 hover:bg-zinc-800 text-orange-400 border border-zinc-700 shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
          title="Voltar ao início da página"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-4 h-4 text-orange-400 stroke-[3]" />
        </button>
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        defaultSubject={contactSubject}
        configuredWhatsapp={publicWhatsapp}
        configuredEmail={publicEmail}
      />
    </div>
  );
};
