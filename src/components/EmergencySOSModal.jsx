import React, { useState, useEffect } from 'react';
import { X, Heart, PhoneCall, Sparkles, Wind, Eye, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function EmergencySOSModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('breathe');
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCountdown, setBreathCountdown] = useState(4);
  const [cyclesCount, setCyclesCount] = useState(0);
  const [groundingStep, setGroundingStep] = useState(0);

  const groundingSteps = [
    { count: 5, label: '5 Coisas que você pode ver', desc: 'Olhe ao redor: encontre 5 objetos, cores ou formatos diferentes no ambiente.' },
    { count: 4, label: '4 Coisas que você pode tocar', desc: 'Sinta suas mãos, a textura da sua roupa, a cadeira ou a sola dos pés no chão.' },
    { count: 3, label: '3 Sons que você consegue ouvir', desc: 'Feche os olhos se quiser e preste atenção aos sons sutis distantes ou próximos.' },
    { count: 2, label: '2 Aromas ou cheiros no ar', desc: 'Sinta o aroma do ambiente, de um creme, ou perfume do travesseiro.' },
    { count: 1, label: '1 Sabor ou sensação na boca', desc: 'Perceba o gosto presente na sua boca ou tome um gole d’água gelada.' },
  ];

  useEffect(() => {
    if (!isOpen) return;

    audioEngine.initContext();
    audioEngine.playAmbient('waves');
    audioEngine.setAmbientVolume(0.4);

    return () => {
      audioEngine.stopAmbient();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'breathe') return;

    let timer = setInterval(() => {
      setBreathCountdown((prev) => {
        if (prev <= 1) {
          if (breathPhase === 'inhale') {
            setBreathPhase('hold');
            return 7;
          } else if (breathPhase === 'hold') {
            setBreathPhase('exhale');
            return 8;
          } else {
            setBreathPhase('inhale');
            setCyclesCount((c) => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeTab, breathPhase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] bg-white dark:bg-slate-900 rounded-t-4xl sm:rounded-4xl shadow-2xl border border-calm-200/50 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header Acolhedor */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 bg-gradient-to-r from-calm-500 via-indigo-500 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/20 backdrop-blur-md shrink-0">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white/90 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">SOS Ansiedade & Pânico</h2>
              <p className="text-[11px] sm:text-xs text-white/80">Você está a salvo. Isso vai passar.</p>
            </div>
          </div>
          <button
            onClick={() => {
              audioEngine.stopAmbient();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-2xl hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/80 m-3 sm:m-4 mb-2 rounded-2xl">
          <button
            onClick={() => setActiveTab('breathe')}
            className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'breathe'
                ? 'bg-white dark:bg-slate-700 text-calm-700 dark:text-calm-300 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Wind className="w-3.5 h-3.5 shrink-0" />
            <span>Respiração</span>
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'grounding'
                ? 'bg-white dark:bg-slate-700 text-calm-700 dark:text-calm-300 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>5-4-3-2-1</span>
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'help'
                ? 'bg-white dark:bg-slate-700 text-calm-700 dark:text-calm-300 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span>Ligue 188</span>
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="p-4 sm:p-6 pt-2 flex-1 flex flex-col justify-center min-h-[280px] sm:min-h-[340px] overflow-y-auto">
          {activeTab === 'breathe' && (
            <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 text-center">
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Siga o ritmo do círculo para acalmar o nervo vago e desarmar a adrenalina.
              </p>

              {/* Círculo Animado Responsivo */}
              <div className="relative flex items-center justify-center w-40 h-40 sm:w-52 sm:h-52">
                <div 
                  className={`absolute inset-0 rounded-full border-2 border-calm-400/30 transition-transform duration-1000 ${
                    breathPhase === 'inhale' ? 'scale-105 sm:scale-110' : breathPhase === 'hold' ? 'scale-105 sm:scale-110' : 'scale-90'
                  }`}
                />
                <div 
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-1000 ${
                    breathPhase === 'inhale'
                      ? 'bg-gradient-to-tr from-calm-500 to-indigo-500 scale-105 shadow-calm-500/40'
                      : breathPhase === 'hold'
                      ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 scale-105 shadow-purple-500/40'
                      : 'bg-gradient-to-tr from-teal-500 to-calm-500 scale-90 shadow-teal-500/30'
                  }`}
                >
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold opacity-90 px-2 text-center">
                    {breathPhase === 'inhale' ? 'Inspire' : breathPhase === 'hold' ? 'Segure' : 'Expire Devagar'}
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold mt-0.5">{breathCountdown}</span>
                  <span className="text-[9px] sm:text-[10px] opacity-75">segundos</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-calm-500" />
                <span>Ciclos completados: <strong>{cyclesCount}</strong></span>
              </div>
            </div>
          )}

          {activeTab === 'grounding' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 rounded-3xl bg-calm-50 dark:bg-calm-950/40 border border-calm-200 dark:border-calm-800 text-center">
                <span className="text-xl sm:text-2xl font-black text-calm-600 dark:text-calm-400 block mb-1">
                  Passo {groundingStep + 1} de 5
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                  {groundingSteps[groundingStep].label}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {groundingSteps[groundingStep].desc}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  disabled={groundingStep === 0}
                  onClick={() => setGroundingStep(s => Math.max(0, s - 1))}
                  className="flex-1 py-2.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (groundingStep < groundingSteps.length - 1) {
                      setGroundingStep(s => s + 1);
                    } else {
                      setGroundingStep(0);
                    }
                  }}
                  className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-calm-600 hover:bg-calm-700 text-white text-xs font-semibold shadow-md shadow-calm-600/20"
                >
                  {groundingStep === groundingSteps.length - 1 ? 'Concluir' : 'Próximo Sentido →'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                    CVV - Centro de Valorização da Vida
                  </h4>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-800/90 dark:text-amber-300/90 mb-3 leading-relaxed">
                  Apoio emocional gratuito e voluntário, 24 horas por dia.
                </p>
                <a
                  href="tel:188"
                  className="inline-flex items-center justify-center w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md space-x-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Ligar Gratuitamente para 188</span>
                </a>
              </div>

              <div className="p-3 sm:p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-100">Lembre-se sempre:</p>
                <p>• Crises de ansiedade passam em poucos minutos.</p>
                <p>• Você é forte e vai superar essa fase.</p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400">
            🌿 Sons de ondas suaves ativados para acalmar a mente.
          </p>
        </div>
      </div>
    </div>
  );
}
