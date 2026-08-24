import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Authentication is temporarily unavailable.' }, { status: 503 });
  }
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return NextResponse.json({ error: 'Session is invalid or expired.' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).maybeSingle();
    return NextResponse.json({ user: authData.user, role: profile?.role === 'admin' ? 'admin' : 'intern' });
  } catch (error) {
    console.error('Session validation failed:', error);
    return NextResponse.json({ error: 'Authentication is temporarily unavailable.' }, { status: 500 });
  }
}
