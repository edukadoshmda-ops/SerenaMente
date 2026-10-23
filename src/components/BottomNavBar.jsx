import React from 'react';
import { Headphones, CheckCircle2, Trophy, Heart, ShieldAlert, Sliders, MessageCircle, Flower2 } from 'lucide-react';

export default function BottomNavBar({ 
  activeTab, 
  onSelectTab, 
  onOpenSOS, 
  onOpenMixer,
  onOpenChat,
  onOpenGarden,
  completedGoalsCount 
}) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-800/70 px-2 py-1.5 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around">
        {/* Playbooks */}
        <button
          onClick={() => onSelectTab('playbooks')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all ${
            activeTab === 'playbooks'
              ? 'text-calm-600 dark:text-calm-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <Headphones className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Áudios</span>
        </button>

        {/* Mixer de Sons */}
        <button
          onClick={onOpenMixer}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-slate-400 hover:text-calm-600 transition-all"
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Sons</span>
        </button>

        {/* Botão Central SOS Pânico */}
        <button
          onClick={onOpenSOS}
          className="flex flex-col items-center justify-center -mt-4"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 active:scale-95 transition-transform border-2 border-white dark:border-slate-900">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-extrabold text-rose-500 mt-0.5">SOS</span>
        </button>

        {/* Chat Serena TCC */}
        <button
          onClick={onOpenChat}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-slate-400 hover:text-calm-600 transition-all"
        >
          <MessageCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Serena</span>
        </button>

        {/* Jardim Virtual */}
        <button
          onClick={onOpenGarden}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-slate-400 hover:text-emerald-500 transition-all"
        >
          <Flower2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Jardim</span>
        </button>
      </div>
    </nav>
  );
}
