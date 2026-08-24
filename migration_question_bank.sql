-- ========================================================
-- MIGRATION: Add Question Bank Table
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS public.question_bank CASCADE;

-- Create Question Bank Table
CREATE TABLE public.question_bank (
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

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can read active questions" ON public.question_bank;
DROP POLICY IF EXISTS "Admin can manage questions" ON public.question_bank;

-- Public can read active questions
CREATE POLICY "Public can read active questions" ON public.question_bank FOR SELECT TO public USING (is_active = true);

-- Admins can manage all questions
CREATE POLICY "Admin can manage questions" ON public.question_bank FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_question_bank_category ON public.question_bank(category);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON public.question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_active ON public.question_bank(is_active);
