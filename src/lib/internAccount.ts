import type { SupabaseClient } from '@supabase/supabase-js';
import { findAuthUserByEmail, upsertInternProfile } from '@/lib/supabaseAdminAuth';

export const DEFAULT_INTERN_PASSWORD = 'ZayaIntern@2026';

export function slugifyName(fullName: string) {
  return (fullName || 'intern').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

export function buildBaseUsername(fullName: string) {
  const parts = slugifyName(fullName).split(/\s+/).filter(Boolean);
  return parts.length > 0 ? parts.join('') : 'intern';
}

export async function generateUniqueOfficialEmail(
  admin: SupabaseClient,
  fullName: string,
  preferredEmail?: string,
) {
  const baseUsername = buildBaseUsername(fullName);
  const preferred = (preferredEmail || '').toLowerCase().trim();

  if (preferred.endsWith('@zayacodehub.com')) {
    const existingAuthUser = await findAuthUserByEmail(admin, preferred);
    if (existingAuthUser) return preferred;
  }

  let targetEmail = preferred.endsWith('@zayacodehub.com')
    ? preferred
    : `${baseUsername}@zayacodehub.com`;

  const existingEmails = new Set<string>();

  const { data: profData } = await admin
    .from('profiles')
    .select('email')
    .ilike('email', `${baseUsername}%@zayacodehub.com`);
  profData?.forEach((p) => p.email && existingEmails.add(p.email.toLowerCase().trim()));

  const { data: appData } = await admin
    .from('applications')
    .select('email')
    .ilike('email', `${baseUsername}%@zayacodehub.com`);
  appData?.forEach((a) => a.email && existingEmails.add(a.email.toLowerCase().trim()));

  if (existingEmails.has(targetEmail)) {
    let counter = 1;
    while (existingEmails.has(`${baseUsername}${counter}@zayacodehub.com`)) {
      counter++;
    }
    targetEmail = `${baseUsername}${counter}@zayacodehub.com`;
  }

  return targetEmail;
}

type ApplicationRow = {
  full_name: string;
  email: string;
  position?: string | null;
  status?: string | null;
  phone?: string | null;
};

export async function findAcceptedApplicationForLogin(
  admin: SupabaseClient,
  cleanEmail: string,
  officialEmail: string,
) {
  const { data: directMatch } = await admin
    .from('applications')
    .select('full_name, email, position, status, phone')
    .eq('status', 'accepted')
    .or(`email.eq.${cleanEmail},email.eq.${officialEmail}`)
    .order('applied_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (directMatch) return directMatch as ApplicationRow;

  if (!officialEmail.endsWith('@zayacodehub.com')) return null;

  const username = officialEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!username) return null;

  const { data: acceptedApps } = await admin
    .from('applications')
    .select('full_name, email, position, status, phone')
    .eq('status', 'accepted');

  if (!acceptedApps?.length) return null;

  const matched = acceptedApps.find((app) => {
    const appSlug = buildBaseUsername(app.full_name || '');
    const appEmail = (app.email || '').toLowerCase().trim();
    return (
      appSlug === username ||
      appEmail === officialEmail ||
      appEmail.startsWith(`${username}@`) ||
      appEmail.startsWith(`${username}`)
    );
  });

  return (matched as ApplicationRow) || null;
}

export async function ensureInternAccount(
  admin: SupabaseClient,
  input: {
    fullName: string;
    personalEmail?: string;
    position?: string;
    password?: string;
    preferredOfficialEmail?: string;
    phone?: string;
  },
) {
  const password = input.password || DEFAULT_INTERN_PASSWORD;
  const officialEmail = await generateUniqueOfficialEmail(
    admin,
    input.fullName,
    input.preferredOfficialEmail,
  );

  const userMetadata = {
    full_name: input.fullName,
    position: input.position || 'Internship',
    personal_email: input.personalEmail,
  };

  let authUser = await findAuthUserByEmail(admin, officialEmail);

  if (!authUser) {
    const { data, error } = await admin.auth.admin.createUser({
      email: officialEmail,
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    });

    if (error) {
      authUser = await findAuthUserByEmail(admin, officialEmail);
      if (!authUser) {
        return { success: false as const, error: error.message, officialEmail };
      }
    } else {
      authUser = data.user;
    }
  }

  if (!authUser) {
    return { success: false as const, error: 'Failed to create auth user.', officialEmail };
  }

  await admin.auth.admin.updateUserById(authUser.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...(authUser.user_metadata || {}),
      ...userMetadata,
    },
  });

  const profileError = await upsertInternProfile(admin, {
    id: authUser.id,
    email: officialEmail,
    fullName: input.fullName,
    role: 'intern',
    position: input.position || 'Internship',
    phone: input.phone || '',
  });

  if (profileError) {
    return {
      success: false as const,
      error: profileError.message,
      officialEmail,
      userId: authUser.id,
    };
  }

  return {
    success: true as const,
    officialEmail,
    userId: authUser.id,
    password,
  };
}
