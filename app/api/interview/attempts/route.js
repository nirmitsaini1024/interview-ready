import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isRateLimited } from '@/lib/utils/rateLimiter';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { ensureUserExists } from '@/lib/utils/ensureUserExists';
import { prisma } from '@/lib/prisma/client';



export async function GET(req) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'anonymous';

        const { success } = await ratelimit.limit(ip);

        if (!success) {
            return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
        }
        // 1. Rate limiting (basic IP-based)
        const ip_address = req.headers.get('x-forwarded-for') || 'localhost';
        if (isRateLimited(ip_address)) {
            return NextResponse.json({ state: false, error: 'Too many requests', message: 'Rate limit exceeded' }, { status: 429 });
        }

        // 2. Get authenticated user
        const user = await currentUser();

        console.log("************** user ********")
        console.log(user)

        const userId = user?.id;

        if (!userId) {
            return NextResponse.json({ state: false, error: 'Unauthorized', message: 'User not authenticated' }, { status: 401 });
        }

        // 3. Ensure user exists in Supabase (auto-create if needed)
        const { exists, user: userRecord, error: ensureError } = await ensureUserExists();

        if (!exists || !userRecord) {
            return NextResponse.json({ state: false, error: ensureError || 'Cannot create user', message: 'Forbidden' }, { status: 403 });
        }

        // 5. Get interview attempts data using Prisma
        const data = await prisma.interviewAttempt.findMany({
            where: {
                user_id: userId
            },
            include: {
                interview: {
                    select: {
                        id: true,
                        interview_name: true,
                        interview_time: true,
                        company: true,
                        company_logo: true,
                        position: true,
                        location: true,
                        difficulty_level: true,
                        experience: true,
                        status: true,
                        duration: true,
                        interview_style: true,
                        job_description: true,
                        interview_link: true,
                        expiry_date: true,
                        salary: true,
                        recruiter_title: true,
                        employment_type: true,
                        job_type: true,
                        type: true,
                        current_duration: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        console.log("Interview Attempts with Details:", data);

        // 6. Success
        return NextResponse.json({ state: true, data, message: 'Updated Successfully' }, { status: 201 });
    } catch (err) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ state: false, error: 'Server Error', message: 'Something went wrong' }, { status: 500 });
    }
}

