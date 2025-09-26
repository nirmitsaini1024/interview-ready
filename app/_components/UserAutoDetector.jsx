"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Component that automatically creates user in database on client-side mount
 */
export default function UserAutoDetector() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      // Trigger user creation on the backend
      fetch('/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          username: user.username,
          email: user.emailAddresses?.[0]?.emailAddress,
          img_url: user.imageUrl,
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.state) {
          console.log('✅ User automatically created:', data.data);
        } else {
          console.log('📝 User already exists or other status:', data.message);
        }
      })
      .catch(err => {
        console.error('❌ Failed to auto-create user:', err);
      });
    }
  }, [user, isLoaded]);

  return null; // This is invisible component
}
