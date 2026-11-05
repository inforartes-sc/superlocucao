import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { downloadAudioMp3 } from '../utils/downloadAudio.ts';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDownloadDemo = async (url: string, id: string, name: string) => {
    setDownloadingAudioId(id);
    await downloadAudioMp3(url, `${name}.mp3`, () => {});
    setTimeout(() => setDownloadingAudioId(null), 1200);
  };

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
      url: '/api/samples/style/natural_amigavel.mp3',
      text: 'Tem feirinha fresca hoje no nosso supermercado! Banana-caturra selecionada por apenas três reais e noventa e nove centavos o quilo! Tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo!',
    },
    {
      id: 'demo-institucional',
      title: 'Comunicado Clube de Descontos',
      tag: 'Clube & Fidelidade',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      voice: 'Marcos (Institucional & Sóbrio)',
      duration: '22s',
      url: '/api/samples/style/elegante_institucional.mp3',
      text: 'Você já é cadastrado no nosso Clube de Vantagens? Informe seu CPF no caixa para ativar ofertas exclusivas direto no leitor. Cadastre-se gratuitamente no balcão de atendimento.',
    },
  ];

  const handleTogglePlay = (id: string, url: string) => {
    if (playingAudioId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(console.warn);
      }
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Como coloco as locuções para tocar no meu supermercado?',
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
      a: 'Não! Ao criar sua conta você recebe 500 créditos gratuitos imediatamente de boas-vindas para criar roteiros, gerar anúncios com voz profissional e testar na prática a qualidade dentro da sua loja.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0e1118] text-zinc-100 selection:bg-orange-500 selection:text-white flex flex-col font-sans">
      <audio ref={audioRef} onEnded={() => setPlayingAudioId(null)} />

      {/* ===================================================================== */}
      {/* 1. TOP COMMERCIAL STICKY HEADER                                       */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-50 bg-[#12141c]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-lg">
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
              onClick={() => scrollToSection('radioweb')}
              className="hover:text-orange-400 transition cursor-pointer flex items-center gap-1 text-orange-400"
            >
              <Radio className="w-3.5 h-3.5" />
              Rádio Web da Loja
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
            <button
              onClick={() => scrollToSection('duvidas')}
              className="hover:text-orange-400 transition cursor-pointer"
            >
              Dúvidas
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

      {/* ===================================================================== */}
      {/* 2. HERO SECTION                                                       */}
      {/* ===================================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
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
                <span>Criar Locução Grátis Agora</span>
                <ArrowRight className="w-5 h-5 text-zinc-950" />
              </button>

              <button
                onClick={() => scrollToSection('amostras')}
                className="w-full sm:w-auto px-7 py-4 bg-[#181b24] hover:bg-[#222633] border border-zinc-700/80 text-zinc-200 hover:text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <Play className="w-4 h-4 text-orange-400 fill-current" />
                <span>Ouvir Demonstração</span>
              </button>
            </div>

            {/* Quick Metrics Trust Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs font-bold text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>500 Créditos de Boas-Vindas</span>
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

          {/* ================================================================= */}
          {/* INTERACTIVE LIVE TRANSFORMATION DEMO CARD                         */}
          {/* ================================================================= */}
          <div className="mt-14 max-w-5xl mx-auto bg-[#181b24] rounded-3xl border border-zinc-700/80 shadow-2xl p-5 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-stretch gap-6">
              {/* Left Column: Raw Supermarket Text Input */}
              <div className="flex-1 bg-[#12141c] rounded-2xl p-5 border border-zinc-700/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Entrada: Sua lista de ofertas
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
                      WhatsApp ou Encarte
                    </span>
                  </div>
                  <div className="bg-[#181b24] rounded-xl p-3.5 border border-zinc-700/70 font-mono text-xs text-zinc-300 leading-relaxed shadow-inner space-y-1">
                    <p className="text-orange-400 font-bold">// Cole seus produtos assim:</p>
                    <p>Arroz Primavera 5kg — R$ 24,90</p>
                    <p>Leite Integral Italac 1L — R$ 4,49</p>
                    <p>Alcatra Friboi com Maminha — R$ 36,90 kg</p>
                    <p>Cerveja Heineken Lata 350ml — R$ 4,89</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>A IA identifica produtos, marcas, embalagens e preços automaticamente.</span>
                </div>
              </div>

              {/* Center arrow indicator */}
              <div className="hidden md:flex flex-col items-center justify-center text-orange-400">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>

              {/* Right Column: Audio Commercial Result */}
              <div className="flex-1 bg-gradient-to-br from-[#1e222e] to-[#161822] text-white rounded-2xl p-5 border border-orange-500/30 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-300">
                      Resultado: Locução Comercial Finalizada
                    </span>
                    <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Pronto para Tocar
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-200 italic leading-relaxed bg-[#12141c]/80 p-3.5 rounded-xl border border-zinc-700/60 mb-4">
                    “Atenção clientes do supermercado! Ofertas imperdíveis preparadas para você: Arroz Primavera pacote de cinco quilos por apenas vinte e quatro reais e noventa centavos! Alcatra Friboi no açougue, trinta e seis e noventa o quilo! E cerveja Heineken lata geladinha só quatro e oitenta e nove! Aproveite!”
                  </p>
                </div>

                {/* Built-in Live Player for Demo */}
                <div className="bg-[#141620] rounded-xl p-3 border border-zinc-700/80 flex items-center justify-between gap-3 shadow-sm">
                  <button
                    onClick={() => handleTogglePlay('hero-demo', '/api/audio/aud-hero-demo.mp3')}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 flex items-center justify-center shrink-0 transition shadow-md cursor-pointer"
                    title={playingAudioId === 'hero-demo' ? 'Pausar' : 'Ouvir demonstração'}
                  >
                    {playingAudioId === 'hero-demo' ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      Demonstração da Locução em Loja
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                      <span>Voz: Daniel (Varejo)</span>
                      <span>•</span>
                      <span>Trilha Varejo Alegre</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleDownloadDemo(
                        '/api/audio/aud-hero-demo.mp3',
                        'hero-demo',
                        'locucao-supermercado-demonstracao'
                      )
                    }
                    disabled={downloadingAudioId === 'hero-demo'}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                  >
                    {downloadingAudioId === 'hero-demo' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                        <span>Baixando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-orange-400" />
                        <span>Baixar MP3</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. RECURSOS EXCLUSIVOS PARA SUPERMERCADOS                             */}
      {/* ===================================================================== */}
      <section id="recursos" className="py-20 bg-[#12141c] border-y border-zinc-800/80">
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
      {/* 4. VITRINE DE AMOSTRAS DE VOZ                                         */}
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
      {/* 5. SEÇÃO RÁDIO WEB DA LOJA                                            */}
      {/* ===================================================================== */}
      <section id="radioweb" className="py-20 bg-[#12141c] border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#181b24] to-[#141620] rounded-3xl border border-orange-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Rádio Web de Supermercado
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  Sua loja com música comercial profissional 24h e ofertas no momento exato
                </h2>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  Esqueça rádios FM convencionais com anúncios de concorrentes ou playlists de streaming que cortam músicas. Nossa Rádio Web foi desenvolvida exclusivamente para caixas de som de supermercados.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#12141c] p-3.5 rounded-xl border border-zinc-700/70 text-xs">
                    <span className="font-bold text-white block mb-1">🔉 Auto-Ducking Automático</span>
                    <span className="text-zinc-400">A música abaixa o volume sozinha quando a voz da oferta entra.</span>
                  </div>
                  <div className="bg-[#12141c] p-3.5 rounded-xl border border-zinc-700/70 text-xs">
                    <span className="font-bold text-white block mb-1">📅 Grade por Dia da Semana</span>
                    <span className="text-zinc-400">Ofertas de quarta não tocam na sexta. Programação automática.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onOpenRegister}
                    className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-xl text-sm shadow-lg shadow-orange-500/20 transition cursor-pointer"
                  >
                    Ativar Rádio Web na Minha Loja
                  </button>
                </div>
              </div>

              {/* Graphic console mock */}
              <div className="lg:col-span-5 bg-[#12141c] rounded-2xl p-5 border border-zinc-700/80 space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-orange-400" />
                    Monitor da Rádio
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500 text-white animate-pulse">
                    NO AR
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Deck 1 Mock */}
                  <div className="p-3 bg-[#181b24] rounded-xl border border-zinc-700/70 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      Deck 1 • Música da Loja
                    </div>
                    <div className="text-xs font-bold text-white">Manhã de Compras & Ofertas</div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-3/4 rounded-full" />
                    </div>
                  </div>

                  {/* Deck 2 Mock */}
                  <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/40 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-orange-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      Deck 2 • Locução Falando Agora
                    </div>
                    <div className="text-xs font-bold text-orange-200">Quarta da Carne — Alcatra Friboi</div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-1/2 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. COMPARATIVO (LOCUTOR TRADICIONAL VS SUPERLOCUÇÃO)                  */}
      {/* ===================================================================== */}
      <section id="comparativo" className="py-20 bg-[#0e1118]">
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
      <section id="planos" className="py-20 bg-[#12141c] border-y border-zinc-800/80">
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
            {/* Card 1: Degustação */}
            <div className="bg-[#181b24] rounded-3xl p-6 sm:p-8 border border-zinc-700/80 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Teste Inicial
                </span>
                <h3 className="text-2xl font-black text-white">Degustação</h3>
                <p className="text-xs text-zinc-400">
                  Perfeito para você experimentar a qualidade na prática na sua loja.
                </p>
                <div className="pt-2">
                  <span className="text-4xl font-black text-white">R$ 0</span>
                  <span className="text-xs text-zinc-400 ml-1">grátis</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <strong>500 créditos</strong> de boas-vindas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Acesso a todas as 5 vozes de varejo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Downloads imediatos em MP3
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Acesso à Rádio Web no navegador
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenRegister}
                className="w-full py-3.5 bg-[#242938] hover:bg-[#2d3447] text-white border border-zinc-700/80 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer"
              >
                Começar Grátis
              </button>
            </div>

            {/* Card 2: Pro Varejo (Popular) */}
            <div className="bg-gradient-to-b from-[#1e222e] to-[#181b24] rounded-3xl p-6 sm:p-8 border-2 border-orange-500 shadow-2xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 text-[11px] font-black rounded-full uppercase tracking-wider shadow">
                Mais Escolhido
              </div>

              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                  Supermercados
                </span>
                <h3 className="text-2xl font-black text-white">Pro Varejo</h3>
                <p className="text-xs text-zinc-300">
                  Ideal para mercados que trocam encartes e ofertas de açougue e hortifrúti todo dia.
                </p>
                <div className="pt-2">
                  <span className="text-4xl font-black text-white">R$ 89</span>
                  <span className="text-xs text-zinc-400 ml-1">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-200 pt-4 border-t border-zinc-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    <strong>1.500 créditos</strong> mensais renovados
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    Geração em lote com download em arquivo ZIP
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    Rádio Web contínua com Auto-Ducking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    15 vinhetas personalizadas com o nome da loja
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    Suporte prioritário via WhatsApp
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenRegister}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition cursor-pointer"
              >
                Assinar Pro Varejo
              </button>
            </div>

            {/* Card 3: Redes & Atacarejo */}
            <div className="bg-[#181b24] rounded-3xl p-6 sm:p-8 border border-zinc-700/80 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Redes & Filiais
                </span>
                <h3 className="text-2xl font-black text-white">Redes & Atacarejo</h3>
                <p className="text-xs text-zinc-400">
                  Para redes com múltiplas filiais ou grande volume diário de queimas de estoque.
                </p>
                <div className="pt-2">
                  <span className="text-4xl font-black text-white">R$ 199</span>
                  <span className="text-xs text-zinc-400 ml-1">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <strong>5.000 créditos</strong> mensais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Múltiplas lojas e filiais gerenciadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Clonagem de voz personalizada da marca
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Gerente de conta e suporte dedicado
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenRegister}
                className="w-full py-3.5 bg-[#242938] hover:bg-[#2d3447] text-white border border-zinc-700/80 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer"
              >
                Falar com Consultor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 8. DEPOIMENTOS                                                        */}
      {/* ===================================================================== */}
      <section className="py-20 bg-[#0e1118]">
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
      <section id="duvidas" className="py-20 bg-[#12141c] border-t border-zinc-800/80">
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
    </div>
  );
};
