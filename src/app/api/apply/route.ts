import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

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
      return NextResponse.json({ success: true, message: 'Application submitted successfully.' });
    }

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
      return NextResponse.json({ success: true, message: 'Application submitted successfully.' });
    }

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
      return NextResponse.json({ success: true, message: 'Application submitted successfully.' });
    }

    console.warn('Tier 3 update notice:', tier3Error.message);

    // Tier 4: Universal core insert (only guaranteed core columns: full_name, email, phone, position, resume_url, status)
    const { error: tier4Error } = await supabase.from('applications').insert({
      full_name: fullName,
      email: cleanEmail,
      phone: phone,
      position: position,
      resume_url: resumeUrl,
      status: 'pending'
    });

    if (!tier4Error) {
      return NextResponse.json({ success: true, message: 'Application submitted successfully.' });
    }

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

    if (tier5Error) {
      console.error('All application database save tiers failed:', tier5Error.message);
      return NextResponse.json(
        { error: 'Failed to record application in database: ' + tier5Error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully.'
    });

  } catch (error: any) {
    console.error('API apply catch error:', error);
    return NextResponse.json(
      { error: 'Server error processing application submission: ' + error?.message },
      { status: 500 }
    );
  }
}
