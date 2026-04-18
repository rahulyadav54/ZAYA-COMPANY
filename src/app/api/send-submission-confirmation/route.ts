import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { email, fullName, taskTitle, paymentId, amount } = await request.json();

    if (!email || !fullName || !taskTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subject = `Project Submitted Successfully: ${taskTitle}`;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #2563eb; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; font-size: 30px; margin: 0 auto; display: inline-block;">✓</div>
        </div>
        <h1 style="color: #0f172a; font-size: 26px; text-align: center; margin-bottom: 8px;">Submission Confirmed!</h1>
        <p style="color: #64748b; font-size: 16px; text-align: center; margin-bottom: 30px;">Hello ${fullName}, your project has been successfully submitted and the payment has been processed.</p>
        
        <div style="background-color: #f8fafc; padding: 25px; border-radius: 16px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; margin-top: 0;">Submission Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Project Task:</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${taskTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Transaction ID:</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right; font-family: monospace;">${paymentId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Amount Paid:</td>
              <td style="padding: 8px 0; color: #2563eb; font-size: 14px; font-weight: 700; text-align: right;">₹${amount}</td>
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

    const { data, error } = await resend.emails.send({
      from: 'ZAYA CODE HUB <onboarding@resend.dev>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Email Error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Confirmation email sent', data });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
