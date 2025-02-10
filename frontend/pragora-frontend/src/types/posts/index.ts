// types/posts/index.ts
import type {
  Post,
  PostTypeId,
  ThoughtPost,
  ImagePost,
  ArticlePost,
  VideoPost,
  PostAuthor,
  PostUser,
  PostAnalytics,
  BasePost
} from './post-types';

import type {
  PostMetrics,
  PostInteractionState,
  PostWithEngagement,
  EngagementResponse,
  EngagementState,
  LoadingStates,
  ErrorStates,
  MetricsData,
  MetricStates
} from './engagement';

import type {
  PostCardProps,
  PostWrapperProps,
  PostFactoryProps,
  PostActionProps,
  EngagementMetricsProps,
  BaseComponentProps
} from './component-types';

import type {
  Category,
  SubCategory,
  CategoryStats,
  PostFeedProps,
  TopicCardProps,
  CreateContentProps,
  PostsResponse
} from './page-types';

// Type guards
export const isImagePost = (post: Post): post is ImagePost =>
  post.post_type_id === 2;

export const isArticlePost = (post: Post): post is ArticlePost =>
  post.post_type_id === 3;

export const isThoughtPost = (post: Post): post is ThoughtPost =>
  post.post_type_id === 1;

export const isVideoPost = (post: Post): post is VideoPost =>
  post.post_type_id === 4;

// Export everything
export type {
  // Post types
  Post,
  PostTypeId,
  ThoughtPost,
  ImagePost,
  ArticlePost,
  VideoPost,
  PostAuthor,
  PostUser,
  PostAnalytics,
  BasePost,

  // Engagement types
  PostMetrics,
  PostInteractionState,
  PostWithEngagement,
  EngagementResponse,
  EngagementState,
  LoadingStates,
  ErrorStates,
  MetricsData,
  MetricStates,

  // Component types
  PostCardProps,
  PostWrapperProps,
  PostFactoryProps,
  PostActionProps,
  EngagementMetricsProps,
  BaseComponentProps,

  // Page types
  Category,
  SubCategory,
  CategoryStats,
  PostFeedProps,
  TopicCardProps,
  CreateContentProps,
  PostsResponse
};