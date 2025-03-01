// types/posts/engagement.ts
// TODO CREATE A UNIQFIED TYPE CONVENTION ACROSS ENGAGEMENTS FOR POST AND COMMENTS
import type {Post, BasePost, PostAnalytics, PostUser, ThoughtPost, ImagePost, ArticlePost, PostTypeId } from './post-types';

export interface PostMetrics {
  like_count: number;
  dislike_count: number;
  save_count: number;
  share_count: number;
  report_count: number;
  comment_count: number;
  [key: string]: number;
}

// Remove MetricsData and just use PostMetrics everywhere
// You can add this alias for backward compatibility
export type MetricsData = PostMetrics;

export interface PostInteractionState {
  like: boolean;
  dislike: boolean;
  save: boolean;
  share: boolean;
  report: boolean;
}

// Use this as an alias for backward compatibility
export type MetricStates = PostInteractionState;

// Create a base interface for posts with engagement
export interface BasePostWithEngagement extends BasePost {
  post_type_id: PostTypeId;
  metrics: PostMetrics;
  interaction_state: PostInteractionState;
  user?: PostUser;
  username?: string;
  analysis?: PostAnalytics;
}


// Create specific post types with engagement
/*
export interface ThoughtPostWithEngagement extends BasePostWithEngagement {
  post_type_id: 1;
}

export interface ImagePostWithEngagement extends BasePostWithEngagement {
  post_type_id: 2;
  image_url: string;
  caption?: string;
}

export interface ArticlePostWithEngagement extends BasePostWithEngagement {
  post_type_id: 3;
  title: string;
} */

//export interface VideoPostWithEngagement extends BasePostWithEngagement {
//  post_type_id: 4
//  video_url: string
//}
export interface EngagementHandlers {
  onLike: () => Promise<void>
  onDislike: () => Promise<void>
  onSave: () => Promise<void>
  onShare: () => Promise<void>
  onReport?: (reason: string) => Promise<void>
  onComment?: () => void
}


//export interface ThoughtPostWithEngagement extends ThoughtPost, BasePostWithEngagement {}
//export interface ImagePostWithEngagement extends ImagePost, BasePostWithEngagement {}
//export interface ArticlePostWithEngagement extends ArticlePost, BasePostWithEngagement {}

export type PostWithEngagement = Post & {
  metrics: PostMetrics;
  interaction_state: PostInteractionState;
};
//export type PostWithEngagement =
//  | ThoughtPostWithEngagement
//  | ImagePostWithEngagement
//  | ArticlePostWithEngagement;
  //| VideoPostWithEngagement
//export type PostWithEngagement = BasePostWithEngagement;

export interface EngagementState {
  like: boolean;
  dislike: boolean;
  save: boolean;
  share: boolean;
  report: boolean;
}

export interface LoadingStates {
  like: boolean;
  dislike: boolean;
  save: boolean;
  share: boolean;
  report: boolean;
}

export interface ErrorStates {
  like: boolean;
  dislike: boolean;
  save: boolean;
  share: boolean;
  report: boolean;
}

export interface EngagementResponse {
  message: string;
  like_count?: number;
  dislike_count?: number;
  save_count?: number;
  share_count?: number;
  report_count?: number;
  comment_count?: number;
  like?: boolean;
  dislike?: boolean;
  save?: boolean;
  share?: boolean;
  report?: boolean;
  metrics?: PostMetrics;
  [key: string]: any;

}

export interface EngagementMetricsHandlerProps {
  type: 'post' | 'comment';
  metrics: MetricsData;
  states: MetricStates;
  loading: LoadingStates;
  error: ErrorStates;
  onLike: () => Promise<void>;
  onDislike: () => Promise<void>;
  onComment?: () => void;
  onShare: () => Promise<void>;
  onSave: () => Promise<void>;
  className?: string;
}

export type EngagementType = 'like' | 'dislike' | 'save' | 'share' | 'report';

export interface EngagementMutationContext {
  previousPost: PostWithEngagement | undefined;
}