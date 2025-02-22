'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { authService } from "@/lib/services/auth/authService";
import { LoginFormData, RegisterFormData, AuthContextType, User, AuthResponse } from "@/types/auth";
import { apolloClient } from '@/lib/graphql/apollo-client';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/'];
const AUTH_CHECK_INTERVAL = 4 * 60 * 1000; // 4 minutes

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  loginUser: async () => ({ status: 'error', message: 'Not implemented' }),
  registerUser: async () => ({ status: 'error', message: 'Not implemented' }),
  logoutUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = useCallback((path: string | null) => {
    if (!path) return true;
    return PUBLIC_PATHS.some(publicPath => path === publicPath);
  }, []);

  const verifyAuth = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) return false;

      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  }, []);

  // Initial auth check
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const isValid = await verifyAuth();
        if (!isValid) {
          authService.removeToken();
          setUser(null);
          setIsAuthenticated(false);
          if (!isPublicPath(pathname)) {
            router.replace('/auth/login');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname, router, verifyAuth, isPublicPath]);

  // Periodic auth check
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInterval = setInterval(async () => {
      const isValid = await verifyAuth();
      if (!isValid) {
        clearInterval(checkInterval);
        await authService.logout();
      }
    }, AUTH_CHECK_INTERVAL);

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, verifyAuth]);

  const loginUser = async (credentials: LoginFormData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(credentials);
      const userData = await authService.getCurrentUser();

      setUser(userData);
      setIsAuthenticated(true);

      // Reset Apollo store
      await apolloClient.resetStore();

      return response;
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (formData: RegisterFormData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(formData);
      const userData = await authService.getCurrentUser();

      setUser(userData);
      setIsAuthenticated(true);

      await apolloClient.resetStore();

      return response;
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await authService.clearCache();
      authService.removeToken();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      // Reset Apollo client
      await apolloClient.resetStore();

      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure user is logged out even on error
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const value = React.useMemo(
    () => ({
      user,
      loginUser,
      registerUser,
      logoutUser,
      loading,
      error,
      isAuthenticated
    }),
    [user, loading, error, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}