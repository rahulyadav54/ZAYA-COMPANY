import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendUniversalEmail } from '@/lib/sendUniversalEmail';

const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetMode, targetDomain, targetIntern, subject, message, ctaText, ctaUrl } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json({ success: false, error: 'Subject is required.' }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message body is required.' }, { status: 400 });
    }

    // 1. Fetch registered profiles and candidate applications
    const [{ data: profiles }, { data: applications }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('applications').select('*')
    ]);

    // Build mapping for personal emails
    const emailToPersonalMap = new Map<string, string>();
    const allInternsMap = new Map<string, { id: string; name: string; email: string; domain: string }>();

    if (applications) {
      for (const a of applications) {
        if (a.email) {
          const personal = a.email.toLowerCase().trim();
          emailToPersonalMap.set(personal, personal);

          if (a.full_name) {
            const clean = a.full_name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
            const parts = clean.split(/\s+/).filter(Boolean);
            const official = `${parts.join('')}@zayacodehub.com`;
            emailToPersonalMap.set(official, personal);
          }

          allInternsMap.set(a.id, {
            id: a.id,
            name: a.full_name || 'Intern',
            email: personal,
            domain: a.position || a.domain || 'Engineering'
          });
        }
      }
    }

    if (profiles) {
      for (const p of profiles) {
        if (p.role === 'intern' && p.email) {
          const raw = p.email.toLowerCase().trim();
          const personal = emailToPersonalMap.get(raw) || raw;
          allInternsMap.set(p.id, {
            id: p.id,
            name: p.full_name || 'Intern',
            email: personal,
            domain: p.position || 'Engineering'
          });
        }
      }
    }

    const allInternList = Array.from(allInternsMap.values());

    // Filter target recipients based on targetMode
    let recipients: { id: string; name: string; email: string }[] = [];

    if (targetMode === 'single' && targetIntern) {
      const found = allInternList.find(i => i.id === targetIntern.id || i.email === targetIntern.email);
      if (found) {
        recipients = [found];
      } else if (targetIntern.email) {
        recipients = [{ id: 'custom', name: targetIntern.name || 'Intern', email: targetIntern.email }];
      }
    } else if (targetMode === 'domain' && targetDomain) {
      recipients = allInternList.filter(i => 
        i.domain.toLowerCase().trim() === targetDomain.toLowerCase().trim()
      );
    } else {
      // Default: All interns
      recipients = allInternList;
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'No matching recipients found.' }, { status: 400 });
    }

    let sentCount = 0;
    let lastError: string | null = null;

    for (const recipient of recipients) {
      const destinationEmail = emailToPersonalMap.get(recipient.email.toLowerCase().trim()) || recipient.email;

      const formattedMessage = message
        .split('\n')
        .map((p: string) => p.trim())
        .filter(Boolean)
        .map((p: string) => `<p style="margin: 0 0 12px 0;">${p}</p>`)
        .join('');

      const ctaButtonHtml = ctaUrl && ctaUrl.trim() ? `
        <div style="margin: 24px 0;">
          <a href="${ctaUrl.trim()}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            ${ctaText && ctaText.trim() ? ctaText.trim() : 'View Details'}
          </a>
        </div>
      ` : '';

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #111827; max-width: 600px;">
          <p>Hello <strong>${recipient.name || 'Intern'}</strong>,</p>
          
          <div style="margin: 16px 0;">
            ${formattedMessage}
          </div>

          ${ctaButtonHtml}

          <br/>
          <p style="margin: 0;">Best regards,<br/>
          <strong>ZAYA CODE HUB Team</strong><br/>
          <span style="color: #6b7280; font-size: 12px;">Official Internship & Project Management</span></p>
        </div>
      `;

      try {
        const sendRes = await sendUniversalEmail({
          to: destinationEmail,
          subject: subject.trim(),
          html: emailHtml
        });

        if (sendRes.success) {
          sentCount++;
        } else {
          lastError = sendRes.error || 'Failed to send';
        }

        // Small 300ms throttle between emails
        await new Promise(r => setTimeout(r, 300));
      } catch (e: any) {
        lastError = e?.message || 'Dispatch error';
        console.warn('Custom email dispatch error for:', destinationEmail, e);
      }
    }

    if (sentCount === 0) {
      return NextResponse.json({
        success: false,
        error: `Failed to deliver custom emails. Reason: ${lastError || 'Unknown error'}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: sentCount,
      message: `Successfully sent custom email to ${sentCount} recipient(s)!`
    });

  } catch (err: any) {
    console.error('Send Custom Email Exception:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to dispatch custom emails.' }, { status: 500 });
  }
}
