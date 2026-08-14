import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isServiceRoleValid = serviceRoleKey && serviceRoleKey.startsWith('ey');
    const supabaseKey = isServiceRoleValid 
      ? serviceRoleKey 
      : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server database configuration is missing.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
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
          resumeUrl = `${supabaseUrl}/storage/v1/object/public/resumes/${data.path}`;
        } else {
          console.warn('Server storage upload notice:', uploadError?.message);
          resumeUrl = `(Attached File: ${resumeFile.name} - ${Math.round(resumeFile.size / 1024)}KB)`;
        }
      } catch (err) {
        console.warn('Resume process notice:', err);
        resumeUrl = `(Attached File: ${resumeFile.name})`;
      }
    }

    const coverLetterContent = `Location: ${location}
Start Date: ${startDate}
Enrolled in Degree: ${isEnrolled}
Major: ${major}
Experience: ${experience}
Proficient Tools: ${tools}
Code Confidence: ${confidence}/10`;

    // Insert into applications table
    const { error: insertError } = await supabase.from('applications').insert({
      full_name: fullName,
      email,
      phone,
      position,
      resume_url: resumeUrl,
      portfolio_url: portfolio,
      cover_letter: coverLetterContent,
      status: 'pending'
    });

    if (insertError) {
      console.error('API apply insert error:', insertError);
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'An application with this email address has already been submitted for review.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: insertError.message || 'Failed to record application in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully.'
    });

  } catch (error: any) {
    console.error('API apply error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error processing application submission.' },
      { status: 500 }
    );
  }
}
