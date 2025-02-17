'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { authService } from "@/lib/services/auth/authService";
import type {
  LoginFormData,
  RegisterFormData,
  AuthContextType,
  User,
  AuthResponse,
  AuthError
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
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = (path: string | null) => {
    if (!path) return true;
    return PUBLIC_PATHS.some(publicPath => path === publicPath);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();

      if (!token) {
        setLoading(false);
        setUser(null);
        if (!isPublicPath(pathname)) {
          router.replace('/auth/login');
        }
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        if (isPublicPath(pathname)) {
          router.replace('/dialectica');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
        setUser(null);
        if (!isPublicPath(pathname)) {
          router.replace('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname]);

  const loginUser = async (credentials: LoginFormData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      const userData = await authService.getCurrentUser();
      setUser(userData);

      //if (response.access_token) {
      // Reset Apollo Client's store when token changes
      //await apolloClient.resetStore();
    //}

      await apolloClient.resetStore();

      router.replace('/dialectica');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
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

  const registerUser = async (formData: RegisterFormData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(formData);
      const userData = await authService.getCurrentUser();
      setUser(userData);

      await apolloClient.resetStore();

      router.replace('/profile');
      return response;
    } catch (error) {
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

  const logoutUser = () => {
    authService.logout();
    setUser(null);
    setError(null);

    // Clear Apollo cache on logout
    apolloClient.clearStore().catch(console.error);

    router.replace('/auth/login');
  };

  const value = React.useMemo(
    () => ({
      user,
      loginUser,
      registerUser,
      logoutUser,
      loading,
      error,
      isAuthenticated: !!user
    }),
    [user, loading, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook export
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Type exports
export type { AuthContextType, User };