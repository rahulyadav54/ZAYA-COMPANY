import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { email, fullName, position, status, officialEmail, password } = await request.json();

    if (!email || !fullName || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not configured. Skipping email send.');
      return NextResponse.json({ 
        message: 'Email skipped (RESEND_API_KEY not configured)',
        credentials: { email, officialEmail, password }
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    let subject = '';
    let htmlContent = '';

    const companyLoginEmail = officialEmail || email;
    const loginPassword = password || 'ZayaIntern@2026';
    const loginUrl = 'https://www.zayacodehub.in/login';

    if (status === 'accepted') {
      subject = `🎉 Official Internship Selection Letter & Portal Access - ${fullName} (${position})`;
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
              .mobile-btn { width: 100% !important; display: block !important; box-sizing: border-box !important; padding: 14px 10px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
            <tr>
              <td align="center" style="padding: 10px 4px;">
                <!-- Container Table -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  
                  <!-- Banner Header -->
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px 16px; color: #ffffff;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center">
                            <span style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; background: rgba(255,255,255,0.2); color: #ffffff; padding: 4px 12px; border-radius: 12px; display: inline-block; margin-bottom: 10px;">
                              ZAYA CODE HUB • OFFICIAL SELECTION LETTER
                            </span>
                            <h1 class="mobile-title" style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.3;">
                              Congratulations, ${fullName}! 🎉
                            </h1>
                            <p class="mobile-text" style="margin: 6px 0 0 0; font-size: 13px; color: #e0f2fe; font-weight: 500;">
                              You have been selected for the ${position} Internship
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Body Content -->
                  <tr>
                    <td class="mobile-padding" style="padding: 24px 18px;">
                      <p class="mobile-text" style="font-size: 14px; color: #0f172a; font-weight: 700; margin-top: 0;">Dear ${fullName},</p>
                      
                      <p class="mobile-text" style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
                        On behalf of <strong>ZAYA CODE HUB</strong>, we are thrilled to inform you that your application for the <strong>${position}</strong> role has been officially <strong>ACCEPTED</strong>!
                      </p>

                      <p class="mobile-text" style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 20px;">
                        Your technical background and dedication stood out during our evaluation. We are excited to welcome you to our team.
                      </p>

                      <!-- Credentials Box -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f9ff; border: 2px solid #38bdf8; border-radius: 14px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 16px 12px;">
                            
                            <div style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; text-align: center;">
                              🔑 Your Official Intern Portal Credentials
                            </div>

                            <!-- Personal Email Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe; margin-bottom: 8px;">
                              <tr>
                                <td style="padding: 10px 12px;">
                                  <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Personal Applicant Email</div>
                                  <div style="font-size: 13px; font-weight: 600; color: #0f172a; word-break: break-all; -webkit-hyphens: auto; word-wrap: break-word;">${email}</div>
                                </td>
                              </tr>
                            </table>

                            <!-- Official Company Email Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1.5px solid #0284c7; border-left: 4px solid #0284c7; margin-bottom: 8px;">
                              <tr>
                                <td style="padding: 10px 12px;">
                                  <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin-bottom: 2px;">Official Company Email (Login ID)</div>
                                  <div style="font-family: monospace, Courier, sans-serif; font-size: 14px; font-weight: 800; color: #0284c7; word-break: break-all; -webkit-hyphens: auto; word-wrap: break-word;">${companyLoginEmail}</div>
                                </td>
                              </tr>
                            </table>

                            <!-- Password Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe; margin-bottom: 8px;">
                              <tr>
                                <td style="padding: 10px 12px;">
                                  <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Assigned Portal Password</div>
                                  <div style="font-family: monospace, Courier, sans-serif; font-size: 14px; font-weight: 800; color: #0f172a; word-break: break-all; word-wrap: break-word;">${loginPassword}</div>
                                </td>
                              </tr>
                            </table>

                            <!-- Login Link Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe;">
                              <tr>
                                <td style="padding: 10px 12px;">
                                  <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Direct Login Portal</div>
                                  <div style="font-size: 13px; font-weight: 800; word-break: break-all; word-wrap: break-word;">
                                    <a href="${loginUrl}" style="color: #2563eb; text-decoration: underline;">${loginUrl}</a>
                                  </div>
                                </td>
                              </tr>
                            </table>

                            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #bae6fd; font-size: 11px; color: #0369a1; text-align: center;">
                              💡 <em>Log in using your official email (<strong>${companyLoginEmail}</strong>) or personal email.</em>
                            </div>

                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 22px 0;">
                        <tr>
                          <td align="center">
                            <a href="${loginUrl}" class="mobile-btn" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; text-align: center; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                              🚀 Click Here to Login to Intern Portal →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Portal Benefits Box -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 14px 12px;">
                            <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                              🌟 What You Can Do in Your Intern Portal:
                            </div>
                            <div style="font-size: 12px; color: #334155; line-height: 1.7;">
                              • <strong>Download Intern ID Card:</strong> Digital ID card with QR verification.<br/>
                              • <strong>Download Offer Letter:</strong> Access your official signed acceptance letter.<br/>
                              • <strong>Download Completion Certificate:</strong> Generate verified Certificate & LOR.<br/>
                              • <strong>Submit Tasks & Projects:</strong> Access assigned tasks and submit work.<br/>
                              • <strong>Direct Messaging:</strong> Chat with mentors and track real-time evaluations.
                            </div>
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

                  <!-- Footer -->
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
      subject = `Update regarding your application for ${position} at ZAYA CODE HUB`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 10px;">
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

    // 1. Try sending from custom domain
    let sendResult = await resend.emails.send({
      from: 'ZAYA CODE HUB <onboarding@zayacodehub.in>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    // 2. Fallback to onboarding@resend.dev if custom domain is unverified
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
      console.error('Final Resend email error:', sendResult.error);
      return NextResponse.json({ error: sendResult.error.message || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully', data: sendResult.data });
  } catch (err: any) {
    console.error('Send acceptance error handler:', err);
    return NextResponse.json({ error: err?.message || 'Server error sending email' }, { status: 500 });
  }
}
