import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/client';

export async function ensureUserExists() {
  try {
    // Get authenticated Clerk user
    const user = await currentUser();
    if (!user) return { exists: false, error: 'Not authenticated', user: null };
    
    const userId = user.id;
    
    // Check if user exists in database
    const userRecord = await prisma.user.findUnique({
      where: { clerk_id: userId }
    });

    // If user exists, return them
    if (userRecord) {
      return { exists: true, user: userRecord };
    }

    // If user doesn't exist, create them
    console.log('🔧 User not found in database, creating them automatically...');
    
    const newUser = await prisma.user.create({
      data: {
        clerk_id: userId,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown',
        username: user.username || null,
        email: user.emailAddresses?.[0]?.emailAddress || null,
        img_url: user.imageUrl || null,
      }
    });

    console.log('✅ User created automatically:', newUser);
    return { exists: true, user: newUser };

  } catch (err) {
    console.error('❌ Error ensuring user exists:', err);
    // Handle unique constraint violations (user already exists)
    if (err.code === 'P2002') {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { clerk_id: userId }
        });
        return { exists: true, user: existingUser };
      } catch (findErr) {
        return { exists: false, error: 'Failed to handle user conflict', user: null };
      }
    }
    return { exists: false, error: err.message, user: null };
  }
}
