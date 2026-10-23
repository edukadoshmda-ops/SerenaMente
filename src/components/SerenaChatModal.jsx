import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, Sparkles, Smile, Bot, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    id: '1',
    sender: 'serena',
    text: 'Olá, meu amigo(a). Estou aqui com você agora. Como está o seu coração neste exato momento? Pode desabafar livremente, sem filtros e sem medo de julgamento. Eu te escuto.',
    time: 'Agora'
  }
];

const QUICK_PROMPTS = [
  "Estou com aperto no peito e muito medo",
  "Sinto que nada vai dar certo na minha vida",
  "Não consigo ter forças para levantar da cama",
  "Minha cabeça não para de pensar em tragédias",
  "Só preciso de um abraço e uma palavra boa"
];

export default function SerenaChatModal({ isOpen, onClose, userName }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('serena_chat_history');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('serena_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  // Lógica de Acolhimento Terapêutico (TCC + ACT)
  const generateSerenaResponse = (userMsg) => {
    const text = userMsg.toLowerCase();

    if (text.includes('peito') || text.includes('aperto') || text.includes('ar') || text.includes('morrer') || text.includes('pânico') || text.includes('ansiedade') || text.includes('crise')) {
      return `Eu sinto o peso do que você está passando agora, e quero que coloque os dois pés no chão com firmeza. 

O que você está sentindo é muito real e desconfortável, mas **não é perigoso**. O seu coração acelerado é apenas o seu corpo bombeando energia achando que precisa correr de um leão imaginário. Não há leão aqui. Você está em um lugar seguro.

Inspire comigo devagar pelo nariz... 1, 2, 3, 4... e solte com um sopro longo... 1, 2, 3, 4, 5, 6, 7, 8. 

Eu não vou sair daqui. Seu corpo já sabe como voltar à calma. Confie no seu próprio ritmo.`;
    }

    if (text.includes('nada vai dar certo') || text.includes('fracasso') || text.includes('ruim') || text.includes('culpa') || text.includes('suficiente')) {
      return `Essa voz severa na sua cabeça está tentando te convencer de que você é incapaz, mas na psicologia chamamos isso de **Catastrofização**.

Pensamentos são apenas nuvens passando no céu da sua mente. Só porque você pensou que nada vai dar certo, isso não torna essa ideia uma verdade absoluta. 

Se um amigo muito querido viesse até você chorando, dizendo essas mesmas coisas sobre ele, você concordaria ou diria a ele com amor que ele é muito forte por continuar tentando? Diga isso a você mesmo agora. Você tem valor independentemente de qualquer resultado.`;
    }

    if (text.includes('cama') || text.includes('força') || text.includes('energia') || text.includes('desânimo') || text.includes('depressão') || text.includes('vontade')) {
      return `Eu compreendo perfeitamente. A depressão é um esgotamento biológico real; ela rouba a química da motivação.

Hoje, retire todo o peso de ter que 'ser produtivo'. Não tente consertar a sua vida inteira hoje.
Qual é a coisa mais minúscula que você consegue fazer agora? 
Pode ser apenas sentar na beirada da cama, beber meio copo de água ou olhar pela janela por 1 minuto. 

Se você só conseguir descansar hoje, isso já é o suficiente. O descanso é parte da sua cura.`;
    }

    if (text.includes('futuro') || text.includes('amanhã') || text.includes('medo') || text.includes('e se')) {
      return `Perceba como a sua mente viajou para o amanhã tentando resolver problemas que ainda nem existem. A ansiedade adora o 'e se...?'.

Traga sua atenção de volta para onde suas mãos estão agora. Hoje você não tem que vencer as batalhas do ano que vem, nem as do mês que vem. Você só precisa atravessar a próxima hora. E essa próxima hora, nós vamos atravessar juntos com calma.`;
    }

    return `Eu ouço cada palavra sua com muito carinho. O que você está sentindo é totalmente legítimo e você não precisa se envergonhar por estar vulnerável.

Você já enfrentou dias muito cinzentos antes e sobreviveu a todos eles. O que você acha de fazermos uma pausa de 3 minutos para respirar fundo, lavar o rosto com água fresca ou ouvir um trechinho de um dos nossos playbooks de acolhimento? Eu estou aqui torcendo por você a cada segundo.`;
  };

  const handleSend = (textToSend = null) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: content.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateSerenaResponse(content);
      const serenaMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'serena',
        text: responseText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, serenaMessage]);
      setIsTyping(false);
    }, 900);
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      localStorage.removeItem('serena_chat_history');
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg h-[92vh] sm:h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-4xl sm:rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header do Chat */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-calm-600 via-calm-700 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <Heart className="w-5 h-5 fill-white/80" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-calm-700 rounded-full" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center space-x-1.5">
                <span>Serena • Acolhimento</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">TCC</span>
              </h3>
              <p className="text-[11px] text-calm-100">Seu espaço seguro e confidencial</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 transition-colors"
              title="Limpar conversa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/40">
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-3.5 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-calm-600 to-indigo-600 text-white rounded-tr-xs shadow-md shadow-calm-500/10'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-xs border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-calm-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-calm-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-calm-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugestões Rápidas de Desabafo */}
        <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-800/60 border-t border-slate-200/60 dark:border-slate-800/60 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
          {QUICK_PROMPTS.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-calm-400 whitespace-nowrap shrink-0 transition-all active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input de Envio */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite o que está sentindo agora..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-calm-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-calm-600 hover:bg-calm-700 text-white disabled:opacity-40 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
