// types/auth.ts
export interface User {
  user_id: number;
  email: string;
  profile?: UserProfile;
}

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

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  // Add any additional registration fields here
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  user: User;
}

// FastAPI default error response
export interface FastAPIError {
  detail: string;
}

// Extended error response that includes potential validation errors
export interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

// Combined error response type
export interface ErrorResponse {
  detail: string | ValidationError[];
  statusCode?: number;
  message?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}