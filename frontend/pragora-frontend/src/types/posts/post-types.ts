// types/posts/post-types.ts
import type { PostMetrics, PostInteractionState } from './engagement';


export interface PostAuthor {
  user_id: number;
  username: string;
  avatar_img?: string;
  reputation_score: number;
  reputation_cat: string;
  expertise_area?: string;
  credentials?: string;
}

export interface PostUser {
  user_id: number;
  username?: string;
  avatar_img?: string;
  reputation_score?: number;
}

export interface PostAnalytics {
  fallacy_score?: number;
  evidence_score: number;
  bias_score: number;
  action_score: number;
  fallacy_types?: string[];
  implementation_complexity?: number;
}

export type PostStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type PostVisibility = 'public' | 'private' | 'followers';
export type PostTypeId = 1 | 2 | 3 | 4; // 1: Thought, 2: Image, 3: Article, 4: Video
export type PostVariant = 'feed' | 'detail';

// Base post interface
export interface BasePost {
  post_id: number;
  user_id: number;
  user?: PostUser;       // Add this for nested user data
  content: string;
  summary?: string;
  post_type_id: PostTypeId;
  category_id?: number;
  subcategory_id?: number;
  custom_subcategory?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];

  metrics?: PostMetrics;
  interaction_state?: PostInteractionState;
  analysis?: PostAnalytics;

  // Flattened user fields
  username?: string;
  avatar_img?: string;
  reputation_score?: number;
  reputation_cat?: string;
  expertise_area?: string;
}

export interface ThoughtPost extends BasePost {
  post_type_id: 1;
}

export interface ImagePost extends BasePost {
  post_type_id: 2;
  image_url: string;
  images?: string[];
  caption?: string;
}

export interface ArticlePost extends BasePost {
  post_type_id: 3;
  title: string;
  subtitle?: string;
  image_url?: string;
}

export interface VideoPost extends BasePost {
  post_type_id: 4;
  video_url: string;
  video_metadata?: any;
}

// Union type for all post types
export type Post = ThoughtPost | ImagePost | ArticlePost | VideoPost;

export const isThoughtPost = (post: Post): post is ThoughtPost => {
  return post.post_type_id === 1;
};

export const isImagePost = (post: Post): post is ImagePost => {
  return post.post_type_id === 2;
};

export const isArticlePost = (post: Post): post is ArticlePost => {
  return post.post_type_id === 3;
};

export const isVideoPost = (post: Post): post is ArticlePost => {
  return post.post_type_id === 3;
};