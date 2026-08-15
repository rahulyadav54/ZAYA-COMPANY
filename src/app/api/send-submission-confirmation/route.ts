import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { email, fullName, title, submissionId } = await req.json();

    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = `Payment Confirmed & Task Under Review: ${title} - ZAYA CODE HUB`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; font-size: 24px; font-weight: 800; margin: 0;">ZAYA CODE HUB</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Payment Confirmed & Submission Received</p>
        </div>
        
        <p style="font-size: 16px; color: #1e293b; font-weight: 600;">Dear ${fullName},</p>
        
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
          Your certificate processing fee payment for <strong>"${title}"</strong> has been successfully confirmed!
        </p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Submission ID:</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${submissionId || 'CONFIRMED'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Task Title:</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Status:</td>
              <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: 600; text-align: right;">Success</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-top: 30px;">
          Our review team will now evaluate your work. You will receive feedback and your score directly in your intern portal within 3-5 business days.
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">ZAYA CODE HUB</p>
          <p style="font-size: 12px; color: #94a3b8;">Subramania Nagar, Salem, Tamil Nadu</p>
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
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
