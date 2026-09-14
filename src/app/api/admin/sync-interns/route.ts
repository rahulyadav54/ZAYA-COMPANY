import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabaseAdminAuth';
import { DEFAULT_INTERN_PASSWORD, ensureInternAccount } from '@/lib/internAccount';

export async function POST() {
  try {
    const admin = createServiceRoleClient();
    if (!admin) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is missing on the server.' },
        { status: 503 },
      );
    }

    const { data: acceptedApps, error } = await admin
      .from('applications')
      .select('full_name, email, position, phone, status')
      .eq('status', 'accepted')
      .order('applied_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results: Array<{
      fullName: string;
      personalEmail: string;
      officialEmail?: string;
      status: 'created' | 'skipped' | 'failed';
      error?: string;
    }> = [];

    const seenPersonalEmails = new Set<string>();

    for (const app of acceptedApps || []) {
      const personalEmail = (app.email || '').toLowerCase().trim();
      if (!personalEmail || seenPersonalEmails.has(personalEmail)) {
        continue;
      }
      seenPersonalEmails.add(personalEmail);

      const preferredOfficialEmail = personalEmail.endsWith('@zayacodehub.com')
        ? personalEmail
        : undefined;

      const result = await ensureInternAccount(admin, {
        fullName: app.full_name,
        personalEmail: personalEmail.endsWith('@zayacodehub.com') ? undefined : personalEmail,
        position: app.position,
        phone: app.phone || '',
        password: DEFAULT_INTERN_PASSWORD,
        preferredOfficialEmail,
      });

      if (result.success) {
        results.push({
          fullName: app.full_name,
          personalEmail,
          officialEmail: result.officialEmail,
          status: 'created',
        });
      } else {
        results.push({
          fullName: app.full_name,
          personalEmail,
          officialEmail: result.officialEmail,
          status: 'failed',
          error: result.error,
        });
      }
    }

    const created = results.filter((r) => r.status === 'created').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      created,
      failed,
      total: results.length,
      password: DEFAULT_INTERN_PASSWORD,
      results,
    });
  } catch (error) {
    console.error('Sync interns error:', error);
    const message = error instanceof Error ? error.message : 'Failed to sync intern accounts.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
