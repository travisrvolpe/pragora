// applib/graphql/types.ts
export interface User {
  user_id: string;
  username: string;
  avatar_img?: string | null;
  reputation_score?: number | null;
}

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

export interface CommentActivity {
  comment_id: string;
  active_viewers: number;
  last_activity: string;
}

export interface Comment {
  comment_id: string;
  content: string;
  user_id: string;
  post_id: string;
  parent_comment_id?: string | null;
  path: string;
  depth: number;
  root_comment_id?: string | null;
  metrics: CommentMetrics;
  user: User;
  username: string;
  avatar_img?: string | null;
  reputation_score?: number | null;
  interaction_state: CommentInteractionState;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string | null;
  last_activity: string;
  active_viewers: number;
  replies?: Comment[];
}

export interface CreateCommentInput {
  content: string;
  post_id: string;
  parent_comment_id?: string | null;
}

export interface UpdateCommentInput {
  comment_id: string;
  content: string;
}

// Query result types
export interface CommentsQueryResult {
  comments: Comment[];
}

export interface CommentQueryResult {
  comment: Comment | null;
}

// Mutation result types
export interface CreateCommentMutationResult {
  createComment: Comment;
}

export interface UpdateCommentMutationResult {
  updateComment: Comment;
}

export interface DeleteCommentMutationResult {
  deleteComment: boolean;
}

export interface LikeCommentMutationResult {
  likeComment: Comment;
}

export interface DislikeCommentMutationResult {
  dislikeComment: Comment;
}

export interface ReportCommentMutationResult {
  reportComment: Comment;
}

// Subscription result types
export interface CommentAddedSubscriptionResult {
  commentAdded: Comment;
}

export interface CommentUpdatedSubscriptionResult {
  commentUpdated: Comment;
}

export interface CommentDeletedSubscriptionResult {
  commentDeleted: string;
}

export interface CommentActivitySubscriptionResult {
  commentActivity: CommentActivity;
}