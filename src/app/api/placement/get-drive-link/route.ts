import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('company_id');
    if (!companyId) {
      return NextResponse.json({ error: 'Missing company_id' }, { status: 400 });
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

    // Check payment status using service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseService);
    const { data: purchase } = await supabaseAdmin
      .from('placement_purchases')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (!purchase || purchase.status !== 'paid') {
      return NextResponse.json({ error: 'Access denied. Purchase placement access first.' }, { status: 403 });
    }

    // User is paid — fetch the drive link securely
    const { data: company, error: companyError } = await supabaseAdmin
      .from('placement_companies')
      .select('drive_link, company_name')
      .eq('id', companyId)
      .eq('status', 'active')
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ drive_link: company.drive_link, company_name: company.company_name });
  } catch (error) {
    console.error('Get drive link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
