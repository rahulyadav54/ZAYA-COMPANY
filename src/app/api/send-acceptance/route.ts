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
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 12px; box-sizing: border-box;">
            <div style="background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              
              <!-- Mobile-Friendly Header Banner -->
              <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 20px; text-align: center; color: #ffffff;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; background: rgba(255,255,255,0.15); display: inline-block; padding: 5px 14px; border-radius: 20px; margin-bottom: 12px;">
                  ZAYA CODE HUB • SELECTION LETTER
                </div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 900; line-height: 1.2;">Congratulations, ${fullName}! 🎉</h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">You have been selected for the ${position} Internship</p>
              </div>

              <!-- Main Content Body -->
              <div style="padding: 24px 20px;">
                <p style="font-size: 15px; color: #1e293b; font-weight: 700; margin-top: 0;">Dear ${fullName},</p>
                
                <p style="font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 18px;">
                  On behalf of <strong>ZAYA CODE HUB</strong>, we are thrilled to inform you that your application for the <strong>${position}</strong> role has been officially <strong>ACCEPTED</strong>! 
                </p>

                <p style="font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 24px;">
                  Your background, technical skills, and dedication stood out during our review process. We are excited to welcome you to our engineering team.
                </p>

                <!-- Mobile-Responsive Stacked Credentials Card -->
                <div style="background: #f0f9ff; border: 2px solid #38bdf8; border-radius: 16px; padding: 18px; margin: 24px 0;">
                  <div style="margin-bottom: 14px; text-align: center;">
                    <h3 style="margin: 0; color: #0284c7; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                      🔑 Your Official Intern Portal Credentials
                    </h3>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    <!-- Personal Email Block -->
                    <div style="background: #ffffff; padding: 12px 14px; border-radius: 10px; border: 1px solid #e0f2fe;">
                      <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Personal Applicant Email</div>
                      <div style="font-size: 14px; font-weight: 600; color: #0f172a; word-break: break-all; overflow-wrap: anywhere;">${email}</div>
                    </div>

                    <!-- Official Company Email Block -->
                    <div style="background: #ffffff; padding: 12px 14px; border-radius: 10px; border: 1.5px solid #0284c7; border-left: 5px solid #0284c7;">
                      <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Official Company Email (Login ID)</div>
                      <div style="font-family: monospace; font-size: 15px; font-weight: 800; color: #0284c7; word-break: break-all; overflow-wrap: anywhere;">${companyLoginEmail}</div>
                    </div>

                    <!-- Assigned Password Block -->
                    <div style="background: #ffffff; padding: 12px 14px; border-radius: 10px; border: 1px solid #e0f2fe;">
                      <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Assigned Portal Password</div>
                      <div style="font-family: monospace; font-size: 15px; font-weight: 800; color: #0f172a; word-break: break-all;">${loginPassword}</div>
                    </div>

                    <!-- Direct Portal Link Block -->
                    <div style="background: #ffffff; padding: 12px 14px; border-radius: 10px; border: 1px solid #e0f2fe;">
                      <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">Direct Login Portal</div>
                      <div style="font-size: 13px; font-weight: 800; word-break: break-all; overflow-wrap: anywhere;">
                        <a href="${loginUrl}" style="color: #2563eb; text-decoration: underline;">${loginUrl}</a>
                      </div>
                    </div>
                  </div>

                  <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #bae6fd; font-size: 11px; color: #0369a1; text-align: center;">
                    💡 <em>You can log in using your official email (<strong>${companyLoginEmail}</strong>) or your personal email.</em>
                  </div>
                </div>

                <!-- Responsive CTA Button -->
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${loginUrl}" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 14px; font-weight: 800; font-size: 15px; display: block; text-align: center; box-shadow: 0 10px 25px -5px rgba(37,99,235,0.4); max-width: 340px; margin: 0 auto;">
                    🚀 Login to Intern Portal →
                  </a>
                  <p style="font-size: 11px; color: #64748b; margin-top: 8px;">Portal URL: <a href="${loginUrl}" style="color: #2563eb; word-break: break-all;">${loginUrl}</a></p>
                </div>

                <!-- What You Can Do in Your Portal Section -->
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                  <h3 style="margin: 0 0 14px 0; color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                    🌟 What You Can Do in Your Intern Portal:
                  </h3>
                  
                  <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: #334155; line-height: 1.6;">
                    <div style="background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                      🪪 <strong>Download Official Intern ID Card:</strong> Access digital ID card with ZAYA CODE HUB QR verification.
                    </div>
                    <div style="background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                      📄 <strong>Download Official Offer Letter:</strong> Access and download signed internship offer letter anytime.
                    </div>
                    <div style="background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                      🎓 <strong>Download Completion Certificate:</strong> Generate verified Certificate & LOR upon project completion.
                    </div>
                    <div style="background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                      💻 <strong>Submit Tasks & Projects:</strong> Access assigned coding tasks, project repos, and submit completed work.
                    </div>
                    <div style="background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                      💬 <strong>Direct Team & Admin Messaging:</strong> Communicate with project mentors and track real-time evaluations.
                    </div>
                  </div>
                </div>

                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                  If you experience any issues logging in, reach out to our team at <a href="mailto:support@zayacodehub.in" style="color: #2563eb; font-weight: 700;">support@zayacodehub.in</a>.
                </p>

                <p style="font-size: 14px; color: #1e293b; font-weight: 700; margin-top: 24px; margin-bottom: 2px;">
                  Welcome to ZAYA CODE HUB!
                </p>
                <p style="font-size: 14px; color: #2563eb; font-weight: 800; margin: 0;">
                  ZAYA CODE HUB HR & Internship Team
                </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #0f172a; padding: 20px 16px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                <p style="margin: 0 0 4px 0; font-weight: 700; color: #cbd5e1;">ZAYA CODE HUB • Subhashish Learning & Tech Pvt Ltd</p>
                <p style="margin: 0; word-break: break-all;">Subramania Nagar, Salem, Tamil Nadu – 636005 | <a href="https://www.zayacodehub.in" style="color: #38bdf8; text-decoration: none;">www.zayacodehub.in</a></p>
              </div>

            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = `Update regarding your application for ${position} at ZAYA CODE HUB`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 12px; box-sizing: border-box;">
          <div style="background-color: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Hello ${fullName},</h2>
            <p style="font-size: 14px; color: #475569; line-height: 1.7;">
              Thank you for applying for the <strong>${position}</strong> role at <strong>ZAYA CODE HUB</strong>.
            </p>
            <p style="font-size: 14px; color: #475569; line-height: 1.7;">
              After careful evaluation of all applications, we have decided to move forward with other candidates at this time. We encourage you to apply for future openings that match your skills.
            </p>
            <p style="font-size: 14px; color: #475569;">
              We wish you the very best in your professional journey.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
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
