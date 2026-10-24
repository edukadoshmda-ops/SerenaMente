import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNavBar from './components/BottomNavBar';
import SalesLandingPage from './components/SalesLandingPage';
import PlaybookLibrary from './components/PlaybookLibrary';
import AudiobookPlayerModal from './components/AudiobookPlayerModal';
import FloatingMiniPlayer from './components/FloatingMiniPlayer';
import DailyGoalsSection from './components/DailyGoalsSection';
import ChallengesSection from './components/ChallengesSection';
import EmergencySOSModal from './components/EmergencySOSModal';
import MoodJournalModal from './components/MoodJournalModal';
import SoundMixerModal from './components/SoundMixerModal';
import SerenaChatModal from './components/SerenaChatModal';
import SerenityGardenModal from './components/SerenityGardenModal';
import ApoioPixModal from './components/ApoioPixModal';
import LoginModal from './components/LoginModal';
import InstallPromptModal from './components/InstallPromptModal';
import AdminRootDashboard from './components/AdminRootDashboard';
import YouTubeVideosSection from './components/YouTubeVideosSection';
import { PLAYBOOKS, DAILY_AFFIRMATIONS } from './data/playbooks';
import { DEFAULT_DAILY_GOALS, CHALLENGE_JOURNEYS } from './data/challenges';
import { audioEngine } from './utils/audioEngine';
import { syncUserDataToSupabase, fetchUserDataFromSupabase, signOutUser } from './lib/supabaseClient';
import { 
  Headphones, CheckCircle2, Trophy, Heart, Sparkles, 
  Smile, Sliders, MessageCircle, Flower2, Moon, QrCode, ArrowLeft, Film 
} from 'lucide-react';

