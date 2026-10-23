import React, { useState } from 'react';
import { X, Heart, Sparkles, Smile, Frown, Meh, Sun, CloudLightning, Calendar, Check } from 'lucide-react';

const MOODS = [
  { id: 'ansioso', label: 'Ansioso / Aflito', icon: CloudLightning, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300' },
  { id: 'deprimido', label: 'Pesado / Sem energia', icon: Frown, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300' },
  { id: 'neutro', label: 'Oscilando / Neutro', icon: Meh, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-300' },
  { id: 'sereno', label: 'Sereno / Aliviado', icon: Smile, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300' },
  { id: 'esperancoso', label: 'Esperançoso / Bem', icon: Sun, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-300' },
];

const COMFORT_MESSAGES = {
  ansioso: 'Seu coração pode estar acelerado, mas este momento vai passar. Não se cobre resolver nada agora. Você está em segurança.',
  deprimido: 'É perfeitamente válido não ter forças para tudo hoje. Permita-se ser apenas você, sem exigências. Um gole de água já é uma vitória.',
  neutro: 'Dias mornos fazem parte da restauração. Não precisa estar radiante para estar em paz. Você está no caminho certo.',
  sereno: 'Que alegria sentir essa brisa de paz. Saboreie essa sensação e guarde na memória corporal esse alívio.',
  esperancoso: 'Que sensação maravilhosa ver você florescer! Lembre-se desta força nas horas em que as nuvens voltarem.'
};

export default function MoodJournalModal({ isOpen, onClose, entries, onSaveEntry }) {
  const [selectedMood, setSelectedMood] = useState('ansioso');
  const [note, setNote] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      note: note.trim(),
      gratitude: gratitude.trim(),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };

    onSaveEntry(newEntry);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setNote('');
      setGratitude('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-4xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Topbar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-calm-100 dark:bg-calm-950 text-calm-600 dark:text-calm-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Diário de Emoções & Acolhimento
              </h3>
              <p className="text-xs text-slate-400">Como está o seu peito hoje?</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Escolha do Humor */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Selecione seu sentimento predominante
          </label>
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(m.id)}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? `ring-2 ring-calm-400 scale-105 shadow-md ${m.color}`
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold text-center leading-tight">
                    {m.label.split('/')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mensagem Compassiva Imediata */}
        <div className="p-4 rounded-3xl bg-calm-50 dark:bg-calm-950/40 border border-calm-200 dark:border-calm-800 text-xs text-calm-900 dark:text-calm-200 leading-relaxed italic">
          "{COMFORT_MESSAGES[selectedMood]}"
        </div>

        {/* Formulário de Escrita Acolhedora */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Despeje seus pensamentos (sem julgamentos)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="O que está pesando ou se passando pela sua cabeça neste instante? Pode desabafar livremente..."
              className="w-full p-3.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-calm-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              1 Pequena coisa boa do seu dia (opcional)
            </label>
            <input
              type="text"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Ex: O café quente da manhã, o abraço que recebi, ver o céu azul..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-calm-400"
            />
          </div>

          <button
            type="submit"
            disabled={savedSuccess}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 text-white ${
              savedSuccess
                ? 'bg-emerald-600'
                : 'bg-gradient-to-r from-calm-600 to-indigo-600 hover:from-calm-700'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Registrado com Sucesso e Carinho!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Salvar Registro de Acolhimento</span>
              </>
            )}
          </button>
        </form>

        {/* Histórico Recente de Entradas */}
        {entries.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Registros Anteriores
            </span>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {entries.slice(-3).reverse().map((entry) => (
                <div key={entry.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-semibold uppercase">{entry.mood}</span>
                    <span>{entry.date}</span>
                  </div>
                  {entry.note && <p className="text-slate-700 dark:text-slate-300">{entry.note}</p>}
                  {entry.gratitude && (
                    <p className="text-calm-600 dark:text-calm-400 font-medium text-[11px]">
                      ✨ {entry.gratitude}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
