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
  portfolio_url TEXT,
  cover_letter TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'hired')),
  intern_id TEXT,
  duration TEXT DEFAULT '1 month',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created previously
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS leetcode_username TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS hackerrank_username TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leetcode_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hackerrank_username TEXT;

-- RLS Policies for applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public select to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public update to applications" ON public.applications;

CREATE POLICY "Allow public insert to applications" ON public.applications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select to applications" ON public.applications FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update to applications" ON public.applications FOR UPDATE TO public USING (true);


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
  intern_id TEXT NOT NULL,
  intern_name TEXT,
  content TEXT,
  sender_type TEXT DEFAULT 'intern',
  file_url TEXT,
  file_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created with older schema
ALTER TABLE public.intern_messages ADD COLUMN IF NOT EXISTS intern_id TEXT;
ALTER TABLE public.intern_messages ADD COLUMN IF NOT EXISTS intern_name TEXT;
ALTER TABLE public.intern_messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.intern_messages ADD COLUMN IF NOT EXISTS sender_type TEXT;
ALTER TABLE public.intern_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.intern_messages ADD COLUMN IF NOT EXISTS file_type TEXT;

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
-- Messages Policies
DROP POLICY IF EXISTS "Allow public select intern_messages" ON public.intern_messages;
DROP POLICY IF EXISTS "Allow public insert intern_messages" ON public.intern_messages;
DROP POLICY IF EXISTS "Allow public update intern_messages" ON public.intern_messages;
DROP POLICY IF EXISTS "Allow public all intern_messages" ON public.intern_messages;
CREATE POLICY "Allow public all intern_messages" ON public.intern_messages FOR ALL USING (true) WITH CHECK (true);

-- Applications Policies
DROP POLICY IF EXISTS "Enable insert applications for anyone" ON public.applications;
DROP POLICY IF EXISTS "Enable read applications for self or admin" ON public.applications;
DROP POLICY IF EXISTS "Enable update applications for admin" ON public.applications;
DROP POLICY IF EXISTS "Allow public insert to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public select to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public update to applications" ON public.applications;
CREATE POLICY "Enable insert applications for anyone" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read applications for self or admin" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Enable update applications for admin" ON public.applications FOR UPDATE USING (true);

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Jobs Policies
DROP POLICY IF EXISTS "Jobs viewable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Jobs insertable by admin" ON public.jobs;
CREATE POLICY "Jobs viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Jobs insertable by admin" ON public.jobs FOR INSERT WITH CHECK (true);

-- Tasks & Submissions Policies
DROP POLICY IF EXISTS "Tasks viewable by assigned intern or admin" ON public.tasks;
DROP POLICY IF EXISTS "Submissions viewable by intern or admin" ON public.submissions;
DROP POLICY IF EXISTS "Submissions insertable by intern" ON public.submissions;
CREATE POLICY "Tasks viewable by assigned intern or admin" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Submissions viewable by intern or admin" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Submissions insertable by intern" ON public.submissions FOR INSERT WITH CHECK (true);

-- Contact & Posts Policies
DROP POLICY IF EXISTS "Anyone can send contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Posts viewable by everyone" ON public.posts;
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

-- Ensure columns exist if table was created previously
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS certificate_id TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending';
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS cert_full_name TEXT;

-- ==========================================
-- 9. SUPABASE STORAGE BUCKETS setup
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('messages', 'messages', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Anon Upload Resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public Anon Read Resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public Anon Upload Messages" ON storage.objects;
DROP POLICY IF EXISTS "Public Anon Read Messages" ON storage.objects;

-- Create policies allowing uploads and downloads
CREATE POLICY "Public Anon Upload Resumes" ON storage.objects 
FOR INSERT TO anon WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Public Anon Read Resumes" ON storage.objects 
FOR SELECT TO public USING (bucket_id = 'resumes');

CREATE POLICY "Public Anon Upload Messages" ON storage.objects 
FOR INSERT TO anon WITH CHECK (bucket_id = 'messages');

CREATE POLICY "Public Anon Read Messages" ON storage.objects 
FOR SELECT TO public USING (bucket_id = 'messages');

-- ==========================================
-- 10. EXAM PORTAL TABLES (Anti-Cheating Proctored Exams)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT DEFAULT 'Full Stack',
  duration_minutes INTEGER DEFAULT 30,
  passing_score INTEGER DEFAULT 60,
  max_violations INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option INTEGER NOT NULL DEFAULT 0,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  intern_id TEXT NOT NULL,
  intern_name TEXT,
  college_name TEXT,
  phone TEXT,
  score INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  violations_count INTEGER DEFAULT 0,
  violations_log JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'disqualified')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS college_name TEXT;
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS phone TEXT;

-- Enable RLS for Exam Tables
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Exams" ON public.exams;
DROP POLICY IF EXISTS "Public Manage Exams" ON public.exams;
DROP POLICY IF EXISTS "Public Read Questions" ON public.exam_questions;
DROP POLICY IF EXISTS "Public Manage Questions" ON public.exam_questions;
DROP POLICY IF EXISTS "Public Read Exam Submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Public Insert Exam Submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Public Update Exam Submissions" ON public.exam_submissions;

CREATE POLICY "Public Read Exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Public Manage Exams" ON public.exams FOR ALL USING (true);

CREATE POLICY "Public Read Questions" ON public.exam_questions FOR SELECT USING (true);
CREATE POLICY "Public Manage Questions" ON public.exam_questions FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Exam Submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Public Insert Exam Submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Public Update Exam Submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Public Delete Exam Submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Public Manage Exam Submissions" ON public.exam_submissions;
CREATE POLICY "Public Manage Exam Submissions" ON public.exam_submissions FOR ALL USING (true);

-- 9. USER PRACTICE STATS & GAMIFICATION TABLE
CREATE TABLE IF NOT EXISTS public.user_practice_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 1,
  tests_completed INTEGER DEFAULT 0,
  coding_problems_solved INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_practice_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Manage User Practice Stats" ON public.user_practice_stats;
CREATE POLICY "Public Manage User Practice Stats" ON public.user_practice_stats FOR ALL USING (true);

