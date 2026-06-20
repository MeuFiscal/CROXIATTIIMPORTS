-- ======================================================
-- CROXIATTI IMPORTS V3 — Migration Script
-- Execute this in the Supabase SQL Editor
-- ======================================================

-- 1. Create profiles table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telefone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  role TEXT DEFAULT 'cliente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for profiles
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for the trigger)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin (authenticated) can view all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- 4. Add user_id column to pedidos (links orders to auth users)
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 5. Create index for faster order lookups by user
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON public.pedidos(user_id);

-- 6. Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, telefone, whatsapp, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    'cliente'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profile_updated_at ON public.profiles;

CREATE TRIGGER profile_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_timestamp();

-- 8. Create Categorias Table
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Add categoria_id to produtos
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS imagem_url_2 TEXT;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS imagem_url_3 TEXT;

-- 10. Enable RLS on categorias
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categorias_select" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "categorias_admin_all" ON public.categorias FOR ALL TO authenticated USING (true);

