// types/comments/comment-types.ts
import type { PostMetrics, PostInteractionState } from '../posts/engagement';

// Base interfaces with snake_case for existing code
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
  email: string;
  expertise_area?: string;
  credentials?: string;
  created_at: string;
  updated_at?: string;
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
  user?: CommentUser;
  username?: string;
  avatar_img?: string;
  reputation_score?: number;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
  last_activity: string;
}

export interface CommentWithEngagement extends BaseComment {
  metrics: CommentMetrics;
  interaction_state: CommentInteractionState;
  active_viewers?: number;
  replies?: CommentWithEngagement[];
}

// Helper type for API responses
export interface CommentResponse {
  message: string;
  [key: string]: any;
  like_count?: number;
  dislike_count?: number;
  report_count?: number;
  reply_count?: number;
  like?: boolean;
  dislike?: boolean;
  report?: boolean;
}

// Updated conversion utility with proper null checks
export function convertToGraphQLComment(comment: CommentWithEngagement): any {
  if (!comment) return null;

  const user = comment.user ? {
    user_id: comment.user.user_id,
    username: comment.user.username,
    avatar_img: comment.user.avatar_img,
    reputation_score: comment.user.reputation_score,
    email: comment.user.email,
    expertise_area: comment.user.expertise_area,
    credentials: comment.user.credentials,
    created_at: comment.user.created_at,
    updated_at: comment.user.updated_at
  } : null;

  return {
    commentId: comment.comment_id,
    content: comment.content,
    userId: comment.user_id,
    postId: comment.post_id,
    parentCommentId: comment.parent_comment_id,
    path: comment.path,
    depth: comment.depth,
    rootCommentId: comment.root_comment_id,
    user: user,
    username: comment.username || '',
    avatarImg: comment.avatar_img,
    reputationScore: comment.reputation_score,
    metrics: {
      likeCount: comment.metrics.like_count,
      dislikeCount: comment.metrics.dislike_count,
      replyCount: comment.metrics.reply_count,
      reportCount: comment.metrics.report_count
    },
    interactionState: {
      like: comment.interaction_state.like,
      dislike: comment.interaction_state.dislike,
      report: comment.interaction_state.report
    },
    isEdited: comment.is_edited,
    isDeleted: comment.is_deleted,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    lastActivity: comment.last_activity,
    activeViewers: comment.active_viewers,
    replies: comment.replies?.map(reply => convertToGraphQLComment(reply))
  };
}