'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { authService } from "@/lib/services/auth/authService";
import {LoginFormData, RegisterFormData, AuthContextType } from "@/types/auth";
import { User } from "@/types/user";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  loginUser: async () => {},
  registerUser: async () => {},
  logoutUser: () => {},
});

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const loginUser = async (credentials: LoginFormData) => {
    try {
      setLoading(true);
      await authService.login(credentials);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      router.replace('/dialectica');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (formData: RegisterFormData) => {
    try {
      setLoading(true);
      await authService.register(formData);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      router.replace('/profile');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}