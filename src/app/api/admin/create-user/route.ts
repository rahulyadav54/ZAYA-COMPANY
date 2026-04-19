import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, fullName, role, position } = requestData;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your server settings.' 
      }, { status: 500 });
    }

    // 1. Initialize Supabase with Service Role Key (Server-side ONLY)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1.5 Fetch position from applications if missing
    let finalPosition = position;
    if (!finalPosition || finalPosition === 'Intern') {
       const { data: appData } = await supabaseAdmin
         .from('applications')
         .select('position')
         .ilike('email', email)
         .maybeSingle();
       if (appData?.position) finalPosition = appData.position;
    }

    // 2. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        full_name: fullName,
        position: finalPosition || 'Internship'
      }
    });

    if (authError) throw authError;

    // 3. Create the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: role || 'intern',
        position: finalPosition || 'Internship',
        phone: requestData.phone || '',
        joining_date: requestData.joiningDate || new Date().toISOString().split('T')[0],
        intern_id: requestData.internId || `ZCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      });

    if (profileError) throw profileError;
    
    // 4. Update Application status (if exists)
    try {
      await supabaseAdmin
        .from('applications')
        .update({ status: 'hired' })
        .eq('email', email);
    } catch (err) {
      console.warn('Application status update skipped (table might not exist yet)');
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    console.error('Admin User Creation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
