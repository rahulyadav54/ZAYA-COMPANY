import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { email, fullName, position, status, officialEmail, password } = await request.json();

    if (!email || !fullName || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not configured. Skipping email send.');
      return NextResponse.json({ 
        message: 'Email skipped (RESEND_API_KEY not configured)',
        credentials: { officialEmail, password }
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    let subject = '';
    let htmlContent = '';

    if (status === 'accepted') {
      subject = `🎉 Congratulations! Application Accepted for ${position} at ZAYA CODE HUB`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2563eb; font-size: 26px; margin: 0; font-weight: 800;">ZAYA CODE HUB</h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px; uppercase; font-weight: 700;">Official Internship Acceptance</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px;">Congratulations, ${fullName}! 🎉</h2>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">
            We are thrilled to inform you that your application for the <strong>${position}</strong> role at <strong>ZAYA CODE HUB</strong> has been <strong>ACCEPTED</strong>!
          </p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #bae6fd;">
            <p style="margin: 0 0 12px 0; font-weight: 800; color: #0369a1; font-size: 14px; uppercase; tracking-wider;">Your Official Intern Account Credentials</p>
            <table style="width: 100%; font-size: 14px; color: #0f172a;">
              <tr>
                <td style="padding: 6px 0; font-weight: 700; width: 140px;">Official Email:</td>
                <td style="padding: 6px 0; font-family: monospace; font-size: 15px; color: #0284c7; font-weight: 700;">${officialEmail || 'Your official email'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 700;">Initial Password:</td>
                <td style="padding: 6px 0; font-family: monospace; font-size: 15px; color: #0f172a; font-weight: 700;">${password || 'ZayaIntern@2026'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 700;">Login Portal:</td>
                <td style="padding: 6px 0;"><a href="https://zayacodehub.in/login" style="color: #2563eb; font-weight: 700; text-decoration: underline;">zayacodehub.in/login</a></td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-weight: 700; color: #334155; font-size: 13px;">Next Steps:</p>
            <ol style="color: #475569; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
              <li>Log into the <a href="https://zayacodehub.in/login" style="color: #2563eb;">ZAYA CODE HUB Intern Portal</a> using your official email above.</li>
              <li>View your assigned tasks, project deadlines, and training resources.</li>
              <li>Complete your profile details.</li>
            </ol>
          </div>

          <p style="font-size: 15px; color: #334155;">
            Welcome aboard! We look forward to seeing your outstanding work.
          </p>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            ZAYA CODE HUB • Subramania Nagar, Salem, Tamil Nadu – 636005
          </p>
        </div>
      `;
    } else {
      subject = `Update regarding your application for ${position} at ZAYA CODE HUB`;
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e293b; font-size: 20px;">Hello, ${fullName}</h2>
          <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            Thank you for applying for the <strong>${position}</strong> role at <strong>ZAYA CODE HUB</strong>.
          </p>
          <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            After reviewing your application, we have decided to move forward with other candidates at this time. We will keep your profile in our records for future opportunities.
          </p>
          <p style="font-size: 15px; color: #475569;">
            We wish you the best in your professional journey.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            ZAYA CODE HUB | Subramania Nagar, Salem, Tamil Nadu
          </p>
        </div>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: 'ZAYA CODE HUB <onboarding@resend.dev>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully', data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
