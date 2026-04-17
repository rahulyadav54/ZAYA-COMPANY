import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || '');
    const { email, fullName, position, status } = await request.json();

    if (!email || !fullName || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let subject = '';
    let htmlContent = '';

    if (status === 'accepted') {
      subject = `Congratulations! Your Application for ${position} at ZAYA CODE HUB`;
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #2563eb; font-size: 24px;">Congratulations, ${fullName}!</h1>
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            We are thrilled to inform you that your application for the <strong>${position}</strong> role at <strong>ZAYA CODE HUB</strong> has been accepted!
          </p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            We were very impressed with your background and your passion for technology. We believe you will be a fantastic addition to our team.
          </p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">Next Steps:</p>
            <ul style="color: #475569; margin-top: 10px;">
              <li>Wait for our admin to create your portal login credentials.</li>
              <li>You will receive another email with your username and password shortly.</li>
              <li>Get ready to dive into some exciting projects!</li>
            </ul>
          </div>
          <p style="font-size: 16px; color: #475569;">
            Welcome to the ZAYA CODE HUB family. We look forward to working with you!
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            ZAYA CODE HUB | Subramania Nagar, Salem, Tamil Nadu
          </p>
        </div>
      `;
    } else {
      subject = `Update regarding your application for ${position} at ZAYA CODE HUB`;
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #1e293b; font-size: 24px;">Hello, ${fullName}</h1>
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            Thank you for your interest in the <strong>${position}</strong> role at <strong>ZAYA CODE HUB</strong>.
          </p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            After careful review of your application, we have decided to move forward with other candidates at this time. 
          </p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            We truly appreciate the time and effort you put into your application. We will keep your profile in our records for future opportunities that may be a good fit.
          </p>
          <p style="font-size: 16px; color: #475569;">
            We wish you the very best in your job search and future professional endeavors.
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
