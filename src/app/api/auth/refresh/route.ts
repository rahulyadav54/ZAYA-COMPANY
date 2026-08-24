import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: false, error: 'Authentication is temporarily unavailable.' }, { status: 503 });
  }
  try {
    const { refreshToken } = await request.json();
    if (typeof refreshToken !== 'string' || !refreshToken) {
      return NextResponse.json({ success: false, error: 'A refresh token is required.' }, { status: 400 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session || !data.user) {
      return NextResponse.json({ success: false, error: 'Session is invalid or expired.' }, { status: 401 });
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    return NextResponse.json({ success: true, session: data.session, user: data.user, role: profile?.role === 'admin' ? 'admin' : 'intern' });
  } catch (error) {
    console.error('Token refresh failed:', error);
    return NextResponse.json({ success: false, error: 'Authentication is temporarily unavailable.' }, { status: 500 });
  }
}
