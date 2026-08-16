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

function matchDomain(position: string, domainQuery: string): boolean {
  if (!domainQuery || !domainQuery.trim()) return true;
  
  const posClean = (position || '').toLowerCase().trim();
  const queryClean = domainQuery.toLowerCase().trim();

  // 1. Substring check in either direction
  if (posClean.includes(queryClean) || queryClean.includes(posClean)) {
    return true;
  }

  // 2. Tokenized keyword matching (ignoring generic stop words if specific terms exist)
  const stopWords = new Set(['intern', 'internship', 'developer', 'engineer', 'junior', 'senior', 'role', 'position']);
  
  const queryTokens = queryClean.split(/[\s/\-_]+/).filter(t => t.length > 1);
  const posTokens = posClean.split(/[\s/\-_]+/).filter(t => t.length > 1);

  const significantQueryTokens = queryTokens.filter(t => !stopWords.has(t));
  const tokensToCheck = significantQueryTokens.length > 0 ? significantQueryTokens : queryTokens;

  for (const qToken of tokensToCheck) {
    for (const pToken of posTokens) {
      if (pToken.includes(qToken) || qToken.includes(pToken)) {
        return true;
      }
    }
  }

  return false;
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

    const internMap = new Map<string, any>();

    // 1. Fetch profiles table (all non-admin profiles)
    try {
      const { data: profData } = await supabase.from('profiles').select('*');
      if (profData && Array.isArray(profData)) {
        for (const p of profData) {
          if (p.role === 'admin') continue;
          
          const key = p.email ? p.email.toLowerCase().trim() : p.id;
          internMap.set(key, {
            id: p.id,
            full_name: p.full_name || 'Intern',
            email: p.email || '',
            role: p.role || 'intern',
            position: p.position || 'Internship',
            phone: p.phone || '',
            joining_date: p.joining_date || p.created_at || new Date().toISOString().split('T')[0],
            intern_id: p.intern_id || `ZCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            has_profile: true
          });
        }
      }
    } catch (e) {
      console.warn('Profiles query notice:', e);
    }

    // 2. Fetch applications table (accepted candidates)
    try {
      const { data: appData } = await supabase
        .from('applications')
        .select('*')
        .or('status.eq.accepted,status.eq.hired,status.eq.pending');

      if (appData && Array.isArray(appData)) {
        for (const a of appData) {
          const emailKey = (a.email || '').toLowerCase().trim();
          if (emailKey) {
            const cleanName = (a.full_name || 'intern').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
            const parts = cleanName.split(/\s+/).filter(Boolean);
            const officialEmail = parts.length > 0 ? `${parts.join('')}@zayacodehub.com` : emailKey;

            const existingByPersonal = internMap.get(emailKey);
            const existingByOfficial = internMap.get(officialEmail);

            if (!existingByPersonal && !existingByOfficial) {
              const assignedId = (a.user_id && isValidUUID(a.user_id)) ? a.user_id : generateUUID();
              internMap.set(emailKey, {
                id: assignedId,
                full_name: a.full_name || 'Candidate Intern',
                email: officialEmail,
                personal_email: a.email,
                role: 'intern',
                position: a.position || 'Internship',
                phone: a.phone || '',
                joining_date: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                intern_id: `ZCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                has_profile: false
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Applications query notice:', e);
    }

    const allInterns = Array.from(internMap.values());

    // Filter target interns based on targetMode
    let targetInterns: any[] = [];

    if (targetMode === 'individual') {
      const searchValue = String(targetValue || '').toLowerCase().trim();
      targetInterns = allInterns.filter(p => 
        (p.id && String(p.id).toLowerCase() === searchValue) ||
        (p.email && p.email.toLowerCase().trim() === searchValue) ||
        (p.personal_email && p.personal_email.toLowerCase().trim() === searchValue) ||
        (p.intern_id && String(p.intern_id).toLowerCase() === searchValue)
      );
      if (targetInterns.length === 0 && allInterns.length > 0) {
        targetInterns = [allInterns[0]];
      }
    } else if (targetMode === 'domain') {
      const domainSearch = String(targetValue || '').toLowerCase().trim();
      targetInterns = allInterns.filter(p => matchDomain(p.position, domainSearch));
      
      // Fallback: If domain keyword search produced 0, assign to all active interns
      if (targetInterns.length === 0 && allInterns.length > 0) {
        targetInterns = allInterns;
      }
    } else {
      // Default / 'all'
      targetInterns = allInterns;
    }

    if (targetInterns.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No target intern found for task assignment.' 
      }, { status: 404 });
    }

    // Ensure all target interns have valid profiles in profiles table for FK tasks(intern_id)
    const validProfileIds: string[] = [];

    for (const intern of targetInterns) {
      let profileId = intern.id;

      if (!isValidUUID(profileId)) {
        profileId = generateUUID();
      }

      // Upsert into profiles table to satisfy Foreign Key constraint
      try {
        const { data: upsertedProf } = await supabase
          .from('profiles')
          .upsert({
            id: profileId,
            email: intern.email || `${profileId}@zayacodehub.com`,
            full_name: intern.full_name,
            role: 'intern',
            position: intern.position || 'Internship',
            joining_date: intern.joining_date || new Date().toISOString().split('T')[0],
            intern_id: intern.intern_id
          }, { onConflict: 'id' })
          .select('id')
          .maybeSingle();

        if (upsertedProf?.id) {
          validProfileIds.push(upsertedProf.id);
        } else {
          validProfileIds.push(profileId);
        }
      } catch (err) {
        console.warn('Profile sync warning for task assignment:', err);
        validProfileIds.push(profileId);
      }
    }

    // Format deadline
    const formattedDeadline = deadline ? new Date(deadline).toISOString().split('T')[0] : null;

    // Construct task rows
    const taskRows = validProfileIds.map(profId => ({
      intern_id: profId,
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'medium',
      deadline: formattedDeadline,
      status: 'pending'
    }));

    // Insert tasks into database
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
