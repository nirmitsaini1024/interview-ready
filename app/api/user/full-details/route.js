import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import supabase from '@/lib/supabase/client';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { ensureUserExists } from '@/lib/utils/ensureUserExists';

 
export async function GET(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    // Step 1: Get authenticated Clerk user
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ state: false, error: 'Unauthorized', message: "Failed" }, { status: 401 });
    }

    // Step 3: Ensure user exists in Supabase (auto-create if needed)
    const { exists, user: userRecord, error: ensureError } = await ensureUserExists();

    if (!exists || !userRecord) {
      return NextResponse.json({ state: false, error: ensureError || 'Cannot create user', message: "Failed" }, { status: 403 });
    }

    return NextResponse.json({ state: true, data: userRecord, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: "Failed" }, { status: 500 });
  }
}