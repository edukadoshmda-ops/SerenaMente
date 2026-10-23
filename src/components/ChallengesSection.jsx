import React, { useState } from 'react';
import { 
  Trophy, CheckCircle2, Lock, ArrowRight, Sparkles, 
  BookOpen, Heart, Flame, Calendar 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ChallengesSection({ 
  journeys, 
  userProgress, 
  onCompleteDay, 
  onOpenPlaybookById, 
  onOpenJournal 
}) {
  const [selectedJourneyId, setSelectedJourneyId] = useState(journeys[0]?.id || '');
  const [activeDayDetail, setActiveDayDetail] = useState(null);

  const activeJourney = journeys.find(j => j.id === selectedJourneyId) || journeys[0];
  const journeyProgress = userProgress[activeJourney.id] || { completedDays: [] };

  const handleComplete = (dayNum) => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}
    onCompleteDay(activeJourney.id, dayNum);
    setActiveDayDetail(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Seletor de Jornada com Scroll Horizontal em Mobile */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {journeys.map((j) => {
          const isActive = j.id === selectedJourneyId;
          const completedCount = (userProgress[j.id]?.completedDays || []).length;
          return (
            <button
              key={j.id}
              onClick={() => {
                setSelectedJourneyId(j.id);
                setActiveDayDetail(null);
              }}
              className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl text-left border transition-all flex items-center space-x-2.5 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-calm-600 to-indigo-600 text-white shadow-md border-transparent'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shrink-0 ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block whitespace-nowrap">{j.title}</span>
                <span className={`text-[9px] sm:text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                  {completedCount}/{j.daysCount} dias superados
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Banner da Jornada */}
      <div className={`p-4 sm:p-6 rounded-3xl sm:rounded-4xl bg-gradient-to-r ${activeJourney.gradient} text-white shadow-xl relative overflow-hidden`}>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-semibold mb-1.5">
            <Flame className="w-3 h-3 text-amber-300" />
            <span>Desafio Guiado</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold tracking-tight">{activeJourney.title}</h3>
          <p className="mt-1 text-xs sm:text-sm text-white/90 line-clamp-2 sm:line-clamp-none">{activeJourney.tagline}</p>
        </div>
      </div>

      {/* Grid de Dias da Jornada - 2 colunas no celular */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {activeJourney.days.map((dayItem) => {
          const isDone = journeyProgress.completedDays.includes(dayItem.day);
          const isCurrent = !isDone && (dayItem.day === 1 || journeyProgress.completedDays.includes(dayItem.day - 1));

          return (
            <div
              key={dayItem.day}
              onClick={() => setActiveDayDetail(dayItem)}
              className={`cursor-pointer p-3 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] sm:min-h-[160px] ${
                isDone
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                  : isCurrent
                  ? 'bg-white dark:bg-slate-800 border-calm-400 dark:border-calm-600 ring-2 ring-calm-300 dark:ring-calm-800 shadow-md scale-[1.01]'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                    isDone 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                      : isCurrent
                      ? 'bg-calm-100 text-calm-700 dark:bg-calm-950 dark:text-calm-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
                  }`}>
                    Dia {dayItem.day}
                  </span>

                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <Sparkles className="w-4 h-4 text-calm-500" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                  {dayItem.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {dayItem.task}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-semibold">
                <span className={isDone ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-calm-600 dark:text-calm-400' : 'text-slate-400'}>
                  {isDone ? 'Feito ✓' : isCurrent ? 'Dar passo →' : 'Ver'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhe do Dia Aberto */}
      {activeDayDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-4xl sm:rounded-4xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-calm-100 dark:bg-calm-950 text-calm-700 dark:text-calm-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Desafio do Dia {activeDayDetail.day}
              </span>
              <button
                onClick={() => setActiveDayDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                {activeDayDetail.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800">
                {activeDayDetail.task}
              </p>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-calm-50/80 dark:bg-calm-950/40 border border-calm-200/60 dark:border-calm-800/40">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-calm-600 dark:text-calm-400 flex items-center space-x-1 mb-0.5">
                <Heart className="w-3 h-3" />
                <span>Afirmação para o seu dia</span>
              </span>
              <p className="text-xs sm:text-sm font-medium italic text-slate-700 dark:text-slate-200">
                "{activeDayDetail.affirmation}"
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {activeDayDetail.actionType === 'audio' && activeDayDetail.targetPlaybookId && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveDayDetail(null);
                    onOpenPlaybookById(activeDayDetail.targetPlaybookId);
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ouvir Playbook Recomendado</span>
                </button>
              )}

              {activeDayDetail.actionType === 'journal' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveDayDetail(null);
                    if (onOpenJournal) onOpenJournal();
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-calm-50 dark:bg-calm-950/40 text-calm-700 dark:text-calm-300 font-semibold text-xs border border-calm-200 dark:border-calm-800 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Abrir Diário de Emoções</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleComplete(activeDayDetail.day)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-calm-600 to-indigo-600 hover:from-calm-700 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {journeyProgress.completedDays.includes(activeDayDetail.day)
                    ? 'Desafio Concluído (Celebrar)'
                    : 'Marcar como Vencido!'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
