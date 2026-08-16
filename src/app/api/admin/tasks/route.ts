import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

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

    const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY, {
      auth: { persistSession: false }
    });

    // Format deadline
    const formattedDeadline = deadline ? new Date(deadline).toISOString().split('T')[0] : null;

    const isValidUUID = (uuid: string): boolean => {
      if (!uuid) return false;
      const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return regex.test(uuid);
    };

    // Build task rows — use intern_email and intern_name, and link intern_id if UUID is valid
    const taskRows = targetInterns.map((intern: any) => {
      const row: any = {
        title: title.trim(),
        description: description.trim(),
        priority: priority || 'medium',
        deadline: formattedDeadline,
        status: 'pending',
        intern_email: intern.email || intern.personal_email || 'unknown',
        intern_name: intern.full_name || 'Intern'
      };
      if (intern.id && isValidUUID(String(intern.id))) {
        row.intern_id = intern.id;
      }
      return row;
    });

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
