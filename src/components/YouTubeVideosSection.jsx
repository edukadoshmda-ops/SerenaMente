import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Play, Heart, Trash2, ExternalLink, X, 
  Sparkles, ShieldAlert, Moon, Wind, Clock, User, Check, AlertCircle, Share2, Film
} from 'lucide-react';
import { DEFAULT_YOUTUBE_VIDEOS, VIDEO_CATEGORIES, extractYouTubeId } from '../data/defaultVideos';

export default function YouTubeVideosSection() {
  const [videos, setVideos] = useState(() => {
    try {
      const saved = localStorage.getItem('serena_youtube_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar vídeos do YouTube:', e);
    }
    return DEFAULT_YOUTUBE_VIDEOS;
  });

  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null); // Vídeo em reprodução
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Formulário de novo vídeo
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoAuthor, setNewVideoAuthor] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState('ansiedade');
  const [newVideoDuration, setNewVideoDuration] = useState('');
  const [newVideoDescription, setNewVideoDescription] = useState('');
  const [detectedId, setDetectedId] = useState(null);
  const [formError, setFormError] = useState('');

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem('serena_youtube_videos', JSON.stringify(videos));
    } catch (e) {
      console.warn('Erro ao salvar vídeos:', e);
    }
  }, [videos]);

  // Detectar ID do YouTube ao colar URL
  const handleUrlChange = (val) => {
    setNewVideoUrl(val);
    setFormError('');
    const id = extractYouTubeId(val);
    setDetectedId(id);
    if (!id && val.trim().length > 10) {
      setFormError('Link do YouTube não reconhecido. Cole o link completo ou o código do vídeo.');
    }
  };

  // Adicionar novo vídeo
  const handleAddVideo = (e) => {
    e.preventDefault();
    const id = extractYouTubeId(newVideoUrl);
    if (!id) {
      setFormError('Por favor, informe um link válido do YouTube.');
      return;
    }

    if (!newVideoTitle.trim()) {
      setFormError('Informe um título para o vídeo.');
      return;
    }

    const newVideo = {
      id: `yt-${Date.now()}`,
      youtubeId: id,
      title: newVideoTitle.trim(),
      category: newVideoCategory,
      duration: newVideoDuration.trim() || 'Vídeo',
      author: newVideoAuthor.trim() || 'Canal do YouTube',
      description: newVideoDescription.trim() || 'Vídeo terapêutico adicionado aos seus favoritos.',
      tags: [newVideoCategory, 'YouTube'],
      isFavorite: true,
      addedAt: new Date().toISOString()
    };

    setVideos((prev) => [newVideo, ...prev]);
    setIsAddModalOpen(false);

    // Limpar formulário
    setNewVideoUrl('');
    setNewVideoTitle('');
    setNewVideoAuthor('');
    setNewVideoCategory('ansiedade');
    setNewVideoDuration('');
    setNewVideoDescription('');
    setDetectedId(null);
    setFormError('');
  };

  // Alternar favorito
  const handleToggleFavorite = (videoId, e) => {
    e.stopPropagation();
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isFavorite: !v.isFavorite } : v))
    );
  };

  // Excluir vídeo
  const handleDeleteVideo = (videoId, e) => {
    e.stopPropagation();
    if (window.confirm('Deseja remover este vídeo da sua lista de refúgio?')) {
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      if (activeVideo && activeVideo.id === videoId) {
        setActiveVideo(null);
      }
    }
  };

  // Filtragem de vídeos
  const filteredVideos = videos.filter((v) => {
    const matchesCat =
      selectedCategory === 'todas'
        ? true
        : selectedCategory === 'favoritos'
        ? v.isFavorite
        : v.category === selectedCategory;

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      v.title.toLowerCase().includes(query) ||
      v.author.toLowerCase().includes(query) ||
      (v.description && v.description.toLowerCase().includes(query));

    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. BANNER DE DESTAQUE & AÇÃO RÁPIDA */}
      <div className="relative rounded-3xl sm:rounded-4xl bg-gradient-to-br from-red-600 via-rose-600 to-indigo-800 text-white p-5 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
            <Film className="w-3.5 h-3.5 text-amber-300" />
            <span>Vídeos & Meditações do YouTube</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
            Seus vídeos favoritos de paz e acolhimento em um só refúgio.
          </h2>

          <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
            Adicione meditações guiadas, palestras, frequências para dormir e exercícios de respiração do YouTube para assistir sem distrações e sem perder o foco na sua recuperação.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-rose-700 font-extrabold text-xs sm:text-sm shadow-lg hover:bg-rose-50 active:scale-95 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar Vídeo do YouTube</span>
            </button>

            <span className="text-xs text-white/80 font-semibold px-2">
              {videos.length} {videos.length === 1 ? 'vídeo salvo' : 'vídeos salvos'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE BUSCA E FILTROS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filtros em Pílulas */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl overflow-x-auto no-scrollbar py-1">
          {VIDEO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Campo de Busca */}
        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nos seus vídeos..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 shadow-xs"
          />
        </div>
      </div>

      {/* 3. GRID DE VÍDEOS */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-4xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center text-2xl">
            📺
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">Nenhum vídeo encontrado</h4>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? 'Nenhum vídeo corresponde à sua pesquisa.'
                : 'Que tal adicionar sua primeira meditação ou música relaxante do YouTube?'}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Vídeo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredVideos.map((video) => {
            const thumbUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

            return (
              <div
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="group cursor-pointer rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-400/80 dark:hover:border-rose-500/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Imagem de Capa (Thumbnail Oficial do YouTube) */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <img
                    src={thumbUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradiente de proteção */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Botão Play Central Flutuante */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duração no Canto Inferior Direito */}
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 text-white text-[10px] font-bold backdrop-blur-xs flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{video.duration}</span>
                    </span>
                  )}

                  {/* Botão de Favoritar */}
                  <button
                    onClick={(e) => handleToggleFavorite(video.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors"
                    title={video.isFavorite ? 'Remover dos favoritos' : 'Favoritar vídeo'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        video.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/40">
                        {video.category === 'ansiedade'
                          ? 'Ansiedade'
                          : video.category === 'sono'
                          ? 'Sono'
                          : video.category === 'respiracao'
                          ? 'Respiração'
                          : 'Inspiração'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {video.title}
                    </h4>

                    {video.author && (
                      <p className="text-[11px] text-slate-400 truncate flex items-center space-x-1">
                        <User className="w-3 h-3 shrink-0" />
                        <span>{video.author}</span>
                      </p>
                    )}
                  </div>

                  {/* Rodapé do Card com Ações */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 font-semibold group-hover:underline">
                      <span>Assistir Agora</span>
                      <span>→</span>
                    </span>

                    <button
                      onClick={(e) => handleDeleteVideo(video.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Excluir vídeo da lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL DO PLAYER DE VÍDEO DO YOUTUBE (MODO CINEMA RELAXANTE) */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Topo do Player */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center space-x-2.5 min-w-0 pr-4">
                <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                    {activeVideo.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {activeVideo.author} • Modo Acolhedor Livre de Distrações
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Abrir no aplicativo do YouTube"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Fechar Player"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Iframe Responsivo 16:9 Seguro */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Descrição e Orientações de Bem-Estar */}
            <div className="p-4 sm:p-6 bg-slate-900 space-y-3 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-teal-400 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dica Terapêutica:</span>
                  </span>
                  <span className="text-xs text-slate-300">
                    Ajuste o brilho da tela, use fones de ouvido e respire com calma.
                  </span>
                </div>

                <button
                  onClick={(e) => handleToggleFavorite(activeVideo.id, e)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    activeVideo.isFavorite
                      ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${activeVideo.isFavorite ? 'fill-current' : ''}`} />
                  <span>{activeVideo.isFavorite ? 'Favoritado' : 'Favoritar'}</span>
                </button>
              </div>

              {activeVideo.description && (
                <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
                  {activeVideo.description}
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. MODAL PARA ADICIONAR NOVO VÍDEO DO YOUTUBE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Adicionar Vídeo do YouTube
                  </h3>
                  <p className="text-[11px] text-slate-400">Cole qualquer link de meditação, música ou palestra</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVideo} className="space-y-4">
              {/* Campo do Link do YouTube */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Link ou Código do Vídeo do YouTube *
                </label>
                <input
                  type="text"
                  required
                  value={newVideoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="Ex: https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
                {formError && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formError}</span>
                  </p>
                )}
              </div>

              {/* Prévia da Thumbnail do YouTube se ID for reconhecido */}
              {detectedId && (
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center space-x-3">
                  <img
                    src={`https://img.youtube.com/vi/${detectedId}/hqdefault.jpg`}
                    alt="Prévia"
                    className="w-20 aspect-video rounded-xl object-cover bg-black shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Vídeo Localizado com Sucesso!</span>
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block">ID: {detectedId}</span>
                  </div>
                </div>
              )}

              {/* Título do Vídeo */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Título ou Nome do Vídeo *
                </label>
                <input
                  type="text"
                  required
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Ex: Meditação Guiada para Acalmar a Mente"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              {/* Canal / Autor e Duração */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Canal ou Criador (opcional)
                  </label>
                  <input
                    type="text"
                    value={newVideoAuthor}
                    onChange={(e) => setNewVideoAuthor(e.target.value)}
                    placeholder="Ex: Yoga Mudra"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Duração Aproximada
                  </label>
                  <input
                    type="text"
                    value={newVideoDuration}
                    onChange={(e) => setNewVideoDuration(e.target.value)}
                    placeholder="Ex: 15 min"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Categoria
                </label>
                <select
                  value={newVideoCategory}
                  onChange={(e) => setNewVideoCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                >
                  <option value="ansiedade">Ansiedade & Pânico</option>
                  <option value="sono">Sono & Insônia</option>
                  <option value="respiracao">Respiração & Calma</option>
                  <option value="inspiracao">Esperança & Inspiração</option>
                </select>
              </div>

              {/* Descrição / Notas Pessoais */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Por que esse vídeo te faz bem? (opcional)
                </label>
                <textarea
                  rows="2"
                  value={newVideoDescription}
                  onChange={(e) => setNewVideoDescription(e.target.value)}
                  placeholder="Ex: Ouvir quando o peito apertar ou antes de dormir."
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  Salvar Vídeo no App
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
