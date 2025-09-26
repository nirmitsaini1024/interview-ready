import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/client';

/**
 * Create user directly using Clerk session without webhooks
 * This is called whenever a user hits any protected route
 */
export async function createUserDirectly() {
  try {
    // Get current authenticated Clerk user
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: 'Not authenticated', user: null };
    }

    // Check if already exists
    let userRecord = await prisma.user.findUnique({
      where: { clerk_id: clerkUser.id }
    });

    // If exists, return the user
    if (userRecord) {
      console.log('👤 User already exists in database');
      return { success: true, user: userRecord };
    }

    // Create the user directly
    console.log('🆕 Creating new user directly from Clerk session...');
    
    const newUser = await prisma.user.create({
      data: {
        clerk_id: clerkUser.id,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 
               clerkUser.username || 
               'User',
        username: clerkUser.username || null,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
        img_url: clerkUser.imageUrl || null,
      }
    });

    // Also create initial usage record
    await prisma.usage.create({
      data: {
        user_id: clerkUser.id,
        tokens_used: 0,
        video_minutes_used: 0,
      }
    });

    console.log('✅ User created directly:', newUser.id);
    return { success: true, user: newUser };

  } catch (err) {
    console.error('❌ Error creating user directly:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to create user',
      user: null 
    };
  }
}

/**
 * Middleware-style function to ensure user exists for any API route
 */
export async function requireUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: 'Not authenticated', user: null };
    }

    const result = await createUserDirectly();
    return result;

  } catch (err) {
    console.error('❌ Error in requireUser:', err);
    return { success: false, error: err.message, user: null };
  }
}
