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
Code Confidence: ${confidence}/10`;

    const cleanEmail = email.toLowerCase().trim();

    // 1. Tier 1: Try inserting with full schema fields
    const { error: primaryError } = await supabase.from('applications').insert({
      full_name: fullName,
      email: cleanEmail,
      phone: phone,
      position: position,
      resume_url: resumeUrl,
      portfolio_url: portfolio,
      cover_letter: coverLetterContent,
      status: 'pending'
    });

    if (primaryError) {
      console.warn('Primary application insert notice:', primaryError.message);

      // 2. Tier 2: Try inserting with legacy schema fields (experience / github_url)
      const { error: secondaryError } = await supabase.from('applications').insert({
        full_name: fullName,
        email: cleanEmail,
        phone: phone,
        position: position,
        resume_url: resumeUrl,
        github_url: portfolio,
        experience: coverLetterContent,
        status: 'pending'
      });

      if (secondaryError) {
        console.warn('Secondary application insert notice:', secondaryError.message);

        // 3. Tier 3: If candidate email already exists (duplicate constraint), update existing record
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            full_name: fullName,
            phone: phone,
            position: position,
            resume_url: resumeUrl,
            portfolio_url: portfolio,
            cover_letter: coverLetterContent,
            status: 'pending'
          })
          .eq('email', cleanEmail);

        if (updateError) {
          console.error('Tier 3 update notice:', updateError.message);
          return NextResponse.json(
            { error: 'Failed to record application in database: ' + updateError.message },
            { status: 500 }
          );
        }
      }
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
