import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('sua-url-aqui'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// ==============================================================================
// FUNÇÕES OTIMIZADAS PARA O PLANO GRATUITO (OFFLINE-FIRST + CACHE INTELIGENTE)
// ==============================================================================

/**
 * Cadastrar novo usuário no Supabase
 */
export async function signUpUser(email, password, name, avatar) {
  if (!isSupabaseConfigured) {
    return {
      user: { id: `local-${Date.now()}`, email, name, avatar },
      error: null
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, avatar }
    }
  });

  return { user: data?.user, session: data?.session, error };
}

/**
 * Entrar com e-mail e senha
 */
export async function signInUser(email, password) {
  if (!isSupabaseConfigured) {
    return {
      user: { id: `local-${Date.now()}`, email, name: email.split('@')[0], avatar: 'calm' },
      error: null
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { user: data?.user, session: data?.session, error };
}

/**
 * Desconectar
 */
export async function signOutUser() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}

/**
 * Sincronizar dados locais com o Supabase em segundo plano
 * (Usa UPSERT em lote para gastar o mínimo de chamadas da cota gratuita)
 */
export async function syncUserDataToSupabase(userId, { goals, challengesProgress, journalEntries, streakDays }) {
  if (!isSupabaseConfigured || !supabase || !userId || userId.startsWith('local-')) return;

  try {
    // 1. Atualizar Perfil e Streak
    await supabase.from('profiles').upsert({
      id: userId,
      streak_days: streakDays,
      updated_at: new Date().toISOString()
    });

    // 2. Sincronizar Metas em lote
    if (goals && goals.length > 0) {
      const formattedGoals = goals.map(g => ({
        id: g.id,
        user_id: userId,
        title: g.title,
        category: g.category || 'mente',
        completed: Boolean(g.completed),
        updated_at: new Date().toISOString()
      }));
      await supabase.from('daily_goals').upsert(formattedGoals);
    }

    // 3. Sincronizar Desafios
    if (challengesProgress) {
      const challengeRows = Object.entries(challengesProgress).map(([journeyId, data]) => ({
        user_id: userId,
        journey_id: journeyId,
        completed_days: data.completedDays || [],
        updated_at: new Date().toISOString()
      }));
      await supabase.from('challenges_progress').upsert(challengeRows, { onConflict: 'user_id,journey_id' });
    }

    // 4. Sincronizar Diário de Emoções (apenas os últimos 20 para economizar espaço)
    if (journalEntries && journalEntries.length > 0) {
      const journalRows = journalEntries.slice(-20).map(j => ({
        id: j.id,
        user_id: userId,
        mood: j.mood,
        note: j.note,
        gratitude: j.gratitude,
        created_at: j.date ? new Date().toISOString() : new Date().toISOString()
      }));
      await supabase.from('mood_journals').upsert(journalRows);
    }
  } catch (err) {
    console.warn('Sincronização em segundo plano adiada (modo offline ativo):', err);
  }
}

/**
 * Carregar dados da nuvem ao fazer login
 */
export async function fetchUserDataFromSupabase(userId) {
  if (!isSupabaseConfigured || !supabase || !userId || userId.startsWith('local-')) return null;

  try {
    const [profileRes, goalsRes, challengesRes, journalRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('daily_goals').select('*').eq('user_id', userId),
      supabase.from('challenges_progress').select('*').eq('user_id', userId),
      supabase.from('mood_journals').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    ]);

    return {
      profile: profileRes.data,
      goals: goalsRes.data,
      challenges: challengesRes.data,
      journals: journalRes.data
    };
  } catch (e) {
    console.warn('Erro ao carregar dados do Supabase:', e);
    return null;
  }
}
