'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { authService } from "@/lib/services/auth/authService";
import {
  LoginFormData,
  RegisterFormData,
  AuthContextType,
  User,
  AuthResponse,
  AuthError, isAuthSuccess
} from "@/types/auth";
import { apolloClient } from '@/lib/graphql/apollo-client';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/'];

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

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRetryCount, setAuthRetryCount] = useState(0); // Add this state
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = (path: string | null) => {
    if (!path) return true;
    return PUBLIC_PATHS.some(publicPath => path === publicPath);
  };

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

          // Only redirect if we're on auth pages
          if (pathname.startsWith('/auth/')) {
            router.replace('/dialectica');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Don't automatically clear token on error
          setUser(null);
          setIsAuthenticated(false);
          if (!isPublicPath(pathname)) {
            router.replace('/auth/login');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname]);

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    const setupRefreshInterval = () => {
        if (isAuthenticated) {
            refreshInterval = setInterval(async () => {
                try {
                    await authService.getCurrentUser();
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    logoutUser();
                }
            }, 4 * 60 * 1000); // Refresh every 4 minutes
        }
    };

    setupRefreshInterval();

    return () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    };
    }, [isAuthenticated]);

    useEffect(() => {
    const refreshToken = async () => {
      try {
        const token = authService.getToken();
        if (!token) return;

        const tokenCreatedAt = localStorage.getItem('token_created_at');
        const now = Date.now();

        // Refresh token if it's older than 15 minutes
        if (tokenCreatedAt && now - parseInt(tokenCreatedAt) > 15 * 60 * 1000) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        authService.removeToken();
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Set up periodic token refresh
    const interval = setInterval(refreshToken, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

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

  const validateToken = async (retries = 3) => {
    while (retries > 0) {
        try {
            const userData = await authService.getCurrentUser();
            return userData;
        } catch (error) {
            retries--;
            if (retries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
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

      await apolloClient.resetStore();

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
    try {
      console.log('Logging out...');
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      await apolloClient.clearStore();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      router.replace('/auth/login');
    }
  };

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