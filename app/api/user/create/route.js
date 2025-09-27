import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(request) {
  try {
    const inputData = await request.json();
    console.log('Incoming Data:', inputData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerk_id: inputData.clerk_id }
    });

    if (existingUser) {
      // Convert BigInt to string for JSON serialization
      const serializedExistingUser = {
        ...existingUser,
        id: existingUser.id.toString(),
      };
      
      return NextResponse.json(
        { state: true, data: serializedExistingUser, message: 'User already exists' },
        { status: 200 }
      );
    }

    // 1. Add user to 'users' table
    const userData = await prisma.user.create({
      data: {
        clerk_id: inputData.clerk_id,
        name: inputData.name,
        username: inputData.username || 'username',
        email: inputData.email,
        img_url: inputData.img_url,
      }
    });

    // 2. Add usage record for this user
    const usageData = await prisma.usage.create({
      data: {
        user_id: inputData.clerk_id,
        tokens_used: 0,
        video_minutes_used: 0,
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedUserData = {
      ...userData,
      id: userData.id.toString(),
    };

    return NextResponse.json(
      {
        state: true,
        data: serializedUserData,
        message: 'User and usage created successfully',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Server Error:', err);
    return NextResponse.json(
      { state: false, error: err.message || 'Internal Server Error', message: 'Failed' },
      { status: 500 }
    );
  }
}
