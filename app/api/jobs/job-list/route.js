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

    // Query the database for jobs/interviews using Prisma
    const jobs = await prisma.interview.findMany({
      where: {
        type: 'JOB'
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

    console.log("jobs length::: ", jobs?.length);

    // Convert BigInt to string for JSON serialization
    const serializedJobs = jobs.map(job => ({
      ...job,
      id: job.id.toString(),
      user: job.user ? {
        ...job.user,
        id: job.user.id.toString()
      } : null
    }));

    return NextResponse.json({ state: true, data: serializedJobs, message: "Success" }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: "Failed" }, { status: 500 });
  }
}