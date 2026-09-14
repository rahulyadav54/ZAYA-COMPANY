import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
  createAnonServerClient,
  createServiceRoleClient,
  findAcceptedApplication,
  findAuthUserByEmail,
  upsertInternProfile,
} from '@/lib/supabaseAdminAuth';

type ProfileRow = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
  position?: string | null;
  intern_id?: string | null;
  phone?: string | null;
  joining_date?: string | null;
};

function resolveRole(email: string, profileRole?: string | null) {
  if (profileRole === 'admin') return 'admin';
  if (email.includes('admin') || email === 'zayacodehub@gmail.com') return 'admin';
  return 'intern';
}

async function buildLoginResponse(
  supabase: SupabaseClient,
  email: string,
  session: { access_token: string; refresh_token: string },
  user: User,
) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return NextResponse.json({
    success: true,
    session,
    user,
    role: resolveRole(email, profile?.role),
  });
}

async function trySignIn(supabase: SupabaseClient, email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) return null;
  return { session: data.session, user: data.user };
}

async function findProfileByEmail(
  supabase: SupabaseClient,
  emails: string[],
): Promise<ProfileRow | null> {
  for (const email of emails) {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, position, intern_id, phone, joining_date')
      .ilike('email', email)
      .maybeSingle();
    if (data) return data as ProfileRow;
  }
  return null;
}

async function syncProfileWithAuthUser(
  admin: SupabaseClient,
  profile: ProfileRow,
  authUser: User,
) {
  if (profile.id === authUser.id) return;

  await upsertInternProfile(admin, {
    id: authUser.id,
    email: authUser.email || profile.email,
    fullName: profile.full_name || 'Portal Intern',
    role: profile.role || 'intern',
    position: profile.position || 'Internship',
    phone: profile.phone || '',
    joiningDate: profile.joining_date || undefined,
    internId: profile.intern_id || undefined,
  });

  await admin.from('profiles').delete().eq('id', profile.id);
}

async function ensureConfirmedAuthUser(
  admin: SupabaseClient,
  email: string,
  password: string,
  metadata?: Record<string, unknown>,
  profile?: ProfileRow | null,
) {
  let authUser = await findAuthUserByEmail(admin, email);

  if (!authUser) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata || {},
    });

    if (error) {
      authUser = await findAuthUserByEmail(admin, email);
      if (!authUser) return null;
    } else {
      authUser = data.user;
    }
  }

  if (!authUser) return null;

  await admin.auth.admin.updateUserById(authUser.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...(authUser.user_metadata || {}),
      ...(metadata || {}),
    },
  });

  if (profile && profile.id !== authUser.id) {
    await syncProfileWithAuthUser(admin, profile, authUser);
  } else if (!profile) {
    await upsertInternProfile(admin, {
      id: authUser.id,
      email: authUser.email || email,
      fullName: String(metadata?.full_name || 'Portal Intern'),
      role: 'intern',
      position: String(metadata?.position || 'Internship'),
    });
  }

  return authUser;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';

    if (!cleanEmail || typeof password !== 'string' || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 },
      );
    }

    const supabaseAnon = createAnonServerClient();
    const candidateEmails = [cleanEmail];

    if (!cleanEmail.endsWith('@zayacodehub.com')) {
      const username = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (username) candidateEmails.push(`${username}@zayacodehub.com`);
    }

    const officialEmail =
      candidateEmails.find((value) => value.endsWith('@zayacodehub.com')) || cleanEmail;

    for (const candidateEmail of [...new Set(candidateEmails)]) {
      const result = await trySignIn(supabaseAnon, candidateEmail, password);
      if (result) {
        return buildLoginResponse(
          supabaseAnon,
          candidateEmail,
          result.session,
          result.user,
        );
      }
    }

    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Intern login recovery is unavailable. Please contact admin — server is missing SUPABASE_SERVICE_ROLE_KEY.',
        },
        { status: 503 },
      );
    }

    const profile = await findProfileByEmail(admin, [...new Set(candidateEmails)]);
    const application = await findAcceptedApplication(admin, cleanEmail, officialEmail);
    const hasInternRecord = Boolean(profile || application);

    if (!hasInternRecord || !officialEmail.endsWith('@zayacodehub.com')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid login credentials. Please check your email address and password.',
        },
        { status: 401 },
      );
    }

    const targetEmail = profile?.email?.toLowerCase() || officialEmail;

    const metadata = {
      full_name: profile?.full_name || application?.full_name || 'Portal Intern',
      position: profile?.position || application?.position || 'Internship',
      personal_email:
        application?.email && !application.email.endsWith('@zayacodehub.com')
          ? application.email
          : undefined,
    };

    const authUser = await ensureConfirmedAuthUser(
      admin,
      targetEmail,
      password,
      metadata,
      profile,
    );

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid login credentials. Please check your email address and password.',
        },
        { status: 401 },
      );
    }

    const loginEmail = (authUser.email || targetEmail).toLowerCase();
    const recovered = await trySignIn(supabaseAnon, loginEmail, password);

    if (!recovered) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account found but sign-in failed. Please try again or use Forgot Password.',
        },
        { status: 401 },
      );
    }

    return buildLoginResponse(
      supabaseAnon,
      loginEmail,
      recovered.session,
      recovered.user,
    );
  } catch (error) {
    console.error('API login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication is temporarily unavailable.' },
      { status: 500 },
    );
  }
}