export default function App() {
  // Usuário
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('serena_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // FLUXO: 'sales' (Página de Venda) ou 'app' (Aplicativo Completo)
  // Se o usuário já tiver sessão ativa, vai direto pro 'app', senão começa na 'sales'
  const [viewMode, setViewMode] = useState(() => {
    try {
      const hasUser = localStorage.getItem('serena_user');
      return hasUser ? 'app' : 'sales';
    } catch {
      return 'sales';
    }
  });

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('serena_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Aba ativa: 'playbooks', 'metas', 'desafios'
  const [activeTab, setActiveTab] = useState('playbooks');

  // Metas Diárias
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('serena_daily_goals');
      return saved ? JSON.parse(saved) : DEFAULT_DAILY_GOALS;
    } catch {
      return DEFAULT_DAILY_GOALS;
    }
  });

  // Progresso dos Desafios
  const [userProgress, setUserProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('serena_challenges_progress');
      return saved ? JSON.parse(saved) : {
        'jornada-7-dias-paz': { completedDays: [1] },
        'jornada-14-dias-renovacao': { completedDays: [] }
      };
    } catch {
      return {
        'jornada-7-dias-paz': { completedDays: [1] },
        'jornada-14-dias-renovacao': { completedDays: [] }
      };
    }
  });

  // Diário de Emoções
  const [journalEntries, setJournalEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('serena_journal_entries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [streakDays, setStreakDays] = useState(3);

  // Modais
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGardenOpen, setIsGardenOpen] = useState(false);
  const [isPixOpen, setIsPixOpen] = useState(false);
  const [isAdminRootOpen, setIsAdminRootOpen] = useState(() => {
    return window.location.hash === '#root' || window.location.search.includes('admin=true');
  });

  // Ouvir atalhos e mudanças de hash para abrir o painel root (#root)
  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '#root' || window.location.search.includes('admin=true')) {
        setIsAdminRootOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  // Player de Áudio
  const [activePlaybook, setActivePlaybook] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Frase do dia
  const [todayAffirmation, setTodayAffirmation] = useState('');

  useEffect(() => {
    const randomAffirmation = DAILY_AFFIRMATIONS[Math.floor(Math.random() * DAILY_AFFIRMATIONS.length)];
    setTodayAffirmation(randomAffirmation);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('serena_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('serena_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Persistir e Sincronizar em lote com Supabase
  useEffect(() => {
    localStorage.setItem('serena_daily_goals', JSON.stringify(goals));
    localStorage.setItem('serena_challenges_progress', JSON.stringify(userProgress));
    localStorage.setItem('serena_journal_entries', JSON.stringify(journalEntries));

    if (user?.id) {
      const timer = setTimeout(() => {
        syncUserDataToSupabase(user.id, {
          goals,
          challengesProgress: userProgress,
          journalEntries,
          streakDays
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [goals, userProgress, journalEntries, streakDays, user]);

  const handleToggleGoal = (id) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const handleAddGoal = (goalData) => {
    const newGoal = {
      id: `custom-${Date.now()}`,
      completed: false,
      ...goalData,
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleDeleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleCompleteDay = (journeyId, dayNumber) => {
    setUserProgress((prev) => {
      const current = prev[journeyId] || { completedDays: [] };
      const already = current.completedDays.includes(dayNumber);
      const newDays = already
        ? current.completedDays
        : [...current.completedDays, dayNumber];
      return {
        ...prev,
        [journeyId]: { ...current, completedDays: newDays },
      };
    });
  };

  const handleOpenPlaybookById = (id) => {
    const target = PLAYBOOKS.find((p) => p.id === id);
    if (target) {
      setActivePlaybook(target);
      setIsPlayerOpen(true);
      setIsPlayerMinimized(false);
    }
  };

  const handleSaveJournalEntry = (entry) => {
    setJournalEntries((prev) => [entry, ...prev]);
  };

  // FLUXO DE LOGIN: Logou -> Muda para a tela do app
  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setViewMode('app');
    if (userData?.id && !userData.id.startsWith('local-')) {
      const cloudData = await fetchUserDataFromSupabase(userData.id);
      if (cloudData) {
        if (cloudData.goals?.length > 0) setGoals(cloudData.goals);
        if (cloudData.profile?.streak_days) setStreakDays(cloudData.profile.streak_days);
      }
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    localStorage.removeItem('serena_user');
    setUser(null);
    setViewMode('sales'); // Volta para a página de apresentação ao deslogar
  };

  const completedGoalsCount = goals.filter((g) => g.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* 1. SE ESTIVER NO MODO PÁGINA DE VENDA (LANDING PAGE) */}
      {viewMode === 'sales' ? (
        <SalesLandingPage
          onOpenLogin={() => setIsLoginOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onEnterAppDirectly={() => {
            // Se já tem cadastro ativo em um plano ou é SuperAdmin, entra no app
            if (user?.plan || user?.role === 'superAdmin') {
              setViewMode('app');
            } else {
              // Caso contrário, precisa se cadastrar em um plano ou entrar com sua conta
              setIsLoginOpen(true);
            }
          }}
          onOpenPixCheckout={(val) => {
            setIsPixOpen(true);
          }}
        />
      ) : (
        /* 2. SE ESTIVER NO MODO DO APLICATIVO COMPLETO (APP) */
        <>
          {/* Barra de Navegação Topo */}
          <Navbar
            user={user}
            streakDays={streakDays}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenJournal={() => setIsJournalOpen(true)}
            onOpenMixer={() => setIsMixerOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenGarden={() => setIsGardenOpen(true)}
            onOpenPix={() => setIsPixOpen(true)}
            onOpenSales={() => setViewMode('sales')}
            onOpenVideos={() => {
              setViewMode('app');
              setActiveTab('videos');
            }}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenInstall={() => setIsInstallOpen(true)}
            onOpenAdminRoot={() => setIsAdminRootOpen(true)}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />

          {/* Conteúdo Principal */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-8">
            
            {/* Banner de Boas-vindas com Botão de Voltar para Apresentação */}
            <section className="relative p-4 sm:p-8 rounded-3xl sm:rounded-4xl bg-gradient-to-br from-calm-500/10 via-indigo-500/5 to-teal-500/10 border border-calm-200/50 dark:border-calm-800/30 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-calm-700 dark:text-calm-200 text-[11px] sm:text-xs font-bold shadow-xs">
                      <Smile className="w-3.5 h-3.5 text-calm-500" />
                      <span>{user ? `Olá, ${user.name}` : 'Bem-vindo(a) ao seu Refúgio'}</span>
                    </div>

                    <button
                      onClick={() => setViewMode('sales')}
                      className="text-[11px] font-semibold text-slate-400 hover:text-calm-600 flex items-center space-x-1 px-2 py-0.5 rounded-lg hover:bg-white/50 transition-colors"
                      title="Ver página de apresentação e planos"
                    >
                      <span>🌟 Ver Apresentação</span>
                    </button>
                  </div>

                  <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Respire fundo. Você não precisa carregar tudo de uma vez.
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic pt-0.5">
                    "{todayAffirmation}"
                  </p>
                </div>

                {/* Ações Rápidas do Banner */}
                <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 shrink-0">
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-calm-600 hover:bg-calm-700 text-white text-xs font-bold shadow-md shadow-calm-600/20 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="truncate">Desabafar</span>
                  </button>

                  <button
                    onClick={() => setIsSOSOpen(true)}
                    className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="truncate">Respiração SOS</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 4 Cards de Acesso Rápido */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
              <div
                onClick={() => setIsMixerOpen(true)}
                className="cursor-pointer p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-calm-400 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Sliders className="w-5 h-5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">Mixer da Natureza</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Chuva, lareira e ondas</p>
              </div>

              <div
                onClick={() => setIsChatOpen(true)}
                className="cursor-pointer p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-calm-400 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">Assistente Serena</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Acolhimento com TCC</p>
              </div>

              <div
                onClick={() => setIsGardenOpen(true)}
                className="cursor-pointer p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Flower2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">Meu Jardim</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Plantas que florescem</p>
              </div>

              <div
                onClick={() => setIsPixOpen(true)}
                className="cursor-pointer p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-rose-400 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 fill-rose-500/20" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">Apoiar via Pix</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Via Asaas Seguro</p>
              </div>
            </section>

            {/* Abas de Navegação (Desktop, Tablet e Mobile) */}
            <section className="flex justify-start overflow-x-auto no-scrollbar py-1">
              <div className="flex p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-3xl shadow-inner max-w-full overflow-x-auto gap-1">
                <button
                  onClick={() => setActiveTab('playbooks')}
                  className={`flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'playbooks'
                      ? 'bg-white dark:bg-slate-700 text-calm-700 dark:text-calm-300 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>Playbooks & Áudios</span>
                </button>

                <button
                  onClick={() => setActiveTab('videos')}
                  className={`flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'videos'
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Film className="w-4 h-4 text-rose-500" />
                  <span>Vídeos do YouTube</span>
                </button>

                <button
                  onClick={() => setActiveTab('metas')}
                  className={`flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'metas'
                      ? 'bg-white dark:bg-slate-700 text-calm-700 dark:text-calm-300 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Metas ({completedGoalsCount}/{goals.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('desafios')}
                  className={`flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'desafios'
                  ? 'bg-white dark:bg-slate-700 text-calm-700 dark:text-calm-300 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Desafios</span>
                </button>
              </div>
            </section>

            {/* Seção Ativa */}
            <section className="animate-fadeIn">
              {activeTab === 'playbooks' && (
                <PlaybookLibrary
                  playbooks={PLAYBOOKS}
                  onSelectPlaybook={(book) => {
                    setActivePlaybook(book);
                    setIsPlayerOpen(true);
                    setIsPlayerMinimized(false);
                  }}
                />
              )}

              {activeTab === 'videos' && (
                <YouTubeVideosSection />
              )}

              {activeTab === 'metas' && (
                <DailyGoalsSection
                  goals={goals}
                  onToggleGoal={handleToggleGoal}
                  onAddGoal={handleAddGoal}
                  onDeleteGoal={handleDeleteGoal}
                />
              )}

              {activeTab === 'desafios' && (
                <ChallengesSection
                  journeys={CHALLENGE_JOURNEYS}
                  userProgress={userProgress}
                  onCompleteDay={handleCompleteDay}
                  onOpenPlaybookById={handleOpenPlaybookById}
                  onOpenJournal={() => setIsJournalOpen(true)}
                />
              )}
            </section>
          </main>

          {/* Barra de Navegação Inferior Mobile */}
          <BottomNavBar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenMixer={() => setIsMixerOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenGarden={() => setIsGardenOpen(true)}
            completedGoalsCount={completedGoalsCount}
          />

          {/* Rodapé Acolhedor */}
          <footer className="hidden md:block mt-12 py-8 px-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400 space-y-2">
            <p className="flex items-center justify-center space-x-1">
              <span>Feito com</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>para você encontrar paz nos dias difíceis.</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Ferramenta de apoio e acolhimento emocional. Em caso de crise, disque CVV 188.
            </p>
          </footer>
        </>
      )}

      {/* MODAIS COMPARTILHADOS NO FLUXO (FUNCIONAM TANTO NA LANDING PAGE QUANTO NO APP) */}

      {/* Modal do Player de Audiobook */}
      <AudiobookPlayerModal
        playbook={activePlaybook}
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setIsPlayingAudio(false);
        }}
        onMinimize={() => {
          setIsPlayerOpen(false);
          setIsPlayerMinimized(true);
        }}
        onProgressUpdate={() => {}}
      />

      {/* Mini Player Flutuante */}
      {isPlayerMinimized && activePlaybook && (
        <FloatingMiniPlayer
          playbook={activePlaybook}
          isPlaying={isPlayingAudio}
          onTogglePlay={() => {
            if (isPlayingAudio) {
              audioEngine.pauseSpeech();
              setIsPlayingAudio(false);
            } else {
              audioEngine.resumeSpeech();
              setIsPlayingAudio(true);
            }
          }}
          onExpand={() => {
            setIsPlayerMinimized(false);
            setIsPlayerOpen(true);
          }}
          onClose={() => {
            audioEngine.stopSpeech();
            audioEngine.stopAmbient();
            setIsPlayerMinimized(false);
            setIsPlayingAudio(false);
          }}
        />
      )}

      {/* Modal SOS Ansiedade & Pânico */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />

      {/* Modal Diário de Emoções */}
      <MoodJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalEntries}
        onSaveEntry={handleSaveJournalEntry}
      />

      {/* Modal do Mixer de Sons */}
      <SoundMixerModal
        isOpen={isMixerOpen}
        onClose={() => setIsMixerOpen(false)}
      />

      {/* Modal do Chat Serena */}
      <SerenaChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userName={user?.name}
      />

      {/* Modal do Jardim */}
      <SerenityGardenModal
        isOpen={isGardenOpen}
        onClose={() => setIsGardenOpen(false)}
        completedGoalsCount={completedGoalsCount}
        streakDays={streakDays}
        journalCount={journalEntries.length}
      />

      {/* Modal Apoiar via Pix (Asaas) */}
      <ApoioPixModal
        isOpen={isPixOpen}
        onClose={() => setIsPixOpen(false)}
        user={user}
      />

      {/* Modal de Instalação PWA */}
      <InstallPromptModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      {/* Modal de Login (Conecta a Landing Page ao App) */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialUser={user}
      />

      {/* PAINEL ROOT MASTER (MENSALIDADES & GESTÃO FINANCEIRA) */}
      <AdminRootDashboard
        isOpen={isAdminRootOpen}
        onClose={() => {
          setIsAdminRootOpen(false);
          if (window.location.hash === '#root') {
            window.history.pushState(null, '', window.location.pathname);
          }
        }}
      />
    </div>
  );
}
