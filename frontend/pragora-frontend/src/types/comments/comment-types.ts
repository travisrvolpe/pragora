// types/comments/comment-types.ts
import type { PostMetrics, PostInteractionState } from '../posts/engagement';

export interface CommentMetrics {
  like_count: number;
  dislike_count: number;
  reply_count: number;
  report_count: number;
}

export interface CommentInteractionState {
  like: boolean;
  dislike: boolean;
  report: boolean;
}

export interface CommentUser {
  user_id: number;
  username: string;
  avatar_img?: string;
  reputation_score: number;
}

export interface BaseComment {
  comment_id: number;
  user_id: number;
  post_id: number;
  content: string;
  parent_comment_id?: number;
  path: string;
  depth: number;
  root_comment_id?: number;

  // User info
  user?: CommentUser;
  username?: string;
  avatar_img?: string;
  reputation_score?: number;

  // Status and timestamps
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
  last_activity: string;
}

export interface CommentWithEngagement extends BaseComment {
  metrics: CommentMetrics;
  interaction_state: CommentInteractionState;
  replies?: CommentWithEngagement[];
}

export interface CommentResponse {
  message: string;
  like_count?: number;
  dislike_count?: number;
  report_count?: number;
  reply_count?: number;
  like?: boolean;
  dislike?: boolean;
  report?: boolean;
}
