import React from 'react';
import { Play, Pause, Maximize2, X, Headphones } from 'lucide-react';

export default function FloatingMiniPlayer({ 
  playbook, 
  isPlaying, 
  onTogglePlay, 
  onExpand, 
  onClose 
}) {
  if (!playbook) return null;

  return (
    <div className="fixed bottom-16 md:bottom-5 right-2 left-2 sm:left-auto sm:right-5 z-40 sm:max-w-sm sm:w-80 p-2.5 sm:p-3.5 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-calm-200 dark:border-slate-800 shadow-2xl flex items-center justify-between space-x-2 sm:space-x-3 animate-slideUp">
      <div 
        onClick={onExpand}
        className="flex items-center space-x-2.5 flex-1 min-w-0 cursor-pointer"
      >
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr ${playbook.coverGradient} flex items-center justify-center text-white shrink-0 shadow-md`}>
          <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-calm-600 dark:text-calm-400 block truncate">
            Em Reprodução
          </span>
          <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {playbook.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        <button
          onClick={onTogglePlay}
          className="p-2 sm:p-2.5 rounded-2xl bg-calm-600 hover:bg-calm-700 text-white shadow-md transition-all active:scale-95"
          title={isPlaying ? "Pausar" : "Tocar"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />}
        </button>
        <button
          onClick={onExpand}
          className="p-1.5 sm:p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          title="Expandir"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 rounded-2xl text-slate-400 hover:text-rose-500"
          title="Fechar"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
