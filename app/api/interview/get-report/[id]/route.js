import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';

export async function GET(req, context) {
  try {
    const param = await context.params;
    const reportId = param.id;

    // Get report by ID (no authentication required)
    const { data: report, error } = await supabase
      .from('ai_reports')
      .select(`
        *,
        attempt:interview_attempts(*),
        user:users(*)
      `)
      .eq('id', reportId)
      .single();

    if (error) {
      return NextResponse.json({ state: false, error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ state: true, data: report, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error' }, { status: 500 });
  }
}