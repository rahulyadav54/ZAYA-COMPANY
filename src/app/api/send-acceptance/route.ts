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
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background-color: #f8fafc; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 36px 32px; text-align: center; color: #ffffff;">
            <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.15); display: inline-block; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px;">
              ZAYA CODE HUB • OFFICIAL SELECTION LETTER
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">Congratulations, ${fullName}!</h1>
            <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.9; font-weight: 500;">You have been selected for the ${position} Internship</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #1e293b; font-weight: 600; margin-top: 0;">Dear ${fullName},</p>
            
            <p style="font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 20px;">
              On behalf of <strong>ZAYA CODE HUB</strong>, we are thrilled to inform you that your application for the <strong>${position}</strong> role has been officially <strong>ACCEPTED</strong>! 
            </p>

            <p style="font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 24px;">
              Your background, technical skills, and dedication stood out during our review process. We are excited to welcome you to our team as you embark on this professional journey with us.
            </p>

            <!-- Login Credentials Box -->
            <div style="background: #f0f9ff; border: 2px solid #38bdf8; border-radius: 16px; padding: 24px; margin: 28px 0;">
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0; color: #0284c7; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                  🔑 Your Official Intern Portal Credentials
                </h3>
              </div>

              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #0f172a;">
                <tr style="border-bottom: 1px solid #e0f2fe;">
                  <td style="padding: 10px 0; font-weight: 700; color: #475569; width: 180px;">Personal Email:</td>
                  <td style="padding: 10px 0; font-weight: 600; color: #0f172a;">${email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e0f2fe;">
                  <td style="padding: 10px 0; font-weight: 700; color: #475569;">Official Company Email:</td>
                  <td style="padding: 10px 0; font-family: monospace; font-size: 15px; font-weight: 800; color: #0284c7;">${companyLoginEmail}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e0f2fe;">
                  <td style="padding: 10px 0; font-weight: 700; color: #475569;">Assigned Password:</td>
                  <td style="padding: 10px 0; font-family: monospace; font-size: 15px; font-weight: 800; color: #1e293b;">${loginPassword}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 700; color: #475569;">Direct Login Portal:</td>
                  <td style="padding: 10px 0;">
                    <a href="${loginUrl}" style="color: #2563eb; font-weight: 800; text-decoration: underline;">${loginUrl}</a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #bae6fd; font-size: 12px; color: #0369a1;">
                💡 <em>Note: You can log into the ZAYA CODE HUB portal using your official company email (<strong>${companyLoginEmail}</strong>) or your personal email with the assigned password above.</em>
              </div>
            </div>

            <!-- Action Button CTA -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 14px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 10px 25px -5px rgba(37,99,235,0.4);">
                🚀 Click Here to Login to Intern Portal →
              </a>
              <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Direct Link: <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></p>
            </div>

            <!-- What You Can Do in Your Portal Section -->
            <div style="background-color: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 28px; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                🌟 What You Can Do in Your Intern Portal:
              </h3>
              
              <ul style="margin: 0; padding: 0; list-style: none; font-size: 14px; color: #334155; line-height: 1.8;">
                <li style="margin-bottom: 12px; padding-left: 28px; position: relative;">
                  <span style="position: absolute; left: 0; top: 2px; font-size: 16px;">🪪</span>
                  <strong>Download Official Intern ID Card:</strong> Access your digital ID card complete with official ZAYA CODE HUB verification badge.
                </li>
                <li style="margin-bottom: 12px; padding-left: 28px; position: relative;">
                  <span style="position: absolute; left: 0; top: 2px; font-size: 16px;">📄</span>
                  <strong>Download Official Offer Letter:</strong> Access and download your signed internship acceptance offer letter anytime.
                </li>
                <li style="margin-bottom: 12px; padding-left: 28px; position: relative;">
                  <span style="position: absolute; left: 0; top: 2px; font-size: 16px;">🎓</span>
                  <strong>Download Completion Certificate:</strong> Generate and download your verified Internship Certificate & LOR upon task completion.
                </li>
                <li style="margin-bottom: 12px; padding-left: 28px; position: relative;">
                  <span style="position: absolute; left: 0; top: 2px; font-size: 16px;">💻</span>
                  <strong>Submit Tasks & Projects:</strong> Receive assigned coding tasks, view project repos, and submit your completed work for review.
                </li>
                <li style="margin-bottom: 12px; padding-left: 28px; position: relative;">
                  <span style="position: absolute; left: 0; top: 2px; font-size: 16px;">💬</span>
                  <strong>Direct Team & Admin Messaging:</strong> Communicate with project mentors and receive real-time evaluations and feedback.
                </li>
              </ul>
            </div>

            <p style="font-size: 15px; color: #475569; line-height: 1.7;">
              If you experience any issues logging in, feel free to reach out to our team directly at <a href="mailto:support@zayacodehub.in" style="color: #2563eb; font-weight: 700;">support@zayacodehub.in</a>.
            </p>

            <p style="font-size: 15px; color: #1e293b; font-weight: 700; margin-top: 28px; margin-bottom: 4px;">
              Welcome to ZAYA CODE HUB!
            </p>
            <p style="font-size: 15px; color: #2563eb; font-weight: 800; margin: 0;">
              ZAYA CODE HUB HR & Internship Team
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
            <p style="margin: 0 0 4px 0; font-weight: 700; color: #cbd5e1;">ZAYA CODE HUB • Subhashish Learning & Tech Pvt Ltd</p>
            <p style="margin: 0;">Subramania Nagar, Salem, Tamil Nadu – 636005 | <a href="https://www.zayacodehub.in" style="color: #38bdf8; text-decoration: none;">www.zayacodehub.in</a></p>
          </div>

        </div>
      `;
    } else {
      subject = `Update regarding your application for ${position} at ZAYA CODE HUB`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Hello ${fullName},</h2>
          <p style="font-size: 15px; color: #475569; line-height: 1.7;">
            Thank you for taking the time to apply for the <strong>${position}</strong> role at <strong>ZAYA CODE HUB</strong>.
          </p>
          <p style="font-size: 15px; color: #475569; line-height: 1.7;">
            After careful evaluation of all applications, we have decided to move forward with other candidates at this time. We encourage you to apply for future openings that match your skills.
          </p>
          <p style="font-size: 15px; color: #475569;">
            We wish you the very best in your professional journey.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            ZAYA CODE HUB | Subramania Nagar, Salem, Tamil Nadu
          </p>
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

    // 2. Fallback to onboarding@resend.dev if custom domain is not yet verified on Resend
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
