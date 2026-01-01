-- Add user profile related supplemental tables and social link columns
-- 1) Add new enum value for specialties: oral_medicine_radiology
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'specialty_type' AND e.enumlabel = 'oral_medicine_radiology'
  ) THEN
    ALTER TYPE specialty_type ADD VALUE 'oral_medicine_radiology';
  END IF;
END $$;

-- 2) Add social link columns to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- 3) Create user_educations table
CREATE TABLE IF NOT EXISTS public.user_educations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field TEXT,
  year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Create user_certifications table
CREATE TABLE IF NOT EXISTS public.user_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  year TEXT,
  credential TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5) Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6) Enable RLS
ALTER TABLE public.user_educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- 7) Policies: public can view; only owner can write
DO $$
BEGIN
  -- user_educations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_educations' AND policyname = 'Anyone can view user educations'
  ) THEN
    CREATE POLICY "Anyone can view user educations" ON public.user_educations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_educations' AND policyname = 'Users can insert own user educations'
  ) THEN
    CREATE POLICY "Users can insert own user educations" ON public.user_educations FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_educations' AND policyname = 'Users can update own user educations'
  ) THEN
    CREATE POLICY "Users can update own user educations" ON public.user_educations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_educations' AND policyname = 'Users can delete own user educations'
  ) THEN
    CREATE POLICY "Users can delete own user educations" ON public.user_educations FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- user_certifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_certifications' AND policyname = 'Anyone can view user certifications'
  ) THEN
    CREATE POLICY "Anyone can view user certifications" ON public.user_certifications FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_certifications' AND policyname = 'Users can insert own user certifications'
  ) THEN
    CREATE POLICY "Users can insert own user certifications" ON public.user_certifications FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_certifications' AND policyname = 'Users can update own user certifications'
  ) THEN
    CREATE POLICY "Users can update own user certifications" ON public.user_certifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_certifications' AND policyname = 'Users can delete own user certifications'
  ) THEN
    CREATE POLICY "Users can delete own user certifications" ON public.user_certifications FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- user_achievements
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_achievements' AND policyname = 'Anyone can view user achievements'
  ) THEN
    CREATE POLICY "Anyone can view user achievements" ON public.user_achievements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_achievements' AND policyname = 'Users can insert own user achievements'
  ) THEN
    CREATE POLICY "Users can insert own user achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_achievements' AND policyname = 'Users can update own user achievements'
  ) THEN
    CREATE POLICY "Users can update own user achievements" ON public.user_achievements FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_achievements' AND policyname = 'Users can delete own user achievements'
  ) THEN
    CREATE POLICY "Users can delete own user achievements" ON public.user_achievements FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 8) updated_at triggers for new tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_educations_updated_at'
  ) THEN
    CREATE TRIGGER update_user_educations_updated_at BEFORE UPDATE ON public.user_educations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_certifications_updated_at'
  ) THEN
    CREATE TRIGGER update_user_certifications_updated_at BEFORE UPDATE ON public.user_certifications
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_achievements_updated_at'
  ) THEN
    CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON public.user_achievements
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
