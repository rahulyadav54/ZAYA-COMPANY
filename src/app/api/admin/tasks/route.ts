import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'f' + Date.now().toString(16).padStart(11, '0') + '-4000-8000-' + Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority, deadline, targetInterns } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Task title and description are required.' }, { status: 400 });
    }

    if (!targetInterns || !Array.isArray(targetInterns) || targetInterns.length === 0) {
      return NextResponse.json({ success: false, error: 'No target interns provided.' }, { status: 400 });
    }

    const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const clientKey = (envServiceKey && envServiceKey.startsWith('ey')) ? envServiceKey : SUPABASE_PUBLIC_ANON_KEY;
    
    const supabase = createClient(SUPABASE_PROJECT_URL, clientKey, {
      auth: { persistSession: false }
    });

    // Ensure all target interns have valid profiles for FK constraint
    const validProfileIds: string[] = [];

    for (const intern of targetInterns) {
      let profileId = intern.id;

      if (!profileId || !isValidUUID(String(profileId))) {
        profileId = generateUUID();
      }

      // Upsert into profiles table to satisfy Foreign Key constraint on tasks.intern_id
      try {
        const { data: upsertedProf } = await supabase
          .from('profiles')
          .upsert({
            id: profileId,
            email: intern.email || `${profileId}@zayacodehub.com`,
            full_name: intern.full_name || 'Intern',
            role: 'intern',
            position: intern.position || 'Internship',
            joining_date: intern.joining_date || new Date().toISOString().split('T')[0],
            intern_id: intern.intern_id || `ZCH-2026-${Math.floor(1000 + Math.random() * 9000)}`
          }, { onConflict: 'id' })
          .select('id')
          .maybeSingle();

        validProfileIds.push(upsertedProf?.id || profileId);
      } catch (err) {
        console.warn('Profile upsert warning:', err);
        validProfileIds.push(profileId);
      }
    }

    // Format deadline
    const formattedDeadline = deadline ? new Date(deadline).toISOString().split('T')[0] : null;

    // Construct task rows
    const taskRows = validProfileIds.map(profId => ({
      intern_id: profId,
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'medium',
      deadline: formattedDeadline,
      status: 'pending'
    }));

    // Insert tasks into database
    const { data: insertedData, error: insertErr } = await supabase
      .from('tasks')
      .insert(taskRows)
      .select();

    if (insertErr) {
      console.error('Task Batch Insertion Error:', insertErr);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    const assignedCount = insertedData?.length || taskRows.length;

    return NextResponse.json({
      success: true,
      count: assignedCount,
      message: `Task successfully assigned to ${assignedCount} intern(s)!`
    });

  } catch (err: any) {
    console.error('Assign Task Route Exception:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to assign tasks.' }, { status: 500 });
  }
}
