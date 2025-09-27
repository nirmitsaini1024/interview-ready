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

    // For demo purposes, use a hardcoded recruiter user ID
    const recruiterId = 'demo_user_123';

    // Get all interview attempts (both from job postings and direct interviews)
    // For demo purposes, show all interview attempts since we don't have separate recruiters
    const interviewAttempts = await prisma.interviewAttempt.findMany({
      include: {
        interview: {
          select: {
            id: true,
            interview_name: true,
            company: true,
            position: true,
            location: true,
            job_description: true,
            created_date: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            img_url: true,
            designation: true,
            experience: true
          }
        },
        ai_reports: {
          select: {
            id: true,
            report_content: true,
            report_type: true,
            created_at: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log("Found interview attempts:", interviewAttempts.length);

    // Convert BigInt to string for JSON serialization
    const serializedAttempts = interviewAttempts.map(attempt => ({
      ...attempt,
      id: attempt.id.toString(),
      interview_id: attempt.interview_id?.toString(),
      interview: attempt.interview ? {
        ...attempt.interview,
        id: attempt.interview.id.toString()
      } : null,
      user: attempt.user ? {
        ...attempt.user,
        id: attempt.user.id.toString()
      } : null,
      ai_reports: attempt.ai_reports.map(report => ({
        ...report,
        id: report.id.toString()
      }))
    }));

    return NextResponse.json({ 
      state: true, 
      data: serializedAttempts, 
      message: "Candidate performance data fetched successfully" 
    }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ 
      state: false, 
      error: 'Internal Server Error', 
      message: "Failed to fetch candidate performance" 
    }, { status: 500 });
  }
}
