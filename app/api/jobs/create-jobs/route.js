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

    const userId = 'demo_user_123';

    const { formData } = await req.json();

    let demoUser;
    try {
      demoUser = await prisma.user.findUnique({
        where: { clerk_id: userId }
      });

      if (!demoUser) {
        demoUser = await prisma.user.create({
          data: {
            clerk_id: userId,
            name: 'Demo User',
            username: 'demo_user',
            email: 'demo@example.com'
          }
        });
      }
    } catch (userError) {
      console.log('User creation failed, proceeding without user_id');
    }

    const job = await prisma.interview.create({
      data: {
        user_id: demoUser ? userId : null,
        interview_name: formData?.jobTitle || 'Demo Job',
        company: formData?.companyName || 'Demo Company',
        position: formData?.jobTitle || 'Demo Position',
        location: formData?.location || 'Remote',
        job_description: formData?.jobDescription || 'Demo job description',
        salary: formData?.salary || 'Not specified',
        recruiter_title: formData?.recruiterTitle || 'Recruiter',
        employment_type: formData?.employmentType || 'Full-time',
        job_type: formData?.jobType || 'Remote',
        difficulty_level: formData?.difficulty || 'Medium',
        experience: formData?.experience || 'Mid-level',
        type: 'JOB',
        status: 'ACTIVE',
        duration: 60, // Default duration in minutes
        interview_style: 'Technical'
      }
    });

    console.log("========== Job Created =============");
    console.log(job);

    const serializedJob = {
      ...job,
      id: job.id.toString()
    };

    return NextResponse.json({ state: true, data: serializedJob, message: 'Job created successfully' }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error', message: 'Failed' }, { status: 500 });
  }
}

