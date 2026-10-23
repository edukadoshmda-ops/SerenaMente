import React, { useState, useRef } from 'react';
import { 
  Heart, Sparkles, Headphones, ShieldAlert, CheckCircle2, ArrowRight, 
  Play, Pause, Waves, CloudRain, ShieldCheck, Download, Star, 
  HelpCircle, ChevronDown, ChevronUp, Lock, Smartphone, RefreshCw, 
  Sliders, MessageCircle, Moon, Sun, FileText, Check, AlertCircle, X, ExternalLink 
} from 'lucide-react';

export default function SalesLandingPage({ 
  onOpenLogin, 
  onEnterAppDirectly,
  isDarkMode,
  onToggleDarkMode
}) {
  // Controle de Tema Claro / Escuro
  const [internalDarkMode, setInternalDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('serena_dark_mode') === 'true';
  });

  const activeDarkMode = typeof isDarkMode === 'boolean' ? isDarkMode : internalDarkMode;

  const handleToggleTheme = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    } else {
      const next = !internalDarkMode;
      setInternalDarkMode(next);
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('serena_dark_mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('serena_dark_mode', 'false');
      }
    }
  };
  // Player de Áudio Demonstrativo Interativo (Voz Feminina e Masculina)
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoVoice, setDemoVoice] = useState('feminina'); // 'feminina' | 'masculina'
  const [demoProgress, setDemoProgress] = useState(0);
  const demoAudioRef = useRef(null);

  // Modal de Checkout Asaas
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '' });

  // Links do Asaas reais e ativos da sua conta
  const ASAAS_LINKS = {
    mensal: 'https://www.asaas.com/000/c/znw37swbmbzvod0z',
    anual: 'https://www.asaas.com/000/c/so98wzo06jbvo8dr',
    vitalicio: 'https://www.asaas.com/000/c/cpvg71k31t3ebq4i'
  };

  // Tocar ou pausar o áudio demonstrativo
  const togglePlayDemo = () => {
    if (isPlayingDemo) {
      if (demoAudioRef.current) demoAudioRef.current.pause();
      setIsPlayingDemo(false);
    } else {
      if (!demoAudioRef.current) {
        demoAudioRef.current = new Audio();
        demoAudioRef.current.ontimeupdate = () => {
          if (demoAudioRef.current && demoAudioRef.current.duration) {
            const pct = (demoAudioRef.current.currentTime / demoAudioRef.current.duration) * 100;
            setDemoProgress(pct);
          }
        };
        demoAudioRef.current.onended = () => {
          setIsPlayingDemo(false);
          setDemoProgress(100);
        };
      }

      const audioUrl = `/audio/ha-luz/${demoVoice}/cap-01.mp3`;
      demoAudioRef.current.src = audioUrl;
      demoAudioRef.current.play().catch((err) => {
        console.warn('Playback error:', err);
      });
      setIsPlayingDemo(true);
    }
  };

  const handleSwitchVoice = (voice) => {
    setDemoVoice(voice);
    const wasPlaying = isPlayingDemo;
    if (demoAudioRef.current) {
      demoAudioRef.current.pause();
    }
    setDemoProgress(0);
    if (!demoAudioRef.current) {
      demoAudioRef.current = new Audio();
    }
    demoAudioRef.current.src = `/audio/ha-luz/${voice}/cap-01.mp3`;
    if (wasPlaying) {
      demoAudioRef.current.play().catch(() => {});
      setIsPlayingDemo(true);
    } else {
      setIsPlayingDemo(false);
    }
  };

  const handleOpenCheckout = (planKey, planName, planPrice, equivalence, highlights) => {
    setSelectedPlan({
      key: planKey,
      name: planName,
      price: planPrice,
      equivalence,
      highlights,
      url: ASAAS_LINKS[planKey] || 'https://www.asaas.com'
    });
    setIsCheckoutOpen(true);
  };

  const handleProceedToAsaas = (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    // Salvar Lead localmente
    try {
      const leads = JSON.parse(localStorage.getItem('serena_captured_leads') || '[]');
      leads.push({ ...leadForm, plan: selectedPlan.name, date: new Date().toISOString() });
      localStorage.setItem('serena_captured_leads', JSON.stringify(leads));
    } catch (err) {}

    window.open(selectedPlan.url, '_blank');
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-teal-500 selection:text-white antialiased transition-colors duration-300">
      
      {/* AVISO TOPO DE APOIO EMOCIONAL / SOS */}
      <div className="bg-teal-50 dark:bg-gradient-to-r dark:from-teal-950 dark:via-slate-900 dark:to-indigo-950 border-b border-teal-200 dark:border-teal-800/40 px-4 py-2 text-center text-xs text-teal-800 dark:text-teal-200 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            Espaço Seguro & Acolhedor:
          </span>
          <span>Você não está sozinho(a). Se estiver em sofrimento agudo, ligue gratuitamente para o <strong>CVV: 188</strong> (24h).</span>
        </div>
      </div>

      {/* HEADER FIXO */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onEnterAppDirectly} title="Ir para a Página Inicial">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-1 flex items-center justify-center shadow-md shrink-0">
              <img src="/logo-icon.png?v=3" alt="SerenaMente" className="w-full h-full object-contain dark:hidden" />
              <img src="/logo-white.png?v=3" alt="SerenaMente" className="w-full h-full object-contain hidden dark:block" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Há Luz no Fim do Túnel</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hidden sm:inline-block">
                  Oficial
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Botão Alternar Tema Claro / Escuro */}
            <button
              onClick={handleToggleTheme}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={activeDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Noturno"}
            >
              {activeDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold hidden sm:inline">Modo Escuro</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenLogin}
              className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Já tenho conta
            </button>
            <button
              onClick={onEnterAppDirectly}
              className="px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <span>Acessar o App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION COM O PRODUTO E PLAYER DE DEGUSTAÇÃO */}
      <section className="relative pt-10 sm:pt-16 pb-16 px-4 sm:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-teal-500/15 via-sky-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
          
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/90 border border-teal-200 dark:border-teal-800/70 text-teal-800 dark:text-teal-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Livro Digital Ilustrado + Audiobook Completo com Narração em Voz Dupla</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.18] max-w-4xl mx-auto">
            Há Luz no Fim do Túnel:<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-indigo-600 to-sky-600 dark:from-teal-300 dark:via-sky-300 dark:to-amber-300">
              Um guia de esperança e cuidado para quem enfrenta a depressão e a ansiedade.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Se você está cansado de acordar sem forças, sentir o peito apertado e ouvir que "é só pensar positivo"... 
            Queremos que saiba de uma coisa: <strong>o que você sente é real, tem nome e tem tratamento</strong>. Você não é fraco nem um fardo.
          </p>

          {/* CARD INTERATIVO DO AUDIOBOOK / DEGUSTAÇÃO COM AS DUAS VOZES */}
          <div className="max-w-xl mx-auto p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-teal-800/50 backdrop-blur-xl shadow-xl dark:shadow-2xl text-left space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 dark:text-teal-300">
                <Headphones className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Amostra de Áudio: Capítulo 1 (Uma Carta Para Você)</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50">
                HD Terapêutico
              </span>
            </div>

            {/* Seletor de Voz Feminina e Masculina */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Escolha a voz que mais te acalma:</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button 
                  onClick={() => handleSwitchVoice('feminina')} 
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    demoVoice === 'feminina' 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Voz Feminina
                </button>
                <button 
                  onClick={() => handleSwitchVoice('masculina')} 
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    demoVoice === 'masculina' 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Voz Masculina
                </button>
              </div>
            </div>

            {/* Botão Play / Progresso */}
            <div className="flex items-center space-x-3.5 bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <button 
                onClick={togglePlayDemo} 
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-teal-500/30 transition-all active:scale-95 cursor-pointer"
              >
                {isPlayingDemo ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white truncate">1. Uma carta para você que está lendo</span>
                  <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 shrink-0">
                    {isPlayingDemo ? 'Ouvindo agora com calma...' : 'Clique para Ouvir'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${demoProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              💡 Narração acolhedora, pausada e sem termos difíceis. Feita especialmente para desacelerar seus batimentos e devolver a calma aos seus pensamentos.
            </p>

          </div>

          {/* BOTÃO DE AÇÃO DIRETA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a 
              href="#planos" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Ver os Planos de Acesso Abaixo</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={onEnterAppDirectly}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-teal-500 dark:text-calm-400" />
              <span>Experimentar o Aplicativo</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. TABELA COMPARATIVA OFICIAL EXIGIDA PELO USUÁRIO */}
      <section id="planos" className="py-16 px-4 sm:px-8 bg-slate-100/70 dark:bg-slate-900/70 border-y border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800/60 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Garantia de 7 Dias • Pagamento Seguro no Asaas (Pix / Cartão)</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
              Tabela de Planos & Valores
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Escolha a opção ideal para você. Liberação imediata e 100% segura.
            </p>
          </div>

          {/* TABELA COMPARATIVA EXATA */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 shadow-xl p-2 sm:p-5">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                  <th className="p-3.5 sm:p-4">Plano</th>
                  <th className="p-3.5 sm:p-4">Preço</th>
                  <th className="p-3.5 sm:p-4">Equivalência</th>
                  <th className="p-3.5 sm:p-4">Destaques</th>
                  <th className="p-3.5 sm:p-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                {/* LINHA 1: ACOLHIMENTO MENSAL */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span>Acolhimento Mensal</span>
                  </td>
                  <td className="p-3.5 sm:p-4 font-black text-teal-700 dark:text-teal-300 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-normal">De R$ 19,90</span>
                      <span>R$ 9,90 <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/mês</span></span>
                    </div>
                  </td>
                  <td className="p-3.5 sm:p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
                    Sem fidelidade
                  </td>
                  <td className="p-3.5 sm:p-4 text-slate-600 dark:text-slate-300">
                    Acesso completo a todos os áudios e ao botão SOS
                  </td>
                  <td className="p-3.5 sm:p-4 text-center">
                    <button 
                      onClick={() => handleOpenCheckout('mensal', 'Acolhimento Mensal', 'R$ 9,90 /mês', 'Sem fidelidade (De R$ 19,90)', 'Acesso completo a todos os áudios e ao botão SOS')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      Assinar Mensal (R$ 9,90)
                    </button>
                  </td>
                </tr>

                {/* LINHA 2: TRANSFORMAÇÃO ANUAL (60% OFF) ⭐ (MAIS ESCOLHIDO) */}
                <tr className="bg-teal-50/70 hover:bg-teal-50 dark:bg-teal-950/40 dark:hover:bg-teal-950/60 transition-colors border-l-4 border-l-teal-500">
                  <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                      <span>Transformação Anual (60% OFF)</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-xs">
                        ⭐ Mais Escolhido
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 sm:p-4 font-black text-teal-700 dark:text-teal-300 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>R$ 97,00 <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/ano</span></span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">12x no cartão</span>
                    </div>
                  </td>
                  <td className="p-3.5 sm:p-4 text-teal-800 dark:text-teal-200 font-semibold whitespace-nowrap">
                    12x de R$ 9,70 <span className="text-[10px] text-slate-500 dark:text-slate-400 block">(ou R$ 8,08/mês)</span>
                  </td>
                  <td className="p-3.5 sm:p-4 text-slate-700 dark:text-slate-200 font-medium">
                    Inclui todos os PDFs para download, histórias de sono e atualizações
                  </td>
                  <td className="p-3.5 sm:p-4 text-center">
                    <button 
                      onClick={() => handleOpenCheckout('anual', 'Transformação Anual (60% OFF) ⭐ (Mais Escolhido)', 'R$ 97,00 /ano ou 12x no Cartão', '12x de R$ 9,70 ou R$ 8,08 /mês (R$ 0,27/dia)', 'Inclui todos os PDFs para download, histórias de sono e atualizações')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-teal-500/20 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      Garantir 12x de R$ 9,70
                    </button>
                  </td>
                </tr>

                {/* LINHA 3: ACESSO VITALÍCIO + BÔNUS */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Acesso Vitalício + Bônus</span>
                  </td>
                  <td className="p-3.5 sm:p-4 font-black text-amber-700 dark:text-amber-300 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>R$ 147,00 <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">(único)</span></span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">12x no cartão</span>
                    </div>
                  </td>
                  <td className="p-3.5 sm:p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                    12x de R$ 14,70 <span className="text-[10px] text-slate-500 dark:text-slate-400 block">no Cartão</span>
                  </td>
                  <td className="p-3.5 sm:p-4 text-slate-600 dark:text-slate-300">
                    Acesso permanente para sempre, sem mensalidades
                  </td>
                  <td className="p-3.5 sm:p-4 text-center">
                    <button 
                      onClick={() => handleOpenCheckout('vitalicio', 'Acesso Vitalício + Bônus', 'R$ 147,00 (único) ou 12x no Cartão', '12x de R$ 14,70 no Cartão', 'Acesso permanente para sempre, sem mensalidades')}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      Garantir 12x de R$ 14,70
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3 CARDS DETALHADOS DE PREÇO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
            
            {/* CARD 1: ACOLHIMENTO MENSAL */}
            <div className="p-6 sm:p-8 rounded-4xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Sem Fidelidade
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Acolhimento Mensal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ideal para experimentar o refúgio diário e ter suporte nos momentos de angústia.
                </p>
                
                <div className="pt-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through">De R$ 19,90</span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">R$ 9,90</div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">por mês</span>
                  <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">✓ Sem fidelidade (cancele a qualquer momento)</div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">✓ <strong>Acesso completo a todos os áudios</strong></div>
                  <div className="flex items-center gap-2">✓ <strong>Acesso ao Botão SOS de Pânico</strong></div>
                  <div className="flex items-center gap-2">✓ Livro "Há Luz no Fim do Túnel" completo</div>
                  <div className="flex items-center gap-2">✓ Narração dupla (Voz Feminina e Masculina)</div>
                  <div className="flex items-center gap-2">✓ Mixer de Sons Relaxantes (Chuva, Ondas, 432 Hz)</div>
                  <div className="flex items-center gap-2">✓ Diário de Emoções & Metas Gentis</div>
                </div>
              </div>

              <button 
                onClick={() => handleOpenCheckout('mensal', 'Acolhimento Mensal', 'R$ 9,90 /mês', 'Sem fidelidade (De R$ 19,90)', 'Acesso completo a todos os áudios e ao botão SOS')}
                className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Assinar Mensal (R$ 9,90)
              </button>
            </div>

            {/* CARD 2: TRANSFORMAÇÃO ANUAL (60% OFF) - O MAIS ESCOLHIDO */}
            <div className="relative p-6 sm:p-8 rounded-4xl bg-gradient-to-b from-teal-50/80 via-white to-white dark:from-teal-950/80 dark:via-slate-900 dark:to-slate-950 border-2 border-teal-500 dark:border-teal-400 shadow-2xl shadow-teal-500/15 flex flex-col justify-between space-y-6 md:-translate-y-3">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-teal-500 via-sky-500 to-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                🔥 Mais Escolhido • 12x no Cartão
              </div>

              <div className="space-y-4 pt-2">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border border-teal-300 dark:border-teal-700/50">
                  12x de R$ 9,70 no Cartão (ou R$ 97 à vista)
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transformação Anual</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  O caminho mais completo e seguro para consolidar novos hábitos e reconquistar a paz.
                </p>
                
                <div className="pt-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through">De R$ 238,80</span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    12x <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-300">R$ 9,70</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">ou R$ 97,00 à vista no Pix / Cartão</span>
                  <div className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold mt-1">Custa apenas R$ 0,27 por dia!</div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-2">✓ <strong>Tudo do Plano Mensal incluso</strong></div>
                  <div className="flex items-center gap-2">✓ <strong>Parcelamento em até 12x no Cartão</strong></div>
                  <div className="flex items-center gap-2">✓ <strong>Inclui todos os PDFs para download</strong></div>
                  <div className="flex items-center gap-2">✓ <strong>Histórias de sono para curar a insônia</strong></div>
                  <div className="flex items-center gap-2">✓ <strong>Todas as atualizações do ano inclusas</strong></div>
                  <div className="flex items-center gap-2">✓ Plano de Ação de 7 Dias para dias difíceis</div>
                  <div className="flex items-center gap-2">✓ Garantia Incondicional de 7 Dias</div>
                </div>
              </div>

              <button 
                onClick={() => handleOpenCheckout('anual', 'Transformação Anual (60% OFF) ⭐ (Mais Escolhido)', 'R$ 97,00 /ano ou 12x no Cartão', '12x de R$ 9,70 ou R$ 8,08 /mês (R$ 0,27/dia)', 'Inclui todos os PDFs para download, histórias de sono e atualizações')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-teal-500/30 transition-all active:scale-95 cursor-pointer"
              >
                Quero o Plano Anual (12x de R$ 9,70 ou R$ 97)
              </button>
            </div>

            {/* CARD 3: ACESSO VITALÍCIO + BÔNUS */}
            <div className="p-6 sm:p-8 rounded-4xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                  Acesso Para Sempre • 12x no Cartão
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Acesso Vitalício + Bônus</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pague uma única vez e tenha o refúgio como companheiro para a vida inteira.
                </p>
                
                <div className="pt-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through">De R$ 497,00</span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    12x <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-300">R$ 14,70</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">ou R$ 147,00 à vista no Pix / Cartão</span>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">Pagamento único • Nunca mais pague nada</div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">✓ <strong>Acesso permanente para sempre, sem mensalidades</strong></div>
                  <div className="flex items-center gap-2">✓ <strong>Parcelamento em até 12x no Cartão</strong></div>
                  <div className="flex items-center gap-2">✓ <strong>Todos os Audiobooks em MP3 para download</strong></div>
                  <div className="flex items-center gap-2">✓ <strong>Todos os Livros em PDF atuais e futuros</strong></div>
                  <div className="flex items-center gap-2">✓ Acesso Vitalício ao App completo</div>
                  <div className="flex items-center gap-2">✓ Nunca mais pague nenhuma renovação</div>
                  <div className="flex items-center gap-2">✓ Garantia Incondicional de 7 Dias</div>
                </div>
              </div>

              <button 
                onClick={() => handleOpenCheckout('vitalicio', 'Acesso Vitalício + Bônus', 'R$ 147,00 (único) ou 12x no Cartão', '12x de R$ 14,70 no Cartão', 'Acesso permanente para sempre, sem mensalidades')}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                Garantir Vitalício (12x de R$ 14,70 ou R$ 147)
              </button>
            </div>

          </div>

          {/* BANNER SEGURANÇA ASAAS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-slate-900 dark:text-white">Pagamento seguro processado pelo Asaas:</span>
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold">Pix Instantâneo</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">Cartão em até 12x</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">Boleto</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Liberação imediata e automática</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. UMA CARTA DIRETA PARA VOCÊ (CAPÍTULO 1) */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-teal-800/40 shadow-lg space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800/60">
              <span>Capítulo 1 do Livro</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              "Se você chegou até aqui, talvez esteja cansado..."
            </h3>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Cansado de acordar sem vontade, de sentir o peito apertado sem motivo aparente, de ouvir <em>"isso é frescura"</em> ou <em>"é só pensar positivo"</em>. Talvez você se sinta sozinho, mesmo cercado de gente.
            </p>
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border-l-4 border-teal-500 dark:border-teal-400 text-teal-900 dark:text-teal-100 font-medium text-sm">
              "Queremos que saiba de uma coisa logo no começo: <strong>o que você sente é real, tem nome e tem tratamento</strong>. Você não é fraco, não é preguiçoso, não é um fardo. Você está doente – e doenças se tratam."
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Milhões de pessoas já passaram por onde você está agora e hoje vivem bem. Não porque o sofrimento sumiu num passe de mágica, mas porque deram um passo de cada vez.
            </p>
          </div>
        </div>
      </section>

      {/* 4. MITOS QUE PRECISAMOS DERRUBAR (CAPÍTULO 2) */}
      <section className="py-16 px-4 sm:px-8 bg-slate-100/60 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Mitos que Precisamos Derrubar</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">A culpa não é sua. Compreenda a ciência por trás do sofrimento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-rose-500 dark:text-rose-400 block">❌ Mito: "É falta de Deus ou falta de fé"</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                <strong className="text-teal-600 dark:text-teal-400">✓ Verdade:</strong> Pessoas de fé profunda também adoecem. A fé é um apoio, mas depressão é doença neuroquímica e precisa de tratamento.
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-rose-500 dark:text-rose-400 block">❌ Mito: "Quem tem tudo não tem motivo pra deprimir"</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                <strong className="text-teal-600 dark:text-teal-400">✓ Verdade:</strong> Depressão não escolhe conta bancária, aparência ou família. É uma condição biológica, não ingratidão.
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-rose-500 dark:text-rose-400 block">❌ Mito: "Remédio vicia e transforma em zumbi"</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                <strong className="text-teal-600 dark:text-teal-400">✓ Verdade:</strong> Antidepressivos modernos bem indicados não causam dependência e ajudam o cérebro a se reequilibrar.
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-rose-500 dark:text-rose-400 block">❌ Mito: "É só você se esforçar mais"</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                <strong className="text-teal-600 dark:text-teal-400">✓ Verdade:</strong> Dizer isso a um deprimido é como dizer a alguém com a perna quebrada para "só andar e correr".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GARANTIA BLINDADA DE 7 DIAS */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto p-8 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-teal-800/40 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center shrink-0 text-3xl">
            🛡️
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Garantia Incondicional de 7 Dias</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Experimente o material por 7 dias inteiros. Se você não sentir seu peito mais leve, devolvemos 100% do seu dinheiro via Pix imediatamente, sem burocracia. O risco é inteiramente nosso.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center space-y-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-rose-500 font-bold">⚠️ Aviso Importante de Saúde</p>
          <p className="leading-relaxed">
            Este material tem caráter psicoeducativo e de apoio. Não substitui acompanhamento médico ou psicológico. Em sofrimento agudo, ligue gratuitamente para o <strong>CVV (188)</strong>.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-4xl mx-auto">
          <span>© SerenaMente • Há Luz no Fim do Túnel. Pagamentos processados com segurança pelo Asaas.</span>
          <a 
            href="#root" 
            className="text-slate-400 hover:text-purple-600 dark:text-slate-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1 font-mono text-[10px]"
            title="Acesso Administrativo Root"
          >
            <span>🔒 Painel Root</span>
          </a>
        </div>
      </footer>

      {/* MODAL DE CHECKOUT INTEGRADO COM ASAAS */}
      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-wider">Passo 1 de 2 • Cadastro</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{selectedPlan.name}</h3>
                <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold">{selectedPlan.price} • {selectedPlan.equivalence}</p>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-xl font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Informe seus dados para receber o comprovante e os links de acesso no e-mail:
            </p>

            <form onSubmit={handleProceedToAsaas} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Seu Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  placeholder="Como podemos te chamar?" 
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Seu Melhor E-mail (receberá os PDFs e áudios)</label>
                <input 
                  type="email" 
                  required 
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  placeholder="seuemail@exemplo.com" 
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">WhatsApp com DDD (para envio do comprovante)</label>
                <input 
                  type="tel" 
                  required 
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  placeholder="(DDD) 99999-9999" 
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 cursor-pointer"
              >
                <span>Ir para Pagamento Seguro no Asaas (Pix/Cartão)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}