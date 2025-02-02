// src/types/post.ts

// User/Author related types
export interface Author {
  user_id: number;
  username?: string;
  avatar_img?: string;
  about?: string;
  reputation_score?: number;
  reputation_cat?: string;
  credentials?: string;
  expertise_area?: string;
}

// Post metrics/interaction types
export interface PostMetrics {
  likes_count: number;
  dislikes_count: number;
  loves_count: number;
  hates_count: number;
  saves_count: number;
  shares_count: number;
  comments_count: number;
  reports_count: number;
}

// Base post interface matching your PostBase schema
export interface BasePost {
  post_id: number;
  user_id: number;
  title?: string;
  subtitle?: string;
  content: string;
  post_type_id: PostTypeId;
  category_id?: number;
  subcategory_id?: number;
  custom_subcategory?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  author?: Author;
  metrics?: PostMetrics;
  tags?: string[];
}

// Literal type for post types matching your database
export type PostTypeId = 1 | 2 | 3 | 4; // thoughts, image, article, video

// Specific post type interfaces
export interface ThoughtPost extends BasePost {
  post_type_id: 1;
}

export interface ImagePost extends BasePost {
  post_type_id: 2;
  image_url: string;
  caption?: string;
}

export interface ArticlePost extends BasePost {
  post_type_id: 3;
  title: string; // Required for articles
}

export interface VideoPost extends BasePost {
  post_type_id: 4;
  video_url: string;
  caption?: string;
}

// Union type of all post types
export type Post = ThoughtPost | ImagePost | ArticlePost | VideoPost;

// Post display variant type
export type PostVariant = 'feed' | 'full';

// Category types
export interface Category {
  category_id: number;
  cat_name: string;
}

export interface Subcategory {
  subcategory_id: number;
  name: string;
  category_id: number;
}

// Comment types
export interface Comment {
  comment_id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  author?: Author;
  metrics?: CommentMetrics;
}

export interface CommentMetrics {
  likes_count: number;
  dislikes_count: number;
  loves_count: number;
  hates_count: number;
}

// Interaction types matching your database
export type PostInteractionType =
  | 'like'
  | 'dislike'
  | 'love'
  | 'hate'
  | 'save'
  | 'share'
  | 'report';

export interface PostInteraction {
  post_intact_id: number;
  user_id: number;
  post_id: number;
  post_interaction_type_id: number;
  created_at: string;
}