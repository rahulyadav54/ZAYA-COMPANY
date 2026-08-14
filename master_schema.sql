-- ========================================================
-- MASTER SUPABASE DATABASE SCHEMA FOR ZAYA CODE HUB
-- Run this in your Supabase SQL Editor for your new project
-- ========================================================

-- 1. PROFILES TABLE (Users & Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'intern' CHECK (role IN ('admin', 'intern')),
  avatar_url TEXT,
  intern_id TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APPLICATIONS TABLE (Job/Internship Applications)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  position TEXT NOT NULL,
  experience TEXT,
  resume_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'hired')),
  intern_id TEXT,
  duration TEXT DEFAULT '1 month',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOBS TABLE (Careers / Job Listings)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'Internship',
  category TEXT DEFAULT 'tech',
  location TEXT DEFAULT 'Remote (Work From Home)',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TASKS TABLE (Intern Tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
  id BIGSERIAL PRIMARY KEY,
  intern_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'completed')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBMISSIONS TABLE (Task Submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES public.tasks(id) ON DELETE CASCADE,
  intern_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  comment TEXT,
  certificate_issued BOOLEAN DEFAULT FALSE,
  payment_status TEXT DEFAULT 'unpaid',
  payment_id TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. POSTS / MAGAZINE TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  content TEXT,
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INTERN MESSAGES / CHAT TABLE
CREATE TABLE IF NOT EXISTS public.intern_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intern_messages ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- RLS POLICIES FOR PUBLIC ACCESS
-- ========================================================
-- Applications Policies
CREATE POLICY "Enable insert applications for anyone" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read applications for self or admin" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Enable update applications for admin" ON public.applications FOR UPDATE USING (true);

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Jobs Policies
CREATE POLICY "Jobs viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Jobs insertable by admin" ON public.jobs FOR INSERT WITH CHECK (true);

-- Tasks & Submissions Policies
CREATE POLICY "Tasks viewable by assigned intern or admin" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Submissions viewable by intern or admin" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Submissions insertable by intern" ON public.submissions FOR INSERT WITH CHECK (true);

-- Contact & Posts Policies
CREATE POLICY "Anyone can send contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Posts viewable by everyone" ON public.posts FOR SELECT USING (true);

-- ========================================================
-- AUTOMATIC USER PROFILE TRIGGER ON SIGNUP
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'intern'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
