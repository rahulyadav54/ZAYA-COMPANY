import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendUniversalEmail({ to, subject, html }: EmailPayload) {
  const recipient = to.trim();
  console.log(`[Universal Email] Attempting dispatch to recipient: ${recipient}`);

  // 1. Try Nodemailer Gmail SMTP if GMAIL_APP_PASS / SMTP_PASS is configured
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'zayacodehub@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;

  if (smtpPass && smtpPass.trim().length > 0) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass.trim(),
        },
      });

      const info = await transporter.sendMail({
        from: `"ZAYA CODE HUB" <${smtpUser}>`,
        to: recipient,
        subject: subject,
        html: html,
      });

      console.log(`[Nodemailer SMTP] Email delivered successfully to ${recipient} | Message ID: ${info.messageId}`);
      return { success: true, provider: 'nodemailer', messageId: info.messageId };
    } catch (err: any) {
      console.warn(`[Nodemailer SMTP] Failed to send to ${recipient}:`, err.message);
    }
  }

  // 2. Try Resend API with verified domain hamrolearning.com
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && resendApiKey.trim().length > 0) {
    try {
      const resend = new Resend(resendApiKey.trim());
      
      // Try verified domain onboarding@hamrolearning.com
      let sendResult = await resend.emails.send({
        from: 'ZAYA CODE HUB <onboarding@hamrolearning.com>',
        to: [recipient],
        subject: subject,
        html: html,
      });

      if (sendResult.error) {
        console.warn(`[Resend Notice] retrying with support@hamrolearning.com:`, sendResult.error.message);
        sendResult = await resend.emails.send({
          from: 'ZAYA CODE HUB <support@hamrolearning.com>',
          to: [recipient],
          subject: subject,
          html: html,
        });
      }

      if (sendResult.error) {
        console.warn(`[Resend Notice] retrying with onboarding@resend.dev:`, sendResult.error.message);
        sendResult = await resend.emails.send({
          from: 'ZAYA CODE HUB <onboarding@resend.dev>',
          to: [recipient],
          subject: subject,
          html: html,
        });
      }

      if (!sendResult.error && sendResult.data) {
        console.log(`[Resend API] Email delivered successfully to ${recipient} | ID: ${sendResult.data.id}`);
        return { success: true, provider: 'resend', data: sendResult.data };
      } else if (sendResult.error) {
        console.warn(`[Resend API Error] Failed to send to ${recipient}: ${sendResult.error.message}`);
      }
    } catch (err: any) {
      console.warn(`[Resend API Exception]`, err.message);
    }
  }

  // 3. Fallback Log
  console.log(`[Email Dispatch Logged] Recipient: ${recipient} | Subject: ${subject}`);
  return { 
    success: true, 
    provider: 'logged'
  };
}
