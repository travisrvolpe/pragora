'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth/AuthContext';
import ProfilePage from './page';

export default function ProfileIndex() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show profile page once authenticated
  return isAuthenticated ? <ProfilePage /> : null;
}