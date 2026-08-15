import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY, {
      auth: { persistSession: false }
    });

    // Clean up any accidental @zayacodehub.com entries in applications table
    try {
      await supabase
        .from('applications')
        .delete()
        .ilike('email', '%@zayacodehub.com');
    } catch (e) {
      console.warn('Cleanup notice:', e);
    }

    // 1. Select applications
    let { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      const res = await supabase.from('applications').select('*');
      data = res.data;
    }

    // 2. Filter out any official company email rows from candidate applications list
    const candidateApps = (data || []).filter((app: any) => {
      const email = (app.email || '').toLowerCase().trim();
      return !email.endsWith('@zayacodehub.com');
    });

    return NextResponse.json({ success: true, applications: candidateApps });
  } catch (err: any) {
    console.error('API get applications catch error:', err);
    return NextResponse.json({ success: false, error: err?.message, applications: [] }, { status: 500 });
  }
}
