import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { email, fullName, title } = await req.json();

    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = `Task Submission Received: ${title} - ZAYA CODE HUB`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; font-size: 24px; font-weight: 800; margin: 0;">ZAYA CODE HUB</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Task Submission Received</p>
        </div>
        
        <p style="font-size: 16px; color: #1e293b; font-weight: 600;">Dear ${fullName},</p>
        
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
          Thank you for submitting your project task <strong>"${title}"</strong>. We have received your submitted repository and project details.
        </p>

        <div style="background-color: #eff6ff; padding: 25px; border-radius: 16px; margin: 20px 0; border: 1px solid #dbeafe;">
          <h2 style="font-size: 14px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; margin-top: 0;">Next Step</h2>
          <p style="color: #1e40af; font-size: 15px; margin: 0;">Please ensure your certificate processing fee is paid to move your submission to the review stage. If you have already paid, please ignore this message.</p>
        </div>

        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-top: 30px;">
          Once the fee is confirmed, our technical team will review your implementation. Your official certificate will be generated automatically upon successful approval of your project.
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">ZAYA CODE HUB</p>
          <p style="font-size: 12px; color: #94a3b8;">Empowering Next-Gen Developers</p>
        </div>
      </div>
    `;

    // 1. Send via verified custom domain onboarding@hamrolearning.com
    let sendResult = await resend.emails.send({
      from: 'ZAYA CODE HUB <onboarding@hamrolearning.com>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    if (sendResult.error) {
      console.warn('Custom domain email notice, using resend.dev fallback:', sendResult.error.message);
      sendResult = await resend.emails.send({
        from: 'ZAYA CODE HUB <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        html: htmlContent,
      });
    }

    if (sendResult.error) {
      return NextResponse.json({ error: sendResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully', data: sendResult.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
