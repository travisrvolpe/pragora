'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { authService } from "@/applib/services/auth/authService";
import {
  LoginFormData,
  RegisterFormData,
  AuthContextType,
  User,
  AuthResponse,
  AuthError,
  isAuthSuccess
} from "@/types/auth";
import { apolloClient } from '@/applib/graphql/apollo-client';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/'];
const AUTH_CHECK_INTERVAL = 4 * 60 * 1000; // 4 minutes

const defaultAuthResponse: AuthResponse = {
  status: 'error',
  message: 'Not implemented'
} as AuthError;

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  loginUser: async () => defaultAuthResponse,
  registerUser: async () => defaultAuthResponse,
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
        const token = authService.getToken();
        console.log('Init Auth - Token check:', { exists: !!token });

        if (!token) {
          setLoading(false);
          setUser(null);
          setIsAuthenticated(false);

          // Only redirect if we're on a protected route
          if (!isPublicPath(pathname)) {
            router.replace('/auth/login');
          }
          return;
        }

        try {
          const userData = await authService.getCurrentUser();
          console.log('Init Auth - User data fetched:', userData);
          setUser(userData);
          setIsAuthenticated(true);

          // Redirect based on path
          if (pathname.startsWith('/auth/')) {
            router.replace('/dialectica');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          authService.removeToken();
          setUser(null);
          setIsAuthenticated(false);
          if (!isPublicPath(pathname)) {
            router.replace('/auth/login');
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname, router, isPublicPath]);

  // Periodic auth check
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInterval = setInterval(async () => {
      try {
        const isValid = await verifyAuth();
        if (!isValid) {
          await authService.logout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await authService.logout();
      }
    }, AUTH_CHECK_INTERVAL);

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, verifyAuth]);

  const loginUser = async (credentials: LoginFormData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login with credentials:', credentials.email);

      const response = await authService.login(credentials);
      console.log('Login response received:', response);

      if (!isAuthSuccess(response)) {
        throw new Error(response.message || 'Login failed');
      }

      // Wait for user data
      const userData = await authService.getCurrentUser();
      console.log('User data fetched:', userData);

      setUser(userData);
      setIsAuthenticated(true);

      // Reset Apollo store and redirect
      await apolloClient.resetStore();
      router.replace('/dialectica');

      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (formData: RegisterFormData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting registration...');

      const response = await authService.register(formData);

      // Add delay before fetching user data
      await new Promise(resolve => setTimeout(resolve, 500));

      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);

      await apolloClient.resetStore();

      // Redirect to profile page for new users
      router.replace('/profile');
      return response;
    } catch (error: any) {
      console.error('Registration error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      const errorResponse: AuthError = {
        status: 'error',
        message: errorMessage
      };
      throw errorResponse;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      // Clear local state first
      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      // Clear caches
      await authService.clearCache();
      await apolloClient.resetStore();

      // Remove auth token
      authService.removeToken();

      // Always redirect to login page
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure redirect happens even on error
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  // Prevent access to auth pages when already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && pathname.startsWith('/auth/')) {
      router.replace('/dialectica');
    }
  }, [isAuthenticated, loading, pathname, router]);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type { AuthContextType, User };