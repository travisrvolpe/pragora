// types/auth.ts
import type { User } from './user';

// Form Data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  // Add any registration-specific fields here
}

// Token Response type
export interface TokenData {
  access_token: string;
  token_type: string;
}

// API Response types
export interface AuthSuccess {
  status: 'success';
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthError {
  status: 'error';
  message: string;
}

// Combined Auth Response type
export type AuthResponse = AuthSuccess | AuthError;

// Auth State management
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  loginUser: (credentials: LoginFormData) => Promise<AuthResponse>;
  registerUser: (userData: RegisterFormData) => Promise<AuthResponse>;
  logoutUser: () => void;
}

// Re-export User type
export type { User } from './user';