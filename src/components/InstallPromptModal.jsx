import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  X, 
  Check, 
  Sparkles, 
  Monitor, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  Maximize2,
  Lock,
  ArrowUpRight
} from 'lucide-react';

export default function InstallPromptModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPWAInstallPrompt || null);
  const [isIOS, setIsIOS] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    // 1. Detectar dispositivo / SO
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isWin = /windows|win32|win64/.test(ua);
    setIsIOS(isIosDevice);
    setIsWindows(isWin);

    // 2. Detectar se já está rodando como PWA instalado (Standalone)
    if (
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    ) {
      setIsInstalled(true);
    }

    // 3. Capturar se o prompt antecipado já foi capturado no index.html
    if (window.deferredPWAInstallPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt);
    }

    // 4. Ouvir novos eventos de prompt
    const handlePromptAvailable = () => {
      if (window.deferredPWAInstallPrompt) {
        setDeferredPrompt(window.deferredPWAInstallPrompt);
      }
    };

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Disparar o prompt nativo do navegador (se disponível)
  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        window.deferredPWAInstallPrompt = null;
      } catch (err) {
        console.warn('Erro ao disparar prompt PWA:', err);
      }
    }
  };

  // Abrir o app em janela de aplicativo nativo (Modo Standalone / Sem barras)
  const handleOpenAppWindow = () => {
    const width = 460;
    const height = 860;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    window.open(
      window.location.origin,
      'SerenaMenteStandaloneApp',
      `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  };

  // Baixar lançador HTML (compatível com 100% dos navegadores sem bloqueio .download)
  const handleDownloadLauncher = () => {
    try {
      const appUrl = window.location.origin;
      const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>SerenaMente • Abrindo...</title>
  <link rel="icon" href="${appUrl}/favicon.png">
  <meta http-equiv="refresh" content="0; url=${appUrl}/">
  <script>
    window.location.replace('${appUrl}/');
  </script>
  <style>
    body {
      background: #090d16;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      padding: 32px;
      border-radius: 24px;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    h2 { margin: 12px 0 6px; font-size: 20px; color: #a78bfa; }
    p { font-size: 14px; color: #94a3b8; }
    a {
      display: inline-block;
      margin-top: 16px;
      background: #7c3aed;
      color: #fff;
      padding: 10px 20px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="${appUrl}/logo-icon.png" width="64" height="64" alt="SerenaMente" style="border-radius: 16px;">
    <h2>SerenaMente</h2>
    <p>Iniciando o seu refúgio de paz...</p>
    <a href="${appUrl}/">Entrar no Aplicativo</a>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'SerenaMente - Atalho Oficial.html';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (err) {
      console.error('Falha ao baixar lançador:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl sm:rounded-4xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[94vh] overflow-y-auto">
        
        {/* Cabeçalho com Logo de Cantos Arredondados */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-calm-500/20 to-teal-500/20 p-1 flex items-center justify-center shadow-md border border-slate-200/80 dark:border-slate-700 shrink-0 overflow-hidden">
              <img 
                src="/app-icon-rounded.png" 
                alt="SerenaMente Logo" 
                className="w-11 h-11 object-contain rounded-xl drop-shadow" 
                onError={(e) => { e.currentTarget.src = '/icon-192.png'; }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Instalador SerenaMente
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-calm-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-wider shadow-xs">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Seu aplicativo de alívio emocional e sono a 1 toque
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status: Já Instalado */}
        {isInstalled ? (
          <div className="p-4 sm:p-5 rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-700 space-y-2">
            <div className="flex items-center space-x-2 text-teal-800 dark:text-teal-200 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>O SerenaMente já está instalado!</span>
            </div>
            <p className="text-xs text-teal-900 dark:text-teal-100 leading-relaxed font-medium">
              Você já pode abrir o aplicativo direto pelo ícone na sua área de trabalho ou lista de aplicativos do celular.
            </p>
          </div>
        ) : (
          <>
            {/* Vantagens do App - Alta Legibilidade no Tema Escuro */}
            <div className="p-4 rounded-3xl bg-calm-50/80 dark:bg-slate-800/90 border border-calm-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center space-x-2 font-black text-calm-800 dark:text-calm-200 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-calm-500 dark:text-calm-300 shrink-0" />
                <span>Por que ter o app no seu dispositivo?</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-start space-x-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 dark:text-slate-100 font-medium">
                    Abre em <strong className="text-slate-950 dark:text-white font-bold">tela cheia</strong>, sem abas de navegador.
                  </span>
                </div>

                <div className="flex items-start space-x-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 dark:text-slate-100 font-medium">
                    <strong className="text-slate-950 dark:text-white font-bold">Botão SOS Pânico</strong> acessível na hora que precisar.
                  </span>
                </div>

                <div className="flex items-start space-x-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 dark:text-slate-100 font-medium">
                    Playbooks e Áudios <strong className="text-slate-950 dark:text-white font-bold">carregam mais rápido</strong>.
                  </span>
                </div>

                <div className="flex items-start space-x-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 dark:text-slate-100 font-medium">
                    Ícone oficial direto na <strong className="text-slate-950 dark:text-white font-bold">Área de Trabalho/Celular</strong>.
                  </span>
                </div>
              </div>
            </div>

            {/* Ações de Instalação e Acesso */}
            <div className="space-y-2.5">
              
              {/* Botão 1: Se o navegador disponibilizou o prompt direto */}
              {(deferredPrompt || window.deferredPWAInstallPrompt) ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-calm-600 via-indigo-600 to-purple-600 hover:from-calm-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-calm-600/30 flex items-center justify-center space-x-2.5 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>📲 Instalar Aplicativo Agora (PWA Nativo)</span>
                </button>
              ) : null}

              {/* Botão 2: Abrir em Janela de Aplicativo Standalone */}
              <button
                onClick={handleOpenAppWindow}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-calm-600 via-indigo-600 to-teal-600 hover:from-calm-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2.5 shadow-lg shadow-calm-900/30 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-teal-200 shrink-0" />
                <span>Abrir em Modo Aplicativo (Sem Barras)</span>
              </button>

              {/* Botão 3: Baixar Atalho para a Área de Trabalho (Com Ícone Arredondado) */}
              <button
                onClick={handleDownloadLauncher}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2.5 transition-all border active:scale-[0.98] cursor-pointer ${
                  downloadSuccess 
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/90 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-sm'
                }`}
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span className="font-extrabold">Atalho com Ícone Arredondado Baixado!</span>
                  </>
                ) : (
                  <>
                    <img 
                      src="/app-icon-rounded.png" 
                      alt="Ícone SerenaMente" 
                      className="w-5 h-5 rounded-md object-contain shrink-0 shadow-xs border border-white/20" 
                    />
                    <span>Baixar Atalho para a Área de Trabalho</span>
                  </>
                )}
              </button>

            </div>

            {/* Guia Visual por Navegador */}
            {isIOS ? (
              /* Instruções iOS Safari */
              <div className="space-y-3 p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Smartphone className="w-4 h-4 text-calm-500" />
                  <span>Como instalar no iPhone ou iPad (Safari):</span>
                </p>
                <ol className="space-y-2 text-slate-800 dark:text-slate-200 list-decimal list-inside font-medium leading-relaxed">
                  <li>Toque no botão <strong className="text-slate-950 dark:text-white font-bold">Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline mx-1 text-calm-500" />) na barra inferior do Safari.</li>
                  <li>Role para baixo e selecione <strong className="text-slate-950 dark:text-white font-bold">"Adicionar à Tela de Início"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-calm-500" />).</li>
                  <li>Toque em <strong className="text-slate-950 dark:text-white font-bold">Adicionar</strong> no canto superior direito.</li>
                </ol>
              </div>
            ) : (
              /* Instruções Chrome / Edge no PC com Mockup Visual da Barra */
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs space-y-3.5">
                <div className="flex items-center space-x-2 font-black text-slate-900 dark:text-white">
                  <Laptop className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>Instalar pelo Navegador (Chrome / Edge / Brave):</span>
                </div>

                {/* Mockup da Barra de Endereço com Destaque no Botão de Instalação */}
                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 flex items-center justify-between gap-2 shadow-inner">
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 truncate text-[11px] font-mono">
                    <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">localhost:3000</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-calm-600 to-indigo-600 text-white font-black text-[11px] shadow-sm animate-pulse">
                      <Download className="w-3 h-3" />
                      <span>Instalar</span>
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  <div className="flex items-start space-x-2">
                    <span className="font-extrabold text-teal-600 dark:text-teal-400 shrink-0">1.</span>
                    <p>
                      Olhe na <strong className="text-slate-950 dark:text-white font-bold">barra de endereço</strong> do seu navegador no topo direito: clique no botão <strong className="text-calm-600 dark:text-calm-300 font-bold">"Instalar aplicativo"</strong> ou ícone <strong className="text-calm-600 dark:text-calm-300 font-bold">( ⊕ )</strong>.
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-extrabold text-teal-600 dark:text-teal-400 shrink-0">2.</span>
                    <p>
                      Ou abra o menu de <strong className="text-slate-950 dark:text-white font-bold">três pontinhos (⋮)</strong> e escolha <strong className="text-slate-950 dark:text-white font-bold">"Instalar SerenaMente..."</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Rodapé com Alto Contraste */}
        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Continuar no navegador por enquanto
          </button>
        </div>
      </div>
    </div>
  );
}
