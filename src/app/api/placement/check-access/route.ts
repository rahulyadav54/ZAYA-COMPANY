import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token') || req.headers.get('X-Placement-Token') || '';
    const authHeader = req.headers.get('Authorization');

    const supabaseAdmin = createClient(supabaseUrl, supabaseService);

    if (authHeader) {
      const bearer = authHeader.replace('Bearer ', '');
      const supabaseUser = createClient(supabaseUrl, supabaseAnon);
      const { data: authData } = await supabaseUser.auth.getUser(bearer);
      if (!authData.user) {
        return NextResponse.json({ hasAccess: false }, { status: 401 });
      }

      const { data: purchase } = await supabaseAdmin
        .from('placement_purchases')
        .select('status, guest_access_token, guest_email, guest_name')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      return NextResponse.json({
        hasAccess: purchase?.status === 'paid',
        access_token: purchase?.guest_access_token || null,
        guest_email: purchase?.guest_email || null,
        guest_name: purchase?.guest_name || null,
      });
    }

    if (!token) {
      return NextResponse.json({ hasAccess: false }, { status: 400 });
    }

    const { data: purchase } = await supabaseAdmin
      .from('placement_purchases')
      .select('status, guest_access_token, guest_email, guest_name, razorpay_payment_id')
      .eq('guest_access_token', token)
      .maybeSingle();

    if (!purchase) {
      return NextResponse.json({ hasAccess: false }, { status: 404 });
    }

    return NextResponse.json({
      hasAccess: purchase.status === 'paid',
      access_token: purchase.guest_access_token,
      guest_email: purchase.guest_email,
      guest_name: purchase.guest_name,
      payment_id: purchase.razorpay_payment_id,
    });
  } catch (error) {
    console.error('Check access error:', error);
    return NextResponse.json({ hasAccess: false }, { status: 500 });
  }
}
