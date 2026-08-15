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
        secure: true, // use TLS
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

  // 2. Try Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && resendApiKey.trim().length > 0) {
    try {
      const resend = new Resend(resendApiKey.trim());
      
      // Try official domain sender first
      let sendResult = await resend.emails.send({
        from: 'ZAYA CODE HUB <onboarding@zayacodehub.in>',
        to: [recipient],
        subject: subject,
        html: html,
      });

      if (sendResult.error) {
        console.warn(`[Resend Domain Notice] Custom domain error, retrying with onboarding@resend.dev:`, sendResult.error.message);
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
        if (sendResult.error.message?.includes('testing mode') || sendResult.error.message?.includes('own email address')) {
          console.warn(`💡 RESEND RESTRICTION NOTICE: Resend in testing mode only allows sending to account owner (${smtpUser}). To send emails to all candidates (e.g. ${recipient}), add a Gmail App Password (GMAIL_APP_PASS) in .env.local or add your domain to Resend.`);
        }
      }
    } catch (err: any) {
      console.warn(`[Resend API Exception]`, err.message);
    }
  }

  // 3. Fallback Log
  console.log(`[Email Dispatch Logged] Recipient: ${recipient} | Subject: ${subject}`);
  return { 
    success: true, 
    provider: 'logged',
    warning: `Resend free testing mode restricts external emails to ${recipient}. Please configure GMAIL_APP_PASS in .env.local or add domain to Resend for direct delivery.`
  };
}
