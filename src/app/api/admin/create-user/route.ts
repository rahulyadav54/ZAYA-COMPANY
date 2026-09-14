import { NextResponse } from 'next/server';
import {
  createServiceRoleClient,
  findAuthUserByEmail,
  upsertInternProfile,
} from '@/lib/supabaseAdminAuth';

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error:
            'SUPABASE_SERVICE_ROLE_KEY is missing. Add it in Vercel/hosting env vars so intern accounts can be saved to the database.',
        },
        { status: 503 },
      );
    }

    const requestData = await request.json();
    const { email, password, fullName, role, position, personalEmail } = requestData;

    const assignedPassword = password || 'ZayaIntern@2026';

    // 1. Generate unique official @zayacodehub.com email from candidate name
    let targetEmail = (email || '').toLowerCase().trim();
    const cleanName = (fullName || 'intern').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const baseUsername = parts.length > 0 ? parts.join('') : 'intern';

    if (!targetEmail.endsWith('@zayacodehub.com')) {
      targetEmail = `${baseUsername}@zayacodehub.com`;
    }

    try {
      const existingEmails = new Set<string>();

      const { data: profData } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .ilike('email', `${baseUsername}%@zayacodehub.com`);
      if (profData) profData.forEach((p) => p.email && existingEmails.add(p.email.toLowerCase().trim()));

      const { data: appData } = await supabaseAdmin
        .from('applications')
        .select('email')
        .ilike('email', `${baseUsername}%@zayacodehub.com`);
      if (appData) appData.forEach((a) => a.email && existingEmails.add(a.email.toLowerCase().trim()));

      if (existingEmails.has(targetEmail)) {
        let counter = 1;
        while (existingEmails.has(`${baseUsername}${counter}@zayacodehub.com`)) {
          counter++;
        }
        targetEmail = `${baseUsername}${counter}@zayacodehub.com`;
      }
    } catch (e) {
      console.warn('Uniqueness check notice, using random suffix fallback:', e);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      targetEmail = `${baseUsername}${randomSuffix}@zayacodehub.com`;
    }

    let finalPosition = position;
    if (!finalPosition || finalPosition === 'Intern') {
      const { data: appData } = await supabaseAdmin
        .from('applications')
        .select('position')
        .or(`email.eq.${personalEmail || email},email.eq.${targetEmail}`)
        .maybeSingle();
      if (appData?.position) finalPosition = appData.position;
    }

    const userMetadata = {
      full_name: fullName,
      position: finalPosition || 'Internship',
      personal_email: personalEmail || email,
    };

    let createdUserId = '';

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: targetEmail,
      password: assignedPassword,
      email_confirm: true,
      user_metadata: userMetadata,
    });

    if (!authError && authData?.user) {
      createdUserId = authData.user.id;
    } else if (authError?.message?.toLowerCase().includes('already')) {
      const existingUser = await findAuthUserByEmail(supabaseAdmin, targetEmail);
      if (existingUser) {
        createdUserId = existingUser.id;
        await supabaseAdmin.auth.admin.updateUserById(createdUserId, {
          password: assignedPassword,
          email_confirm: true,
          user_metadata: userMetadata,
        });
      }
    } else {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create intern auth account in Supabase.' },
        { status: 500 },
      );
    }

    if (!createdUserId) {
      return NextResponse.json(
        { error: 'Failed to create intern auth account. No auth user was created.' },
        { status: 500 },
      );
    }

    // 2. Save profile with service role (anon key cannot bypass profiles RLS)
    const profileError = await upsertInternProfile(supabaseAdmin, {
      id: createdUserId,
      email: targetEmail,
      fullName,
      role: role || 'intern',
      position: finalPosition || 'Internship',
      phone: requestData.phone || '',
      joiningDate: requestData.joiningDate,
      internId: requestData.internId,
    });

    if (profileError) {
      console.error('Profile save failed:', profileError.message);
      return NextResponse.json(
        {
          error: `Auth user created but profile was not saved: ${profileError.message}`,
          officialEmail: targetEmail,
        },
        { status: 500 },
      );
    }

    // 3. Mark application as accepted
    const targetCandidateEmail = (personalEmail || email || '').toLowerCase().trim();
    if (targetCandidateEmail && !targetCandidateEmail.endsWith('@zayacodehub.com')) {
      const { error: appUpdateError } = await supabaseAdmin
        .from('applications')
        .update({ status: 'accepted', position: finalPosition || 'Internship' })
        .ilike('email', targetCandidateEmail);

      if (appUpdateError) {
        console.warn('Application record sync notice:', appUpdateError.message);
      }
    }

    return NextResponse.json({
      success: true,
      officialEmail: targetEmail,
      password: assignedPassword,
      userId: createdUserId,
      message: `Intern account created and saved: ${targetEmail}`,
    });
  } catch (error: unknown) {
    console.error('Admin User Creation Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create intern account.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
