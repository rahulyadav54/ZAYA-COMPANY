import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function verifyAdmin(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabaseUser = createClient(supabaseUrl, supabaseAnon);
  const { data: { user } } = await supabaseUser.auth.getUser(token);
  if (!user) return null;

  const supabaseAdmin = createClient(supabaseUrl, supabaseService);
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return null;
  return { user, supabaseAdmin };
}

// GET — list all companies (admin sees all including drive_link)
export async function GET(req: Request) {
  const auth = await verifyAdmin(req.headers.get('Authorization'));
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { supabaseAdmin } = auth;
  const { data, error } = await supabaseAdmin
    .from('placement_companies')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — create company
export async function POST(req: Request) {
  const auth = await verifyAdmin(req.headers.get('Authorization'));
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { supabaseAdmin } = auth;
  const body = await req.json();
  const { company_name, company_image, drive_link, description, category, status, display_order } = body;

  if (!company_name || !drive_link) {
    return NextResponse.json({ error: 'company_name and drive_link are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('placement_companies')
    .insert({ company_name, company_image, drive_link, description, category, status, display_order })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT — update company
export async function PUT(req: Request) {
  const auth = await verifyAdmin(req.headers.get('Authorization'));
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { supabaseAdmin } = auth;
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('placement_companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — delete company
export async function DELETE(req: Request) {
  const auth = await verifyAdmin(req.headers.get('Authorization'));
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { supabaseAdmin } = auth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('placement_companies')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
