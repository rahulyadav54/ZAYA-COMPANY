import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jhfmkjkldxovscvobvoh.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = 'ZayaIntern@2026';

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

function buildBaseUsername(fullName) {
  const parts = (fullName || 'intern').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  return parts.length ? parts.join('') : 'intern';
}

async function generateUniqueOfficialEmail(fullName, preferredEmail) {
  const baseUsername = buildBaseUsername(fullName);
  let targetEmail = (preferredEmail || '').toLowerCase().trim();
  if (!targetEmail.endsWith('@zayacodehub.com')) targetEmail = `${baseUsername}@zayacodehub.com`;

  const existingEmails = new Set();
  const { data: profData } = await admin.from('profiles').select('email').ilike('email', `${baseUsername}%@zayacodehub.com`);
  profData?.forEach((p) => p.email && existingEmails.add(p.email.toLowerCase()));
  const { data: appData } = await admin.from('applications').select('email').ilike('email', `${baseUsername}%@zayacodehub.com`);
  appData?.forEach((a) => a.email && existingEmails.add(a.email.toLowerCase()));

  if (existingEmails.has(targetEmail)) {
    let counter = 1;
    while (existingEmails.has(`${baseUsername}${counter}@zayacodehub.com`)) counter++;
    targetEmail = `${baseUsername}${counter}@zayacodehub.com`;
  }
  return targetEmail;
}

async function ensureIntern(app) {
  const personalEmail = (app.email || '').toLowerCase().trim();
  const preferred = personalEmail.endsWith('@zayacodehub.com') ? personalEmail : undefined;
  const officialEmail = await generateUniqueOfficialEmail(app.full_name, preferred);

  let authUser = null;
  const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  authUser = users.users.find((u) => u.email?.toLowerCase() === officialEmail) || null;

  if (!authUser) {
    const { data, error } = await admin.auth.admin.createUser({
      email: officialEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: app.full_name, position: app.position || 'Internship', personal_email: preferred ? undefined : personalEmail },
    });
    if (error && !error.message.toLowerCase().includes('already')) {
      return { ok: false, officialEmail, error: error.message };
    }
    authUser = data?.user || users.users.find((u) => u.email?.toLowerCase() === officialEmail) || null;
  }

  if (!authUser) return { ok: false, officialEmail, error: 'No auth user' };

  await admin.auth.admin.updateUserById(authUser.id, {
    password,
    email_confirm: true,
    user_metadata: { full_name: app.full_name, position: app.position || 'Internship' },
  });

  const { error: profileError } = await admin.from('profiles').upsert({
    id: authUser.id,
    email: officialEmail,
    full_name: app.full_name,
    role: 'intern',
    department: app.position || 'Internship',
    phone: app.phone || '',
    intern_id: `ZCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    updated_at: new Date().toISOString(),
  });

  if (profileError) return { ok: false, officialEmail, error: profileError.message };
  return { ok: true, officialEmail };
}

const { data: acceptedApps } = await admin.from('applications').select('*').eq('status', 'accepted').order('applied_at', { ascending: true });
const seen = new Set();
let created = 0;
let failed = 0;

for (const app of acceptedApps || []) {
  const key = (app.email || '').toLowerCase();
  if (!key || seen.has(key)) continue;
  seen.add(key);
  const result = await ensureIntern(app);
  if (result.ok) {
    created++;
    console.log(`OK  ${app.full_name} -> ${result.officialEmail}`);
  } else {
    failed++;
    console.log(`FAIL ${app.full_name} -> ${result.error}`);
  }
}

console.log(`\nDone. created=${created} failed=${failed}`);

const signIn = await createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } }).auth.signInWithPassword({
  email: 'ritesh@zayacodehub.com',
  password,
});
console.log('Ritesh login test:', signIn.error?.message || 'SUCCESS');
