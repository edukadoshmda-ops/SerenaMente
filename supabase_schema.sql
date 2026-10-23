-- ==============================================================================
-- SCHEMA DEFINITIVO E 100% SEGURO PARA O SUPABASE (SERENAMENTE APP)
-- Execute este script completo no SQL Editor do Supabase (sem selecionar trechos)
-- ==============================================================================

SET search_path = public, auth;

-- 1. CRIAÇÃO DAS TABELAS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  name VARCHAR(80) NOT NULL DEFAULT 'Viajante Serena',
  avatar VARCHAR(30) DEFAULT 'calm',
  streak_days SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_goals (
  id TEXT PRIMARY KEY,
  user_id UUID,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(30) DEFAULT 'mente',
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenges_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  journey_id VARCHAR(60) NOT NULL,
  completed_days INT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, journey_id)
);

CREATE TABLE IF NOT EXISTS public.mood_journals (
  id TEXT PRIMARY KEY,
  user_id UUID,
  mood VARCHAR(30) NOT NULL,
  note TEXT,
  gratitude TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VINCULAÇÃO SEGURA COM AUTH.USERS (FOREIGN KEYS PROTEGIDAS)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_goals_user_id_fkey') THEN
    ALTER TABLE public.daily_goals ADD CONSTRAINT daily_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenges_progress_user_id_fkey') THEN
    ALTER TABLE public.challenges_progress ADD CONSTRAINT challenges_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mood_journals_user_id_fkey') THEN
    ALTER TABLE public.mood_journals ADD CONSTRAINT mood_journals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. ÍNDICES DE ALTA PERFORMANCE (B-TREE)
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user ON public.challenges_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_user ON public.mood_journals(user_id);

-- 4. ATIVAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_journals ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE SEGURANÇA (RLS)
DO $$
BEGIN
  DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
  CREATE POLICY "profiles_policy" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

  DROP POLICY IF EXISTS "daily_goals_policy" ON public.daily_goals;
  CREATE POLICY "daily_goals_policy" ON public.daily_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "challenges_policy" ON public.challenges_progress;
  CREATE POLICY "challenges_policy" ON public.challenges_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "mood_journals_policy" ON public.mood_journals;
  CREATE POLICY "mood_journals_policy" ON public.mood_journals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
END $$;

-- 6. TRIGGER: CRIAÇÃO AUTOMÁTICA DE PERFIL NO CADASTRO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'calm')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
