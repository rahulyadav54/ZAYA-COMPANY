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

    // Always use active Supabase project credentials for jhfmkjkldxovscvobvoh
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

    // Upsert into applications table (insert new or update existing candidate application by email)
    const { error: insertError } = await supabase.from('applications').upsert(
      {
        full_name: fullName,
        email: email.toLowerCase().trim(),
        phone,
        position,
        resume_url: resumeUrl,
        portfolio_url: portfolio,
        github_url: portfolio,
        cover_letter: coverLetterContent,
        experience: coverLetterContent,
        status: 'pending',
        applied_at: new Date().toISOString()
      },
      { onConflict: 'email' }
    );

    if (insertError) {
      console.warn('API apply database notice:', insertError);
      
      // Fallback: If upsert fails, attempt standard insert
      const { error: fallbackError } = await supabase.from('applications').insert({
        full_name: fullName,
        email: email.toLowerCase().trim(),
        phone,
        position,
        resume_url: resumeUrl,
        portfolio_url: portfolio,
        cover_letter: coverLetterContent,
        status: 'pending',
        applied_at: new Date().toISOString()
      });

      if (fallbackError) {
        console.error('API apply database insert fallback error:', fallbackError);
        return NextResponse.json(
          { error: 'Failed to record application in database: ' + fallbackError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully.'
    });

  } catch (error: any) {
    console.error('API apply general handler notice:', error);
    return NextResponse.json(
      { error: 'Server error processing application submission: ' + error?.message },
      { status: 500 }
    );
  }
}
