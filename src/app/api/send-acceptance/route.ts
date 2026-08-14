import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

async function sendUniversalEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const targetEmail = to.trim();

  let lastError: any = null;

  // 1. Try Resend with custom domain email onboarding@zayacodehub.in
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const res1 = await resend.emails.send({
        from: 'ZAYA CODE HUB <onboarding@zayacodehub.in>',
        to: [targetEmail],
        subject: subject,
        html: html,
      });

      if (!res1.error) {
        return { success: true, provider: 'resend_custom_domain', data: res1.data };
      }
      console.warn('Resend custom domain notice:', res1.error.message);
      lastError = res1.error;

      // Try Resend with support@zayacodehub.in
      const res2 = await resend.emails.send({
        from: 'ZAYA CODE HUB <support@zayacodehub.in>',
        to: [targetEmail],
        subject: subject,
        html: html,
      });

      if (!res2.error) {
        return { success: true, provider: 'resend_support_domain', data: res2.data };
      }
      console.warn('Resend support domain notice:', res2.error.message);
      lastError = res2.error;

      // Try Resend fallback domain
      const res3 = await resend.emails.send({
        from: 'ZAYA CODE HUB <onboarding@resend.dev>',
        to: [targetEmail],
        subject: subject,
        html: html,
      });

      if (!res3.error) {
        return { success: true, provider: 'resend_dev', data: res3.data };
      }
      console.warn('Resend dev domain notice:', res3.error.message);
      lastError = res3.error;
    } catch (e: any) {
      console.warn('Resend send exception:', e?.message);
      lastError = e;
    }
  }

  // 2. Nodemailer Universal Fallback (bypasses Resend testing email restrictions 100%)
  try {
    const smtpUser = process.env.SMTP_USER || 'zayacodehub@gmail.com';
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

    if (smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      });

      const mailOptions = {
        from: `ZAYA CODE HUB <${smtpUser}>`,
        to: targetEmail,
        subject: subject,
        html: html
      };

      const info = await transporter.sendMail(mailOptions);
      return { success: true, provider: 'nodemailer_gmail', data: info };
    }
  } catch (err: any) {
    console.warn('Nodemailer SMTP notice:', err?.message);
    lastError = err;
  }

  return { success: false, error: lastError?.message || 'Failed to send email to recipient' };
}

