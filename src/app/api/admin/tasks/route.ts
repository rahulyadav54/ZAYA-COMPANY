import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendUniversalEmail } from '@/lib/sendUniversalEmail';

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

    // Trigger Bulk Email dispatch in background
    if (insertedData && insertedData.length > 0) {
      const emailPromises = targetInterns.map((intern: any) => {
        const emailAddress = intern.email || intern.personal_email;
        if (!emailAddress) return Promise.resolve();

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0;">ZAYA CODE HUB</h2>
              <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">New Task Assigned</p>
            </div>
            <div style="margin-bottom: 20px;">
              <p>Hello <strong>${intern.full_name || 'Intern'}</strong>,</p>
              <p>A new task/project has been assigned to you. Here are the details:</p>
            </div>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e293b;">${title.trim()}</h3>
              <p style="white-space: pre-wrap; color: #334155;">${description.trim()}</p>
              <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-weight: bold; width: 100px;">Priority:</td>
                  <td style="padding: 4px 0; color: #1e293b;">${(priority || 'medium').toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-weight: bold;">Deadline:</td>
                  <td style="padding: 4px 0; color: #ef4444;">${deadline || 'N/A'}</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="https://www.zayacodehub.in/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Task on Dashboard</a>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">
              <p>This is an automated message from ZAYA CODE HUB. Please do not reply directly to this email.</p>
            </div>
          </div>
        `;

        return sendUniversalEmail({
          to: emailAddress,
          subject: `[ZAYA CODE HUB] New Assignment: ${title.trim()}`,
          html: emailHtml
        });
      });

      // Fire and forget in the background (won't block Next.js response)
      Promise.allSettled(emailPromises).then((results) => {
        console.log(`[Bulk Task Email Notification] Finished dispatch. Result count: ${results.length}`);
      });
    }

    const assignedCount = insertedData?.length || taskRows.length;

    return NextResponse.json({
      success: true,
      count: assignedCount,
      message: `Task successfully assigned to ${assignedCount} intern(s)! Notification emails dispatched.`
    });

  } catch (err: any) {
    console.error('Assign Task Route Exception:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to assign tasks.' }, { status: 500 });
  }
}
