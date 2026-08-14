import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY, {
      auth: { persistSession: false }
    });

    const internMap = new Map<string, any>();

    // 1. Fetch profiles table
    try {
      const { data: profData } = await supabase.from('profiles').select('*');
      if (profData && Array.isArray(profData)) {
        for (const p of profData) {
          if (p.email) {
            internMap.set(p.email.toLowerCase().trim(), {
              id: p.id,
              full_name: p.full_name || 'Intern',
              email: p.email,
              role: p.role || 'intern',
              position: p.position || 'Internship',
              phone: p.phone || '',
              joining_date: p.joining_date || p.created_at || new Date().toISOString().split('T')[0],
              intern_id: p.intern_id || `ZCH-2026-${Math.floor(1000 + Math.random() * 9000)}`
            });
          }
        }
      }
    } catch (e) {
      console.warn('Profiles query notice:', e);
    }

    // 2. Fetch accepted applications table
    try {
      const { data: appData } = await supabase
        .from('applications')
        .select('*')
        .eq('status', 'accepted');

      if (appData && Array.isArray(appData)) {
        for (const a of appData) {
          const emailKey = (a.email || '').toLowerCase().trim();
          if (emailKey) {
            const cleanName = (a.full_name || 'intern').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
            const parts = cleanName.split(/\s+/).filter(Boolean);
            const officialEmail = parts.length > 0 ? `${parts.join('')}@zayacodehub.com` : emailKey;

            const existing = internMap.get(emailKey) || internMap.get(officialEmail);

            if (!existing) {
              internMap.set(officialEmail, {
                id: a.id || `app-${Date.now()}`,
                full_name: a.full_name || 'Accepted Candidate',
                email: officialEmail,
                personal_email: a.email,
                role: 'intern',
                position: a.position || 'Internship',
                phone: a.phone || '',
                joining_date: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                intern_id: `ZCH-2026-${Math.floor(1000 + Math.random() * 9000)}`
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Applications query notice:', e);
    }

    const resultList = Array.from(internMap.values());

    return NextResponse.json({ success: true, interns: resultList });
  } catch (err: any) {
    console.error('API get interns catch error:', err);
    return NextResponse.json({ success: false, error: err?.message, interns: [] }, { status: 500 });
  }
}
