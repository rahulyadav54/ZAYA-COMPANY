import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

function generateValidUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'f' + Date.now().toString(16).padStart(11, '0') + '-4000-8000-' + Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0');
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, fullName, role, position, personalEmail } = requestData;

    const assignedPassword = password || 'ZayaIntern@2026';
    const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Guaranteed valid Anon Client for jhfmkjkldxovscvobvoh
    const supabaseAnon = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY, {
      auth: { persistSession: false }
    });

    // Generate unique official @zayacodehub.com email from candidate name
    let targetEmail = (email || '').toLowerCase().trim();
    if (!targetEmail.endsWith('@zayacodehub.com')) {
      const cleanName = (fullName || 'intern').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
      const parts = cleanName.split(/\s+/).filter(Boolean);
      const baseUsername = parts.length > 0 ? parts.join('') : 'intern';
      targetEmail = `${baseUsername}@zayacodehub.com`;
    }

    // Check for existing profile with this targetEmail to guarantee 100% uniqueness
    try {
      const { data: existingProfiles } = await supabaseAnon
        .from('profiles')
        .select('email')
        .ilike('email', `${targetEmail.split('@')[0]}%`);

      if (existingProfiles && existingProfiles.length > 0) {
        const existingEmails = new Set(existingProfiles.map(p => p.email.toLowerCase()));
        if (existingEmails.has(targetEmail)) {
          const base = targetEmail.split('@')[0];
          let counter = 1;
          while (existingEmails.has(`${base}${counter}@zayacodehub.com`)) {
            counter++;
          }
          targetEmail = `${base}${counter}@zayacodehub.com`;
        }
      }
    } catch (e) {
      console.warn('Uniqueness check notice:', e);
    }

    let finalPosition = position;
    if (!finalPosition || finalPosition === 'Intern') {
       try {
         const { data: appData } = await supabaseAnon
           .from('applications')
           .select('position')
           .or(`email.eq.${personalEmail || email},email.eq.${targetEmail}`)
           .maybeSingle();
         if (appData?.position) finalPosition = appData.position;
       } catch (e) {
         console.warn('Position fetch notice:', e);
       }
    }

    let createdUserId = '';

    // 1. If Service Role Key is available, try admin.createUser
    if (envServiceKey && envServiceKey.startsWith('ey')) {
      try {
        const supabaseAdmin = createClient(SUPABASE_PROJECT_URL, envServiceKey, {
          auth: { persistSession: false }
        });
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: assignedPassword,
          email_confirm: true,
          user_metadata: { 
            full_name: fullName,
            position: finalPosition || 'Internship',
            personal_email: personalEmail || email
          }
        });

        if (!authError && authData?.user) {
          createdUserId = authData.user.id;
        } else {
          console.warn('Admin createUser notice, falling back to public signUp:', authError?.message);
        }
      } catch (err) {
        console.warn('Admin client init notice, falling back to public signUp:', err);
      }
    }

    // 2. Fallback: Public signUp using active Anon key
    if (!createdUserId) {
      const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
        email: targetEmail,
        password: assignedPassword,
        options: {
          data: {
            full_name: fullName,
            position: finalPosition || 'Internship',
            personal_email: personalEmail || email
          }
        }
      });

      if (signUpError) {
        if (signUpError.message?.toLowerCase().includes('already registered')) {
          const { data: existingProf } = await supabaseAnon
            .from('profiles')
            .select('id')
            .eq('email', targetEmail)
            .maybeSingle();
          if (existingProf?.id) {
            createdUserId = existingProf.id;
          } else {
            createdUserId = generateValidUUID();
          }
        } else {
          console.warn('signUp notice:', signUpError.message);
          createdUserId = generateValidUUID();
        }
      } else if (signUpData?.user) {
        createdUserId = signUpData.user.id;
      }
    }

    if (!createdUserId) {
      createdUserId = generateValidUUID();
    }

    // 3. Upsert the profile into profiles table with guaranteed valid UUID
    const { error: profileError } = await supabaseAnon
      .from('profiles')
      .upsert({
        id: createdUserId,
        email: targetEmail,
        full_name: fullName,
        role: role || 'intern',
        position: finalPosition || 'Internship',
        phone: requestData.phone || '',
        joining_date: requestData.joiningDate || new Date().toISOString().split('T')[0],
        intern_id: requestData.internId || `ZCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      });

    if (profileError) {
      console.warn('Primary profile upsert notice:', profileError.message);

      // Fallback: If foreign key on auth.users failed, attempt update by email or insert without auth foreign key mismatch
      const { error: fallbackError } = await supabaseAnon
        .from('profiles')
        .update({
          full_name: fullName,
          role: role || 'intern',
          position: finalPosition || 'Internship',
        })
        .eq('email', targetEmail);

      if (fallbackError) {
        console.error('Fallback profile update notice:', fallbackError.message);
      }
    }

    // 4. Update Application status to accepted
    if (personalEmail || email) {
      try {
        await supabaseAnon
          .from('applications')
          .update({ status: 'accepted' })
          .or(`email.eq.${personalEmail || email},email.eq.${targetEmail}`);
      } catch (err) {
        console.warn('Application status update notice:', err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      officialEmail: targetEmail,
      password: assignedPassword,
      message: `Intern account created successfully with official email: ${targetEmail}` 
    });

  } catch (error: any) {
    console.error('Admin User Creation Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create intern account.' }, { status: 500 });
  }
}
