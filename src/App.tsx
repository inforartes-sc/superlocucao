import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveView } from './components/Navbar';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { StudioView } from './views/StudioView';
import { RadioView } from './views/RadioView';
import { LibraryView } from './views/LibraryView';
import { CreditsView } from './views/CreditsView';
import { AdminView } from './views/AdminView';
import { AuthModal } from './views/AuthModal';
import { User, Project, ProjectNiche } from './types';
import { api, getActiveUserId, setActiveUserId, clearActiveUserId } from './services/api';
import { RadioBroadcastProvider } from './context/RadioContext';
import { ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';

function checkIsAdminUrl(): boolean {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path === '/superadmin' ||
    path.startsWith('/superadmin/') ||
    hash === '#/admin' ||
    hash === '#admin' ||
    search.includes('admin=1')
  );
}

export function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => checkIsAdminUrl());
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminUrl());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      const activeId = getActiveUserId();

      // If no session exists in localStorage, user is a visitor (show commercial landing page)
      if (!activeId) {
        setUser(null);
        setActiveView('landing');
        setLoading(false);
        return;
      }

      // If session exists, fetch logged-in user profile and their projects
      const [meRes, projRes] = await Promise.all([api.getMe(), api.getProjects()]);

      if (meRes && meRes.user) {
        setUser(meRes.user);
        setProjects(projRes.projects || []);
        // When logged in, navigate straight to panel (never show commercial landing page)
        setActiveView(prev => (prev === 'landing' ? 'dashboard' : prev));
      } else {
        clearActiveUserId();
        setUser(null);
        setActiveView('landing');
      }
    } catch (err) {
      console.warn('Sessão expirada ou visitante não autenticado:', err);
      clearActiveUserId();
      setUser(null);
      setActiveView('landing');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, isAdminRoute]);

  const handleAuthSuccess = (loggedUser: User) => {
    setActiveUserId(loggedUser.id);
    setUser(loggedUser);
    setIsAuthModalOpen(false);
    setActiveView('dashboard');
    loadData();
  };

  const handleLogout = () => {
    clearActiveUserId();
    setUser(null);
    setSelectedProject(null);
    setProjects([]);
    setActiveView('landing');
  };

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const handleNewCampaign = () => {
    const effectiveNiche: ProjectNiche = user?.niche || 'supermercado';
    const newDraft: Project = {
      id: `proj-${Date.now()}`,
      userId: user?.id || 'user-alvorada',
      niche: effectiveNiche,
      title: 'Nova Campanha de Ofertas',
      storeName: user?.companyName || 'Minha Loja',
      storeCity: user?.city || 'São Paulo - SP',
      objective: 'Aumentar giro de estoque e atrair clientes',
      campaignType: 'ofertas_dia',
      style: effectiveNiche === 'farmacia' ? 'natural_amigavel' : (effectiveNiche === 'moda' || effectiveNiche === 'beleza' || effectiveNiche === 'otica') ? 'elegante_institucional' : 'energetica_supermercado',
      desiredDuration: '30s',
      tone: 'alegre',
      presentationFormat: 'abertura_sequencia_encerramento',
      products: [],
      scripts: [],
      currentScriptIndex: 0,
      audios: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedProject(newDraft);
    setActiveView('studio');
  };

  const handleOpenProjectById = (projectId: string) => {
    const found = projects.find(p => p.id === projectId);
    if (found) {
      setSelectedProject(found);
      setActiveView('studio');
    }
  };

  const handleProjectSaved = (savedProject: Project) => {
    setSelectedProject(savedProject);
    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === savedProject.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = savedProject;
        return copy;
      }
      return [savedProject, ...prev];
    });
  };

  const handleCreditsChanged = (newBalance: number) => {
    if (user) {
      setUser({ ...user, creditsBalance: newBalance });
    }
  };

  // =========================================================================
  // STANDALONE SUPER ADMIN PORTAL (ACCESSED EXCLUSIVELY VIA URL: /admin)
  // =========================================================================
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#0e1118] text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#12141c]/95 backdrop-blur-md border-b border-zinc-800 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-orange-500/25 shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg text-white">
                    Super<span className="text-orange-500">Locução</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-orange-500/15 text-orange-400 border border-orange-500/30">
                    Console Super Admin
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 hidden sm:block">
                  Gestão Central de Supermercados, Créditos, Rádio Web & Motores de IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  setIsAdminRoute(false);
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1c202d] hover:bg-[#252b3d] text-zinc-200 hover:text-white border border-zinc-700/80 text-xs font-bold transition shadow-sm cursor-pointer"
                title="Voltar ao painel do supermercado"
              >
                <ArrowLeft className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">Painel da Loja</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('superlocucao_admin_auth');
                  clearActiveUserId();
                  setUser(null);
                  window.history.pushState({}, '', '/');
                  setIsAdminRoute(false);
                  setActiveView('landing');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-200 border border-red-500/30 text-xs font-bold transition shadow-sm cursor-pointer"
                title="Sair do painel e encerrar sessão"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sair do Painel</span>
              </button>
            </div>
          </div>
        </header>
        <div className="h-16 shrink-0 pointer-events-none" aria-hidden="true" />

        <main className="flex-1 pb-16">
          <AdminView
            onNavigate={(view) => {
              window.history.pushState({}, '', '/');
              setIsAdminRoute(false);
              setActiveView(view as any);
            }}
            onImpersonateUser={(targetUser) => {
              handleAuthSuccess(targetUser);
              window.history.pushState({}, '', '/');
              setIsAdminRoute(false);
            }}
          />
        </main>
      </div>
    );
  }

  // =========================================================================
  // 1. VISITOR / LOGGED-OUT USER: COMMERCIAL LANDING PAGE
  //    (The commercial page is completely isolated from the user panel)
  // =========================================================================
  if (!user || activeView === 'landing') {
    return (
      <>
        <LandingView
          onStartCreating={handleOpenRegister}
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // =========================================================================
  // 2. LOGGED-IN SUPERMARKET CLIENT PANEL
  //    (User is inside their workspace; commercial page is NOT visible)
  // =========================================================================
  return (
    <RadioBroadcastProvider
      key={user.id}
      activeView={activeView}
      onNavigateToRadio={() => setActiveView('radio')}
    >
      <div
        className={`min-h-screen flex flex-col transition-colors ${
          activeView === 'radio'
            ? 'bg-[#111318] text-zinc-100 selection:bg-orange-500 selection:text-white'
            : 'bg-[#F5F7FB] text-[#142B4A] selection:bg-blue-600 selection:text-white'
        }`}
      >
        <Navbar
          user={user}
          activeView={activeView}
          onNavigate={view => {
            if (view === 'studio' && !selectedProject) {
              if (projects.length > 0) {
                setSelectedProject(projects[0]);
              } else {
                handleNewCampaign();
                return;
              }
            }
            setActiveView(view);
          }}
          onNewCampaign={handleNewCampaign}
          onLogout={handleLogout}
        />

        <main className="flex-1 pb-24 md:pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-zinc-400 font-medium">Carregando SuperLocução IA...</p>
              </div>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && (
                <DashboardView
                  user={user}
                  projects={projects}
                  onNewVoiceover={handleNewCampaign}
                  onOpenProject={handleOpenProjectById}
                  onNavigate={view => setActiveView(view as ActiveView)}
                  onRefreshUser={loadData}
                />
              )}

              {activeView === 'studio' && selectedProject && (
                <StudioView
                  project={selectedProject}
                  user={user}
                  onUpdateProject={handleProjectSaved}
                  onNavigate={view => setActiveView(view as ActiveView)}
                  onCreditsChanged={handleCreditsChanged}
                />
              )}

              {activeView === 'radio' && (
                <RadioView
                  user={user}
                  onCreditsChanged={handleCreditsChanged}
                  onOpenStudio={handleNewCampaign}
                />
              )}

              {activeView === 'library' && (
                <LibraryView
                  projects={projects}
                  onOpenProject={handleOpenProjectById}
                  onNewVoiceover={handleNewCampaign}
                  onRefreshProjects={loadData}
                />
              )}

              {activeView === 'credits' && (
                <CreditsView
                  user={user}
                  onRefreshUser={loadData}
                />
              )}
            </>
          )}
        </main>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </RadioBroadcastProvider>
  );
}

export default App;
