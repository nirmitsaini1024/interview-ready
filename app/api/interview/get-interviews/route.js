import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';

export async function GET(req) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Get all interviews using Prisma
    const interviews = await prisma.interview.findMany({
      where: {
        type: 'INTERVIEW'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            clerk_id: true,
            img_url: true,
            email: true,
            created_at: true
          }
        }
      },
      orderBy: {
        created_date: 'desc'
      }
    });

    console.log("interviews length::: ", interviews?.length);

    // Convert BigInt to string for JSON serialization
    const serializedInterviews = interviews.map(interview => ({
      ...interview,
      id: interview.id.toString(),
      user: interview.user ? {
        ...interview.user,
        id: interview.user.id.toString()
      } : null
    }));

    return NextResponse.json({ state: true, data: serializedInterviews, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error' }, { status: 500 });
  }
}