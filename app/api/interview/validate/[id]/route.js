import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { prisma } from '@/lib/prisma/client';
import { NextResponse } from 'next/server';

export async function GET(req, context) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const param = await context.params;
    const interviewId = param.id;

    console.log('Validating interview ID:', interviewId);

    if (!interviewId || interviewId === 'undefined') {
      return NextResponse.json({
        state: false,
        error: 'Invalid interview ID provided',
        message: 'Please provide a valid interview ID'
      }, { status: 400 });
    }

    const userId = 'demo_user_123';

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { clerk_id: userId }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            clerk_id: userId,
            name: 'Demo User',
            username: 'demo_user',
            email: 'demo@example.com'
          }
        });
      }
    } catch (userError) {
      console.log('User validation failed, proceeding without user check');
    }

    const interview = await prisma.interview.findUnique({
      where: { id: BigInt(interviewId) }
    });

    console.log('Interview found:', interview ? 'Yes' : 'No');

    if (!interview) {
      return NextResponse.json({
        state: false,
        error: 'Interview not found',
        message: 'The requested interview does not exist'
      }, { status: 404 });
    }

    const serializedInterview = {
      ...interview,
      id: interview.id.toString()
    };

    return NextResponse.json({
      state: true,
      data: serializedInterview,
      message: "Interview validated successfully"
    }, { status: 200 });

  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({
      state: false,
      error: 'Internal server error',
      message: "Failed to validate interview",
      details: err.message
    }, { status: 500 });
  }
}
