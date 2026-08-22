import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const PLACEMENT_AMOUNT_INR = 199;

type OrderRequestBody = {
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
  access_token?: string;
};

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const authHeader = req.headers.get('Authorization');
    let user: { id: string; email?: string | null } | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseUser = createClient(supabaseUrl, supabaseAnon);
      const { data: authData, error: authError } = await supabaseUser.auth.getUser(token);
      if (!authError && authData.user) {
        user = authData.user;
      }
    }

    const body = (await req.json()) as OrderRequestBody;
    const guestEmail = body.guest_email?.trim().toLowerCase() || '';
    const guestName = body.guest_name?.trim() || '';
    const guestPhone = body.guest_phone?.trim() || '';
    const accessToken = body.access_token?.trim() || crypto.randomUUID();

    if (!user && (!guestName || !guestPhone || !guestEmail)) {
      return NextResponse.json({ error: 'Name, phone, and email are required for guest checkout' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseService);

    const existingQuery = user
      ? supabaseAdmin.from('placement_purchases').select('status, guest_access_token').eq('user_id', user.id).maybeSingle()
      : supabaseAdmin.from('placement_purchases').select('status, guest_access_token').eq('guest_access_token', accessToken).maybeSingle();

    const { data: existing } = await existingQuery;

    if (existing?.status === 'paid') {
      return NextResponse.json({ alreadyPaid: true, access_token: existing.guest_access_token || accessToken });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount: PLACEMENT_AMOUNT_INR * 100,
      currency: 'INR',
      receipt: `placement_${(user?.id || guestEmail || 'guest').slice(0, 24)}_${Date.now()}`,
      notes: {
        user_id: user?.id || '',
        guest_email: guestEmail,
        guest_name: guestName,
        guest_phone: guestPhone,
        access_token: accessToken,
        purpose: 'placement_prep_access',
      },
    });

    const purchaseData = {
      user_id: user?.id || null,
      guest_email: guestEmail || null,
      guest_name: guestName || null,
      guest_phone: guestPhone || null,
      guest_access_token: accessToken,
      amount_inr: PLACEMENT_AMOUNT_INR,
      razorpay_order_id: order.id,
      status: 'pending',
    };

    if (user) {
      await supabaseAdmin
        .from('placement_purchases')
        .upsert(purchaseData, { onConflict: 'user_id' });
    } else {
      await supabaseAdmin
        .from('placement_purchases')
        .upsert(purchaseData, { onConflict: 'guest_access_token' });
    }

    return NextResponse.json({ ...order, access_token: accessToken });
  } catch (error) {
    console.error('Placement order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
