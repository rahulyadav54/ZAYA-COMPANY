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

    // Auto-generate certificate_id if approving and none provided
    if (updateFields.review_status === 'approved' && !updateFields.certificate_id) {
      updateFields.certificate_id = `ZAYA-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }

    const { data: updatedSub, error } = await adminSupabase
      .from('submissions')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If approved, sync task status to 'completed' and send email notification
    if (updateFields.review_status === 'approved') {
      try {
        if (updatedSub.task_id) {
          await adminSupabase.from('tasks').update({ status: 'completed' }).eq('id', updatedSub.task_id);
        }

        // Fetch task and profile details to get intern's email and name
        const [taskRes, profileRes] = await Promise.all([
          updatedSub.task_id ? adminSupabase.from('tasks').select('title').eq('id', updatedSub.task_id).maybeSingle() : Promise.resolve({ data: null }),
          updatedSub.intern_id ? adminSupabase.from('profiles').select('full_name, email').eq('id', updatedSub.intern_id).maybeSingle() : Promise.resolve({ data: null })
        ]);

        const recipientEmail = (
          updatedSub.intern_email || 
          profileRes.data?.email || 
          body.email || 
          ''
        ).toLowerCase().trim();

        const internName = (
          updatedSub.cert_full_name || 
          profileRes.data?.full_name || 
          body.fullName || 
          'Intern'
        ).trim();

        const taskTitle = taskRes.data?.title || body.taskTitle || 'Internship Project';
        const certId = updatedSub.certificate_id || updateFields.certificate_id || `ZAYA-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        if (recipientEmail && recipientEmail.includes('@')) {
          const { sendUniversalEmail } = await import('@/lib/sendUniversalEmail');
          const subject = `🎉 Project Accepted & Certificate Ready: ${taskTitle} - ZAYA CODE HUB`;
          
          const htmlContent = `
            <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 28px;">
                <div style="display: inline-block; padding: 8px 16px; background-color: #2563eb; color: #ffffff; font-weight: 900; font-size: 14px; letter-spacing: 2px; border-radius: 9999px; margin-bottom: 12px;">ZAYA CODE HUB</div>
                <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; font-style: italic;">Project Approved! 🎓</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Certificate of Completion Issued</p>
              </div>
              
              <p style="font-size: 16px; color: #1e293b; font-weight: 700;">Dear ${internName},</p>
              
              <p style="font-size: 15px; color: #475569; line-height: 1.7;">
                Congratulations! We are delighted to inform you that your project submission for <strong>"${taskTitle}"</strong> has been reviewed and <span style="color: #16a34a; font-weight: 800;">ACCEPTED</span> by our technical evaluation team.
              </p>
              
              <p style="font-size: 15px; color: #475569; line-height: 1.7;">
                Thank you for your hard work, dedication, and time throughout your internship project with ZAYA CODE HUB. Your implementation demonstrated excellent engineering practice.
              </p>

              <div style="background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); padding: 24px; border-radius: 18px; margin: 24px 0; border: 1px solid #bfdbfe;">
                <div style="font-size: 12px; font-weight: 900; color: #1e40af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Official Credential Details</div>
                <div style="font-size: 14px; color: #334155; margin-bottom: 6px;"><strong>Project:</strong> ${taskTitle}</div>
                <div style="font-size: 14px; color: #334155; margin-bottom: 6px;"><strong>Certificate ID:</strong> <span style="font-family: monospace; color: #2563eb; font-weight: 700;">${certId}</span></div>
                <div style="font-size: 14px; color: #334155;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 700;">Verified & Ready for Download</span></div>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://www.zayacodehub.in/intern/certificates" style="display: inline-block; padding: 16px 36px; background-color: #2563eb; color: #ffffff; font-weight: 800; font-size: 15px; text-decoration: none; border-radius: 14px; box-shadow: 0 10px 20px rgba(37,99,235,0.3); text-transform: uppercase; letter-spacing: 1px;">
                  📥 Download Your Certificate
                </a>
              </div>

              <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 16px;">
                You can also verify your certificate anytime at: <br/>
                <a href="https://www.zayacodehub.in/verify?id=${certId}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">https://www.zayacodehub.in/verify?id=${certId}</a>
              </p>

              <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="font-size: 12px; font-weight: 800; color: #94a3b8; margin-bottom: 2px;">ZAYA CODE HUB</p>
                <p style="font-size: 11px; color: #cbd5e1;">Empowering Next-Gen Developers • Subramania Nagar, Salem, Tamil Nadu</p>
              </div>
            </div>
          `;

          await sendUniversalEmail({
            to: recipientEmail,
            subject: subject,
            html: htmlContent
          }).catch(mailErr => console.error('Approval email dispatch notice:', mailErr));
        }
      } catch (postApprovalErr) {
        console.error('Post approval notification error:', postApprovalErr);
      }
    }

    return NextResponse.json({ success: true, submission: updatedSub });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Update failed' }, { status: 500 });
  }
}

