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

    const { interview_id, started_at, status, chat_conversation } = await req.json();

    console.log('Submitting interview attempt:', { interview_id, started_at, status, chat_conversation });

    // For demo purposes, use a hardcoded user ID
    const userId = 'demo_user_123';

    // Submit interview attempt using Prisma
    const attempt = await prisma.interviewAttempt.create({
      data: {
        user_id: userId,
        interview_id: interview_id ? BigInt(interview_id) : null,
        started_at: started_at ? new Date(started_at) : new Date(),
        completed_at: new Date(),
        status: status || 'COMPLETED',
        chat_conversation: chat_conversation
      }
    });

    console.log('Interview attempt created:', attempt);

    // Convert BigInt to string for JSON serialization
    const serializedAttempt = {
      ...attempt,
      id: attempt.id.toString(),
      interview_id: attempt.interview_id?.toString()
    };

    return NextResponse.json({ 
      state: true, 
      data: serializedAttempt, 
      message: 'Attempt submitted successfully' 
    }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ 
      state: false, 
      error: 'Internal Server Error', 
      details: err.message 
    }, { status: 500 });
  }
}