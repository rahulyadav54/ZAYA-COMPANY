import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids) ? body.ids : body.id ? [body.id] : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No submission IDs provided' }, { status: 400 });
    }

    // Perform Hard Delete in Supabase Database
    const { error } = await supabase
      .from('exam_submissions')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Delete submissions database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (err: any) {
    console.error('Delete submissions API exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete submission' }, { status: 500 });
  }
}
