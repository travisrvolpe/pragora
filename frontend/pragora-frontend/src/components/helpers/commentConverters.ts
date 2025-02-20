// helpers/commentConverters.ts
import type { CommentWithEngagement, CommentUser } from '@/types/comments/comment-types';
// Helper function to format dates

const formatDate = (dateString: string | Date) => {
  if (!dateString) return null;
  if (typeof dateString === 'string') {
    return dateString;
  }
  return new Date(dateString).toISOString();
};

// In your comment processing logic:
const processComment = (comment: any) => ({
  ...comment,
  created_at: formatDate(comment.created_at),
  updated_at: formatDate(comment.updated_at),
  last_activity: formatDate(comment.last_activity),
  user: comment.user ? {
    ...comment.user,
    created_at: formatDate(comment.user.created_at),
    updated_at: formatDate(comment.user.updated_at)
  } : null
});

interface GraphQLCommentMetrics {
  __typename: 'CommentMetrics';
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  reportCount: number;
}

interface GraphQLInteractionState {
  __typename: 'CommentInteractionState';
  like: boolean;
  dislike: boolean;
  report: boolean;
}

interface GraphQLUser {
  __typename: 'User';
  userId: number;
  username: string;
  email: string;
  avatarImg?: string | null;
  reputationScore?: number | null;
  expertiseArea?: string | null;
  credentials?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

interface GraphQLComment {
  __typename: 'Comment';
  commentId: number;
  userId: number;
  postId: number;
  content: string;
  parentCommentId?: number | null;
  path: string;
  depth: number;
  rootCommentId?: number | null;
  user?: GraphQLUser | null;  // Make user optional again
  username: string;
  avatarImg?: string | null;
  reputationScore?: number | null;
  metrics: GraphQLCommentMetrics;
  interactionState: GraphQLInteractionState;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
  lastActivity: string;
  activeViewers: number;
  replies: GraphQLComment[];
}

export function convertToCamelCase(snakeCaseComment: CommentWithEngagement): GraphQLComment {
  return {
    __typename: "Comment",
    commentId: snakeCaseComment.comment_id,
    userId: snakeCaseComment.user_id,
    postId: snakeCaseComment.post_id,
    content: snakeCaseComment.content,
    parentCommentId: snakeCaseComment.parent_comment_id ?? null,
    path: snakeCaseComment.path,
    depth: snakeCaseComment.depth,
    rootCommentId: snakeCaseComment.root_comment_id ?? null,
    user: snakeCaseComment.user ? {
      __typename: "User",
      userId: snakeCaseComment.user.user_id,
      username: snakeCaseComment.user.username,
      email: snakeCaseComment.user.email,
      avatarImg: snakeCaseComment.user.avatar_img ?? null,
      reputationScore: snakeCaseComment.user.reputation_score ?? null,
      expertiseArea: snakeCaseComment.user.expertise_area ?? null,
      credentials: snakeCaseComment.user.credentials ?? null,
      createdAt: snakeCaseComment.user.created_at,
      updatedAt: snakeCaseComment.user.updated_at ?? null
    } : null,
    username: snakeCaseComment.username || '',
    avatarImg: snakeCaseComment.avatar_img ?? null,
    reputationScore: snakeCaseComment.reputation_score ?? null,
    metrics: {
      __typename: "CommentMetrics",
      likeCount: snakeCaseComment.metrics.like_count,
      dislikeCount: snakeCaseComment.metrics.dislike_count,
      replyCount: snakeCaseComment.metrics.reply_count,
      reportCount: snakeCaseComment.metrics.report_count
    },
    interactionState: {
      __typename: "CommentInteractionState",
      like: snakeCaseComment.interaction_state.like,
      dislike: snakeCaseComment.interaction_state.dislike,
      report: snakeCaseComment.interaction_state.report
    },
    isEdited: snakeCaseComment.is_edited,
    isDeleted: snakeCaseComment.is_deleted,
    createdAt: snakeCaseComment.created_at,
    updatedAt: snakeCaseComment.updated_at ?? null,
    lastActivity: snakeCaseComment.last_activity,
    activeViewers: snakeCaseComment.active_viewers || 0,
    replies: snakeCaseComment.replies?.map(convertToCamelCase) || []
  };
}

export function convertToSnakeCase(graphqlComment: GraphQLComment): CommentWithEngagement {
  return {
    comment_id: graphqlComment.commentId,
    user_id: graphqlComment.userId,
    post_id: graphqlComment.postId,
    content: graphqlComment.content,
    parent_comment_id: graphqlComment.parentCommentId !== null ? graphqlComment.parentCommentId : undefined,
    path: graphqlComment.path,
    depth: graphqlComment.depth,
    root_comment_id: graphqlComment.rootCommentId !== null ? graphqlComment.rootCommentId : undefined,
    user: graphqlComment.user ? {
      user_id: graphqlComment.user.userId,
      username: graphqlComment.user.username,
      email: graphqlComment.user.email,
      avatar_img: graphqlComment.user.avatarImg !== null ? graphqlComment.user.avatarImg : undefined,
      reputation_score: graphqlComment.user.reputationScore ?? 0, // Default to 0 since it's required
      expertise_area: graphqlComment.user.expertiseArea !== null ? graphqlComment.user.expertiseArea : undefined,
      credentials: graphqlComment.user.credentials !== null ? graphqlComment.user.credentials : undefined,
      created_at: graphqlComment.user.createdAt,
      updated_at: graphqlComment.user.updatedAt !== null ? graphqlComment.user.updatedAt : undefined
    } : undefined,
    username: graphqlComment.username,
    avatar_img: graphqlComment.avatarImg !== null ? graphqlComment.avatarImg : undefined,
    reputation_score: graphqlComment.reputationScore !== null ? graphqlComment.reputationScore : undefined,
    is_edited: graphqlComment.isEdited,
    is_deleted: graphqlComment.isDeleted,
    created_at: graphqlComment.createdAt,
    updated_at: graphqlComment.updatedAt !== null ? graphqlComment.updatedAt : undefined,
    last_activity: graphqlComment.lastActivity,
    active_viewers: graphqlComment.activeViewers,
    metrics: {
      like_count: graphqlComment.metrics.likeCount,
      dislike_count: graphqlComment.metrics.dislikeCount,
      reply_count: graphqlComment.metrics.replyCount,
      report_count: graphqlComment.metrics.reportCount
    },
    interaction_state: {
      like: graphqlComment.interactionState.like,
      dislike: graphqlComment.interactionState.dislike,
      report: graphqlComment.interactionState.report
    },
    replies: graphqlComment.replies.map(convertToSnakeCase)
  };
}