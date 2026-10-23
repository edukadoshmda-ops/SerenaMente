import React, { useState } from 'react';
import { Play, BookOpen, Clock, Sparkles, Search, Headphones, Download, FileText } from 'lucide-react';

export default function PlaybookLibrary({ playbooks, onSelectPlaybook }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  const filteredPlaybooks = playbooks.filter((p) => {
    const matchesCategory = selectedCategory === 'todas' || p.category === selectedCategory;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featured = playbooks[0];

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Playbook em Destaque do Dia com Cantos Arredondados */}
      {featured && selectedCategory === 'todas' && !searchQuery && (
        <div className="relative rounded-3xl sm:rounded-4xl bg-gradient-to-br from-calm-600 via-indigo-600 to-purple-800 text-white p-5 sm:p-8 shadow-xl overflow-hidden">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-xl space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Destaque de Hoje</span>
            </div>

            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              {featured.title}
            </h3>
            <p className="text-xs sm:text-sm text-calm-100 font-medium leading-relaxed line-clamp-2 sm:line-clamp-none">
              {featured.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] sm:text-xs text-white/80">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{featured.duration}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{featured.chapters.length} Capítulos</span>
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onSelectPlaybook(featured)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-calm-700 font-bold text-xs shadow-lg hover:bg-calm-50 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Ouvir & Ler Playbook</span>
              </button>
              {featured.pdfUrl && (
                <a
                  href={featured.pdfUrl}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 backdrop-blur-md active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Barra de Filtros & Busca - Fluida para Mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filtros em Pílulas com Scroll Horizontal no Celular */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'todas', label: 'Todos' },
            { id: 'ansiedade', label: 'Ansiedade' },
            { id: 'depressao', label: 'Depressão' },
            { id: 'sono', label: 'Sono' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white dark:bg-slate-700 text-calm-600 dark:text-calm-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Input de Busca */}
        <div className="relative w-full sm:w-auto sm:min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tema..."
            className="w-full px-3.5 py-2 pl-9 text-xs rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-calm-400"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Grid de Cards dos Playbooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
        {filteredPlaybooks.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelectPlaybook(book)}
            className="group cursor-pointer rounded-3xl sm:rounded-4xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 hover:border-calm-300 dark:hover:border-calm-700 shadow-sm hover:shadow-lg transition-all duration-300 p-3.5 sm:p-5 flex flex-col justify-between"
          >
            <div className="flex space-x-3 sm:space-x-4">
              {/* Capa */}
              <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-tr ${book.coverGradient} p-2 sm:p-3 shrink-0 flex flex-col justify-between text-white shadow-md group-hover:scale-105 transition-transform`}>
                <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90" />
                <span className="text-[9px] sm:text-[10px] font-bold bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded-lg truncate text-center">
                  {book.duration}
                </span>
              </div>

              {/* Detalhes */}
              <div className="flex-1 min-w-0 space-y-1">
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-calm-50 dark:bg-calm-950 text-calm-600 dark:text-calm-400 inline-block">
                  {book.category}
                </span>

                <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-calm-600 dark:group-hover:text-calm-400 transition-colors line-clamp-1">
                  {book.title}
                </h4>

                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {book.subtitle}
                </p>

                <p className="text-[10px] text-slate-400 truncate pt-0.5">
                  {book.author}
                </p>
              </div>
            </div>

            {/* Rodapé do Card */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex flex-wrap gap-1 max-w-[65%]">
                {book.tags.slice(0, 2).map((tag, tIdx) => (
                  <span key={tIdx} className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 truncate">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                {book.pdfUrl && (
                  <a
                    href={book.pdfUrl}
                    download
                    onClick={(e) => e.stopPropagation()}
                    title="Baixar PDF Original"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors flex items-center space-x-1 text-[10px] font-semibold"
                  >
                    <Download className="w-3 h-3 text-calm-600 dark:text-calm-400" />
                    <span>PDF</span>
                  </a>
                )}
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-calm-600 dark:text-calm-400 group-hover:translate-x-1 transition-transform">
                  <span>Ouvir</span>
                  <Play className="w-3 h-3 fill-current" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
