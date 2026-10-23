// Engine de Áudio Avançado com Mixer Multicanal & Narração Terapêutica (Voz Feminina & Masculina)

// Função utilitária de alta precisão para higienizar o texto para narração:
// Elimina asteriscos, markdown, códigos, pontuações lidas erradas e emojis.
export function cleanTextForSpeech(text) {
  if (!text) return '';
  let t = String(text);

  // 1. Substituir termos e siglas clínicas por pronúncia fluida em português
  const pronunciationMap = [
    [/\b5-4-3-2-1\b/g, 'cinco, quatro, três, dois, um'],
    [/\b4-7-8\b/g, 'quatro, sete, oito'],
    [/\b100%\b/g, 'cem por cento'],
    [/%/g, ' por cento '],
    [/\bCVV\b/g, 'Centro de Valorização da Vida'],
    [/\b188\b/g, 'um, oito, oito'],
    [/\b192\b/g, 'um, nove, dois'],
    [/\bSAMU\b/g, 'Samu'],
    [/\bUPA\b/g, 'Upa'],
    [/\bCAPS\b/g, 'Caps'],
    [/\bSUS\b/g, 'Sus'],
    [/\bTCC\b/g, 'Terapia Cognitivo-Comportamental'],
    [/\bTAG\b/g, 'Transtorno de Ansiedade Generalizada'],
    [/\bTOC\b/g, 'Transtorno Obsessivo-Compulsivo'],
    [/\bWhatsApp\b/gi, 'Uatsap'],
    [/\bshhh\b/gi, 'calma e silêncio'],
    [/\bPloc\b/gi, 'ploc'],
    [/\bTuc-tuc\b/gi, 'tuc tuc'],
  ];

  for (const [pattern, replacement] of pronunciationMap) {
    t = t.replace(pattern, replacement);
  }

  // 2. Limpar estritamente sintaxes de Markdown (NUNCA pronunciar 'asterisco')
  t = t.replace(/\*{1,3}(.*?)\*{1,3}/g, '$1'); // **negrito** ou *itálico*
  t = t.replace(/_{1,3}(.*?)_{1,3}/g, '$1');   // __negrito__
  t = t.replace(/#{1,6}\s*/g, '');              // # Títulos
  t = t.replace(/^>\s*/gm, '');                 // > Citações
  t = t.replace(/`.*?`/g, '');                  // Código inline

  // 3. Remover caracteres indesejados lidos por sintetizadores
  t = t.replace(/\*/g, '');
  t = t.replace(/#/g, '');
  t = t.replace(/~/g, '');
  t = t.replace(/\|/g, ', ');
  t = t.replace(/&/g, ' e ');
  t = t.replace(/•/g, '');
  t = t.replace(/^\s*-\s+/gm, '');              // marcadores de lista '-'
  t = t.replace(/^\s*\d+\.\s+/gm, '');          // marcadores numerados '1. '

  // 4. Traços, aspas e parênteses convertidos em pausas naturais
  t = t.replace(/[—–]/g, ', ');
  t = t.replace(/\s+-\s+/g, ', ');
  t = t.replace(/["“”'']/g, '');
  t = t.replace(/[()[\]{}]/g, ', ');

  // 5. Remover emojis Unicode (evita que a voz diga 'rosto sorridente', 'coração', etc)
  t = t.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');

  // 6. Eliminar repetições de pontos ('...' ou '..') para não pronunciar 'ponto ponto'
  t = t.replace(/\.{2,}/g, ', ');

  // 7. Normalizar espaços e pontuações consecutivas
  t = t.replace(/,\s*,+/g, ',');
  t = t.replace(/\s+/g, ' ').trim();

  return t;
}

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.narrationAudio = null; // Elemento Audio nativo para reproduzir MP3 gravado em estúdio
    this.isNarrating = false;
    this.speechRate = 0.95;
    this.voiceGender = typeof window !== 'undefined' ? (localStorage.getItem('serena_narrator_voice') || 'female') : 'female';

    // Multicanal do Mixer de Sons
    this.channels = {
      rain: { active: false, volume: 0.5, nodes: [] },
      waves: { active: false, volume: 0.5, nodes: [] },
      fire: { active: false, volume: 0.5, nodes: [] },
      wind: { active: false, volume: 0.5, nodes: [] },
      healing432: { active: false, volume: 0.5, nodes: [] },
      crickets: { active: false, volume: 0.5, nodes: [] },
    };
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Ativar ou desativar canal no mixer
  toggleChannel(channelKey, active, volume = 0.5) {
    this.initContext();
    if (!this.channels[channelKey]) return;

    if (active) {
      this.channels[channelKey].active = true;
      this.channels[channelKey].volume = volume;
      this.startSound(channelKey);
    } else {
      this.stopSound(channelKey);
      this.channels[channelKey].active = false;
    }
  }

  // Ajustar volume de canal específico
  setChannelVolume(channelKey, volume) {
    if (!this.channels[channelKey]) return;
    this.channels[channelKey].volume = Math.max(0, Math.min(1, volume));

    const gainNode = this.channels[channelKey].gainNode;
    if (gainNode && this.audioCtx) {
      gainNode.gain.setTargetAtTime(this.channels[channelKey].volume, this.audioCtx.currentTime, 0.08);
    }
  }

  // Iniciar gerador sonoro procedural por tipo
  startSound(type) {
    const ctx = this.audioCtx;
    this.stopSound(type);

    const channel = this.channels[type];
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(channel.volume, ctx.currentTime);
    gainNode.connect(ctx.destination);
    channel.gainNode = gainNode;

    const nodes = [];

    if (type === 'rain') {
      // Chuva Suave
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.15;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      nodes.push(noise, filter);

    } else if (type === 'waves') {
      // Ondas do Oceano
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(360, ctx.currentTime);
      filter.Q.setValueAtTime(1.6, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(240, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);

      noise.start();
      lfo.start();
      nodes.push(noise, filter, lfo, lfoGain);

    } else if (type === 'fire') {
      // Fogueira crepitante
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 2.8;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      nodes.push(noise, filter);

    } else if (type === 'wind') {
      // Vento suave
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(320, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);

      noise.start();
      lfo.start();
      nodes.push(noise, filter, lfo, lfoGain);

    } else if (type === 'healing432') {
      // 432 Hz
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, ctx.currentTime);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(216, ctx.currentTime);

      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(436, ctx.currentTime);

      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0.35, ctx.currentTime);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.25, ctx.currentTime);
      const g3 = ctx.createGain();
      g3.gain.setValueAtTime(0.15, ctx.currentTime);

      osc1.connect(g1);
      osc2.connect(g2);
      osc3.connect(g3);

      g1.connect(gainNode);
      g2.connect(gainNode);
      g3.connect(gainNode);

      osc1.start();
      osc2.start();
      osc3.start();
      nodes.push(osc1, osc2, osc3, g1, g2, g3);

    } else if (type === 'crickets') {
      // Grilos e noite
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(4800, ctx.currentTime);

      const mod = ctx.createOscillator();
      mod.frequency.setValueAtTime(2.5, ctx.currentTime);

      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(0.08, ctx.currentTime);

      const cricketGain = ctx.createGain();
      cricketGain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(cricketGain);
      cricketGain.connect(gainNode);

      osc.start();
      nodes.push(osc, cricketGain);
    }

    channel.nodes = nodes;
  }

  stopSound(type) {
    const channel = this.channels[type];
    if (channel && channel.nodes) {
      channel.nodes.forEach(n => {
        try {
          if (n.stop) n.stop();
          if (n.disconnect) n.disconnect();
        } catch (e) {}
      });
      channel.nodes = [];
    }
  }

  stopAllSounds() {
    Object.keys(this.channels).forEach(key => {
      this.stopSound(key);
      this.channels[key].active = false;
    });
  }

  playAmbient(type = 'waves') {
    this.stopAllSounds();
    this.toggleChannel(type, true, 0.4);
  }

  stopAmbient() {
    this.stopAllSounds();
  }

  setAmbientVolume(vol) {
    Object.keys(this.channels).forEach(key => {
      if (this.channels[key].active) {
        this.setChannelVolume(key, vol);
      }
    });
  }

  // Alterar gênero da voz do narrador ('female' ou 'male')
  setVoiceGender(gender) {
    this.voiceGender = gender;
    if (typeof window !== 'undefined') {
      localStorage.setItem('serena_narrator_voice', gender);
    }
  }

  getVoiceGender() {
    return this.voiceGender;
  }

  // ----------------------------------------------------
  // REPRODUÇÃO DE ÁUDIO GRAVADO EM ESTÚDIO (MP3 NEURAL)
  // ----------------------------------------------------
  playNarrationFile(url, onProgress = null, onEnd = null) {
    this.stopSpeech(); // Para qualquer fala ou áudio anterior
    
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.playbackRate = this.speechRate || 1.0;

        audio.addEventListener('timeupdate', () => {
          if (audio.duration && onProgress) {
            const pct = Math.min(100, Math.round((audio.currentTime / audio.duration) * 100));
            onProgress(pct, audio.currentTime, audio.duration);
          }
        });

        audio.addEventListener('ended', () => {
          this.isNarrating = false;
          if (onEnd) onEnd();
        });

        audio.addEventListener('error', (err) => {
          console.warn('Erro ao reproduzir arquivo neural:', err);
          this.isNarrating = false;
          if (onEnd) onEnd();
          reject(err);
        });

        this.narrationAudio = audio;
        this.isNarrating = true;
        
        audio.play().then(resolve).catch((err) => {
          console.warn('Play suspenso ou bloqueado por autoplay:', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Avançar / retroceder para porcentagem (0 - 100)
  seekNarration(percent) {
    if (this.narrationAudio && this.narrationAudio.duration) {
      const targetTime = (percent / 100) * this.narrationAudio.duration;
      this.narrationAudio.currentTime = targetTime;
    }
  }

  // ----------------------------------------------------
  // SÍNTESE DE VOZ AVANÇADA COM LIMPEZA PROFUNDA (FALLBACK WEB SPEECH)
  // ----------------------------------------------------
  speakText(rawText, onBoundary = null, onEnd = null) {
    if (!this.speechSynth) return;
    this.stopSpeech();

    // Limpeza profunda de asteriscos, markdown, pontuações indesejadas e emojis
    const cleanText = cleanTextForSpeech(rawText);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';

    const isFemale = this.voiceGender === 'female';

    // Ajustes acústicos ideais para cada gênero
    if (isFemale) {
      utterance.rate = this.speechRate || 0.95;
      utterance.pitch = 1.02; // Tom aveludado, suave e afetuoso
    } else {
      utterance.rate = (this.speechRate || 0.95) * 0.94; // Tom calmo e compassado
      utterance.pitch = 0.85; // Tom mais grave, firme e relaxante
    }

    const setBestVoice = () => {
      const voices = this.speechSynth.getVoices();
      const ptVoices = voices.filter(v => v.lang.startsWith('pt'));

      if (ptVoices.length > 0) {
        let chosenVoice = null;

        if (isFemale) {
          // Priorizar vozes neurais / naturais femininas brasileiras
          chosenVoice = ptVoices.find(v => {
            const name = v.name.toLowerCase();
            return (
              (name.includes('natural') && (name.includes('francisca') || name.includes('leticia') || name.includes('maria'))) ||
              name.includes('francisca') ||
              name.includes('leticia') ||
              name.includes('luciana') ||
              name.includes('yara') ||
              name.includes('google português do brasil') ||
              name.includes('female') ||
              name.includes('feminina')
            );
          });
        } else {
          // Priorizar vozes neurais / naturais masculinas brasileiras
          chosenVoice = ptVoices.find(v => {
            const name = v.name.toLowerCase();
            return (
              (name.includes('natural') && (name.includes('antonio') || name.includes('antónio') || name.includes('daniel'))) ||
              name.includes('antonio') ||
              name.includes('antónio') ||
              name.includes('fabio') ||
              name.includes('fábio') ||
              name.includes('daniel') ||
              name.includes('felipe') ||
              name.includes('male') ||
              name.includes('masculina')
            );
          });
        }

        utterance.voice = chosenVoice || ptVoices[0];
      }
    };

    setBestVoice();
    if (this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = setBestVoice;
    }

    utterance.onboundary = (event) => {
      if (onBoundary) onBoundary(event.charIndex);
    };

    utterance.onend = () => {
      this.isNarrating = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isNarrating = false;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.isNarrating = true;
    this.speechSynth.speak(utterance);
  }

  pauseSpeech() {
    if (this.narrationAudio && !this.narrationAudio.paused) {
      this.narrationAudio.pause();
    }
    if (this.speechSynth && this.isNarrating) {
      this.speechSynth.pause();
    }
  }

  resumeSpeech() {
    if (this.narrationAudio && this.narrationAudio.paused) {
      this.narrationAudio.play().catch(() => {});
    }
    if (this.speechSynth) {
      this.speechSynth.resume();
    }
  }

  stopSpeech() {
    if (this.narrationAudio) {
      try {
        this.narrationAudio.pause();
        this.narrationAudio.currentTime = 0;
      } catch (e) {}
      this.narrationAudio = null;
    }
    if (this.speechSynth) {
      try {
        this.speechSynth.cancel();
      } catch (e) {}
    }
    this.isNarrating = false;
  }

  setSpeechRate(rate) {
    this.speechRate = rate;
    if (this.narrationAudio) {
      this.narrationAudio.playbackRate = rate;
    }
  }
}

export const audioEngine = new AudioEngine();
