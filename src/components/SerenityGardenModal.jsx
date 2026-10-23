import React, { useState } from 'react';
import { X, Sparkles, Droplets, Sun, Heart, Trophy, Flower2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const PLANTS = [
  {
    id: 'seed',
    name: 'Semente da Esperança',
    icon: '🌰',
    requiredScore: 0,
    desc: 'O primeiro e mais corajoso passo: admitir a dor e querer melhorar.',
    affirmation: 'Toda floresta começou com uma semente silenciosa.'
  },
  {
    id: 'sprout',
    name: 'Brotinho da Coragem',
    icon: '🌱',
    requiredScore: 2,
    desc: 'Você rompeu a terra escura e deu seus primeiros pequenos passos.',
    affirmation: 'A coragem não grita; às vezes ela sussurra: vou tentar de novo amanhã.'
  },
  {
    id: 'lavender',
    name: 'Lavanda da Calma',
    icon: '🪻',
    requiredScore: 5,
    desc: 'O aroma suave da presença. Seus momentos de respiração estão acalmando seu corpo.',
    affirmation: 'Eu mereço a paz que estou construindo.'
  },
  {
    id: 'bamboo',
    name: 'Bambu da Resiliência',
    icon: '🎋',
    requiredScore: 9,
    desc: 'O vento forte tenta te dobrar, mas suas raízes são firmes e você não quebra.',
    affirmation: 'Eu sou flexível diante das tempestades da vida.'
  },
  {
    id: 'lotus',
    name: 'Flor de Lótus da Paz',
    icon: '🪷',
    requiredScore: 14,
    desc: 'Florescendo pura e radiante, mesmo tendo nascido na água turva.',
    affirmation: 'Minhas cicatrizes são parte do meu florescer.'
  },
  {
    id: 'cherry',
    name: 'Cerejeira do Renascimento',
    icon: '🌸',
    requiredScore: 20,
    desc: 'Plena celebração da vida. Você provou a você mesmo a sua força sagrada.',
    affirmation: 'Eu sou digno de alegria, saúde e plenitude.'
  }
];

export default function SerenityGardenModal({ 
  isOpen, 
  onClose, 
  completedGoalsCount, 
  streakDays, 
  journalCount 
}) {
  const [justWatered, setJustWatered] = useState(false);

  if (!isOpen) return null;

  // Pontuação do Jardim = (Metas x 1) + (Streak x 2) + (Diário x 1)
  const gardenScore = (completedGoalsCount * 1) + (streakDays * 2) + (journalCount * 1);

  const handleWaterGarden = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#a78bfa', '#fbbf24']
      });
    } catch (e) {}

    setJustWatered(true);
    setTimeout(() => setJustWatered(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-4xl sm:rounded-4xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        
        {/* Header do Jardim */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Flower2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Seu Jardim da Serenidade
              </h3>
              <p className="text-xs text-slate-400">Cada passo de autocuidado faz a vida florescer em você</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cenário Visual do Jardim */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-sky-100 via-emerald-50 to-emerald-100 dark:from-slate-800 dark:via-emerald-950/40 dark:to-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 overflow-hidden text-center space-y-3">
          <div className="absolute top-3 right-4">
            <Sun className="w-8 h-8 text-amber-400 animate-spin-slow opacity-80" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Vitalidade do Jardim: {gardenScore} Gotas de Luz</span>
          </div>

          {/* Plantas em Destaque */}
          <div className="py-2 flex items-center justify-center space-x-4 sm:space-x-6 text-4xl sm:text-5xl">
            {PLANTS.filter(p => gardenScore >= p.requiredScore).slice(-3).map((p) => (
              <div key={p.id} className="animate-bounce [animation-duration:3s] hover:scale-125 transition-transform cursor-pointer" title={p.name}>
                {p.icon}
              </div>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium max-w-sm mx-auto">
            "Suas pequenas vitórias diárias estão nutrindo a sua alma e regando a sua recuperação."
          </p>

          {/* Botão Regar */}
          <div className="pt-2">
            <button
              onClick={handleWaterGarden}
              disabled={justWatered}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 mx-auto active:scale-95 ${
                justWatered
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white shadow-emerald-500/20'
              }`}
            >
              <Droplets className="w-4 h-4 fill-current" />
              <span>{justWatered ? 'Jardim Regado com Amor! ✨' : 'Regar Jardim Agora (1 Gole de Paz)'}</span>
            </button>
          </div>
        </div>

        {/* Lista de Flores Desbloqueáveis */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Jornada de Florescimento
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PLANTS.map((plant) => {
              const isUnlocked = gardenScore >= plant.requiredScore;
              return (
                <div
                  key={plant.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                    isUnlocked
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{plant.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {plant.name}
                      </h4>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                        isUnlocked 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                      }`}>
                        {isUnlocked ? 'Floresceu' : `${plant.requiredScore} pts`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {plant.desc}
                    </p>
                    {isUnlocked && (
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 italic font-medium mt-1">
                        "{plant.affirmation}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
