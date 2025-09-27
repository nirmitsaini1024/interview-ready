import { prisma } from './client';

/**
 * Find a single user by clerk_id with optional auto-creation
 */
export async function findUserByClerkId(clerkId, autoCreate = false) {
  try {
    let user = await prisma.user.findUnique({
      where: { clerk_id: clerkId }
    });

    if (!user && autoCreate) {
      // Create a demo user since we removed authentication
      user = await prisma.user.create({
        data: {
          clerk_id: clerkId,
          name: 'Demo User',
          username: 'demo_user',
          email: 'demo@example.com',
          img_url: null,
        }
      });
    }

    return user;
  } catch (err) {
    console.error('Error finding user:', err);
    return null;
  }
}

/**
 * Generic function to replace supabase.from('table').select() with Prisma
 */
export const prismaQueryMap = {
  // Users
  findUser: (clerkId) => prisma.user.findUnique({ where: { clerk_id: clerkId } }),
  createUser: (data) => prisma.user.create({ data }),
  updateUser: (clerkId, data) => prisma.user.update({ where: { clerk_id: clerkId }, data }),
  
  // Interviews
  findInterviews: (filters = {}) => prisma.interview.findMany({ 
    where: filters,
    orderBy: { created_date: 'desc' }
  }),
  createInterview: (data) => prisma.interview.create({ data }),
  
  // Interview Attempts  
  findInterviewAttempts: (userId) => prisma.interviewAttempt.findMany({
    where: { user_id: userId },
    include: { interview: true },
    orderBy: { created_at: 'desc' }
  }),
  createInterviewAttempt: (data) => prisma.interviewAttempt.create({ data }),
  
  // Usage
  findUsage: (userId) => prisma.usage.findFirst({ where: { user_id: userId } }),
  createUsage: (data) => prisma.usage.create({ data }),
  updateUsage: (userId, data) => prisma.usage.updateMany({ 
    where: { user_id: userId }, 
    data 
  }),
  
  // Reports
  findReports: (filters = {}) => prisma.aiReport.findMany({
    where: filters,
    include: { attempt: { include: { interview: true } } },
    orderBy: { created_at: 'desc' }
  }),
  
  // Resumes
  findResumeHtml: (clerkId) => prisma.resumeHtml.findMany({
    where: { clerk_id: clerkId },
    orderBy: { created_at: 'desc' }
  }),
  createResumeHtml: (data) => prisma.resumeHtml.create({ data }),
};

/**
 * Execute common database operations with error handling
 */
export async function safePrismaOperation(operation, fallbackData = null) {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (err) {
    console.error('Prisma operation failed:', err);
    return { 
      success: false, 
      error: err.message,
      data: fallbackData 
    };
  }
}

/**
 * Check user authentication and existence (replacement for user validation logic)
 */
export async function validateUser(userId) {
  if (!userId) {
    return { success: false, error: 'Unauthorized', status: 401 };
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    });
    
    if (!user) {
      return { success: false, error: 'User not found in database', status: 403 };
    }
    
    return { success: true, user: user };
  } catch (err) {
    console.error('Error validating user:', err);
    return { success: false, error: 'Database error', status: 500 };
  }
}
