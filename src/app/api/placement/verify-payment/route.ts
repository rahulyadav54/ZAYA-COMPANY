import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

type VerifyRequestBody = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  access_token: string;
};

export async function POST(req: Request) {
  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const body = (await req.json()) as VerifyRequestBody;
    if (!body.access_token) {
      return NextResponse.json({ success: false, error: 'Missing access token' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseService);
    const { data: purchase } = await supabaseAdmin
      .from('placement_purchases')
      .select('id, user_id, guest_access_token, status, razorpay_order_id')
      .eq('razorpay_order_id', body.razorpay_order_id)
      .maybeSingle();

    if (!purchase) {
      return NextResponse.json({ success: false, error: 'Purchase record not found' }, { status: 404 });
    }

    if (purchase.guest_access_token && purchase.guest_access_token !== body.access_token) {
      return NextResponse.json({ success: false, error: 'Access token mismatch' }, { status: 403 });
    }

    const authHeader = req.headers.get('Authorization');
    if (authHeader && purchase.user_id) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseUser = createClient(supabaseUrl, supabaseAnon);
      const { data: authData } = await supabaseUser.auth.getUser(token);
      if (!authData.user || authData.user.id !== purchase.user_id) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const bodyString = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature !== body.razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    if (purchase.status === 'paid') {
      return NextResponse.json({ success: true, alreadyPaid: true, access_token: body.access_token });
    }

    const { error: updateError } = await supabaseAdmin
      .from('placement_purchases')
      .update({
        status: 'paid',
        razorpay_payment_id: body.razorpay_payment_id,
        guest_access_token: body.access_token,
      })
      .eq('id', purchase.id);

    if (updateError) {
      console.error('DB update error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 });
    }

    return NextResponse.json({ success: true, access_token: body.access_token });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
