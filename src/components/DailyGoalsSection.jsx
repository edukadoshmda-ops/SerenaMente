import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Plus, Sparkles, Droplets, Wind, Sun, 
  Headphones, ShieldCheck, Trash2, Award, HeartHandshake 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ICON_MAP = {
  Droplets,
  Wind,
  Sun,
  Headphones,
  Sparkles,
  ShieldCheck,
  HeartHandshake
};

export default function DailyGoalsSection({ goals, onToggleGoal, onAddGoal, onDeleteGoal }) {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('mente');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('todas');

  const completedCount = goals.filter(g => g.completed).length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const handleToggle = (id) => {
    const target = goals.find(g => g.id === id);
    if (!target.completed) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#a78bfa', '#38bdf8', '#34d399', '#f472b6']
        });
      } catch (e) {}
    }
    onToggleGoal(id);
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddGoal({
      title: newTitle.trim(),
      description: 'Meta gentil criada por você.',
      category: newCategory,
      icon: 'Sparkles',
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  const filteredGoals = goals.filter(g => {
    if (selectedFilter === 'todas') return true;
    return g.category === selectedFilter;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner de Progresso Gentil - Responsivo */}
      <div className="p-4 sm:p-7 rounded-3xl sm:rounded-4xl bg-gradient-to-br from-calm-500/10 via-indigo-500/5 to-teal-500/10 border border-calm-200/50 dark:border-calm-800/30 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-calm-100 dark:bg-calm-950/60 text-calm-700 dark:text-calm-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-calm-500" />
              <span>Metas Gentis</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Pequenos Passos, Grandes Vitórias
            </h3>
            <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg">
              Sem pressa. Se você cumprir apenas uma meta hoje, já é uma vitória enorme.
            </p>
          </div>

          {/* Badge de Progresso */}
          <div className="flex items-center space-x-2.5 bg-white dark:bg-slate-800/90 px-3.5 py-2 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-calm-100 dark:bg-calm-900 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-calm-600 dark:text-calm-400" />
            </div>
            <div>
              <span className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100">{progressPercent}%</span>
              <span className="text-[10px] sm:text-[11px] block text-slate-400">
                {completedCount} de {goals.length} concluídas
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-4 w-full h-2.5 sm:h-3 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-calm-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Ações: Filtros & Botão Adicionar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'mente', label: 'Mente' },
            { id: 'corpo', label: 'Corpo' },
            { id: 'autoestima', label: 'Autoestima' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilter === tab.id
                  ? 'bg-white dark:bg-slate-700 text-calm-600 dark:text-calm-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-calm-600 hover:bg-calm-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Formulário para Adicionar */}
      {showAddForm && (
        <form onSubmit={handleCreateGoal} className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-calm-200 dark:border-slate-700 shadow-lg space-y-2.5 animate-fadeIn">
          <h4 className="text-xs font-bold uppercase tracking-wider text-calm-600 dark:text-calm-400">
            Adicionar Meta Pessoal
          </h4>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Dar uma volta na quadra sem celular..."
              className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-calm-400"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="mente">Mente</option>
              <option value="corpo">Corpo</option>
              <option value="autoestima">Autoestima</option>
              <option value="espirito">Espírito</option>
            </select>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-calm-600 text-white font-semibold text-xs shadow-md"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
        {filteredGoals.map((goal) => {
          const IconComponent = ICON_MAP[goal.icon] || Sparkles;
          return (
            <div
              key={goal.id}
              onClick={() => handleToggle(goal.id)}
              className={`cursor-pointer p-3.5 sm:p-4 rounded-3xl border transition-all duration-300 flex items-start space-x-3 ${
                goal.completed
                  ? 'bg-calm-50/60 dark:bg-calm-950/20 border-calm-200 dark:border-calm-900/50 opacity-90'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {goal.completed ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-calm-600 dark:text-calm-400 fill-calm-100 dark:fill-calm-950" />
                ) : (
                  <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 dark:text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className={`text-xs sm:text-sm font-semibold block truncate ${
                  goal.completed
                    ? 'text-slate-400 line-through'
                    : 'text-slate-800 dark:text-slate-100'
                }`}>
                  {goal.title}
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {goal.description}
                </p>
              </div>

              {onDeleteGoal && goal.id.startsWith('custom-') && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGoal(goal.id);
                  }}
                  className="p-1 rounded-xl text-slate-400 hover:text-rose-500"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
