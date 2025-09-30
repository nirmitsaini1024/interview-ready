import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { 
      interviewId, 
      answers, 
      totalScore, 
      recommendation, 
      detailedAnalysis,
      strengths,
      weaknesses,
      improvementAreas 
    } = await req.json();

    if (!interviewId || !answers) {
      return NextResponse.json(
        { state: false, error: 'Interview ID and answers are required' },
        { status: 400 }
      );
    }

    const userId = 'demo_user_123';

    // Create interview attempt
    const attempt = await prisma.interviewAttempt.create({
      data: {
        user_id: userId,
        interview_id: BigInt(interviewId),
        started_at: new Date(),
        completed_at: new Date(),
        status: 'COMPLETED',
        chat_conversation: answers,
        interview_attempt: 1
      }
    });

    // Create AI report with coding interview results
    const aiReport = await prisma.aiReport.create({
      data: {
        attempt_id: BigInt(attempt.id),
        user_id: userId,
        report_content: JSON.stringify({
          type: 'coding_interview',
          totalScore: totalScore || 0,
          recommendation: recommendation || 'No recommendation provided',
          detailedAnalysis: detailedAnalysis || 'No detailed analysis provided',
          strengths: strengths || [],
          weaknesses: weaknesses || [],
          improvementAreas: improvementAreas || [],
          answers: answers,
          interviewId: interviewId
        }),
        report_type: 'CODING_INTERVIEW'
      }
    });

    console.log('Coding interview results saved successfully:', { attempt, aiReport });

    const serializedAttempt = {
      ...attempt,
      id: attempt.id.toString(),
      interview_id: attempt.interview_id?.toString()
    };

    const serializedReport = {
      ...aiReport,
      id: aiReport.id.toString(),
      attempt_id: aiReport.attempt_id?.toString()
    };

    return NextResponse.json({
      state: true,
      data: {
        attempt: serializedAttempt,
        report: serializedReport
      },
      message: 'Coding interview results saved successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving coding interview results:', error);
    return NextResponse.json({
      state: false,
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}



