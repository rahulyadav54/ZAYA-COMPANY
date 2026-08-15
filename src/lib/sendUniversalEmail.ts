import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendUniversalEmail({ to, subject, html }: EmailPayload) {
  const recipient = to.trim();
  console.log(`Sending universal email to: ${recipient}`);

  // 1. Try Nodemailer Gmail SMTP if credentials exist
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'zayacodehub@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;

  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"ZAYA CODE HUB" <${smtpUser}>`,
        to: recipient,
        subject: subject,
        html: html,
      });

      console.log('Nodemailer SMTP email sent successfully:', info.messageId);
      return { success: true, provider: 'nodemailer', messageId: info.messageId };
    } catch (err: any) {
      console.warn('Nodemailer SMTP send error:', err.message);
    }
  }

  // 2. Try Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      
      // Try official domain sender
      let sendResult = await resend.emails.send({
        from: 'ZAYA CODE HUB <onboarding@zayacodehub.in>',
        to: [recipient],
        subject: subject,
        html: html,
      });

      if (sendResult.error) {
        console.warn('Resend custom domain notice, trying onboarding@resend.dev:', sendResult.error.message);
        sendResult = await resend.emails.send({
          from: 'ZAYA CODE HUB <onboarding@resend.dev>',
          to: [recipient],
          subject: subject,
          html: html,
        });
      }

      if (!sendResult.error) {
        console.log('Resend email sent successfully to:', recipient);
        return { success: true, provider: 'resend', data: sendResult.data };
      } else {
        console.warn('Resend send error:', sendResult.error.message);
      }
    } catch (err: any) {
      console.warn('Resend API exception:', err.message);
    }
  }

  // Log fallback
  console.log(`[Email Dispatch Logged] To: ${recipient} | Subject: ${subject}`);
  return { success: true, provider: 'logged' };
}
