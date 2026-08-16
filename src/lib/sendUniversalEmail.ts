import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendUniversalEmail({ to, subject, html }: EmailPayload): Promise<{ success: boolean; provider?: string; error?: string; messageId?: string }> {
  const recipient = to.trim();
  console.log(`[Universal Email] Attempting dispatch to recipient: ${recipient}`);

  // 1. Try Nodemailer Gmail SMTP if GMAIL_APP_PASS / SMTP_PASS is configured
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'zayacodehub@gmail.com';
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || '').trim();

  let nodemailerError: string | null = null;

  if (smtpPass && smtpPass.length > 0) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const cleanSender = `"Zaya Code Hub" <${smtpUser}>`;
      const plainText = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

      const info = await transporter.sendMail({
        from: cleanSender,
        to: recipient,
        replyTo: smtpUser,
        subject: subject.replace(/\[|\]/g, '').trim(),
        text: plainText,
        html: html,
        headers: {
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
        }
      });

      console.log(`[Nodemailer SMTP] Email delivered successfully to ${recipient} | Message ID: ${info.messageId}`);
      return { success: true, provider: 'nodemailer', messageId: info.messageId };
    } catch (err: any) {
      console.error(`[Nodemailer SMTP Error] Failed to send to ${recipient}:`, err.message);
      nodemailerError = err.message;
    }
  }

  // 2. Try Resend API fallback
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey && resendApiKey.length > 0) {
    try {
      const resend = new Resend(resendApiKey);
      
      const sendResult = await resend.emails.send({
        from: 'ZAYA CODE HUB <onboarding@resend.dev>',
        to: [recipient],
        subject: subject,
        html: html,
      });

      if (!sendResult.error && sendResult.data) {
        console.log(`[Resend API] Email delivered successfully to ${recipient} | ID: ${sendResult.data.id}`);
        return { success: true, provider: 'resend', messageId: sendResult.data.id };
      } else if (sendResult.error) {
        console.error(`[Resend API Error] Failed to send to ${recipient}: ${sendResult.error.message}`);
        return { success: false, error: sendResult.error.message };
      }
    } catch (err: any) {
      console.error(`[Resend API Exception]`, err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. If credentials missing or sending failed
  if (nodemailerError) {
    return { success: false, error: `Gmail SMTP Error: ${nodemailerError}` };
  }

  return { 
    success: false, 
    error: 'Missing GMAIL_APP_PASS or SMTP_PASS environment variable in server deployment.' 
  };
}
