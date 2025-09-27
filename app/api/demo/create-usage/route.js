import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(req) {
  try {
    // Create demo usage data for the demo user
    const demoUser = await prisma.user.findUnique({
      where: { clerk_id: 'demo_user_123' }
    });

    if (!demoUser) {
      return NextResponse.json({ 
        state: false, 
        error: 'Demo user not found' 
      }, { status: 404 });
    }

    // Check if usage already exists
    const existingUsage = await prisma.usage.findFirst({
      where: { user_id: 'demo_user_123' }
    });

    if (existingUsage) {
      return NextResponse.json({ 
        state: true, 
        data: existingUsage, 
        message: 'Usage already exists' 
      }, { status: 200 });
    }

    // Create new usage record
    const usage = await prisma.usage.create({
      data: {
        user_id: 'demo_user_123',
        tokens_used: 0,
        video_minutes_used: 0
      }
    });

    return NextResponse.json({ 
      state: true, 
      data: usage, 
      message: 'Demo usage created successfully' 
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
