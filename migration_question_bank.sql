-- ========================================================
-- MIGRATION: Create Question Bank Table
-- Run this in your Supabase SQL Editor
-- ================================================

-- Create Question Bank Table (idempotent)
CREATE TABLE IF NOT EXISTS public.question_bank (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('aptitude', 'verbal', 'soft_skills', 'placement', 'technical', 'reasoning')),
  subcategory TEXT,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  explanation TEXT,
  points INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for question bank
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for clean setup)
DROP POLICY IF EXISTS "Public can read active questions" ON public.question_bank;
DROP POLICY IF EXISTS "Admin can manage questions" ON public.question_bank;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.question_bank;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.question_bank;
DROP POLICY IF EXISTS "Enable update for all users" ON public.question_bank;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.question_bank;

-- Public can read active questions
CREATE POLICY "Public can read active questions" ON public.question_bank FOR SELECT USING (is_active = true);

-- Admins can manage all questions
CREATE POLICY "Admin can manage questions" ON public.question_bank FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow all authenticated users to read (fallback)
CREATE POLICY "Enable read access for all users" ON public.question_bank FOR SELECT USING (true);

-- Allow all authenticated users to insert (fallback)
CREATE POLICY "Enable insert for all users" ON public.question_bank FOR INSERT WITH CHECK (true);

-- Allow all authenticated users to update (fallback)
CREATE POLICY "Enable update for all users" ON public.question_bank FOR UPDATE USING (true);

-- Allow all authenticated users to delete (fallback)
CREATE POLICY "Enable delete for all users" ON public.question_bank FOR DELETE USING (true);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_question_bank_category ON public.question_bank(category);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON public.question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_active ON public.question_bank(is_active);