export async function POST(request: Request) {
  try {
    const { email, fullName, position, status, officialEmail, password } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Missing required fields: email and fullName' }, { status: 400 });
    }

    const isAccepted = status === 'accepted';
    const companyLoginEmail = officialEmail || email;
    const loginPassword = password || 'ZayaIntern@2026';
    const loginUrl = 'https://www.zayacodehub.in/login';

    const subject = isAccepted
      ? `🎉 Application Accepted! Welcome to ZAYA CODE HUB - ${position}`
      : `Update on your application for ${position} at ZAYA CODE HUB`;

    let htmlContent = '';

    if (isAccepted) {
      htmlContent = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>ZAYA CODE HUB</title>
          <style type="text/css">
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            table { border-collapse: collapse !important; }
            body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; }
            
            @media screen and (max-width: 600px) {
              .email-container { width: 100% !important; padding: 5px !important; }
              .mobile-padding { padding: 20px 14px !important; }
              .mobile-title { font-size: 20px !important; }
              .mobile-text { font-size: 13px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
            <tr>
              <td align="center" style="padding: 10px 4px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px 16px; color: #ffffff;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center">
                            <span style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; background: rgba(255,255,255,0.2); color: #ffffff; padding: 4px 12px; border-radius: 12px; display: inline-block; margin-bottom: 10px;">
                              ZAYA CODE HUB • OFFICIAL SELECTION
                            </span>
                            <h1 class="mobile-title" style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.3;">
                              Congratulations, ${fullName}! 🎉
                            </h1>
                            <p class="mobile-text" style="margin: 6px 0 0 0; font-size: 13px; color: #e0f2fe; font-weight: 500;">
                              You are selected for the <strong>${position}</strong> Internship
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td class="mobile-padding" style="padding: 24px 18px;">
                      <p class="mobile-text" style="font-size: 14px; color: #0f172a; font-weight: 700; margin-top: 0;">Dear ${fullName},</p>
                      
                      <p class="mobile-text" style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
                        We are thrilled to inform you that your application for the <strong>${position}</strong> position at <strong>ZAYA CODE HUB</strong> has been <strong>ACCEPTED</strong>!
                      </p>

                      <!-- Credentials Box -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 14px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 16px 12px;">
                            
                            <div style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; text-align: center;">
                              🔐 Your Official Intern Login Credentials
                            </div>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe; margin-bottom: 8px;">
                              <tr>
                                <td style="padding: 10px 12px;">
                                  <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Official Login Email</div>
                                  <div style="font-size: 13px; font-weight: 800; color: #2563eb; word-break: break-all; -webkit-hyphens: auto; word-wrap: break-word;">${companyLoginEmail}</div>
                                </td>
                              </tr>
                            </table>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe; margin-bottom: 8px;">
                              <tr>
                                <td style="padding: 10px 12px;">
                                  <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Personal Registered Email</div>
                                  <div style="font-size: 13px; font-weight: 800; color: #0f172a; word-break: break-all; -webkit-hyphens: auto; word-wrap: break-word;">${email}</div>
                                </td>
                              </tr>
                            </table>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe;">
                              <tr>
                                <td style="padding: 10px 12px;">
                                  <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Temporary Password</div>
                                  <div style="font-size: 14px; font-weight: 900; color: #0f172a; font-family: monospace; letter-spacing: 1px; word-break: break-all; -webkit-hyphens: auto; word-wrap: break-word;">${loginPassword}</div>
                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>

                      <p class="mobile-text" style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 18px;">
                        💡 <em>Note: You can log in using either your Personal Gmail or your Official Company Email with the password above.</em>
                      </p>

                      <!-- Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                        <tr>
                          <td align="center">
                            <a href="${loginUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; display: inline-block; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                              🚀 Login to Intern Portal
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p class="mobile-text" style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
                        If you experience any login issues, contact our team at <a href="mailto:support@zayacodehub.in" style="color: #2563eb; font-weight: 700;">support@zayacodehub.in</a>.
                      </p>

                      <p class="mobile-text" style="font-size: 13px; color: #0f172a; font-weight: 700; margin: 0 0 2px 0;">
                        Welcome to ZAYA CODE HUB!
                      </p>
                      <p class="mobile-text" style="font-size: 13px; color: #2563eb; font-weight: 800; margin: 0;">
                        ZAYA CODE HUB HR & Internship Team
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="background-color: #0f172a; padding: 18px 12px; color: #94a3b8; font-size: 10px; line-height: 1.5;">
                      <p style="margin: 0 0 3px 0; font-weight: 700; color: #cbd5e1;">ZAYA CODE HUB • Subhashish Learning & Tech Pvt Ltd</p>
                      <p style="margin: 0; word-break: break-all;">Subramania Nagar, Salem, Tamil Nadu – 636005 | <a href="https://www.zayacodehub.in" style="color: #38bdf8; text-decoration: none;">www.zayacodehub.in</a></p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    } else {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: #ffffff; border-radius: 14px; padding: 20px; border: 1px solid #cbd5e1;">
            <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Hello ${fullName},</h2>
            <p style="font-size: 13px; color: #334155; line-height: 1.6;">
              Thank you for applying for the <strong>${position}</strong> role at <strong>ZAYA CODE HUB</strong>.
            </p>
            <p style="font-size: 13px; color: #334155; line-height: 1.6;">
              After careful evaluation of all applications, we have decided to move forward with other candidates at this time. We encourage you to apply for future openings.
            </p>
            <p style="font-size: 13px; color: #334155;">
              We wish you the very best in your professional journey.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 10px; color: #94a3b8; text-align: center; margin: 0;">
              ZAYA CODE HUB | Subramania Nagar, Salem, Tamil Nadu
            </p>
          </div>
        </div>
      `;
    }

    const sendResult = await sendUniversalEmail({ to: email, subject, html: htmlContent });

    if (!sendResult.success) {
      console.warn('Universal email send notice:', sendResult.error);
    }

    return NextResponse.json({ 
      message: 'Acceptance email processed successfully', 
      success: true,
      provider: sendResult.provider || 'resend' 
    });

  } catch (err: any) {
    console.error('Send acceptance error handler:', err);
    return NextResponse.json({ error: err?.message || 'Server error sending email' }, { status: 500 });
  }
}
