import React, { useState } from 'react';
import { Heart, Sparkles, User, ArrowRight, Lock, Smile, Flower2, Sun, CloudRain, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { signInUser, signUpUser, isSupabaseConfigured } from '../lib/supabaseClient';

const AVATARS = [
  { id: 'calm', label: 'Sereno', icon: Smile, bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300' },
  { id: 'flower', label: 'Cura', icon: Flower2, bg: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300' },
  { id: 'sun', label: 'Luz', icon: Sun, bg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'rain', label: 'Alívio', icon: CloudRain, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300' },
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(initialUser?.avatar || 'calm');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (isRegister && !name.trim()) {
      setError('Por favor, informe seu nome ou apelido carinhoso.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Digite um e-mail válido.');
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Cadastro
        const { user, session, error: authErr } = await signUpUser(
          email.trim(),
          password,
          name.trim() || email.split('@')[0],
          selectedAvatar
        );

        if (authErr) {
          setError(authErr.message || 'Erro ao criar conta.');
          setLoading(false);
          return;
        }

        const userData = {
          id: user?.id || `local-${Date.now()}`,
          name: name.trim() || email.split('@')[0],
          email: email.trim(),
          avatar: selectedAvatar,
          isGuest: false,
          loginDate: new Date().toISOString()
        };

        localStorage.setItem('serena_user', JSON.stringify(userData));
        onLoginSuccess(userData);
        setInfoMessage('Conta criada com sucesso! Seja muito bem-vindo(a).');
        setTimeout(() => onClose(), 1200);

      } else {
        // Login
        const { user, session, error: authErr } = await signInUser(email.trim(), password);

        if (authErr) {
          setError('E-mail ou senha incorretos.');
          setLoading(false);
          return;
        }

        const userData = {
          id: user?.id || `local-${Date.now()}`,
          name: user?.user_metadata?.name || name.trim() || email.split('@')[0],
          email: email.trim(),
          avatar: user?.user_metadata?.avatar || selectedAvatar,
          isGuest: false,
          loginDate: new Date().toISOString()
        };

        localStorage.setItem('serena_user', JSON.stringify(userData));
        onLoginSuccess(userData);
        setInfoMessage('Bem-vindo(a) de volta ao seu refúgio.');
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      setError('Ocorreu um imprevisto na conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: `guest-${Date.now()}`,
      name: 'Viajante Serena',
      email: 'visitante@serenamente.app',
      avatar: 'sun',
      isGuest: true,
      loginDate: new Date().toISOString()
    };
    localStorage.setItem('serena_user', JSON.stringify(guestUser));
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 rounded-4xl shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
        
        {/* Banner Superior com Degradê Suave */}
        <div className="relative p-7 pb-5 bg-gradient-to-br from-calm-500 via-calm-600 to-indigo-700 text-white rounded-t-4xl overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm p-1.5 shadow-lg mb-2.5 border border-white/30">
              <img src="/logo-white.png?v=3" alt="SerenaMente" className="w-full h-full object-contain drop-shadow" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">SerenaMente</h2>
            <p className="text-xs text-calm-100 font-medium">
              {isSupabaseConfigured ? 'Sincronizado na Nuvem com Supabase' : 'Seu espaço seguro de acolhimento'}
            </p>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 pt-4 space-y-4">
          {/* Toggle Entrar / Criar Conta */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                !isRegister
                  ? 'bg-white dark:bg-slate-700 text-calm-600 dark:text-calm-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                isRegister
                  ? 'bg-white dark:bg-slate-700 text-calm-600 dark:text-calm-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Criar Conta Grátis
            </button>
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Seletor de Avatar */}
            {isRegister && (
              <div>
                <label className="block mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Como quer que sua energia se sinta?
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {AVATARS.map((av) => {
                    const Icon = av.icon;
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-calm-500 ring-2 ring-calm-300 dark:ring-calm-600 scale-105 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700'
                        } ${av.bg}`}
                      >
                        <Icon className="w-4 h-4 mb-0.5" />
                        <span className="text-[10px] font-semibold">{av.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Campo Nome se for registro */}
            {isRegister && (
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Seu Nome ou Apelido
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mariana, Lucas..."
                    className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-calm-400"
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            {/* Campo E-mail */}
            <div>
              <label className="block mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Seu E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-calm-400"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Senha (mínimo 6 dígitos)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-calm-400"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-calm-600 to-indigo-600 hover:from-calm-700 text-white font-semibold text-xs rounded-2xl shadow-md shadow-calm-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Criar Minha Conta Grátis' : 'Acessar Meu Espaço'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sem pressão
            </span>
          </div>

          {/* Botão Entrada Convidado */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-2xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-1.5 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Entrar Agora sem Cadastro (Modo Tranquilo)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
