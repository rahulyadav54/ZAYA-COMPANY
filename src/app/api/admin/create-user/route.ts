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

    // 2. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        full_name: fullName,
        position: position || 'Intern'
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
        position: position || 'Intern',
        phone: requestData.phone || '',
        joining_date: requestData.joiningDate || new Date().toISOString().split('T')[0],
        intern_id: requestData.internId || `ZCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      });

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    console.error('Admin User Creation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
