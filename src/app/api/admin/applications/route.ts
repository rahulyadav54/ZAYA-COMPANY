import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

export async function GET() {
  try {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseUrl = (envUrl && envUrl.includes('jhfmkjkldxovscvobvoh')) ? envUrl : SUPABASE_PROJECT_URL;
    const supabaseKey = (serviceKey && serviceKey.startsWith('ey')) 
      ? serviceKey 
      : ((envKey && envKey.startsWith('ey')) ? envKey : SUPABASE_PUBLIC_ANON_KEY);

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (error) {
      console.warn('API get applications warning:', error);
      return NextResponse.json({ success: false, error: error.message, applications: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, applications: data || [] });
  } catch (err: any) {
    console.error('API get applications catch:', err);
    return NextResponse.json({ success: false, error: err?.message, applications: [] }, { status: 500 });
  }
}
