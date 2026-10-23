import React, { useState, useEffect } from 'react';
import { 
  Heart, ShieldAlert, Sparkles, Sun, Moon, LogOut, Flame, 
  Smartphone, Sliders, MessageCircle, Flower2, QrCode, 
  Menu, X, BookOpen, ChevronRight, User, Check, Smile, Film,
  Key, Shield
} from 'lucide-react';

export default function Navbar({ 
  user, 
  streakDays, 
  onOpenSOS, 
  onOpenJournal, 
  onOpenMixer,
  onOpenChat,
  onOpenGarden,
  onOpenPix,
  onOpenSales,
  onOpenVideos,
  onOpenLogin, 
  onOpenInstall,
  onOpenAdminRoot,
  onLogout,
  isDarkMode, 
  onToggleDarkMode 
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fechar com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleAction = (actionFn) => {
    setIsDrawerOpen(false);
    if (actionFn) actionFn();
  };

  return (
    <>
      {/* 1. BARRA SUPERIOR LIMPA E DESPOLUÍDA - IMAGEM 1 CENTRALIZADA */}
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 py-2.5 sm:py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Lado Esquerdo: BOTÃO PARA ABRIR O MENU LATERAL (NO LADO ESQUERDO) */}
          <div className="flex items-center justify-start min-w-[70px] sm:min-w-[120px]">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-calm-400 transition-all active:scale-95"
              aria-label="Abrir Menu Lateral"
              title="Abrir Menu com todas as opções"
            >
              <Menu className="w-4 h-4 text-calm-600 dark:text-calm-400 shrink-0" />
              <span className="hidden sm:inline">Menu</span>
              {user && (
                <div className="w-5 h-5 rounded-full bg-calm-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          </div>

          {/* CENTRO: LOGO SERENAMENTE CENTRALIZADO (IMAGEM 1 CENTRALIZADA) */}
          <div 
            onClick={() => handleAction(onOpenSales)}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer shrink-0 group text-center"
            title="SerenaMente - Página Inicial"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/95 dark:bg-slate-800/80 p-1 flex items-center justify-center shadow-md border border-slate-200/80 dark:border-slate-700/80 group-hover:scale-105 transition-transform shrink-0">
              <img src="/logo-icon.png?v=3" alt="SerenaMente Logo" className="w-full h-full object-contain dark:hidden" />
              <img src="/logo-white.png?v=3" alt="SerenaMente Logo Branco" className="w-full h-full object-contain hidden dark:block" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  SerenaMente
                </span>
                <span className="text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-calm-600 to-indigo-600 text-white font-extrabold shadow-xs hidden sm:inline-block">
                  Refúgio & Paz
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-300 font-medium hidden md:block pt-0.5">
                Audiobooks Terapêuticos & Cuidado Diário
              </p>
            </div>
          </div>

          {/* LADO DIREITO: STREAK & SOS */}
          <div className="flex items-center justify-end space-x-1.5 sm:space-x-2 min-w-[70px] sm:min-w-[120px] shrink-0">
            {/* Ofensiva / Streak */}
            <div 
              onClick={() => handleAction(onOpenGarden)}
              className="cursor-pointer flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-bold hover:scale-102 transition-all"
              title="Sua sequência de dias - Ver no Jardim"
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span>{streakDays}d</span>
            </div>

            {/* Botão SOS Pânico & Crise */}
            <button
              onClick={onOpenSOS}
              className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all shrink-0"
              title="SOS Ansiedade & Pânico (Respiração 4-7-8 e Ajuda)"
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>SOS</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MENU LATERAL NO LADO ESQUERDO (IMAGEM 2) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
          {/* Fundo escuro com blur para fechar ao clicar */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn"
          />

          {/* Painel do Menu Lateral no Lado Esquerdo */}
          <div className="relative w-full max-w-sm sm:max-w-md h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slide-left">
            
            {/* Topo do Menu Lateral */}
            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Cabeçalho do Menu */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-800/80 p-1 flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                    <img src="/logo-icon.png?v=3" alt="SerenaMente" className="w-full h-full object-contain dark:hidden" />
                    <img src="/logo-white.png?v=3" alt="SerenaMente Logo Branco" className="w-full h-full object-contain hidden dark:block" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Menu SerenaMente</h3>
                    <p className="text-[11px] text-slate-400">Tudo em um só lugar</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Fechar Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Card do Usuário */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-calm-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md">
                    {user ? user.name?.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {user ? user.name : 'Visitante Serena'}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user ? (user.email || 'Conectado') : 'Modo Convidado'}
                    </p>
                  </div>
                </div>

                {user ? (
                  <button
                    onClick={() => handleAction(onLogout)}
                    className="p-2 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                    title="Sair da Conta"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(onOpenLogin)}
                    className="px-3 py-1.5 rounded-2xl bg-calm-600 hover:bg-calm-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Entrar
                  </button>
                )}
              </div>

              {/* GRUPO 1: RECURSOS & TERAPIAS */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  Recursos & Terapias
                </span>

                {/* Página de Vendas / Apresentação */}
                <button
                  onClick={() => handleAction(onOpenSales)}
                  className="w-full p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200">Página de Apresentação & Vendas</h5>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">Conheça o projeto, visão e planos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Apoiar via Pix */}
                <button
                  onClick={() => handleAction(onOpenPix)}
                  className="w-full p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4 fill-rose-500/20" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-rose-900 dark:text-rose-200">Apoiar via Pix (Asaas)</h5>
                      <p className="text-[11px] text-rose-700 dark:text-rose-400">Contribuição voluntária instantânea</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Vídeos do YouTube */}
                <button
                  onClick={() => handleAction(onOpenVideos)}
                  className="w-full p-3 rounded-2xl bg-red-50/60 hover:bg-red-100/70 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200/80 dark:border-red-900/40 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-red-900 dark:text-red-200">Vídeos do YouTube</h5>
                      <p className="text-[11px] text-red-700 dark:text-red-400">Adicione meditações, sons e palestras</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Mixer de Sons */}
                <button
                  onClick={() => handleAction(onOpenMixer)}
                  className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Mixer da Natureza</h5>
                      <p className="text-[11px] text-slate-400">Chuva, fogueira, ondas e 432 Hz</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Assistente Serena (TCC) */}
                <button
                  onClick={() => handleAction(onOpenChat)}
                  className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Assistente Serena TCC</h5>
                      <p className="text-[11px] text-slate-400">Acolhimento com reestruturação cognitiva</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Meu Jardim da Serenidade */}
                <button
                  onClick={() => handleAction(onOpenGarden)}
                  className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Flower2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Meu Jardim Virtual</h5>
                      <p className="text-[11px] text-slate-400">Suas plantas que florescem a cada dia</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Diário de Emoções */}
                <button
                  onClick={() => handleAction(onOpenJournal)}
                  className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Diário de Emoções</h5>
                      <p className="text-[11px] text-slate-400">Registre sentimentos e pequenas vitórias</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* SOS Pânico & Ansiedade */}
                <button
                  onClick={() => handleAction(onOpenSOS)}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-rose-500/10 to-purple-500/10 hover:from-rose-500/15 text-left flex items-center justify-between group border border-rose-200/50 dark:border-rose-900/30 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-rose-800 dark:text-rose-200">SOS Ansiedade & Pânico</h5>
                      <p className="text-[11px] text-rose-600/80 dark:text-rose-300/80">Respiração 4-7-8, Aterramento & CVV 188</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* GRUPO 2: PREFERÊNCIAS */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  Preferências & Aplicativo
                </span>

                {/* Alternar Modo Noturno / Claro */}
                <div 
                  onClick={onToggleDarkMode}
                  className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                      {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isDarkMode ? 'Modo Claro' : 'Modo Noturno'}
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        {isDarkMode ? 'Mudar para tema claro' : 'Mudar para descanso visual'}
                      </p>
                    </div>
                  </div>

                  <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    isDarkMode ? 'bg-calm-600 justify-end' : 'bg-slate-200 justify-start'
                  }`}>
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </div>
                </div>

                {/* Instalar App (PWA) */}
                <button
                  onClick={() => handleAction(onOpenInstall)}
                  className="w-full p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Instalar Aplicativo (PWA)</h5>
                      <p className="text-[11px] text-slate-400">Acesse direto da tela inicial do celular</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* GRUPO 3: ADMINISTRAÇÃO & MENSALIDADES (ROOT) */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Administração & Finanças
                </span>

                <button
                  onClick={() => handleAction(onOpenAdminRoot)}
                  className="w-full p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 text-left flex items-center justify-between group border border-purple-200/60 dark:border-purple-800/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h5 className="text-xs font-extrabold text-purple-900 dark:text-purple-200">Painel Root (Mensalidades)</h5>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-extrabold">Admin</span>
                      </div>
                      <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70">Acompanhe assinantes, pagamentos e Asaas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>

            {/* Rodapé do Menu Lateral */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Centro de Apoio CVV</span>
                <a href="tel:188" className="font-extrabold text-rose-500 hover:underline">Ligue 188 (Grátis 24h)</a>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                SerenaMente • Cuidado Integrativo & Superação
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
