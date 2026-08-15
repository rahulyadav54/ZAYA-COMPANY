import { NextResponse } from 'next/server';
import { sendUniversalEmail } from '@/lib/sendUniversalEmail';

export async function POST(request: Request) {
  try {
    const { email, fullName, position, status, officialEmail, password } = await request.json();

    if (!email || !fullName || !position) {
      return NextResponse.json({ error: 'Missing required parameters (email, fullName, position)' }, { status: 400 });
    }

    const isAccepted = status?.toLowerCase() === 'accepted';
    const recipientEmail = email.trim();
    
    // Format unique official company login email if not provided
    const nameSlug = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const companyLoginEmail = officialEmail || `${nameSlug}@zayacodehub.com`;
    const loginPassword = password || 'ZayaIntern@2026';
    const loginUrl = 'https://www.zayacodehub.in/login';

    const subject = isAccepted
      ? `🎉 Congratulations ${fullName}! You are Selected for ${position} Internship at ZAYA CODE HUB`
      : `Update regarding your ${position} application at ZAYA CODE HUB`;

    let htmlContent = '';

    if (isAccepted) {
      htmlContent = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>ZAYA CODE HUB - Internship Selection</title>
          <style type="text/css">
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            table { border-collapse: collapse !important; }
            body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; }
            
            @media screen and (max-width: 600px) {
              .email-container { width: 100% !important; padding: 4px !important; }
              .mobile-padding { padding: 22px 14px !important; }
              .mobile-title { font-size: 20px !important; }
              .mobile-text { font-size: 13px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
            <tr>
              <td align="center" style="padding: 12px 4px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
                  
                  <!-- Banner Header -->
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #002855 0%, #004080 50%, #2563eb 100%); padding: 36px 20px; color: #ffffff;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center">
                            <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.18); color: #ffffff; padding: 6px 16px; border-radius: 20px; display: inline-block; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.25);">
                              ✨ OFFICIAL SELECTION ANNOUNCEMENT
                            </span>
                            <h1 class="mobile-title" style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1.3;">
                              Congratulations, ${fullName}! 🎉
                            </h1>
                            <p class="mobile-text" style="margin: 8px 0 0 0; font-size: 14px; color: #e0f2fe; font-weight: 600;">
                              You are officially selected for the <strong>${position}</strong> Internship Program at <strong>ZAYA CODE HUB</strong>!
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content Body -->
                  <tr>
                    <td class="mobile-padding" style="padding: 28px 24px;">
                      
                      <!-- Appreciation Section -->
                      <p class="mobile-text" style="font-size: 15px; color: #0f172a; font-weight: 800; margin-top: 0;">Dear ${fullName},</p>
                      
                      <p class="mobile-text" style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
                        On behalf of <strong>ZAYA CODE HUB</strong>, we are thrilled to extend our warmest congratulations! Out of a highly competitive pool of applicants, your technical background, skills, and enthusiasm truly impressed our evaluation committee.
                      </p>

                      <p class="mobile-text" style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 20px;">
                        We are excited to have you join our technology team as a <strong>${position} Intern</strong>. This program is designed to give you real-world development experience, mentorship, and industry-level project exposure.
                      </p>

                      <!-- Credentials Card -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f9ff; border: 2px solid #38bdf8; border-radius: 16px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 20px 16px;">
                            
                            <div style="font-size: 13px; font-weight: 900; color: #0369a1; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; text-align: center;">
                              🔐 YOUR ASSIGNED OFFICIAL INTERN CREDENTIALS
                            </div>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #bae6fd; margin-bottom: 10px;">
                              <tr>
                                <td style="padding: 12px 14px;">
                                  <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 3px;">Official Company Login Email</div>
                                  <div style="font-size: 14px; font-weight: 900; color: #2563eb; word-break: break-all;">${companyLoginEmail}</div>
                                </td>
                              </tr>
                            </table>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #bae6fd; margin-bottom: 12px;">
                              <tr>
                                <td style="padding: 12px 14px;">
                                  <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 3px;">Temporary Password</div>
                                  <div style="font-size: 15px; font-weight: 900; color: #0f172a; font-family: monospace; letter-spacing: 1px;">${loginPassword}</div>
                                </td>
                              </tr>
                            </table>

                            <div style="background-color: #e0f2fe; border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #0369a1; text-align: center; font-weight: 700;">
                              🔒 NOTE: For portal access and synchronization, you MUST log in using your Official Company Email (<strong>${companyLoginEmail}</strong>). Personal Gmail login is disabled for interns.
                            </div>

                          </td>
                        </tr>
                      </table>

                      <!-- Next Steps Section -->
                      <div style="margin: 28px 0 20px 0;">
                        <h2 style="font-size: 16px; font-weight: 900; color: #0f172a; margin: 0 0 14px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                          🚀 What to Do After Logging In (Step-by-Step Guide):
                        </h2>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                          <tr>
                            <td width="36" valign="top" style="padding-right: 12px;">
                              <div style="width: 28px; height: 28px; line-height: 28px; background-color: #2563eb; color: #ffffff; font-weight: 900; border-radius: 50%; text-align: center; font-size: 13px;">1</div>
                            </td>
                            <td valign="top">
                              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Log in to your Intern Dashboard</div>
                              <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 2px;">Visit <a href="${loginUrl}" style="color: #2563eb; font-weight: 700;">${loginUrl}</a> and enter your assigned official company email and password.</div>
                            </td>
                          </tr>
                        </table>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                          <tr>
                            <td width="36" valign="top" style="padding-right: 12px;">
                              <div style="width: 28px; height: 28px; line-height: 28px; background-color: #2563eb; color: #ffffff; font-weight: 900; border-radius: 50%; text-align: center; font-size: 13px;">2</div>
                            </td>
                            <td valign="top">
                              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Review & Download Your Offer Letter</div>
                              <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 2px;">Navigate to the <strong>Offer Letter</strong> tab in your portal to view your official selection details, duration, and download your document.</div>
                            </td>
                          </tr>
                        </table>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                          <tr>
                            <td width="36" valign="top" style="padding-right: 12px;">
                              <div style="width: 28px; height: 28px; line-height: 28px; background-color: #2563eb; color: #ffffff; font-weight: 900; border-radius: 50%; text-align: center; font-size: 13px;">3</div>
                            </td>
                            <td valign="top">
                              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Access Your Digital Intern ID Card</div>
                              <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 2px;">Open the <strong>ID Card</strong> tab to generate and download your personalized Zaya Code Hub Intern ID Card.</div>
                            </td>
                          </tr>
                        </table>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                          <tr>
                            <td width="36" valign="top" style="padding-right: 12px;">
                              <div style="width: 28px; height: 28px; line-height: 28px; background-color: #2563eb; color: #ffffff; font-weight: 900; border-radius: 50%; text-align: center; font-size: 13px;">4</div>
                            </td>
                            <td valign="top">
                              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Complete & Submit Assigned Tasks</div>
                              <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 2px;">Go to the <strong>Submit Project</strong> section to view project tasks, upload your code repositories, and submit live project links.</div>
                            </td>
                          </tr>
                        </table>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                          <tr>
                            <td width="36" valign="top" style="padding-right: 12px;">
                              <div style="width: 28px; height: 28px; line-height: 28px; background-color: #2563eb; color: #ffffff; font-weight: 900; border-radius: 50%; text-align: center; font-size: 13px;">5</div>
                            </td>
                            <td valign="top">
                              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">Earn Certificate & Recommendation Letter</div>
                              <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 2px;">Upon task evaluation, your official verified <strong>Certificate of Completion</strong> and <strong>Letter of Recommendation</strong> will be unlocked in your portal.</div>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Direct Login Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                        <tr>
                          <td align="center">
                            <a href="${loginUrl}" target="_blank" style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: #ffffff; display: inline-block; font-size: 15px; font-weight: 900; padding: 16px 36px; border-radius: 14px; text-decoration: none; box-shadow: 0 6px 18px rgba(37,99,235,0.35); border: 1px solid rgba(255,255,255,0.2);">
                              🚀 LOG IN TO INTERN PORTAL NOW
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Support Note -->
                      <div style="background-color: #f8fafc; border-radius: 12px; padding: 14px 16px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">💬 Need Assistance?</div>
                        <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
                          If you have any questions about your internship or face any difficulty logging in, please contact our support team at <a href="mailto:support@zayacodehub.in" style="color: #2563eb; font-weight: 700; text-decoration: none;">support@zayacodehub.in</a>.
                        </div>
                      </div>

                      <!-- Signoff -->
                      <p class="mobile-text" style="font-size: 14px; color: #0f172a; font-weight: 800; margin: 0 0 4px 0;">
                        Welcome aboard! We are thrilled to have you with us.
                      </p>
                      <p class="mobile-text" style="font-size: 13px; color: #2563eb; font-weight: 900; margin: 0;">
                        ZAYA CODE HUB HR & Selection Board
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="background-color: #002855; padding: 22px 16px; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                      <p style="margin: 0 0 4px 0; font-weight: 800; color: #f8fafc; font-size: 12px;">ZAYA CODE HUB • Subhashish Learning & Tech Pvt Ltd</p>
                      <p style="margin: 0; color: #94a3b8;">Subramania Nagar, Salem, Tamil Nadu – 636005 | <a href="https://www.zayacodehub.in" style="color: #38bdf8; text-decoration: none; font-weight: 700;">www.zayacodehub.in</a></p>
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
      // Rejection email template
      htmlContent = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>ZAYA CODE HUB - Application Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
            <tr>
              <td align="center" style="padding: 20px 8px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  
                  <tr>
                    <td align="center" style="background-color: #0f172a; padding: 24px 20px; color: #ffffff;">
                      <span style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; background: rgba(255,255,255,0.15); color: #cbd5e1; padding: 4px 12px; border-radius: 12px; display: inline-block; margin-bottom: 8px;">
                        ZAYA CODE HUB • APPLICATION UPDATE
                      </span>
                      <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                        Application Status Update
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 28px 24px;">
                      <p style="font-size: 14px; color: #0f172a; font-weight: 800; margin-top: 0;">Dear ${fullName},</p>
                      
                      <p style="font-size: 13px; color: #334155; line-height: 1.6;">
                        Thank you for taking the time to apply for the <strong>${position}</strong> Internship position at <strong>ZAYA CODE HUB</strong>.
                      </p>

                      <p style="font-size: 13px; color: #334155; line-height: 1.6;">
                        After a thorough review of all submitted profiles, we regret to inform you that we are unable to offer you an internship position at this time. Due to a high volume of strong applications, our selection process was extremely competitive.
                      </p>

                      <p style="font-size: 13px; color: #334155; line-height: 1.6;">
                        We sincerely appreciate your interest in ZAYA CODE HUB and encourage you to apply again for future internship programs and career opportunities on our platform.
                      </p>

                      <div style="background-color: #f1f5f9; border-radius: 10px; padding: 12px 14px; margin: 20px 0; border: 1px solid #e2e8f0;">
                        <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
                          💡 <em>Tip: You can explore open developer resources, technical tutorials, and future openings at <a href="https://www.zayacodehub.in/careers" style="color: #2563eb; font-weight: 700; text-decoration: none;">zayacodehub.in/careers</a>.</em>
                        </p>
                      </div>

                      <p style="font-size: 13px; color: #0f172a; font-weight: 800; margin: 24px 0 2px 0;">
                        We wish you all the very best in your academic and professional career!
                      </p>
                      <p style="font-size: 13px; color: #2563eb; font-weight: 900; margin: 0;">
                        ZAYA CODE HUB Recruitment Team
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="background-color: #002855; padding: 18px 12px; color: #94a3b8; font-size: 11px;">
                      <p style="margin: 0; font-weight: 700; color: #cbd5e1;">ZAYA CODE HUB • Subhashish Learning & Tech Pvt Ltd</p>
                      <p style="margin: 3px 0 0 0;">Subramania Nagar, Salem, Tamil Nadu – 636005</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    }

    // Send universal email directly to candidate email address (recipientEmail)
    const sendResult = await sendUniversalEmail({
      to: recipientEmail,
      subject: subject,
      html: htmlContent
    });

    return NextResponse.json({ 
      message: `${isAccepted ? 'Acceptance' : 'Rejection'} email sent to candidate`, 
      success: true,
      recipient: recipientEmail,
      provider: sendResult.provider || 'universal'
    });

  } catch (error: any) {
    console.error('API Send acceptance catch error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process email request' }, { status: 500 });
  }
}
