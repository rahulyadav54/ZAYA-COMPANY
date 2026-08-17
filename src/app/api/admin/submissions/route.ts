import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

const adminSupabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export async function GET() {
  try {
    // 1. Fetch all submissions
    const { data: rawSubmissions, error: subError } = await adminSupabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (subError) {
      console.error('Error fetching submissions from DB:', subError);
      return NextResponse.json({ submissions: [] }, { status: 200 });
    }

    if (!rawSubmissions || rawSubmissions.length === 0) {
      return NextResponse.json({ submissions: [] }, { status: 200 });
    }

    // 2. Fetch tasks and profiles for joining
    const [tasksRes, profilesRes] = await Promise.all([
      adminSupabase.from('tasks').select('id, title, duration_months'),
      adminSupabase.from('profiles').select('id, full_name, email')
    ]);

    const tasksMap = new Map((tasksRes.data || []).map((t: any) => [String(t.id), t]));
    const profilesMap = new Map((profilesRes.data || []).map((p: any) => [String(p.id), p]));

    // 3. Merge submissions with task & profile details
    const submissions = rawSubmissions.map((sub: any) => {
      const task = sub.task_id ? tasksMap.get(String(sub.task_id)) : null;
      const profile = sub.intern_id ? profilesMap.get(String(sub.intern_id)) : null;

      return {
        ...sub,
        tasks: task || (sub.task_title ? { title: sub.task_title } : null),
        profiles: profile || (sub.intern_email ? { full_name: sub.cert_full_name, email: sub.intern_email } : null)
      };
    });

    return NextResponse.json({ submissions }, { status: 200 });
  } catch (err: any) {
    console.error('Submissions API route error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from('submissions')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Update failed' }, { status: 500 });
  }
}
