import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, fullName, role, position } = requestData;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabaseUrl = (envUrl && envUrl.includes('jhfmkjkldxovscvobvoh')) ? envUrl : SUPABASE_PROJECT_URL;
    
    // Check if Service Role Key is available & valid JWT
    const isServiceRoleValid = envServiceKey && envServiceKey.startsWith('ey');
    const activeKey = isServiceRoleValid ? envServiceKey : SUPABASE_PUBLIC_ANON_KEY;

    const supabaseAdmin = createClient(supabaseUrl, activeKey, {
      auth: { persistSession: false }
    });

    let finalPosition = position;
    if (!finalPosition || finalPosition === 'Intern') {
       try {
         const { data: appData } = await supabaseAdmin
           .from('applications')
           .select('position')
           .ilike('email', email)
           .maybeSingle();
         if (appData?.position) finalPosition = appData.position;
       } catch (e) {
         console.warn('Position fetch notice:', e);
       }
    }

    let createdUserId = '';

    // 1. If Service Role key is valid, use admin.createUser
    if (isServiceRoleValid) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          full_name: fullName,
          position: finalPosition || 'Internship'
        }
      });

      if (authError) {
        console.warn('Admin createUser failed, attempting signUp fallback:', authError.message);
      } else if (authData?.user) {
        createdUserId = authData.user.id;
      }
    }

    // 2. Fallback: Standard signUp if Service Role Key not present/valid
    if (!createdUserId) {
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            position: finalPosition || 'Internship'
          }
        }
      });

      if (signUpError) {
        // If user already exists in auth, fetch existing profile ID
        if (signUpError.message?.toLowerCase().includes('already registered')) {
          const { data: existingProf } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();
          if (existingProf?.id) {
            createdUserId = existingProf.id;
          } else {
            return NextResponse.json({ error: 'User already exists. Please log in or use a different email.' }, { status: 400 });
          }
        } else {
          return NextResponse.json({ error: 'Failed to create user auth: ' + signUpError.message }, { status: 500 });
        }
      } else if (signUpData?.user) {
        createdUserId = signUpData.user.id;
      }
    }

    // 3. Upsert the profile into profiles table
    if (createdUserId) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: createdUserId,
          email,
          full_name: fullName,
          role: role || 'intern',
          position: finalPosition || 'Internship',
          phone: requestData.phone || '',
          joining_date: requestData.joiningDate || new Date().toISOString().split('T')[0],
          intern_id: requestData.internId || `ZCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
      }
    }

    // 4. Update Application status to hired/accepted
    try {
      await supabaseAdmin
        .from('applications')
        .update({ status: 'accepted' })
        .eq('email', email);
    } catch (err) {
      console.warn('Application status update notice:', err);
    }

    return NextResponse.json({ success: true, message: 'Intern account created successfully.' });
  } catch (error: any) {
    console.error('Admin User Creation Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create intern account.' }, { status: 500 });
  }
}
