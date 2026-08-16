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

    // Dispatch in background with safe 1.2s pause between each email to prevent Google spam filters & rate-limiting
    (async () => {
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0;">ZAYA CODE HUB</h2>
              <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">New Task Assigned</p>
            </div>
            <div style="margin-bottom: 20px;">
              <p>Hello <strong>${name || 'Intern'}</strong>,</p>
              <p>A new task/project has been assigned to you. Please complete it before the deadline:</p>
            </div>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e293b;">${task.title}</h3>
              <p style="white-space: pre-wrap; color: #334155;">${task.description || ''}</p>
              <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-weight: bold; width: 100px;">Priority:</td>
                  <td style="padding: 4px 0; color: #1e293b;">${(task.priority || 'medium').toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-weight: bold;">Deadline:</td>
                  <td style="padding: 4px 0; color: #ef4444; font-weight: bold;">17 September 2026</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="https://www.zayacodehub.in/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View & Submit Task on Dashboard</a>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">
              <p>This is an automated message from ZAYA CODE HUB. Please submit your project work before 17 Sept 2026.</p>
            </div>
          </div>
        `;

        try {
          await sendUniversalEmail({
            to: destinationEmail,
            subject: `[ZAYA CODE HUB] Task Assigned (Due 17 Sept): ${task.title}`,
            html: emailHtml
          });
          // Wait 1.2s between each email to maintain high deliverability
          await new Promise(r => setTimeout(r, 1200));
        } catch (e) {
          console.warn('Dispatch error for:', destinationEmail, e);
        }
      }
    })();

    return NextResponse.json({
      success: true,
      count: tasks.length,
      message: `Started dispatching task notifications to ${tasks.length} interns!`
    });

  } catch (err: any) {
    console.error('Resend Notifications Exception:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to resend notifications.' }, { status: 500 });
  }
}
