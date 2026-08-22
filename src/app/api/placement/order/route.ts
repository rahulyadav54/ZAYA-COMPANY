import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const PLACEMENT_AMOUNT_INR = 199;

export async function POST(req: Request) {
  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Verify the user token
    const supabaseUser = createClient(supabaseUrl, supabaseAnon);
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already paid — prevent duplicate orders
    const supabaseAdmin = createClient(supabaseUrl, supabaseService);
    const { data: existing } = await supabaseAdmin
      .from('placement_purchases')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (existing?.status === 'paid') {
      return NextResponse.json({ alreadyPaid: true });
    }

    // Create Razorpay order
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount: PLACEMENT_AMOUNT_INR * 100, // paise
      currency: 'INR',
      receipt: `placement_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id, purpose: 'placement_prep_access' },
    });

    // Create a pending purchase record
    await supabaseAdmin
      .from('placement_purchases')
      .upsert({
        user_id: user.id,
        amount_inr: PLACEMENT_AMOUNT_INR,
        razorpay_order_id: order.id,
        status: 'pending',
      }, { onConflict: 'user_id' });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Placement order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
