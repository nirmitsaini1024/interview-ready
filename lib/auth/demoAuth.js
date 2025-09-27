/**
 * Demo Authentication System
 * Hardcoded credentials for demonstration purposes
 */

// Demo users with different roles
export const DEMO_USERS = {
  'demo@candidate.com': {
    id: 'demo_candidate_001',
    email: 'demo@candidate.com',
    password: 'demo123',
    name: 'John Candidate',
    username: 'john_candidate',
    firstName: 'John',
    lastName: 'Candidate',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'CANDIDATE'
  },
  'demo@recruiter.com': {
    id: 'demo_recruiter_001',
    email: 'demo@recruiter.com',
    password: 'demo123',
    name: 'Jane Recruiter',
    username: 'jane_recruiter',
    firstName: 'Jane',
    lastName: 'Recruiter',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    role: 'RECRUITER'
  },
  'admin@demo.com': {
    id: 'demo_admin_001',
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Admin User',
    username: 'admin_user',
    firstName: 'Admin',
    lastName: 'User',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    role: 'CANDIDATE' // Can switch roles
  }
};

/**
 * Authenticate user with email and password
 */
export function authenticateUser(email, password) {
  const user = DEMO_USERS[email];
  
  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid credentials' };
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    success: true,
    user: userWithoutPassword
  };
}

/**
 * Get user by ID (for session management)
 */
export function getUserById(userId) {
  const user = Object.values(DEMO_USERS).find(u => u.id === userId);
  
  if (!user) {
    return null;
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get user by email
 */
export function getUserByEmail(email) {
  const user = DEMO_USERS[email];
  
  if (!user) {
    return null;
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Validate user session
 */
export function validateSession(sessionData) {
  if (!sessionData || !sessionData.userId) {
    return { valid: false, error: 'No session data' };
  }

  const user = getUserById(sessionData.userId);
  
  if (!user) {
    return { valid: false, error: 'Invalid session' };
  }

  return { valid: true, user };
}

/**
 * Demo credentials for display
 */
export const DEMO_CREDENTIALS = [
  {
    role: 'Candidate',
    email: 'demo@candidate.com',
    password: 'demo123',
    description: 'Access candidate features like interviews, resume builder, job search'
  },
  {
    role: 'Recruiter', 
    email: 'demo@recruiter.com',
    password: 'demo123',
    description: 'Access recruiter features like job posting, candidate management'
  },
  {
    role: 'Admin',
    email: 'admin@demo.com',
    password: 'admin123',
    description: 'Full access to all features, can switch between roles'
  }
];
