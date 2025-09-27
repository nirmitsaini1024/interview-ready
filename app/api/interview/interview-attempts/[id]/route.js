import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';

export async function GET(req, context) {
  try {
    const param = await context.params;
    const interviewId = param.id;

    const { data: reports, error } = await supabase
      .from('ai_reports')
      .select(`
        id,
        recommendation,
        score,
        created_at,
        duration,
        report,
        interview_id,
        interview_attempts (
          id,
          started_at,
          completed_at,
          status,
          chat_conversation,
          users (
            *
          )
        )
      `)
      .eq('interview_id', interviewId);

    console.log(reports)

    if (error) {
      return NextResponse.json({ state: false, error: 'Failed to fetch interview_attempts' }, { status: 500 });
    }

    return NextResponse.json({ state: true, data: reports, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error' }, { status: 500 });
  }
}