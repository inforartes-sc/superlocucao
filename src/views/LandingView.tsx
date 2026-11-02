import React, { useState } from 'react';
import {
  Radio, Sparkles, ArrowRight, Play, Pause, Download, CheckCircle2,
  Loader2
} from 'lucide-react';
import { downloadAudioMp3 } from '../utils/downloadAudio.ts';

interface LandingViewProps {
  onStartCreating: () => void;
  onNavigate: (view: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartCreating, onNavigate }) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [downloadingAudioId, setDownloadingAudioId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleDownloadDemo = async (url: string, id: string, name: string) => {
    setDownloadingAudioId(id);
    await downloadAudioMp3(url, `${name}.mp3`, () => {});
    setTimeout(() => setDownloadingAudioId(null), 1200);
  };

  const demoSpots = [
    {
      id: 'demo-carne',
      title: 'Quarta da Carne & Açougue',
      tag: 'Carnes & Açougue',
      voice: 'Daniel (Varejo Enérgico)',
      duration: '28s',
      url: '/api/audio/aud-demo-1.mp3',
      text: 'Atenção clientes do Supermercado! Quarta da Carne com Alcatra Friboi por apenas trinta e seis reais e noventa centavos o quilo! Coxa e sobrecoxa Sadia só oito reais e noventa e nove centavos!',
    },
    {
      id: 'demo-fim-semana',
      title: 'Super Fim de Semana de Ofertas',
      tag: 'Churrasco & Bebidas',
      voice: 'Rodrigo (Voz de Impacto)',
      duration: '38s',
      url: '/api/audio/aud-demo-2.mp3',
      text: 'O fim de semana chegou com tudo no Supermercado Alvorada! Picanha bovina fatiada grill por só cinquenta e nove reais e noventa centavos o quilo! Cerveja Heineken lata bem gelada, quatro reais e oitenta e nove centavos!',
    },
    {
      id: 'demo-hortifruti',
      title: 'Festival de Hortifrúti & Feirinha',
      tag: 'Hortifrúti & Padaria',
      voice: 'Carolina (Vendedora Amigável)',
      duration: '25s',
      url: '/api/samples/style/natural_amigavel.mp3',
      text: 'Tem feirinha fresca hoje no nosso supermercado! Banana-caturra selecionada por apenas três reais e noventa e nove centavos o quilo! Tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo!',
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

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudioId(null)}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/40 via-transparent to-transparent -z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Inteligência Artificial & Vozes Profissionais para Supermercados</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#142B4A] tracking-tight leading-[1.12]">
              Transforme suas ofertas em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                locuções de supermercado
              </span>{' '}
              com inteligência artificial
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Cadastre seus produtos, gere anúncios comerciais com voz natural em português brasileiro e baixe seus áudios em MP3, prontos para tocar no sistema de som do seu supermercado.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartCreating}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition flex items-center justify-center gap-2 text-base cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Criar minha locução agora</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-2xl transition shadow-xs flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <span>Acessar Dashboard Demo</span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sem necessidade de locutor físico</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Download imediato em MP3</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pronúncia correta de preços e marcas</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Transformation Demo Card */}
          <div className="mt-14 max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-stretch gap-6">
              {/* Left Column: Raw Supermarket List */}
              <div className="flex-1 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Entrada: Sua lista de ofertas
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      WhatsApp ou Planilha
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 font-mono text-xs text-slate-700 leading-relaxed shadow-2xs space-y-1.5">
                    <p className="text-blue-600 font-semibold">// Cole sua lista assim:</p>
                    <p>Arroz Primavera 5kg — R$ 24,99</p>
                    <p>Leite Integral Italac 1L — R$ 4,49</p>
                    <p>Alcatra com Maminha Friboi — R$ 36,90/kg</p>
                    <p>Banana-caturra fresca — R$ 3,99/kg</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>A IA identifica produtos, marcas, embalagens e preços automaticamente.</span>
                </div>
              </div>

              {/* Center arrow indicator */}
              <div className="hidden md:flex flex-col items-center justify-center text-blue-600">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Right Column: Audio Commercial Result */}
              <div className="flex-1 bg-gradient-to-br from-[#142B4A] to-[#1E3A8A] text-white rounded-2xl p-5 flex flex-col justify-between shadow-inner">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      Resultado: Locução Comercial de Supermercado
                    </span>
                    <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      Pronto em 15 segundos
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10 mb-4">
                    “Atenção clientes! Temos uma oferta especial esperando por você! Arroz Primavera pacote de cinco quilos por apenas vinte e quatro reais e noventa e nove centavos! E leite Italac por só quatro reais e quarenta e nove centavos o litro! Corra e aproveite!”
                  </p>
                </div>

                {/* Built-in Live Player for Demo */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleTogglePlay('hero-demo', '/api/audio/aud-hero-demo.mp3')}
                    className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center shrink-0 transition shadow cursor-pointer"
                  >
                    {playingAudioId === 'hero-demo' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      Demonstração da Locução em Loja
                    </div>
                    <div className="text-[11px] text-blue-200 flex items-center gap-2">
                      <span>Voz: Dany Varejo (Voz Real)</span>
                      <span>•</span>
                      <span>MP3 44.1kHz</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadDemo('/api/audio/aud-hero-demo.mp3', 'hero-demo', 'locucao-super-demonstracao')}
                    disabled={downloadingAudioId === 'hero-demo'}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-75"
                  >
                    {downloadingAudioId === 'hero-demo' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Baixando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
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

      {/* Audio Showcase Samples Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-[#142B4A]">
              Ouça amostras de Locuções para Supermercados
            </h2>
            <p className="mt-3 text-slate-600">
              Vozes com sotaque brasileiro natural, cadência profissional e tom perfeito para ofertas do dia, açougue, hortifrúti e encartes semanais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoSpots.map((spot) => (
              <div
                key={spot.id}
                className="bg-[#F5F7FB] rounded-2xl p-5 border border-slate-200 hover:border-blue-400 transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {spot.tag}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{spot.duration}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{spot.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">Locutor: {spot.voice}</p>
                  <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200/80 mb-4 line-clamp-3">
                    "{spot.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleTogglePlay(spot.id, spot.url)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    {playingAudioId === spot.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{playingAudioId === spot.id ? 'Pausar' : 'Ouvir Locução'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadDemo(spot.url, spot.id, `locucao-${spot.id}`)}
                    disabled={downloadingAudioId === spot.id}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition cursor-pointer"
                    title="Baixar MP3"
                  >
                    {downloadingAudioId === spot.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
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

      {/* How it works in 3 steps */}
      <section className="py-20 bg-[#F5F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Simples e rápido</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B4A] mt-2">
              Como funciona em 3 passos
            </h2>
            <p className="mt-3 text-slate-600">
              Crie spots comerciais de rádio interna para o seu supermercado sem complexidade e sem depender de ninguém.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-xl flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cadastre seus produtos</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Digite os itens ou simplesmente cole a lista copiada do seu WhatsApp, planilha ou sistema de estoque. A IA organiza tudo em segundos.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold text-xl flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">A IA cria o roteiro</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                O modelo de linguagem gera um texto comercial natural, adaptando os preços para leitura falada e aplicando o tom ideal de supermercado.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold text-xl flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Baixe seu áudio em MP3</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Escolha o locutor ou locutora desejada, ouça a prévia em tempo real e faça o download do MP3 pronto para tocar na rádio da sua loja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Credits Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Planos & Créditos</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#142B4A] mt-2">
              Planos pensados para cada porte de supermercado
            </h2>
            <p className="mt-3 text-slate-600">
              Pague apenas pelo que utilizar ou assine para ter geração ilimitada de ofertas diárias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gratuito / Degustação */}
            <div className="bg-[#F5F7FB] rounded-3xl p-8 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Degustação</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Gratuito</h3>
                <p className="text-sm text-slate-600 mt-2">Para testar a ferramenta no seu supermercado.</p>
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-slate-900">R$ 0</span>
                  <span className="text-slate-500 text-sm ml-1">/mês</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 500 créditos de boas-vindas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Acesso a todas as vozes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Download em MP3 alta qualidade
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartCreating}
                className="mt-8 w-full py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold rounded-xl transition cursor-pointer"
              >
                Começar Grátis
              </button>
            </div>

            {/* Pro Varejo - Popular */}
            <div className="bg-gradient-to-b from-blue-900 to-[#142B4A] text-white rounded-3xl p-8 border-2 border-blue-500 shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow uppercase tracking-wider">
                Mais Popular
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Supermercados</span>
                <h3 className="text-2xl font-bold text-white mt-1">Pro Varejo</h3>
                <p className="text-sm text-blue-200 mt-2">Ideal para mercados que trocam ofertas diariamente.</p>
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-white">R$ 89</span>
                  <span className="text-blue-200 text-sm ml-1">/mês</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-blue-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1.500 créditos mensais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Geração de lote (1 áudio por produto)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pacote ZIP com todos os arquivos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Suporte prioritário via WhatsApp
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartCreating}
                className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition cursor-pointer"
              >
                Assinar Pro Varejo
              </button>
            </div>

            {/* Redes & Atacarejo */}
            <div className="bg-[#F5F7FB] rounded-3xl p-8 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Redes & Atacados</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Redes & Atacarejo</h3>
                <p className="text-sm text-slate-600 mt-2">Múltiplas lojas, filiais e alto volume de spots diários.</p>
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-slate-900">R$ 199</span>
                  <span className="text-slate-500 text-sm ml-1">/mês</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 5.000 créditos mensais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Múltiplas lojas e filiais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Voz exclusiva e suporte a trilhas
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartCreating}
                className="mt-8 w-full py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold rounded-xl transition cursor-pointer"
              >
                Falar com Consultor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#F5F7FB] border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#142B4A]">Perguntas frequentes</h2>
            <p className="mt-2 text-slate-600">Tire suas dúvidas sobre o Locução Super IA.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 mb-2">Como coloco os áudios para tocar no supermercado?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Você pode baixar os arquivos em MP3 e colocar em um pen drive conectado na caixa amplificada ou no computador da loja usando qualquer tocador (Windows Media Player, Spotify, VLC ou softwares de rádio interna).
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 mb-2">A inteligência artificial fala os preços e centavos corretamente?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sim! Nosso sistema possui um módulo especializado em varejo brasileiro que converte números como "R$ 24,99" diretamente para "vinte e quatro reais e noventa e nove centavos", além de falar "o quilo", "a unidade" ou "o pacote" com ritmo de locutor de rádio.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 mb-2">Posso gerar um áudio para cada produto separado?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sim! Você pode escolher entre gerar uma única locução com todas as ofertas em sequência ou gerar o modo em lote (1 áudio curto para cada produto), com opção de baixar todos em um único arquivo ZIP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#142B4A] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Comece a profissionalizar o som do seu supermercado hoje mesmo
          </h2>
          <p className="mt-4 text-blue-200 max-w-xl mx-auto text-sm sm:text-base">
            Junte-se a supermercados e atacarejos que aumentaram o giro de mercadorias em oferta com anúncios diários na rádio interna.
          </p>
          <div className="mt-8">
            <button
              onClick={onStartCreating}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg transition cursor-pointer text-base"
            >
              Criar minha primeira locução agora
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
