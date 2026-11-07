import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  LayoutDashboard,
  Mic2,
  FolderKanban,
  Coins,
  LogOut,
  Plus,
  Radio,
  ChevronDown,
  Store,
  Zap,
  SkipForward,
  Pause,
  Megaphone,
  ArrowUpRight,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { User } from '../types';
import { useRadio } from '../context/RadioContext';
import { ContactModal } from './ContactModal';

export type ActiveView = 'landing' | 'dashboard' | 'studio' | 'radio' | 'library' | 'credits' | 'admin';

interface NavbarProps {
  user: User | null;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onNewCampaign: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  onNavigate,
  onNewCampaign,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  let radioCtx: ReturnType<typeof useRadio> | null = null;
  try {
    radioCtx = useRadio();
  } catch {
    radioCtx = null;
  }

  const isRadioOnAir = Boolean(radioCtx?.isOnAir);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isRadio?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'studio', label: 'Estúdio', icon: Mic2 },
    { id: 'radio', label: 'Rádio Web', icon: Radio, isRadio: true },
    { id: 'library', label: 'Meus Áudios', icon: FolderKanban },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#161820]/95 backdrop-blur-xl border-b border-zinc-700/80 shadow-lg">
        {/* Main Top Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Brand Identity */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition shrink-0">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white">
                  Super<span className="text-orange-500">Locução</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  Varejo IA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden xl:block max-w-[205px] truncate">
                Locução Comercial & Rádio Web
              </p>
            </div>
          </div>

          {/* Center: Clean Single-Line Navigation Pills (Desktop Only) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#1a1d27]/90 p-1.5 rounded-2xl border border-zinc-700/80 shrink-0">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              if (item.isRadio) {
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md shadow-red-600/25'
                        : isRadioOnAir
                        ? 'bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/70'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isRadioOnAir && !isActive ? 'text-red-400 animate-pulse' : ''
                      }`}
                    />
                    <span>{item.label}</span>
                    {isRadioOnAir && (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        NO AR
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Primary CTA (Desktop) */}
            <button
              onClick={onNewCampaign}
              className="hidden sm:inline-flex items-center gap-2 px-4 h-9 sm:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-sm font-bold whitespace-nowrap shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Nova Locução</span>
            </button>

            {/* Single Credits Badge & Access Button */}
            {user && (
              <button
                onClick={() => onNavigate('credits')}
                className={`inline-flex items-center gap-1.5 px-3 h-8 sm:h-10 rounded-xl border whitespace-nowrap transition cursor-pointer ${
                  activeView === 'credits'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-amber-500/40 text-white'
                }`}
                title="Saldo de créditos disponível — clique para recarregar ou ver planos"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold">{user.creditsBalance}</span>
                <span className="text-[11px] sm:text-xs font-semibold text-amber-400 hidden lg:inline">créditos</span>
              </button>
            )}

            {/* Store Profile Menu */}
            {user && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="inline-flex items-center gap-2 pl-2 pr-2.5 h-8 sm:h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs sm:text-sm text-zinc-200 whitespace-nowrap transition cursor-pointer"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-[10px] sm:text-[11px] shrink-0">
                    {(user.companyName || user.name).charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline font-semibold max-w-[150px] truncate">
                    {user.companyName || user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 max-w-[90vw] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-white truncate">
                        <Store className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span className="truncate">{user.companyName || 'Supermercado'}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-orange-400" />
                      Painel do Supermercado
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('credits');
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2 cursor-pointer mt-0.5"
                    >
                      <Coins className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      Recarregar Créditos ({user.creditsBalance})
                    </button>
                    <button
                      onClick={() => {
                        try {
                          window.sessionStorage.setItem('credits_initial_tab', 'invoices');
                        } catch {}
                        onNavigate('credits');
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2 cursor-pointer mt-0.5"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                      Minhas Faturas & Assinatura
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setIsContactModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-2 cursor-pointer mt-0.5 font-medium transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      Fale Conosco / Suporte
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        if (onLogout) {
                          onLogout();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer mt-1 font-semibold transition"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      Sair do Painel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* TOP LIVE RADIO BROADCAST BAR (RESPONSIVE, NO WRAPPING)                */}
        {/* ===================================================================== */}
        {isRadioOnAir && activeView !== 'radio' && radioCtx?.config && (
          <div className="bg-gradient-to-r from-zinc-950 via-red-950/50 to-zinc-950 border-t border-orange-500/30">
            <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-10 sm:h-11 flex items-center justify-between gap-2 sm:gap-3 flex-nowrap overflow-hidden">
              {/* Left Side: Status + Current Audio (truncates cleanly) */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0 overflow-hidden whitespace-nowrap">
                <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-sm shrink-0">
                  <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse shrink-0" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 border border-zinc-950 animate-ping" />
                </div>

                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span className="hidden sm:inline">NO AR AO VIVO</span>
                  <span className="sm:hidden">NO AR</span>
                </span>

                <span className="font-bold text-xs text-white shrink-0 hidden md:inline">
                  {radioCtx.config.stationName}
                </span>

                <span className="text-zinc-600 shrink-0 hidden md:inline">•</span>

                {radioCtx.currentSpot ? (
                  <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden text-xs">
                    <Megaphone className="w-3 h-3 text-orange-400 shrink-0 animate-bounce" />
                    <span className="text-orange-400 font-semibold truncate text-[11px] sm:text-xs">
                      Locução: <strong>{radioCtx.currentSpot.title}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden text-xs text-zinc-300">
                    <span className="truncate text-[11px] sm:text-xs">
                      🎵 <strong className="text-white">{radioCtx.currentMusic?.title || 'Música Ambiente'}</strong>
                      <span className="hidden sm:inline"> • Próxima: <strong className="text-orange-400 font-mono">{radioCtx.countdownSeconds}s</strong></span>
                    </span>
                  </div>
                )}
              </div>

              {/* Right Side: Responsive Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap">
                <button
                  onClick={() => radioCtx?.playSpotNow()}
                  className="px-2 sm:px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap transition cursor-pointer"
                  title="Disparar próxima locução de oferta imediatamente"
                >
                  <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="hidden sm:inline">Disparar Oferta</span>
                </button>

                <button
                  onClick={() => radioCtx?.skipMusicTrack()}
                  className="p-1 sm:p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition cursor-pointer shrink-0"
                  title="Pular música ambiente"
                >
                  <SkipForward className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  onClick={() => radioCtx?.toggleOnAir()}
                  className="p-1 sm:p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition cursor-pointer shrink-0"
                  title="Pausar Rádio Web"
                >
                  <Pause className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  onClick={() => onNavigate('radio')}
                  className="px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black text-xs inline-flex items-center gap-1 whitespace-nowrap shadow-sm transition cursor-pointer shrink-0"
                  title="Abrir Rádio Web"
                >
                  <span className="hidden sm:inline">Abrir Rádio</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to keep layout offset when header is fixed at top (accounts for live radio bar when on air) */}
      <div
        className={`${
          isRadioOnAir && activeView !== 'radio' && radioCtx?.config
            ? 'h-24 sm:h-[108px]'
            : 'h-14 sm:h-16'
        } shrink-0 pointer-events-none transition-all duration-150`}
        aria-hidden="true"
      />

      {/* ===================================================================== */}
      {/* MOBILE FIXED BOTTOM APP BAR (MODERN NATIVE APP NAVIGATION)            */}
      {/* ===================================================================== */}
      <nav aria-label="Navegação Mobile" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161820]/95 backdrop-blur-xl border-t border-zinc-700/80 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            activeView === 'dashboard' ? 'text-orange-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Painel</span>
        </button>

        <button
          onClick={() => onNavigate('studio')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            activeView === 'studio' ? 'text-orange-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Mic2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Estúdio</span>
        </button>

        {/* Central Elevated Floating Action Button (+ Nova Locução) */}
        <button
          onClick={onNewCampaign}
          className="relative -top-2.5 w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 active:scale-90 transition cursor-pointer"
          title="Nova Locução"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => onNavigate('radio')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition relative ${
            activeView === 'radio'
              ? 'text-orange-400 font-bold'
              : isRadioOnAir
              ? 'text-red-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Radio className={`w-5 h-5 mb-0.5 ${isRadioOnAir ? 'animate-pulse text-red-400' : ''}`} />
          <span className="text-[10px]">
            {isRadioOnAir ? 'Rádio No Ar' : 'Rádio Web'}
          </span>
          {isRadioOnAir && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => onNavigate('library')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            activeView === 'library' ? 'text-orange-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderKanban className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Áudios</span>
        </button>
      </nav>

      {/* Modal de Contato & Suporte */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        defaultStoreName={user?.companyName}
        defaultSubject="Suporte ao Cliente / Dúvidas"
      />
    </>
  );
};
