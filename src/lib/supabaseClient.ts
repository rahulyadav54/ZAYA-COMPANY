import { createBrowserClient } from '@supabase/ssr';

const defaultUrl = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = (envUrl && envUrl.includes('jhfmkjkldxovscvobvoh'))
  ? envUrl
  : defaultUrl;

const supabaseAnonKey = (envKey && envKey.startsWith('ey'))
  ? envKey
  : defaultAnonKey;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
