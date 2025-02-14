// types/user.ts
export interface BaseUser {
  user_id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  username: string;
  avatar_img?: string;
  about?: string;
  location?: string;
  role: 'user' | 'admin' | 'instructor';
  is_admin: boolean;
  is_instructor: boolean;
}

export interface UserRole {
  role: 'user' | 'admin' | 'instructor';
  is_admin: boolean;
  is_instructor: boolean;
}

export interface UserMetrics {
  post_cnt: number;
  comment_cnt: number;
  upvote_cnt: number;
  plan_cnt: number;
  plan_comp_cnt: number;
  plan_ip_cnt: number;
  saved_posts_cnt?: number;
  draft_cnt?: number;
  total_views?: number;
  total_likes?: number;
  total_shares?: number;
}

export interface UserEngagement {
  posts: UserPost[];
  comments: UserComment[];
  drafts: UserDraft[];
  saved_posts: UserSavedPost[];
}

export interface UserPreferences {
  is_messaging: boolean;
  is_networking: boolean;
  worldview_u?: string;
  worldview_ai?: string;
}

export interface UserTimestamps {
  date_joined: string;
  logon_time: string;
  last_active: string;
}

export interface User extends BaseUser {
  role: 'user' | 'admin' | 'instructor';
  is_admin: boolean;
  is_instructor: boolean;
  username?: string;
  avatar_img?: string;
  metrics?: UserMetrics;
  preferences?: UserPreferences;
  timestamps?: UserTimestamps;
  engagement?: UserEngagement;
}

export interface UserPost {
  post_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'deleted' | 'hidden';
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

export interface UserComment {
  comment_id: number;
  post_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
  replies: number;
}

export interface UserDraft {
  draft_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  category_id?: number;
  tags?: string[];
}

export interface UserSavedPost extends UserPost {
  saved_at: string;
  category?: string;
  author: {
    user_id: number;
    username: string;
    avatar_img?: string;
  };
}