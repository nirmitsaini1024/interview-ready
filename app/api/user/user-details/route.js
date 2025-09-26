import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { requireUser } from '@/lib/utils/createUserDirectly';

 
export async function GET(req, context) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';

    const { success: rateLimitSuccess } = await ratelimit.limit(ip);

    if (!rateLimitSuccess) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    // Get reportId from params
    const param = await context.params;
    const reportId = param.id;
    console.log('📊 Report ID:', reportId);

    // Ensure user exists (creates automatically if needed)
    const { success, user: userRecord, error } = await requireUser();

    if (!success || !userRecord) {
      return NextResponse.json({ 
        state: false, 
        error: error || 'Cannot access user data', 
        message: "Failed" 
      }, { status: 403 });
    }

    return NextResponse.json({ state: true, data: userRecord, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: "Failed" }, { status: 500 });
  }
}