import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnon);
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    // Signature is valid — use service role to update purchase record securely
    const supabaseAdmin = createClient(supabaseUrl, supabaseService);

    // Check if already paid (idempotent)
    const { data: existing } = await supabaseAdmin
      .from('placement_purchases')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (existing?.status === 'paid') {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    const { error: updateError } = await supabaseAdmin
      .from('placement_purchases')
      .upsert({
        user_id: user.id,
        amount_inr: 199,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'paid',
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('DB update error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
