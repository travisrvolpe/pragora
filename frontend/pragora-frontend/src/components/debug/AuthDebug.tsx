// src/components/debug/AuthDebug.tsx
import React from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { TOKEN_KEY } from '@/lib/constants/constants';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, loading, error } = useAuth();
  const token = localStorage.getItem(TOKEN_KEY);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg opacity-75 hover:opacity-100 transition-opacity">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="text-sm">
        <p>Authenticated: {String(isAuthenticated)}</p>
        <p>Loading: {String(loading)}</p>
        <p>Has Token: {String(!!token)}</p>
        <p>Has User: {String(!!user)}</p>
        {user && <p>Username: {user.username}</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
      </div>
    </div>
  );
};

export default AuthDebug;