import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
  findAcceptedApplicationForLogin,
  ensureInternAccount,
} from '@/lib/internAccount';
import {
  createAnonServerClient,
  createServiceRoleClient,
  findAuthUserByEmail,
} from '@/lib/supabaseAdminAuth';

type ProfileRow = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
  department?: string | null;
  intern_id?: string | null;
  phone?: string | null;
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
      .select('id, email, full_name, role, department, intern_id, phone')
      .ilike('email', email)
      .maybeSingle();
    if (data) return data as ProfileRow;
  }
  return null;
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
    const application = await findAcceptedApplicationForLogin(admin, cleanEmail, officialEmail);
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

    const ensured = await ensureInternAccount(admin, {
      fullName: profile?.full_name || application?.full_name || 'Portal Intern',
      personalEmail:
        application?.email && !application.email.endsWith('@zayacodehub.com')
          ? application.email
          : undefined,
      position: profile?.department || application?.position || 'Internship',
      password,
      preferredOfficialEmail: profile?.email || officialEmail,
      phone: profile?.phone || application?.phone || '',
    });

    if (!ensured.success) {
      return NextResponse.json(
        {
          success: false,
          error: ensured.error || 'Invalid login credentials. Please check your email address and password.',
        },
        { status: 401 },
      );
    }

    const authUser = await findAuthUserByEmail(admin, ensured.officialEmail);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid login credentials. Please check your email address and password.',
        },
        { status: 401 },
      );
    }

    const loginEmail = (authUser.email || ensured.officialEmail).toLowerCase();
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
