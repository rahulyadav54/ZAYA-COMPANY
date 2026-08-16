import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_URL = 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'f' + Date.now().toString(16).padStart(11, '0') + '-4000-8000-' + Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetMode, targetValue, title, description, priority, deadline } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Task title and description are required.' }, { status: 400 });
    }

    const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const clientKey = (envServiceKey && envServiceKey.startsWith('ey')) ? envServiceKey : SUPABASE_PUBLIC_ANON_KEY;
    
    const supabase = createClient(SUPABASE_PROJECT_URL, clientKey, {
      auth: { persistSession: false }
    });

    // 1. Fetch profiles
    const { data: profData, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'intern');

    let profilesList = profData || [];

    // 2. Fetch accepted applications if profiles empty or for candidate fallback
    const { data: appData } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'accepted');

    const applicationsList = appData || [];

    // Map profiles by email for quick lookup
    const profileEmailMap = new Map<string, any>();
    profilesList.forEach(p => {
      if (p.email) profileEmailMap.set(p.email.toLowerCase().trim(), p);
    });

    // Ensure all accepted applications have a profile row created if missing
    for (const app of applicationsList) {
      const emailKey = (app.email || '').toLowerCase().trim();
      if (emailKey && !profileEmailMap.has(emailKey)) {
        const cleanName = (app.full_name || 'intern').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
        const parts = cleanName.split(/\s+/).filter(Boolean);
        const officialEmail = parts.length > 0 ? `${parts.join('')}@zayacodehub.com` : emailKey;

        if (!profileEmailMap.has(officialEmail)) {
          const newId = (app.user_id && isValidUUID(app.user_id)) ? app.user_id : generateUUID();
          const { data: createdProf, error: createErr } = await supabase
            .from('profiles')
            .upsert({
              id: newId,
              email: officialEmail,
              full_name: app.full_name,
              role: 'intern',
              position: app.position || 'Internship',
              joining_date: app.created_at ? new Date(app.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              intern_id: `ZCH-2026-${Math.floor(1000 + Math.random() * 9000)}`
            })
            .select()
            .maybeSingle();

          if (!createErr && createdProf) {
            profilesList.push(createdProf);
            profileEmailMap.set(officialEmail, createdProf);
          }
        }
      }
    }

    // Filter target interns based on targetMode
    let targetInterns: any[] = [];

    if (targetMode === 'individual') {
      targetInterns = profilesList.filter(p => 
        (p.id && String(p.id) === String(targetValue)) ||
        (p.email && p.email.toLowerCase().trim() === String(targetValue).toLowerCase().trim()) ||
        (p.intern_id && String(p.intern_id) === String(targetValue))
      );
    } else if (targetMode === 'domain') {
      const domainSearch = (targetValue || '').toLowerCase().trim();
      targetInterns = profilesList.filter(p => {
        const pos = (p.position || '').toLowerCase().trim();
        return pos.includes(domainSearch) || pos === domainSearch;
      });
    } else if (targetMode === 'all') {
      targetInterns = profilesList;
    }

    if (targetInterns.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: targetMode === 'domain' 
          ? `No active interns found for domain "${targetValue}".`
          : 'No target intern found for task assignment.' 
      }, { status: 404 });
    }

    // Batch insert tasks
    const formattedDeadline = deadline ? new Date(deadline).toISOString().split('T')[0] : null;
    const taskRows = targetInterns.map(intern => ({
      intern_id: intern.id,
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'medium',
      deadline: formattedDeadline,
      status: 'pending'
    }));

    const { data: insertedData, error: insertErr } = await supabase
      .from('tasks')
      .insert(taskRows)
      .select();

    if (insertErr) {
      console.error('Task Batch Insertion Error:', insertErr);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    const assignedCount = insertedData?.length || taskRows.length;

    return NextResponse.json({
      success: true,
      count: assignedCount,
      message: `Task successfully assigned to ${assignedCount} intern(s)!`
    });

  } catch (err: any) {
    console.error('Assign Task Route Exception:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to assign tasks.' }, { status: 500 });
  }
}
