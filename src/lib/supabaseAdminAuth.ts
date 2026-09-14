import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import {
  SUPABASE_PROJECT_URL,
  SUPABASE_PUBLIC_ANON_KEY,
  getServiceRoleKey,
} from '@/lib/supabaseConfig';

export function createServiceRoleClient() {
  const serviceKey = getServiceRoleKey();
  if (!serviceKey) return null;
  return createClient(SUPABASE_PROJECT_URL, serviceKey, {
    auth: { persistSession: false },
  });
}

export function createAnonServerClient() {
  return createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY, {
    auth: { persistSession: false },
  });
}

export async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<User | null> {
  const cleanEmail = email.toLowerCase().trim();

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .ilike('email', cleanEmail)
    .maybeSingle();

  if (profile?.id) {
    const { data } = await admin.auth.admin.getUserById(profile.id);
    if (data.user) return data.user;
  }

  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data.users.length) break;

    const match = data.users.find((user) => user.email?.toLowerCase() === cleanEmail);
    if (match) return match;

    if (data.users.length < perPage) break;
    page++;
  }

  return null;
}

type InternProfileInput = {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  position?: string;
  phone?: string;
  joiningDate?: string;
  internId?: string;
};

export async function upsertInternProfile(
  admin: SupabaseClient,
  input: InternProfileInput,
) {
  const { error } = await admin.from('profiles').upsert({
    id: input.id,
    email: input.email.toLowerCase().trim(),
    full_name: input.fullName,
    role: input.role || 'intern',
    department: input.position || 'Internship',
    phone: input.phone || '',
    intern_id:
      input.internId ||
      `ZCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    updated_at: new Date().toISOString(),
  });

  return error;
}
