import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';

export async function POST(req) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    // For demo purposes, use a hardcoded user ID
    const userId = 'demo_user_123';

    // Validate request body
    const { currentDuration, interviewId, status } = await req.json();

    // Fetch interview using Prisma
    const interviewData = await prisma.interview.findUnique({
      where: { id: BigInt(interviewId) }
    });

    console.log("+++++++++++++ interviewData ++++++++++++++");
    console.log(interviewData);

    if (!interviewData) {
      return NextResponse.json({ state: false, error: 'Interview not found', message: "Failed" }, { status: 404 });
    }

    const current = Number(interviewData?.current_duration || 0);
    const newDuration = Number(currentDuration || 0);
    const new_current_duration = current + newDuration;
    
    console.log("new_current_duration", new_current_duration);
    console.log("status", status);

    // Update interview data using Prisma
    const updatedInterview = await prisma.interview.update({
      where: { id: BigInt(interviewId) },
      data: { 
        current_duration: new_current_duration, 
        status: status 
      }
    });

    console.log("============== update interview ================");
    console.log(updatedInterview);

    // Convert BigInt to string for JSON serialization
    const serializedInterview = {
      ...updatedInterview,
      id: updatedInterview.id.toString()
    };

    // Success
    return NextResponse.json({ state: true, data: serializedInterview, message: 'Updated Successfully' }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Server Error', message: 'Something went wrong' }, { status: 500 });
  }
}

