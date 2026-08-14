import { createBrowserClient } from '@supabase/ssr';

const defaultUrl = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co')
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : defaultUrl;

const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder')
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : defaultAnonKey;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
