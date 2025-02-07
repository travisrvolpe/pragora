// src/contexts/auth/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {  authService } from "../../services/auth/authService";
import { User, LoginFormData, RegisterFormData, AuthState, ErrorResponse } from "@/types/auth";
import { AxiosError } from "axios";

interface AuthContextType extends AuthState {
  loginUser: (credentials: LoginFormData) => Promise<void>;
  registerUser: (userData: RegisterFormData) => Promise<void>;
  logoutUser: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    try {
      console.log('Fetching current user...');
      const userData = await authService.getCurrentUser();
      console.log('Current user data:', userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error);
      authService.logout();
      setUser(null);
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      console.log('Initializing auth - Token exists:', !!token);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await fetchCurrentUser();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginUser = async (credentials: LoginFormData): Promise<void> => {
    try {
      console.log('Attempting login...');
      const response = await authService.login(credentials);
      console.log('Login response:', response);

      // After successful login, fetch the user data
      const userData = await fetchCurrentUser();
      console.log('User data after login:', userData);

      setError(null);
      navigate("/dialectica");
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error("Login failed:", error);

      // Handle different error response formats
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail.map(err => err.msg).join(', ') // Convert array of errors to string
        : typeof errorDetail === 'string'
          ? errorDetail
          : "Invalid login credentials.";

      setError(errorMessage); // Now we're always setting a string
    }
  };

  const registerUser = async (formData: RegisterFormData): Promise<void> => {
    try {
      const response = await authService.register(formData);
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        //api.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        setError(null);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logoutUser = (): void => {
    console.log('Logging out user...');
    authService.logout();
    setUser(null);
    setError(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginUser,
        registerUser,
        logoutUser,
        loading,
        error,
        isAuthenticated: !!user
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};