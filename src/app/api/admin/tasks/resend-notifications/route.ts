import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendUniversalEmail } from '@/lib/sendUniversalEmail';
import { renderTaskAssignedEmail } from '@/lib/emailTemplates';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

export async function POST() {
  try {
    const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY, {
      auth: { persistSession: false }
    });

    // 1. Fetch all pending tasks
    const { data: tasks, error: tasksErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending');

    if (tasksErr) {
      return NextResponse.json({ success: false, error: tasksErr.message }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No pending tasks found to notify.' });
    }

    // 2. Fetch profiles to resolve emails
    const { data: profiles } = await supabase.from('profiles').select('id, email, full_name');
    const profMap = new Map();
    if (profiles) {
      profiles.forEach(p => profMap.set(p.id, p));
    }

    // 3. Fetch applications to map official email -> personal Gmail address
    const { data: applications } = await supabase.from('applications').select('*');
    const emailToPersonalMap = new Map<string, string>();
    const appMap = new Map();
    if (applications) {
      for (const a of applications) {
        if (a.email) {
          const personal = a.email.toLowerCase().trim();
          emailToPersonalMap.set(personal, personal);
          if (a.user_id) appMap.set(a.user_id, a);

          if (a.full_name) {
            const clean = a.full_name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
            const parts = clean.split(/\s+/).filter(Boolean);
            const official = `${parts.join('')}@zayacodehub.com`;
            emailToPersonalMap.set(official, personal);
          }
        }
      }
    }

    let sentCount = 0;
    let lastError: string | null = null;
    for (const task of tasks) {
      let rawEmail = task.intern_email;
      let name = task.intern_name;

      if (!rawEmail && task.intern_id) {
        const p = profMap.get(task.intern_id);
        if (p) {
          rawEmail = p.email;
          name = p.full_name;
        } else {
          const a = appMap.get(task.intern_id);
          if (a) {
            rawEmail = a.email;
            name = a.full_name;
          }
        }
      }

      if (!rawEmail) continue;

      const cleanRaw = rawEmail.toLowerCase().trim();
      const destinationEmail = emailToPersonalMap.get(cleanRaw) || rawEmail;

      const emailHtml = renderTaskAssignedEmail({
        internName: name,
        taskTitle: task.title,
        description: task.description || '',
        priority: task.priority || 'HIGH',
        deadline: '17 September 2026',
        loginUrl: 'https://www.zayacodehub.in/login'
      });

      try {
        const sendRes = await sendUniversalEmail({
          to: destinationEmail,
          subject: `New Internship Task Assigned: ${task.title} (Due Sept 17)`,
          html: emailHtml
        });
        if (sendRes.success) {
          sentCount++;
        } else {
          lastError = sendRes.error || 'Failed to send';
        }
        // 300ms pause
        await new Promise(r => setTimeout(r, 300));
      } catch (e: any) {
        lastError = e?.message || 'Dispatch error';
        console.warn('Dispatch error for:', destinationEmail, e);
      }
    }

    if (sentCount === 0 && tasks.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Failed to send emails. Reason: ${lastError || 'Missing or invalid email credentials'}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: sentCount,
      message: `Successfully sent task notification emails to ${sentCount} interns!`
    });

  } catch (err: any) {
    console.error('Resend Notifications Exception:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to resend notifications.' }, { status: 500 });
  }
}
