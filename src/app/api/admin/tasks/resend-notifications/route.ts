import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendUniversalEmail } from '@/lib/sendUniversalEmail';

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

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #111827; max-width: 600px;">
          <p>Hello ${name || 'Intern'},</p>
          
          <p>You have been assigned a new internship task at <strong>ZAYA CODE HUB</strong>:</p>
          
          <p style="background: #f3f4f6; padding: 12px 16px; border-radius: 8px;">
            <strong>Task:</strong> ${task.title}<br/>
            <strong>Priority:</strong> ${(task.priority || 'medium').toUpperCase()}<br/>
            <strong>Deadline:</strong> 17 September 2026
          </p>
          
          <p><strong>Description:</strong><br/>
          ${task.description || 'Please refer to your dashboard for full project requirements.'}</p>
          
          <p>Please log in to your intern portal to view the details and submit your project:</p>
          
          <p style="margin: 20px 0;">
            <a href="https://www.zayacodehub.in/login" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log in to Intern Portal</a>
          </p>
          
          <p style="color: #6b7280; font-size: 13px;">Or access directly at: <a href="https://www.zayacodehub.in/login" style="color: #2563eb;">https://www.zayacodehub.in/login</a></p>
          
          <br/>
          <p>Best regards,<br/>
          <strong>ZAYA CODE HUB Team</strong><br/>
          <span style="color: #6b7280; font-size: 12px;">Official Internship & Project Management</span></p>
        </div>
      `;

      try {
        await sendUniversalEmail({
          to: destinationEmail,
          subject: `New Internship Task Assigned: ${task.title} (Due Sept 17)`,
          html: emailHtml
        });
        sentCount++;
        // 300ms pause
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.warn('Dispatch error for:', destinationEmail, e);
      }
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
