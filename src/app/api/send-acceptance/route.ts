import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// IMPORTANT: Add RESEND_API_KEY to your .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, fullName, position } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'ZAYA CODE HUB <onboarding@resend.dev>', // You can use your own domain here later
      to: [email],
      subject: `Congratulations! Your Application for ${position} at ZAYA HUB`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
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
            Welcome to the ZAYA HUB family. We look forward to working with you!
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            ZAYA CODE HUB | Subramania Nagar, Salem, Tamil Nadu
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully', data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
