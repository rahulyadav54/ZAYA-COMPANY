# Supabase Database Schema & Setup

To make the application fully functional, follow these steps to set up your Supabase project.

## 1. Create Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Profiles table for Users (Admins and Interns)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'intern')),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Applications table
CREATE TABLE applications (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table (Intern Management)
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  intern_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGSERIAL REFERENCES tasks(id),
  intern_id UUID REFERENCES profiles(id),
  file_url TEXT,
  comment TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. Environment Variables

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Storage Buckets

Create a public storage bucket named `resumes` and `submissions` in your Supabase dashboard to handle file uploads.

## 4. Auth Configuration

- Enable **Email/Password** authentication.
- Set up a trigger to automatically create a `profiles` entry when a new user signs up (optional but recommended).
```sql
-- Trigger for new user profile
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'intern');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
