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

    const { interviewId, interview_attempt_id, score, recommendation, report, duration } = await req.json();

    // Normalize and clamp score 0-100
    const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));

    console.log('Saving report with data:', { interviewId, interview_attempt_id, score, recommendation, report, duration });

    const userId = 'demo_user_123';

    const aiReport = await prisma.aiReport.create({
      data: {
        attempt_id: BigInt(interview_attempt_id),
        user_id: userId,
        report_content: JSON.stringify({
          score: normalizedScore,
          recommendation: recommendation,
          report: report,
          duration: duration,
          interview_id: interviewId
        }),
        report_type: 'GENERAL'
      }
    });

    console.log('Report saved successfully:', aiReport);

    const serializedReport = {
      ...aiReport,
      id: aiReport.id.toString(),
      attempt_id: aiReport.attempt_id.toString()
    };

    return NextResponse.json({
      state: true,
      data: serializedReport,
      message: 'Report saved successfully'
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