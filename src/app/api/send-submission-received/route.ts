import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not configured. Skipping email send.');
      return NextResponse.json({ message: 'Email skipped (RESEND_API_KEY not configured)' });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email, fullName, taskTitle } = await request.json();

    if (!email || !fullName || !taskTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subject = `Documents Received: ${taskTitle} - ZAYA CODE HUB`;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #0f172a; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; font-size: 30px; font-weight: bold; margin: 0 auto; display: inline-block;">Z</div>
        </div>
        <h1 style="color: #0f172a; font-size: 26px; text-align: center; margin-bottom: 8px;">Documents Received!</h1>
        <p style="color: #64748b; font-size: 16px; text-align: center; margin-bottom: 30px;">Hello ${fullName}, we have successfully received your project documents for <strong>${taskTitle}</strong>.</p>
        
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

    // 1. Try sending from custom domain
    let sendResult = await resend.emails.send({
      from: 'ZAYA CODE HUB <onboarding@zayacodehub.in>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    // 2. Fallback to onboarding@resend.dev if custom domain is not yet verified
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
