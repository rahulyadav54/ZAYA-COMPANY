import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY, {
      auth: { persistSession: false }
    });

    // 1. Fetch profiles where role is intern
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'intern');

    if (error || !data) {
      console.warn('API interns fetch notice:', error?.message);
      // Fallback: select all profiles
      const res = await supabase.from('profiles').select('*');
      data = (res.data || []).filter((p: any) => p.role === 'intern' || !p.role);
    }

    return NextResponse.json({ success: true, interns: data || [] });
  } catch (err: any) {
    console.error('API get interns catch error:', err);
    return NextResponse.json({ success: false, error: err?.message, interns: [] }, { status: 500 });
  }
}
