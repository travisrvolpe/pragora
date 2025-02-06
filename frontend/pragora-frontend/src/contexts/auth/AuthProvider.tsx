import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {authService} from '../../services/auth/authService';
import { User, LoginFormData, RegisterFormData, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  loginUser: (credentials: LoginFormData) => Promise<void>;
  registerUser: (userData: RegisterFormData) => Promise<void>;
  logoutUser: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginUser = async (credentials: LoginFormData) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setError(null);
      navigate('/dialectica');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Login failed');
      throw error;
    }
  };

  const registerUser = async (userData: RegisterFormData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setError(null);
      navigate('/dialectica');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Registration failed');
      throw error;
    }
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
    setError(null);
    navigate('/login');
  };

  const value = {
    user,
    loginUser,
    registerUser,
    logoutUser,
    loading,
    error,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};