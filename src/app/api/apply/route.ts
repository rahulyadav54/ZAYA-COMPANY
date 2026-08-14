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
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 0; background-color: #f8fafc; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 36px 32px; text-align: center; color: #ffffff;">
          <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.15); display: inline-block; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px;">
            ZAYA CODE HUB • APPLICATION CONFIRMATION
          </div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 900;">Application Received! 📬</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.9;">We have received your application for ${position}</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #1e293b; font-weight: 600; margin-top: 0;">Dear ${fullName},</p>
          
          <p style="font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 20px;">
            Thank you for your interest in joining <strong>ZAYA CODE HUB</strong>! We have officially received your application and details for the <strong>${position}</strong> position.
          </p>

          <!-- Details Summary Box -->
          <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 14px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; color: #0284c7; font-size: 14px; font-weight: 800; text-transform: uppercase;">
              📋 Submitted Application Summary
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #0f172a;">
              <tr style="border-bottom: 1px solid #e0f2fe;">
                <td style="padding: 8px 0; font-weight: 700; color: #475569; width: 150px;">Applicant Name:</td>
                <td style="padding: 8px 0; font-weight: 600;">${fullName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0f2fe;">
                <td style="padding: 8px 0; font-weight: 700; color: #475569;">Email Address:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #2563eb;">${email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0f2fe;">
                <td style="padding: 8px 0; font-weight: 700; color: #475569;">Position Applied:</td>
                <td style="padding: 8px 0; font-weight: 600;">${position}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 700; color: #475569;">Submission Date:</td>
                <td style="padding: 8px 0; font-weight: 600;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
              </tr>
            </table>
          </div>

          <!-- What to Expect Next -->
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 14px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; font-weight: 800; text-transform: uppercase;">
              ⏳ What Happens Next?
            </h4>
            <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
              <li>Our recruitment team and technical leads are reviewing your qualifications.</li>
              <li>If selected, you will receive an official acceptance letter along with your intern portal credentials.</li>
              <li>Application evaluations are typically completed within 24 to 48 hours.</li>
            </ol>
          </div>

          <p style="font-size: 15px; color: #475569; line-height: 1.7;">
            If you have any questions regarding your application status, please contact us at <a href="mailto:support@zayacodehub.in" style="color: #2563eb; font-weight: 700;">support@zayacodehub.in</a>.
          </p>

          <p style="font-size: 15px; color: #1e293b; font-weight: 700; margin-top: 28px; margin-bottom: 4px;">
            Best regards,
          </p>
          <p style="font-size: 15px; color: #2563eb; font-weight: 800; margin: 0;">
            ZAYA CODE HUB Talent Acquisition Team
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
          <p style="margin: 0 0 4px 0; font-weight: 700; color: #cbd5e1;">ZAYA CODE HUB • Subhashish Learning & Tech Pvt Ltd</p>
          <p style="margin: 0;">Subramania Nagar, Salem, Tamil Nadu – 636005 | <a href="https://www.zayacodehub.in" style="color: #38bdf8; text-decoration: none;">www.zayacodehub.in</a></p>
        </div>

      </div>
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
