import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(req) {
  try {
    const { formData, questions, college_interview_data } = await req.json();

    console.log('Creating interview with data:', { formData, questions, college_interview_data });

    // First, create or find the demo user
    let demoUser;
    try {
      demoUser = await prisma.user.findUnique({
        where: { clerk_id: 'demo_user_123' }
      });
      
      if (!demoUser) {
        demoUser = await prisma.user.create({
          data: {
            clerk_id: 'demo_user_123',
            name: 'Demo User',
            username: 'demo_user',
            email: 'demo@example.com'
          }
        });
      }
    } catch (userError) {
      console.log('User creation failed, proceeding without user_id');
    }

    // Create interview using Prisma (no authentication required)
    const interview = await prisma.interview.create({
      data: {
        user_id: demoUser ? 'demo_user_123' : null,
        interview_name: formData?.interview_name || 'Demo Interview',
        company: formData?.company || 'Demo Company',
        position: formData?.position || 'Demo Position',
        location: formData?.location || 'Remote',
        difficulty_level: formData?.difficulty_level || 'Medium',
        experience: formData?.experience || 'Mid-level',
        duration: parseInt(formData?.duration) || 30,
        interview_style: formData?.interview_style || 'Technical',
        job_description: formData?.job_description || 'Demo job description',
        type: 'INTERVIEW',
        status: 'ACTIVE'
      }
    });

    console.log('Interview created successfully:', interview);
    
    // Convert BigInt to string for JSON serialization
    const serializedInterview = {
      ...interview,
      id: interview.id.toString()
    };
    
    console.log('Returning interview with ID:', serializedInterview.id);
    
    return NextResponse.json({ state: true, data: serializedInterview, message: 'Interview created successfully' }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ 
      state: false, 
      error: 'Internal Server Error',
      details: err.message 
    }, { status: 500 });
  }
}