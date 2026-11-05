import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Radio, Volume2, Clock, Zap, ArrowRight,
  CheckCircle2, TrendingUp, Lightbulb, Mic2, Play, Pause,
  Star, Search, Sparkles, Filter, Check
} from 'lucide-react';
import { Project, UserProfile, VoicePreset } from '../types/index.ts';
import { AudioPlayer } from '../components/AudioPlayer.tsx';
import { api } from '../services/api.ts';
import { useFavoriteVoices } from '../services/voiceFavorites.ts';

interface DashboardViewProps {
  user: UserProfile | null;
  projects: Project[];
  onNewVoiceover: () => void;
  onOpenProject: (projectId: string) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  projects,
  onNewVoiceover,
  onOpenProject,
  onNavigate,
}) => {
  const allAudios = projects.flatMap((p) => p.audios);
  const latestAudios = allAudios.slice(0, 3);
  const recentProjects = projects.slice(0, 4);

  // Banco de Vozes State
  const [voices, setVoices] = useState<VoicePreset[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState<boolean>(true);
  const [voiceTab, setVoiceTab] = useState<'todas' | 'favoritas'>('todas');
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<'todos' | 'masculino' | 'feminino'>('todos');
  const [voiceSearchQuery, setVoiceSearchQuery] = useState<string>('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const { favorites, toggleFavorite, isFavorite } = useFavoriteVoices();

  useEffect(() => {
    setIsLoadingVoices(true);
    api.getVoices()
      .then(res => {
        setVoices(res.voices || []);
      })
      .catch(err => {
        console.error('Erro ao buscar vozes no painel:', err);
      })
      .finally(() => {
        setIsLoadingVoices(false);
      });
  }, []);

  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const handleToggleVoicePreview = (voice: VoicePreset) => {
    if (!audioPreviewRef.current) return;
    if (playingVoiceId === voice.id) {
      audioPreviewRef.current.pause();
      setPlayingVoiceId(null);
      return;
    }
    const previewSrc = voice.previewUrl || voice.sampleAudioUrl || `/api/voices/${voice.id}/preview`;
    audioPreviewRef.current.src = previewSrc;
    audioPreviewRef.current.play().then(() => {
      setPlayingVoiceId(voice.id);
    }).catch(err => {
      console.warn('Erro ao tocar prévia da voz:', err);
      setPlayingVoiceId(null);
    });
  };

  const handleUseVoiceInStudio = (voiceId: string) => {
    localStorage.setItem('superlocucao_selected_voice', voiceId);
    onNewVoiceover();
  };

  const filteredVoices = voices.filter(v => {
    if (voiceTab === 'favoritas' && !isFavorite(v.id)) {
      return false;
    }
    if (voiceGenderFilter !== 'todos' && v.gender !== voiceGenderFilter) {
      return false;
    }
    if (voiceSearchQuery.trim()) {
      const q = voiceSearchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchDesc = (v.description || '').toLowerCase().includes(q);
      const matchTag = (v.styleTag || '').toLowerCase().includes(q);
      return matchName || matchDesc || matchTag;
    }
    return true;
  });

  const favoriteVoicesCount = voices.filter(v => isFavorite(v.id)).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16 space-y-6 sm:space-y-8">
      {/* Hidden audio element for voice sample previews */}
      <audio
        ref={audioPreviewRef}
        onEnded={() => setPlayingVoiceId(null)}
        onError={() => setPlayingVoiceId(null)}
        className="hidden"
      />

      {/* Welcome & Primary CTA Banner */}
      <div className="bg-gradient-to-r from-[#142B4A] via-[#1E3A8A] to-blue-700 text-white rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
            <Radio className="w-3.5 h-3.5 text-blue-300" />
            <span>{user?.companyName || 'Supermercado'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {user?.name || 'Lojista'}!
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
            Pronto para colocar as melhores ofertas do dia no sistema de som do seu supermercado?
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => onNavigate('radio')}
            className="px-5 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-950/30 transition flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Radio className="w-5 h-5 animate-pulse" />
            <span>Abrir Rádio Web da Loja</span>
          </button>

          <button
            onClick={onNewVoiceover}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/20 transition flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>Criar nova locução</span>
          </button>
        </div>

        {/* Background ambient pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Live Web Radio Highlight Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-orange-950/90 border border-orange-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30">
            <Radio className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                NOVO • SISTEMA COMPLETO DE RÁDIO INTERNA
              </span>
              <span className="text-xs text-orange-300 font-semibold">AutoDJ + Auto-Ducking Automático</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Rádio Web Supermercado — Gere Locuções de Ofertas e Divulgue Ao Vivo na Loja
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
              Programação musical ambiente contínua que reduz o volume automaticamente toda vez que o locutor anuncia uma oferta ou fornada de pão quentinho!
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('radio')}
          className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-orange-500/20 transition cursor-pointer"
        >
          <span>Acessar Estúdio da Rádio Web</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>Locuções Criadas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
            {projects.length}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">Campanhas ativas</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>Áudios Prontos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
            {allAudios.length}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">100% disponíveis</span> para download
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>Saldo de Créditos</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
            {user?.creditsBalance ?? 0}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>A partir de 5 créditos / áudio</span>
            <button
              onClick={() => onNavigate('credits')}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Recarregar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>Plano Atual</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#142B4A] capitalize">
            {user?.plan ? user.plan.replace('_', ' ') : 'Pro Varejo'}
          </div>
          <div className="mt-2 text-xs text-purple-700 font-medium">
            Renovação mensal ativa
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BANCO DE VOZES DISPONÍVEIS & FAVORITAS (PORTUGUÊS BR COM IA)             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        {/* Header with Title and Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#142B4A]">
                  Banco de Vozes Oficiais
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {voices.length} Locutores Profissionais
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ouça as vozes antes de usar, favorite seus locutores preferidos e utilize direto no Estúdio e na Rádio Web.
              </p>
            </div>
          </div>

          {/* Quick Tabs: Todas as Vozes vs Favoritas */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setVoiceTab('todas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                voiceTab === 'todas'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Todas as Vozes</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                voiceTab === 'todas' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {voices.length}
              </span>
            </button>

            <button
              onClick={() => setVoiceTab('favoritas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                voiceTab === 'favoritas'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${voiceTab === 'favoritas' ? 'fill-white' : 'text-amber-500'}`} />
              <span>Minhas Favoritas</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                voiceTab === 'favoritas' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {favoriteVoicesCount}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Search + Gender Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={voiceSearchQuery}
              onChange={(e) => setVoiceSearchQuery(e.target.value)}
              placeholder="Buscar locutor por nome, estilo (varejo, oferta, alegre)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {(['todos', 'masculino', 'feminino'] as const).map((g) => {
              const count = g === 'todos' ? voices.length : voices.filter(v => v.gender === g).length;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setVoiceGenderFilter(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                    voiceGenderFilter === g
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g === 'todos' ? `Todos os Locutores (${count})` : `${g === 'feminino' ? 'Femininas' : 'Masculinas'} (${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Voice Cards Grid */}
        {isLoadingVoices ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Carregando banco de vozes...</span>
          </div>
        ) : filteredVoices.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
            {voiceTab === 'favoritas' ? (
              <>
                <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">Nenhuma voz favoritada ainda</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Clique na estrelinha ⭐ em qualquer locutor abaixo para salvá-lo nos seus favoritos e acessá-lo rapidamente no Estúdio e na Rádio!
                </p>
                <button
                  onClick={() => setVoiceTab('todas')}
                  className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer transition"
                >
                  Ver Todas as Vozes
                </button>
              </>
            ) : (
              <>
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">Nenhuma voz encontrada</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tente alterar o termo de busca ou os filtros de gênero.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredVoices.map((voice) => {
              const isPlaying = playingVoiceId === voice.id;
              const isFav = isFavorite(voice.id);

              return (
                <div
                  key={voice.id}
                  className={`rounded-2xl p-4 border transition-all duration-200 relative flex flex-col justify-between ${
                    isPlaying
                      ? 'border-blue-500 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Badges & Favorite Star */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                          voice.gender === 'feminino'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {voice.gender === 'feminino' ? 'Feminina' : 'Masculina'}
                        </span>

                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[150px]">
                          {voice.styleTag || voice.tone || 'Varejo Comercial'}
                        </span>
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(voice.id);
                        }}
                        title={isFav ? 'Remover dos favoritos' : 'Favoritar este locutor'}
                        className={`p-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                          isFav
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/30'
                            : 'bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-500 border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Voice Name & Description */}
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{voice.name}</span>
                      {isFav && <span className="text-amber-500 text-xs" title="Voz Favorita">★</span>}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {voice.description || 'Voz comercial calibrada para alto impacto em supermercados e varejo.'}
                    </p>
                  </div>

                  {/* Actions: Listen Preview & Use in Studio */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVoicePreview(voice)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        isPlaying
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 shrink-0" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                          <span>Ouvir Voz</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUseVoiceInStudio(voice.id)}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Criar nova locução usando esta voz"
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span>Usar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Recent Projects & Quick Audio Library */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Projetos Recentes</h2>
              <p className="text-xs text-slate-500">Continue a editar ou gere novas versões das suas campanhas</p>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 capitalize">
                        {project.campaignType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Supermercado
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {`${project.products.length} ${project.products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}`}
                  </p>

                  {/* Audio badge */}
                  {project.audios.length > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                      <Volume2 className="w-3 h-3" />
                      <span>{project.audios.length} áudio(s) gerado(s)</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-blue-600">
                  <span>Abrir no Estúdio</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>

          {recentProjects.length === 0 && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <Radio className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-medium">Nenhuma locução criada ainda.</p>
              <button
                onClick={onNewVoiceover}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Criar primeira locução
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Tips & Latest Generated Audio Player */}
        <div className="space-y-6">
          {/* Latest audio quick player */}
          {latestAudios.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Último Áudio Gerado</h3>
                <span className="text-xs text-slate-500">MP3</span>
              </div>
              <AudioPlayer audio={latestAudios[0]} />
            </div>
          )}

          {/* Quick Sound Tips for Supermarkets */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-200/80">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Dicas de Ouro para Locução em Loja</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Anúncios curtos (30s)</strong> são os mais eficazes para que o cliente absorva a oferta sem cansaço.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Destaque no máximo <strong>3 a 4 produtos âncora</strong> por bloco de ofertas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Programe a locução para tocar a cada <strong>15 a 20 minutos</strong> entre as músicas da rádio interna.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
