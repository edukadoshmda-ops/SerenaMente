import React, { useState, useEffect } from 'react';
import { 
  X, Volume2, CloudRain, Waves, Flame, Wind, Sparkles, 
  Moon, Play, Pause, RotateCcw, Sliders, Check 
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

const SOUNDS = [
  { id: 'rain', label: 'Chuva Suave', icon: CloudRain, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200' },
  { id: 'waves', label: 'Ondas do Mar', icon: Waves, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200' },
  { id: 'fire', label: 'Fogueira Aconchegante', icon: Flame, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
  { id: 'wind', label: 'Brisa nas Árvores', icon: Wind, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200' },
  { id: 'healing432', label: 'Frequência 432Hz', icon: Sparkles, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200' },
  { id: 'crickets', label: 'Noite Serena & Grilos', icon: Moon, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200' },
];

const PRESETS = [
  {
    name: 'Cabana na Chuva',
    icon: '🌧️',
    volumes: { rain: 0.7, fire: 0.5, wind: 0.2, waves: 0, healing432: 0, crickets: 0 }
  },
  {
    name: 'Paz à Beira-Mar',
    icon: '🌊',
    volumes: { rain: 0, fire: 0, wind: 0.3, waves: 0.75, healing432: 0.2, crickets: 0 }
  },
  {
    name: 'Meditação Profunda',
    icon: '🧘',
    volumes: { rain: 0.2, fire: 0, wind: 0, waves: 0, healing432: 0.8, crickets: 0 }
  },
  {
    name: 'Noite Estrelada',
    icon: '✨',
    volumes: { rain: 0, fire: 0.4, wind: 0.25, waves: 0, healing432: 0, crickets: 0.6 }
  }
];

export default function SoundMixerModal({ isOpen, onClose }) {
  const [volumes, setVolumes] = useState({
    rain: 0,
    waves: 0,
    fire: 0,
    wind: 0,
    healing432: 0,
    crickets: 0,
  });

  const [activePreset, setActivePreset] = useState(null);
  const [sleepTimer, setSleepTimer] = useState(0); // minutos
  const [remainingTime, setRemainingTime] = useState(0);

  const hasAnyActive = Object.values(volumes).some(v => v > 0);

  // Manipular volume individual
  const handleVolumeChange = (soundId, newVol) => {
    const volNum = parseFloat(newVol);
    setVolumes(prev => ({ ...prev, [soundId]: volNum }));
    setActivePreset(null);

    audioEngine.initContext();
    if (volNum > 0) {
      audioEngine.toggleChannel(soundId, true, volNum);
    } else {
      audioEngine.toggleChannel(soundId, false);
    }
  };

  // Alternar som ligado/desligado com clique no ícone
  const toggleSound = (soundId) => {
    const current = volumes[soundId];
    handleVolumeChange(soundId, current > 0 ? 0 : 0.6);
  };

  // Aplicar Preset
  const applyPreset = (preset) => {
    setActivePreset(preset.name);
    setVolumes(preset.volumes);
    audioEngine.initContext();

    Object.entries(preset.volumes).forEach(([id, vol]) => {
      if (vol > 0) {
        audioEngine.toggleChannel(id, true, vol);
      } else {
        audioEngine.toggleChannel(id, false);
      }
    });
  };

  // Parar tudo
  const stopAll = () => {
    audioEngine.stopAllSounds();
    setVolumes({ rain: 0, waves: 0, fire: 0, wind: 0, healing432: 0, crickets: 0 });
    setActivePreset(null);
  };

  // Timer de Sono
  useEffect(() => {
    let interval = null;
    if (sleepTimer > 0) {
      setRemainingTime(sleepTimer * 60);
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            stopAll();
            setSleepTimer(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sleepTimer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-4xl sm:rounded-4xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        
        {/* Topo */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-calm-100 dark:bg-calm-950 text-calm-600 dark:text-calm-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Mixer de Sons da Natureza
              </h3>
              <p className="text-xs text-slate-400">Crie seu refúgio sonoro exclusivo para dormir e relaxar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Rápidos */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Cenários Prontos de Relaxamento
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const isSelected = activePreset === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-calm-50 border-calm-400 ring-2 ring-calm-300 dark:bg-calm-950 dark:border-calm-600 text-calm-800 dark:text-calm-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-calm-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-lg mb-1">{p.icon}</span>
                  <span className="text-xs font-bold leading-tight">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders de Camadas Sonoras */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Camadas Sonoras Independentes
            </span>
            {hasAnyActive && (
              <button
                onClick={stopAll}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Silenciar Tudo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SOUNDS.map((s) => {
              const Icon = s.icon;
              const vol = volumes[s.id] || 0;
              const isActive = vol > 0;

              return (
                <div 
                  key={s.id}
                  className={`p-3.5 rounded-3xl border transition-all ${
                    isActive 
                      ? 'bg-slate-50 dark:bg-slate-800/80 border-calm-300 dark:border-calm-700 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => toggleSound(s.id)}
                      className="flex items-center space-x-2 text-left"
                    >
                      <div className={`p-2 rounded-2xl border ${s.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {s.label}
                      </span>
                    </button>
                    <span className="text-[10px] font-extrabold text-calm-600 dark:text-calm-400">
                      {Math.round(vol * 100)}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={vol}
                    onChange={(e) => handleVolumeChange(s.id, e.target.value)}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-calm-600"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Timer de Sono no Rodapé */}
        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Moon className="w-4 h-4 text-calm-500" />
            <span>Desligar sons automaticamente:</span>
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setSleepTimer(sleepTimer === mins ? 0 : mins)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  sleepTimer === mins
                    ? 'bg-calm-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {sleepTimer > 0 && (
          <p className="text-center text-[11px] text-calm-600 dark:text-calm-400 font-semibold">
            ⏳ Os sons vão diminuir suavemente e desligar em {Math.floor(remainingTime / 60)}m {remainingTime % 60}s.
          </p>
        )}
      </div>
    </div>
  );
}
