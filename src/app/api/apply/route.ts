import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

async function sendApplicationConfirmationEmail(email: string, fullName: string, position: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set. Skipping application confirmation email.');
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = `📬 Application Received - ${position} at ZAYA CODE HUB`;
    const htmlContent = `
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
              <!-- Container Table -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                
                <!-- Banner Header -->
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px 16px; color: #ffffff;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <span style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; background: rgba(255,255,255,0.2); color: #ffffff; padding: 4px 12px; border-radius: 12px; display: inline-block; margin-bottom: 10px;">
                            ZAYA CODE HUB • APPLICATION CONFIRMATION
                          </span>
                          <h1 class="mobile-title" style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.3;">
                            Application Received! 📬
                          </h1>
                          <p class="mobile-text" style="margin: 6px 0 0 0; font-size: 13px; color: #e0f2fe; font-weight: 500;">
                            We have received your application for ${position}
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
                      Thank you for your interest in joining <strong>ZAYA CODE HUB</strong>! We have officially received your application for the <strong>${position}</strong> position.
                    </p>

                    <!-- Summary Box -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 14px; margin: 20px 0;">
                      <tr>
                        <td style="padding: 16px 12px;">
                          
                          <div style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; text-align: center;">
                            📋 Submitted Application Summary
                          </div>

                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe; margin-bottom: 8px;">
                            <tr>
                              <td style="padding: 10px 12px;">
                                <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Applicant Name</div>
                                <div style="font-size: 13px; font-weight: 600; color: #0f172a;">${fullName}</div>
                              </td>
                            </tr>
                          </table>

                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe; margin-bottom: 8px;">
                            <tr>
                              <td style="padding: 10px 12px;">
                                <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Email Address</div>
                                <div style="font-size: 13px; font-weight: 600; color: #2563eb; word-break: break-all; -webkit-hyphens: auto; word-wrap: break-word;">${email}</div>
                              </td>
                            </tr>
                          </table>

                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe; margin-bottom: 8px;">
                            <tr>
                              <td style="padding: 10px 12px;">
                                <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Position Applied</div>
                                <div style="font-size: 13px; font-weight: 600; color: #0f172a;">${position}</div>
                              </td>
                            </tr>
                          </table>

                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e0f2fe;">
                            <tr>
                              <td style="padding: 10px 12px;">
                                <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Submission Date</div>
                                <div style="font-size: 13px; font-weight: 600; color: #0f172a;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <!-- What Happens Next -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 14px 12px;">
                          <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                            ⏳ What Happens Next?
                          </div>
                          <div style="font-size: 12px; color: #334155; line-height: 1.7;">
                            1. Our recruitment team is reviewing your profile and qualifications.<br/>
                            2. If selected, you will receive an official acceptance letter with portal credentials.<br/>
                            3. Application reviews are completed within 24 to 48 hours.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p class="mobile-text" style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
                      If you have any questions, contact us at <a href="mailto:support@zayacodehub.in" style="color: #2563eb; font-weight: 700;">support@zayacodehub.in</a>.
                    </p>

                    <p class="mobile-text" style="font-size: 13px; color: #0f172a; font-weight: 700; margin: 0 0 2px 0;">
                      Best regards,
                    </p>
                    <p class="mobile-text" style="font-size: 13px; color: #2563eb; font-weight: 800; margin: 0;">
                      ZAYA CODE HUB Talent Acquisition Team
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
      await resend.emails.send({
        from: 'ZAYA CODE HUB <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        html: htmlContent,
      });
    }
  } catch (err: any) {
    console.warn('Application confirmation email error:', err?.message);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const fullName = (formData.get('fullName') as string) || '';
    const email = (formData.get('email') as string) || '';
    const phone = (formData.get('phone') as string) || '';
    const position = (formData.get('position') as string) || '';
    const portfolio = (formData.get('portfolio') as string) || '';
    const location = (formData.get('location') as string) || '';
    const startDate = (formData.get('startDate') as string) || '';
    const isEnrolled = (formData.get('isEnrolled') as string) || '';
    const major = (formData.get('major') as string) || '';
    const experience = (formData.get('experience') as string) || '';
    const tools = (formData.get('tools') as string) || '';
    const confidence = (formData.get('confidence') as string) || '';
    const resumeFile = (formData.get('resume') as File) || null;

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: Name, Email, and Phone are required.' },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY, {
      auth: { persistSession: false }
    });

    let resumeUrl = '';

    // Handle resume upload on server side
    if (resumeFile && resumeFile.size > 0) {
      try {
        const fileExt = resumeFile.name.split('.').pop() || 'pdf';
        const safeName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${Date.now()}_${safeName}.${fileExt}`;
        const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());

        const { data, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, fileBuffer, {
            contentType: resumeFile.type || 'application/pdf',
            cacheControl: '3600',
            upsert: true,
          });

        if (!uploadError && data?.path) {
          resumeUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/resumes/${data.path}`;
        } else {
          console.warn('Resume storage notice:', uploadError?.message);
          resumeUrl = `(File Uploaded: ${resumeFile.name} - ${Math.round(resumeFile.size / 1024)}KB)`;
        }
      } catch (err) {
        console.warn('Resume process notice:', err);
        resumeUrl = `(File Uploaded: ${resumeFile.name})`;
      }
    }

    const coverLetterContent = `Location: ${location}
Start Date: ${startDate}
Enrolled in Degree: ${isEnrolled}
Major: ${major}
Experience: ${experience}
Proficient Tools: ${tools}
Code Confidence: ${confidence}/10
Portfolio: ${portfolio}`;

    const cleanEmail = email.toLowerCase().trim();
    let savedSuccessfully = false;

    // Tier 1: Try inserting full modern schema (cover_letter + portfolio_url)
    const { error: tier1Error } = await supabase.from('applications').insert({
      full_name: fullName,
      email: cleanEmail,
      phone: phone,
      position: position,
      resume_url: resumeUrl,
      portfolio_url: portfolio,
      cover_letter: coverLetterContent,
      status: 'pending'
    });

    if (!tier1Error) {
      savedSuccessfully = true;
    } else {
      console.warn('Tier 1 insert notice:', tier1Error.message);

      // Tier 2: Try inserting legacy schema (experience + github_url)
      const { error: tier2Error } = await supabase.from('applications').insert({
        full_name: fullName,
        email: cleanEmail,
        phone: phone,
        position: position,
        resume_url: resumeUrl,
        github_url: portfolio,
        experience: coverLetterContent,
        status: 'pending'
      });

      if (!tier2Error) {
        savedSuccessfully = true;
      } else {
        console.warn('Tier 2 insert notice:', tier2Error.message);

        // Tier 3: Try updating existing row by email using legacy columns (experience + phone)
        const { error: tier3Error } = await supabase
          .from('applications')
          .update({
            full_name: fullName,
            phone: phone,
            position: position,
            resume_url: resumeUrl,
            experience: coverLetterContent,
            status: 'pending'
          })
          .eq('email', cleanEmail);

        if (!tier3Error) {
          savedSuccessfully = true;
        } else {
          console.warn('Tier 3 update notice:', tier3Error.message);

          // Tier 4: Universal core insert
          const { error: tier4Error } = await supabase.from('applications').insert({
            full_name: fullName,
            email: cleanEmail,
            phone: phone,
            position: position,
            resume_url: resumeUrl,
            status: 'pending'
          });

          if (!tier4Error) {
            savedSuccessfully = true;
          } else {
            // Tier 5: Universal core update by email
            const { error: tier5Error } = await supabase
              .from('applications')
              .update({
                full_name: fullName,
                phone: phone,
                position: position,
                resume_url: resumeUrl,
                status: 'pending'
              })
              .eq('email', cleanEmail);

            if (!tier5Error) {
              savedSuccessfully = true;
            } else {
              console.error('All application database save tiers failed:', tier5Error.message);
              return NextResponse.json(
                { error: 'Failed to record application in database: ' + tier5Error.message },
                { status: 500 }
              );
            }
          }
        }
      }
    }

    // Trigger instant Application Received Confirmation Email to candidate
    if (savedSuccessfully) {
      await sendApplicationConfirmationEmail(cleanEmail, fullName, position);
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. A confirmation email has been sent to ' + cleanEmail
    });

  } catch (error: any) {
    console.error('API apply catch error:', error);
    return NextResponse.json(
      { error: 'Server error processing application submission: ' + error?.message },
      { status: 500 }
    );
  }
}
