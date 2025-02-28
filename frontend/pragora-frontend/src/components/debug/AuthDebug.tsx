// components/debug/AuthDebug.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { authService } from '@/applib/services/auth/authService';

export default function AuthDebug() {
  const { user, isAuthenticated, loading } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<string>('');

  useEffect(() => {
    // Update debug info every second
    const interval = setInterval(() => {
      setToken(authService.getToken());
      setLastCheck(new Date().toISOString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/75 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div>Auth State: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Loading: {loading ? '⌛' : '✓'}</div>
      <div>User ID: {user?.user_id || 'none'}</div>
      <div>Token: {token ? '✓' : '❌'}</div>
      <div>Last Check: {lastCheck}</div>
    </div>
  );
}