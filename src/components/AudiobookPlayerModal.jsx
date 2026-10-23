import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, Moon, Sparkles, 
  ChevronDown, BookOpen, Clock, Waves, CloudRain, Music, X, Headphones, CheckCircle2, User, Heart 
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function AudiobookPlayerModal({ 
  playbook, 
  isOpen, 
  onClose, 
  onMinimize, 
  onProgressUpdate,
  onPlayStateChange 
}) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [narrator, setNarrator] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('serena_narrator_voice') === 'male' ? 'masculina' : 'feminina') : 'feminina';
  });
  const [ambientType, setAmbientType] = useState('rain');
  const [ambientVolume, setAmbientVolume] = useState(0.35);
  const [speechRate, setSpeechRate] = useState(0.92);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [fontSize, setFontSize] = useState('medium');
  const [mobileTab, setMobileTab] = useState('player');
  const [readingProgress, setReadingProgress] = useState(0);

  const timerRef = useRef(null);
  const contentRef = useRef(null);

  // Efeito de limpeza do timer de sono
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Atualizar som ambiente inicial quando o playbook mudar
  useEffect(() => {
    if (playbook?.ambientSound) {
      setAmbientType(playbook.ambientSound);
    }
    setCurrentChapterIndex(0);
    setReadingProgress(0);
    setIsPlaying(false);
    setIsPaused(false);
  }, [playbook?.id]);

  if (!isOpen || !playbook) return null;

  const currentChapter = playbook.chapters[currentChapterIndex] || playbook.chapters[0];
  const hasRecordedAudio = Boolean(currentChapter?.audio);

  const updatePlayingState = (playing, paused = false) => {
    setIsPlaying(playing);
    setIsPaused(paused);
    if (onPlayStateChange) onPlayStateChange(playing);
  };

  // Iniciar fala sintetizada ou arquivo gravado
  const startPlayback = (chapterIdx, selectedNarrator = narrator) => {
    const chap = playbook.chapters[chapterIdx];
    if (!chap) return;

    audioEngine.initContext();
    if (ambientType !== 'none') {
      audioEngine.playAmbient(ambientType);
      audioEngine.setAmbientVolume(ambientVolume);
    }

    // Se tiver áudio profissional gravado em estúdio (MP3 Neural Francisca/Antonio)
    if (chap.audio) {
      const audioUrl = chap.audio[selectedNarrator] || chap.audio.feminina;
      if (audioUrl) {
        audioEngine.setSpeechRate(speechRate);
        audioEngine.playNarrationFile(
          audioUrl,
          (pct) => setReadingProgress(pct),
          () => {
            if (onProgressUpdate) onProgressUpdate(playbook.id, chapterIdx);
            if (chapterIdx + 1 < playbook.chapters.length) {
              setCurrentChapterIndex(chapterIdx + 1);
              startPlayback(chapterIdx + 1, selectedNarrator);
            } else {
              updatePlayingState(false, false);
              setReadingProgress(100);
            }
          }
        ).catch((err) => {
          console.warn("Fallback para síntese:", err);
        });
        updatePlayingState(true, false);
        return;
      }
    }

    // Narração Inteligente (Web Speech API com Tom Masculino ou Feminino)
    audioEngine.setVoiceGender(selectedNarrator === 'masculina' ? 'male' : 'female');
    audioEngine.setSpeechRate(speechRate);
    audioEngine.speakText(
      chap.content,
      (charIndex) => {
        const totalLength = chap.content.length;
        setReadingProgress(Math.min(100, Math.round((charIndex / totalLength) * 100)));
      },
      () => {
        updatePlayingState(false, false);
        setReadingProgress(100);
        if (onProgressUpdate) {
          onProgressUpdate(playbook.id, chapterIdx);
        }
        // Auto avançar capítulo
        if (chapterIdx + 1 < playbook.chapters.length) {
          setTimeout(() => {
            setCurrentChapterIndex(chapterIdx + 1);
            startPlayback(chapterIdx + 1, selectedNarrator);
          }, 800);
        }
      }
    );
    updatePlayingState(true, false);
  };

  // Alternar entre Play e Pause
  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.pauseSpeech();
      updatePlayingState(false, true);
    } else {
      if (isPaused) {
        audioEngine.resumeSpeech();
        updatePlayingState(true, false);
      } else {
        startPlayback(currentChapterIndex, narrator);
      }
    }
  };

  // Trocar narrador (feminina / masculina) em todos os áudios
  const handleNarratorChange = (newVoice) => {
    setNarrator(newVoice);
    const genderKey = newVoice === 'masculina' ? 'male' : 'female';
    audioEngine.setVoiceGender(genderKey);
    localStorage.setItem('serena_narrator_voice', genderKey);

    if (isPlaying) {
      audioEngine.stopSpeech();
      startPlayback(currentChapterIndex, newVoice);
    }
  };

  // Selecionar capítulo
  const handleSelectChapter = (index) => {
    const wasPlaying = isPlaying;
    setCurrentChapterIndex(index);
    setReadingProgress(0);
    audioEngine.stopSpeech();
    if (wasPlaying) {
      startPlayback(index, narrator);
    } else {
      updatePlayingState(false, false);
    }
  };

  // Mudar som ambiente
  const handleAmbientChange = (type) => {
    setAmbientType(type);
    if (type === 'none') {
      audioEngine.stopAmbient();
    } else {
      audioEngine.playAmbient(type);
      audioEngine.setAmbientVolume(ambientVolume);
    }
  };

  // Mudar velocidade
  const handleRateChange = (rate) => {
    setSpeechRate(rate);
    audioEngine.setSpeechRate(rate);
    if (isPlaying) {
      audioEngine.stopSpeech();
      startPlayback(currentChapterIndex, narrator);
    }
  };

  // Ajuste do Sleep Timer
  const setSleepTimer = (minutes) => {
    setSleepTimerMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    if (timerRef.current) clearInterval(timerRef.current);

    if (minutes > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            audioEngine.stopSpeech();
            audioEngine.stopAmbient();
            updatePlayingState(false, false);
            setSleepTimerMinutes(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const formatRemainingTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[94vh] sm:h-auto sm:max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-4xl sm:rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Barra Superior */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              onClick={onMinimize}
              className="p-1.5 sm:p-2 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors shrink-0"
              title="Minimizar"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] font-bold tracking-wider uppercase text-calm-600 dark:text-calm-400 block truncate">
                Playbook & Audiobook Interativo
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {playbook.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Sleep Timer */}
            <button
              onClick={() => setSleepTimer(sleepTimerMinutes === 0 ? 15 : sleepTimerMinutes === 15 ? 30 : 0)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl text-[11px] font-medium border transition-all ${
                sleepTimerMinutes > 0
                  ? 'bg-calm-50 border-calm-300 text-calm-700 dark:bg-calm-950/40 dark:border-calm-800 dark:text-calm-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
              }`}
              title="Timer de sono"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{sleepTimerMinutes > 0 ? formatRemainingTime(remainingSeconds) : 'Timer'}</span>
            </button>

            {/* Fechar */}
            <button
              onClick={() => {
                audioEngine.stopSpeech();
                audioEngine.stopAmbient();
                updatePlayingState(false, false);
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-2xl hover:bg-rose-50 hover:text-rose-600 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alternador Mobile (Áudio vs Texto) */}
        <div className="flex md:hidden px-4 pt-2 pb-1 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex w-full p-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-2xl">
            <button
              onClick={() => setMobileTab('player')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                mobileTab === 'player'
                  ? 'bg-white dark:bg-slate-800 text-calm-600 dark:text-calm-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Áudio & Voz</span>
            </button>
            <button
              onClick={() => setMobileTab('text')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                mobileTab === 'text'
                  ? 'bg-white dark:bg-slate-800 text-calm-600 dark:text-calm-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Texto do Livro</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          
          {/* Coluna Esquerda: Player, Capa & Narrador */}
          <div className={`md:col-span-5 p-4 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-5 bg-slate-50/40 dark:bg-slate-900/30 ${
            mobileTab === 'text' ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Capa */}
            <div className={`relative aspect-square w-36 sm:w-52 md:w-full max-w-[220px] mx-auto rounded-3xl bg-gradient-to-tr ${playbook.coverGradient} p-4 shadow-xl flex flex-col justify-between text-white shrink-0`}>
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-white/20 backdrop-blur-md rounded-full">
                  {playbook.duration}
                </span>
                <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </span>
              </div>

              <div>
                <h4 className="text-sm sm:text-lg font-bold leading-tight">{playbook.title}</h4>
                <p className="text-[11px] text-white/90 line-clamp-2 mt-1">{playbook.subtitle}</p>
              </div>

              <div className="text-[10px] text-white/80 font-medium pt-1 border-t border-white/20 truncate">
                Por {playbook.author}
              </div>
            </div>

            {/* SELETOR DE VOZ: MASCULINA & FEMININA DISPONÍVEL EM TODOS OS ÁUDIOS */}
            <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-calm-500" />
                  <span>Voz da Narração</span>
                </span>
                <span className="text-[10px] font-extrabold text-calm-600 dark:text-calm-400 uppercase">
                  {narrator === 'feminina' ? '🌸 Serena (Feminina)' : '🌿 Gabriel (Masculina)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleNarratorChange('feminina')}
                  className={`py-2 px-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                    narrator === 'feminina'
                      ? 'bg-gradient-to-r from-calm-500 to-indigo-600 text-white shadow-md border-transparent scale-102'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>🌸</span>
                  <span>Voz Feminina</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNarratorChange('masculina')}
                  className={`py-2 px-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                    narrator === 'masculina'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md border-transparent scale-102'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>🌿</span>
                  <span>Voz Masculina</span>
                </button>
              </div>
            </div>

            {/* Trilha Sonora Relaxante */}
            <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Music className="w-3.5 h-3.5 text-calm-500" />
                  <span>Fundo Relaxante</span>
                </span>
                <span className="text-[10px] text-calm-600 dark:text-calm-400 font-semibold uppercase">
                  {ambientType === 'waves' ? 'Ondas' : ambientType === 'rain' ? 'Chuva' : ambientType === 'healing432' ? '432 Hz' : 'Mudo'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'waves', label: 'Ondas', icon: Waves },
                  { id: 'rain', label: 'Chuva', icon: CloudRain },
                  { id: 'healing432', label: '432Hz', icon: Sparkles },
                  { id: 'none', label: 'Mudo', icon: Volume2 }
                ].map((sound) => {
                  const SIcon = sound.icon;
                  const isActive = ambientType === sound.id;
                  return (
                    <button
                      key={sound.id}
                      onClick={() => handleAmbientChange(sound.id)}
                      className={`py-1.5 px-1 flex flex-col items-center justify-center rounded-2xl text-[10px] font-medium border transition-all ${
                        isActive
                          ? 'bg-calm-100 border-calm-400 text-calm-700 dark:bg-calm-950 dark:border-calm-600 dark:text-calm-200'
                          : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <SIcon className="w-3.5 h-3.5 mb-0.5" />
                      <span>{sound.label}</span>
                    </button>
                  );
                })}
              </div>

              {ambientType !== 'none' && (
                <div className="flex items-center space-x-2 pt-1">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setAmbientVolume(v);
                      audioEngine.setAmbientVolume(v);
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-calm-600"
                  />
                </div>
              )}
            </div>

            {/* Capítulos */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Capítulos
              </span>
              <div className="space-y-1 max-h-28 sm:max-h-32 overflow-y-auto pr-1">
                {playbook.chapters.map((chap, idx) => {
                  const isCurrent = currentChapterIndex === idx;
                  return (
                    <button
                      key={chap.id}
                      onClick={() => handleSelectChapter(idx)}
                      className={`w-full text-left px-3 py-1.5 rounded-2xl text-xs font-medium transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-calm-500 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate pr-2">{chap.title}</span>
                      <span className="text-[10px] opacity-80 shrink-0">{chap.duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Texto do Playbook */}
          <div className={`md:col-span-7 p-4 sm:p-6 flex flex-col justify-between space-y-3 sm:space-y-4 ${
            mobileTab === 'player' ? 'hidden md:flex' : 'flex'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2 min-w-0">
                <BookOpen className="w-4 h-4 text-calm-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                  {currentChapter.title}
                </span>
              </div>

              {/* Ajuste de Fonte */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs shrink-0">
                <button
                  onClick={() => setFontSize('small')}
                  className={`px-2 py-0.5 rounded-xl font-medium ${fontSize === 'small' ? 'bg-white dark:bg-slate-700 shadow-sm text-calm-600' : 'text-slate-500'}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('medium')}
                  className={`px-2 py-0.5 rounded-xl font-medium ${fontSize === 'medium' ? 'bg-white dark:bg-slate-700 shadow-sm text-calm-600' : 'text-slate-500'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-0.5 rounded-xl font-medium ${fontSize === 'large' ? 'bg-white dark:bg-slate-700 shadow-sm text-calm-600' : 'text-slate-500'}`}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Texto do Capítulo */}
            <div 
              ref={contentRef}
              className={`flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3 leading-relaxed font-normal text-slate-700 dark:text-slate-200 select-text ${
                fontSize === 'small' ? 'text-xs sm:text-sm' : fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              }`}
            >
              {currentChapter.content.split('\n\n').map((paragraph, pIdx) => (
                <p 
                  key={pIdx} 
                  className="p-2 sm:p-2.5 rounded-2xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="p-2.5 rounded-2xl bg-calm-50/70 dark:bg-calm-950/30 border border-calm-200/50 dark:border-calm-900/50 flex items-center justify-between text-[11px] sm:text-xs text-calm-800 dark:text-calm-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-calm-600 shrink-0" />
                <span>Respire com calma no ritmo da leitura.</span>
              </div>
              <span className="font-bold opacity-80">
                Narrado por: {narrator === 'feminina' ? 'Serena (Feminina)' : 'Gabriel (Masculino)'}
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé / Barra de Controle do Audiobook */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2 sm:space-y-3">
          {/* Barra de Progresso com Scrubbing Interativo */}
          <div className="w-full flex items-center space-x-2 sm:space-x-3">
            <span className="text-[10px] font-semibold text-slate-400">0:00</span>
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPct = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
                setReadingProgress(newPct);
                audioEngine.seekNarration(newPct);
              }}
              className="relative flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden cursor-pointer group flex items-center"
              title="Clique para avançar ou voltar"
            >
              <div 
                className="h-full bg-gradient-to-r from-calm-500 to-indigo-600 rounded-full transition-all duration-150"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-400">{currentChapter.duration}</span>
          </div>

          <div className="flex items-center justify-between">
            {/* Velocidade */}
            <div className="flex items-center space-x-1">
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                    speechRate === rate
                      ? 'bg-calm-100 text-calm-700 dark:bg-calm-900 dark:text-calm-300'
                      : 'text-slate-400'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => {
                  const newPct = Math.max(0, readingProgress - 15);
                  setReadingProgress(newPct);
                  audioEngine.seekNarration(newPct);
                }}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
                title="Voltar 15s"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="w-11 h-11 sm:w-13 sm:h-13 p-2.5 sm:p-3.5 rounded-full bg-gradient-to-r from-calm-600 to-indigo-600 text-white shadow-lg shadow-calm-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  const newPct = Math.min(100, readingProgress + 15);
                  setReadingProgress(newPct);
                  audioEngine.seekNarration(newPct);
                }}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
                title="Avançar 15s"
              >
                <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Status */}
            <div className="text-right">
              <span className="text-[10px] sm:text-[11px] font-semibold text-calm-600 dark:text-calm-400 block truncate max-w-[100px] sm:max-w-none">
                {isPlaying ? (narrator === 'feminina' ? '🌸 Serena Narrando...' : '🌿 Gabriel Narrando...') : 'Pausado'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400">
                Cap. {currentChapterIndex + 1}/{playbook.chapters.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
