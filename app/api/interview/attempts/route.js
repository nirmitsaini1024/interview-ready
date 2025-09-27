import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';

export async function GET(req) {
  try {

    const { data: attempts, error } = await supabase
      .from('interview_attempts')
      .select(`
        *,
        user:users(*),
        interview:interviews(*)
      `);

    if (error) {
      return NextResponse.json({ state: false, error: 'Failed to fetch attempts' }, { status: 500 });
    }

    return NextResponse.json({ state: true, data: attempts, message: 'Success' }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error' }, { status: 500 });
  }
}