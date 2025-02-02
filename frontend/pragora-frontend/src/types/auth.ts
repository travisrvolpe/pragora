// types/auth.ts
// Basic auth types
// Basic user type matching your database schema
export interface User {
  user_id: number;
  email: string;
  profile?: UserProfile;
}

// Profile type matching your database schema
export interface UserProfile {
  user_id: number;
  username: string;
  avatar_img?: string;
  about?: string;
  reputation_score?: number;
  reputation_cat?: string;
  post_cnt?: number;
  comment_cnt?: number;
  upvote_cnt?: number;
  interests?: string;
  credentials?: string;
  expertise_area?: string;
  location?: string;
  date_joined?: string;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  // No additional fields needed based on your backend
}

// API response types
export interface AuthResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  user: User;
}

// Auth context state
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}