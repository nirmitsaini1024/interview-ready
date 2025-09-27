import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';

export async function POST(req) {
  try {
    const { userId, tokens, videoMinutes } = await req.json();

    const { data, error } = await supabase
      .from('usage')
      .insert({
        user_id: userId || 'demo_user_123',
        tokens_used: tokens || 0,
        video_minutes_used: videoMinutes || 0
      });

    if (error) {
      return NextResponse.json({ state: false, error: 'Failed to add usage' }, { status: 500 });
    }

    return NextResponse.json({ state: true, data, message: 'Usage added successfully' }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error' }, { status: 500 });
  }
}