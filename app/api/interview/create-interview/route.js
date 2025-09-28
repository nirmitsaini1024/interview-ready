import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(req) {
  try {
    const { formData, questions, college_interview_data } = await req.json();
    
    // Extract resume from college_interview_data
    const resumeData = college_interview_data?.resume || null;

    console.log('Creating interview with data:', { formData, questions, college_interview_data });

    // Always generate personalized questions from resume
    let finalQuestions = null;
    if (resumeData) {
      console.log('Generating personalized questions from resume...');
      try {
        const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/portal/generate-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: formData?.company || 'frontend-development',
            resume: resumeData,
            questionsCount: 5
          })
        });
        
        if (generateResponse.ok) {
          const genResult = await generateResponse.json();
          if (genResult.state && genResult.data) {
            finalQuestions = genResult.data;
            console.log('Generated personalized questions from resume:', finalQuestions);
          }
        }
      } catch (error) {
        console.error('Error generating questions:', error);
      }
    }
    
    // Use generated questions or fallback to provided questions
    if (!finalQuestions) {
      finalQuestions = questions;
      console.log('Using fallback questions:', finalQuestions);
    }

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
        resume: resumeData,
        questions: finalQuestions,
        type: 'INTERVIEW',
        status: 'ACTIVE'
      }
    });

    console.log('Interview created successfully:', interview);

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