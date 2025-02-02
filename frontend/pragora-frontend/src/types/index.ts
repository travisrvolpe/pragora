// User related types
export interface User {
  user_id: number;
  username: string;
  email: string;
  avatar_img?: string;
  about?: string;
  post_cnt: number;
  comment_cnt: number;
  upvote_cnt: number;
  reputation_score: number;
  reputation_cat: string;
  interests?: string[];
  credentials?: string;
  expertise_area?: string;
  location?: string;
  worldview_u?: string;
  worldview_ai?: string;
  date_joined: Date;
  role: 'user' | 'admin' | 'moderator';
}

// Post related types
export interface Post {
  post_id: number;
  title: string;
  post_body: string;
  user_id: number;
  topic_id?: number;
  status: 'active' | 'archived' | 'deleted';
  created_at: Date;
  updated_at?: Date;
  upvotes: number;
  downvotes: number;
  score: number;
  char_count?: number;
  post_type: 'article' | 'thought' | 'image' | 'link';
  is_draft: boolean;
}

// Comment related types
export interface Comment {
  comment_id: number;
  comment_body: string;
  user_id: number;
  post_id: number;
  parent_comment_id?: number;
  status: 'active' | 'deleted' | 'hidden';
  created_at: Date;
  updated_at?: Date;
  upvotes: number;
  downvotes: number;
  score: number;
  comment_type?: string;
}

// Topic related types
export interface Topic {
  topic_id: number;
  topic_name: string;
  description?: string;
  topic_cats?: string[];
}

// Common props interface for components that need user data
export interface WithUserProps {
  user?: User;
  isLoading?: boolean;
  error?: string;
}

// Authentication context types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}