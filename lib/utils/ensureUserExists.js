import { currentUser } from '@clerk/nextjs/server';
import supabase from '@/lib/supabase/client';

export async function ensureUserExists() {
  try {
    // Get authenticated Clerk user
    const user = await currentUser();
    if (!user) return { exists: false, error: 'Not authenticated', user: null };
    
    const userId = user.id;
    
    // Check if user exists in Supabase
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    // If user exists, return them
    if (userRecord && !userError) {
      return { exists: true, user: userRecord };
    }

    // If user doesn't exist, create them
    console.log('🔧 User not found in Supabase, creating them automatically...');
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        clerk_id: userId,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown',
        username: user.username || null,
        email: user.emailAddresses?.[0]?.emailAddress || null,
        img_url: user.imageUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create user automatically:', createError);
      return { exists: false, error: createError.message, user: null };
    }

    console.log('✅ User created automatically:', newUser);
    return { exists: true, user: newUser };

  } catch (err) {
    console.error('❌ Error ensuring user exists:', err);
    return { exists: false, error: err.message, user: null };
  }
}
