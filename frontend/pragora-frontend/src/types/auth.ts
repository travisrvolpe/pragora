import { BaseUser } from './user';

// What the backend expects
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  // Add any registration-specific fields here
}

// What the backend returns
export interface TokenData {
  access_token: string;
  token_type: string;
}

// The complete auth response from the backend
export interface AuthResponse {
  status: 'success' | 'error';
  access_token: string;
  token_type: string;
  user: User;  // This User extends BaseUser, so it has user_id
}

// The User type inherits from BaseUser which has user_id
export interface User extends BaseUser {
  // Auth-specific user properties can be added here
}

// State management for auth
export interface AuthState {
  user: User | null;  // This User type has user_id from BaseUser
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  loginUser: (credentials: LoginFormData) => Promise<void>;
  registerUser: (userData: RegisterFormData) => Promise<void>;
  logoutUser: () => void;
}