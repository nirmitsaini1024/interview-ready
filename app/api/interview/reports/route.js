import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(req) {
  try {
    // Get all reports using Prisma
    const reports = await prisma.aiReport.findMany({
      include: {
        attempt: {
          include: {
            user: true,
            interview: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Serialize BigInt IDs to strings for JSON response
    const serializedReports = reports.map(report => ({
      ...report,
      id: report.id.toString(),
      attempt_id: report.attempt_id.toString(),
      user_id: report.user_id,
      created_at: report.created_at,
      updated_at: report.updated_at,
      attempt: report.attempt ? {
        ...report.attempt,
        id: report.attempt.id.toString(),
        user_id: report.attempt.user_id,
        interview_id: report.attempt.interview_id.toString(),
        created_at: report.attempt.created_at,
        updated_at: report.attempt.updated_at,
        interview: report.attempt.interview ? {
          ...report.attempt.interview,
          id: report.attempt.interview.id.toString(),
          user_id: report.attempt.interview.user_id,
          created_date: report.attempt.interview.created_date,
          expiry_date: report.attempt.interview.expiry_date
        } : null
      } : null
    }));

    return NextResponse.json({ state: true, data: serializedReports, message: 'Success' }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error' }, { status: 500 });
  }
}