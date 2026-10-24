import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  User, 
  ArrowRight, 
  Lock, 
  Smile, 
  Flower2, 
  Sun, 
  CloudRain, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Crown, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  Star,
  Zap,
  X
} from 'lucide-react';
import { signInUser, signUpUser, isSupabaseConfigured } from '../lib/supabaseClient';

const AVATARS = [
  { id: 'calm', label: 'Sereno', icon: Smile, bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300' },
  { id: 'flower', label: 'Cura', icon: Flower2, bg: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300' },
  { id: 'sun', label: 'Luz', icon: Sun, bg: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'rain', label: 'Alívio', icon: CloudRain, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300' },
];

export const PLANOS_DISPONIVEIS = [
  {
    id: 'mensal',
    name: 'Acolhimento Mensal',
    price: 'R$ 9,90',
    period: '/mês',
    equivalence: 'Sem fidelidade • Cartão ou Pix',
    highlights: 'Acesso completo a todos os áudios e ao botão SOS (Cartão ou Pix)',
    asaasUrl: 'https://www.asaas.com/000/c/6c8gl87rm97ltavn',
    badge: 'Cartão ou Pix',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
  },
  {
    id: 'anual',
    name: 'Transformação Anual (60% OFF)',
    price: 'R$ 97,00',
    period: '/ano',
    equivalence: '12x no Cartão (R$ 8,08/mês)',
    highlights: 'Inclui todos os PDFs para download, histórias de sono e atualizações • 12 vezes no Cartão',
    asaasUrl: 'https://www.asaas.com/000/c/so98wzo06jbvo8dr',
    badge: '⭐ 12x no Cartão',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    isPopular: true
  },
  {
    id: 'vitalicio',
    name: 'Acesso Vitalício + Bônus',
    price: 'R$ 147,00',
    period: 'pagamento único',
    equivalence: '12x no Cartão ou Pix à vista',
    highlights: 'Acesso permanente para sempre, sem mensalidades • 12 vezes no Cartão',
    asaasUrl: 'https://www.asaas.com/000/c/cpvg71k31t3ebq4i',
    badge: '👑 12x no Cartão',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  }
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [password, setPassword] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('anual'); // Anual como padrão recomendado
  const [selectedAvatar, setSelectedAvatar] = useState(initialUser?.avatar || 'sun');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [needPlanSelection, setNeedPlanSelection] = useState(false);

  if (!isOpen) return null;

  // Obter membros cadastrados localmente
  const getRegisteredMembers = () => {
    try {
      return JSON.parse(localStorage.getItem('serena_registered_members') || '[]');
    } catch {
      return [];
    }
  };

  // Salvar membro cadastrado
  const saveRegisteredMember = (member) => {
    try {
      const members = getRegisteredMembers();
      const existingIdx = members.findIndex(m => m.email.toLowerCase() === member.email.toLowerCase());
      if (existingIdx >= 0) {
        members[existingIdx] = { ...members[existingIdx], ...member };
      } else {
        members.push(member);
      }
      localStorage.setItem('serena_registered_members', JSON.stringify(members));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setNeedPlanSelection(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 dígitos.');
      return;
    }

    // 1. VERIFICAÇÃO SUPERADMIN: edukadoshmda@gmail.com / 123456
    if (cleanEmail === 'edukadoshmda@gmail.com' && cleanPassword === '123456') {
      setLoading(true);
      const superAdminUser = {
        id: 'superadmin-eduardo',
        name: 'Eduardo (SuperAdmin)',
        email: 'edukadoshmda@gmail.com',
        role: 'superAdmin',
        plan: 'vitalicio',
        planName: '👑 Acesso Total Vitalício (SuperAdmin)',
        avatar: 'sun',
        isGuest: false,
        loginDate: new Date().toISOString()
      };

      // Tenta autenticar no Supabase em segundo plano
      if (isSupabaseConfigured) {
        signInUser('edukadoshmda@gmail.com', '123456').catch(() => {});
      }

      localStorage.setItem('serena_user', JSON.stringify(superAdminUser));
      saveRegisteredMember(superAdminUser);
      onLoginSuccess(superAdminUser);
      setInfoMessage('👑 Bem-vindo, SuperAdmin Eduardo! Acesso total liberado.');
      setLoading(false);
      setTimeout(() => onClose(), 800);
      return;
    }

    // 2. FLUXO DE CADASTRO (OBRIGATÓRIO ESCOLHER UM DOS PLANOS)
    if (isRegister) {
      if (!name.trim()) {
        setError('Por favor, informe seu nome ou como prefere ser chamado(a).');
        return;
      }

      const planChosen = PLANOS_DISPONIVEIS.find(p => p.id === selectedPlanId);
      if (!planChosen) {
        setError('Por favor, selecione um dos planos de acolhimento para liberar o acesso.');
        return;
      }

      setLoading(true);

      try {
        // Salva cadastro no Supabase
        let supabaseId = null;
        if (isSupabaseConfigured) {
          try {
            const { user } = await signUpUser(
              cleanEmail,
              cleanPassword,
              name.trim(),
              selectedAvatar
            );
            if (user?.id) supabaseId = user.id;
          } catch (e) {
            console.warn('Supabase signup fallback to local storage:', e);
          }
        }

        const newUser = {
          id: supabaseId || `aluno-${Date.now()}`,
          name: name.trim(),
          email: cleanEmail,
          role: 'aluno',
          plan: planChosen.id,
          planName: planChosen.name,
          avatar: selectedAvatar,
          isGuest: false,
          registeredAt: new Date().toISOString(),
          loginDate: new Date().toISOString()
        };

        // Salva no banco de membros e na sessão ativa
        saveRegisteredMember(newUser);
        localStorage.setItem('serena_user', JSON.stringify(newUser));

        // Registrar lead capturado
        try {
          const leads = JSON.parse(localStorage.getItem('serena_captured_leads') || '[]');
          leads.push({ name: name.trim(), email: cleanEmail, plan: planChosen.name, date: new Date().toISOString() });
          localStorage.setItem('serena_captured_leads', JSON.stringify(leads));
        } catch {}

        // Redireciona para o checkout oficial do Asaas em nova aba
        window.open(planChosen.asaasUrl, '_blank');

        onLoginSuccess(newUser);
        setInfoMessage(`✅ Cadastro realizado no plano "${planChosen.name}"! Acesso ao aplicativo liberado.`);
        setTimeout(() => onClose(), 1200);

      } catch (err) {
        setError('Ocorreu um erro ao processar seu cadastro. Tente novamente.');
      } finally {
        setLoading(false);
      }

      return;
    }

    // 3. FLUXO DE LOGIN (JÁ SOU ALUNO / MEMBRO)
    setLoading(true);

    try {
      const members = getRegisteredMembers();
      const existingMember = members.find(m => m.email.toLowerCase() === cleanEmail);

      // Tenta login pelo Supabase
      let supabaseUser = null;
      if (isSupabaseConfigured) {
        try {
          const { user } = await signInUser(cleanEmail, cleanPassword);
          supabaseUser = user;
        } catch {}
      }

      if (existingMember && existingMember.plan) {
        // Usuário tem plano ativo registrado
        const activeUser = {
          ...existingMember,
          loginDate: new Date().toISOString()
        };
        localStorage.setItem('serena_user', JSON.stringify(activeUser));
        onLoginSuccess(activeUser);
        setInfoMessage(`Bem-vindo(a) de volta! Plano: ${activeUser.planName || 'Ativo'}.`);
        setTimeout(() => onClose(), 800);
      } else if (supabaseUser) {
        // Usuário autenticado no Supabase
        const plan = supabaseUser.user_metadata?.plan || 'mensal';
        const planObj = PLANOS_DISPONIVEIS.find(p => p.id === plan) || PLANOS_DISPONIVEIS[0];
        const activeUser = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: supabaseUser.user_metadata?.role || 'aluno',
          plan: plan,
          planName: planObj.name,
          avatar: supabaseUser.user_metadata?.avatar || 'sun',
          isGuest: false,
          loginDate: new Date().toISOString()
        };
        localStorage.setItem('serena_user', JSON.stringify(activeUser));
        saveRegisteredMember(activeUser);
        onLoginSuccess(activeUser);
        setInfoMessage(`Bem-vindo(a) de volta! Plano: ${planObj.name}.`);
        setTimeout(() => onClose(), 800);
      } else {
        // Usuário não tem cadastro em plano ativo!
        setError('Este e-mail ainda não possui um plano de acesso ativo. Escolha o seu plano abaixo para liberar o app:');
        setNeedPlanSelection(true);
      }
    } catch (err) {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlanAndGoToCheckout = (plan) => {
    setSelectedPlanId(plan.id);
    setIsRegister(true);
    setNeedPlanSelection(false);
    window.open(plan.asaasUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-slate-900 rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all max-h-[95vh] overflow-y-auto">
        
        {/* Banner Superior com Logo Oficial e Título */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-calm-600 via-indigo-600 to-slate-900 text-white rounded-t-3xl overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md p-1.5 shadow-lg border border-white/30 shrink-0">
              <img src="/app-icon-rounded.png" alt="SerenaMente" className="w-full h-full object-contain drop-shadow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">SerenaMente</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-teal-200 border border-white/20">
                  Acesso aos Planos
                </span>
              </div>
              <p className="text-xs text-indigo-100 font-medium">
                Seu refúgio de paz, áudios e acolhimento emocional
              </p>
            </div>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Toggle: Já sou Aluno / Quero Escolher Plano */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); setNeedPlanSelection(false); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-white dark:bg-slate-700 text-calm-700 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Já tenho Plano (Entrar)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); setNeedPlanSelection(false); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isRegister
                  ? 'bg-gradient-to-r from-calm-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cadastrar em um Plano
            </button>
          </div>

          {/* Alertas de Erro ou Sucesso */}
          {error && (
            <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 text-xs text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span className="font-semibold">{infoMessage}</span>
            </div>
          )}

          {/* SE O USUÁRIO TENTOU LOGAR MAS NÃO TEM PLANO, MOSTRA SELEÇÃO DIRETA */}
          {needPlanSelection && (
            <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-3">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200 font-bold text-xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>Escolha seu plano para ativar seu acesso agora:</span>
              </div>
              <div className="space-y-2">
                {PLANOS_DISPONIVEIS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPlanAndGoToCheckout(p)}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 hover:border-calm-500 cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{p.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${p.badgeColor}`}>{p.badge}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.highlights}</p>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-black text-sm text-calm-600 dark:text-teal-400">{p.price}</span>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-bold flex items-center justify-end gap-1 group-hover:underline">
                        <span>Ativar</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FORMULÁRIO PRINCIPAL */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Se for Cadastro: Seleção Visual Obrigatória do Plano */}
            {isRegister && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                  1. Escolha o seu Plano de Acesso:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PLANOS_DISPONIVEIS.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-calm-500 bg-calm-50/70 dark:bg-calm-950/40 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-calm-600 bg-calm-600 text-white' : 'border-slate-400'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {plan.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${plan.badgeColor}`}>
                              {plan.badge}
                            </span>
                          </div>
                          <span className="font-black text-xs sm:text-sm text-calm-700 dark:text-teal-400">
                            {plan.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-6">
                          {plan.highlights}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Campo Nome (se for cadastro) */}
            {isRegister && (
              <div>
                <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Seu Nome ou Apelido:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como você prefere ser chamado(a)?"
                    className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-calm-400"
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            {/* Campo E-mail */}
            <div>
              <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                {isRegister ? '3. Seu E-mail:' : 'Seu E-mail Cadastrado:'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-calm-400"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                {isRegister ? '4. Crie sua Senha:' : 'Sua Senha:'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-calm-400"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Botão de Ação */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-calm-600 via-indigo-600 to-purple-600 hover:from-calm-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-calm-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRegister ? (
                <>
                  <span>Cadastrar & Ativar no Asaas</span>
                  <ExternalLink className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Entrar no Meu Refúgio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dica de Segurança e Garantia */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
            <span>Pagamento Seguro pelo Asaas • Garantia incondicional de 7 dias</span>
          </div>

        </div>
      </div>
    </div>
  );
}
