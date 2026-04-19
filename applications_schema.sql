-- 1. Create the Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    position TEXT NOT NULL, -- e.g., "Android Developer Intern"
    experience TEXT,
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'hired')),
    intern_id TEXT, -- e.g., "ZCH-2026-001"
    duration TEXT DEFAULT '1 month',
    applied_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Optional: Link to a user profile if they already have one
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow anyone to submit an application (Insert)
CREATE POLICY "Enable insert for all users" ON public.applications
    FOR INSERT WITH CHECK (true);

-- Allow Admins to see all applications
CREATE POLICY "Enable read access for admins" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Allow users to see their own applications by email
CREATE POLICY "Enable read access for own applications" ON public.applications
    FOR SELECT USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- 4. Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.applications(email);
