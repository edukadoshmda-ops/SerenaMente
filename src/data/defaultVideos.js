// Vídeos Terapêuticos Curados do YouTube para Ansiedade, Depressão e Sono

export function extractYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  // Se for apenas o ID de 11 caracteres
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  // Padrões de URLs do YouTube (watch, youtu.be, shorts, embed)
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = str.match(regExp);
  return match ? match[1] : null;
}

export const DEFAULT_YOUTUBE_VIDEOS = [
  {
    id: 'yt-1',
    youtubeId: 'inpok4MKVLM',
    title: 'Meditação Guiada para Alívio Imediato da Ansiedade e Pânico',
    category: 'ansiedade',
    duration: '10 min',
    author: 'Yoga Mudra • Raissa Zoccal',
    description: 'Uma condução suave com respiração profunda para acalmar o coração acelerado e ancorar sua mente no presente.',
    tags: ['Ansiedade', 'Pânico', 'Respiração', 'Acalmar'],
    isFavorite: true,
    addedAt: '2026-10-23T10:00:00.000Z'
  },
  {
    id: 'yt-2',
    youtubeId: '1ZYbU82GVz4',
    title: 'Frequência 432 Hz & Chuva Suave para Dormir em Minutos',
    category: 'sono',
    duration: '60 min',
    author: 'Sons de Cura & Ondas Delta',
    description: 'Som contínuo de chuva tranquila com frequência harmônica de 432 Hz para desacelerar as ondas cerebrais e induzir o sono.',
    tags: ['Sono', 'Insônia', '432 Hz', 'Chuva'],
    isFavorite: true,
    addedAt: '2026-10-23T10:05:00.000Z'
  },
  {
    id: 'yt-3',
    youtubeId: 'aNXKjGFUlMs',
    title: 'Respiração 4-7-8 Guiada na Prática: Desarme a Crise Agora',
    category: 'respiracao',
    duration: '5 min',
    author: 'Respira Serenidade',
    description: 'Siga a animação visual respirando em 4 segundos, retendo em 7 e soltando em 8 para ativar o nervo vago.',
    tags: ['Respiração 4-7-8', 'Nervo Vago', 'SOS'],
    isFavorite: false,
    addedAt: '2026-10-23T10:10:00.000Z'
  },
  {
    id: 'yt-4',
    youtubeId: 'ZToicYcHIOU',
    title: 'Um Passo de Cada Vez: Conversa Franca Sobre Depressão e Esperança',
    category: 'inspiracao',
    duration: '18 min',
    author: 'Canal SerenaMente',
    description: 'Palavras sinceras de acolhimento para lembrar que você não é um fardo e que a recuperação não precisa ser perfeita.',
    tags: ['Depressão', 'Esperança', 'Superação', 'Acolhimento'],
    isFavorite: true,
    addedAt: '2026-10-23T10:15:00.000Z'
  }
];

export const VIDEO_CATEGORIES = [
  { id: 'todas', label: 'Todos os Vídeos', icon: 'Sparkles' },
  { id: 'ansiedade', label: 'Ansiedade & Pânico', icon: 'ShieldAlert' },
  { id: 'sono', label: 'Sono & Insônia', icon: 'Moon' },
  { id: 'respiracao', label: 'Respiração & Calma', icon: 'Wind' },
  { id: 'inspiracao', label: 'Esperança & Inspiração', icon: 'Heart' },
  { id: 'favoritos', label: 'Meus Favoritos ❤️', icon: 'Star' },
];
