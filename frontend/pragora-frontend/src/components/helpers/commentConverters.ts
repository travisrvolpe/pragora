// helpers/commentConverters.ts
import type { CommentWithEngagement } from '@/types/comments/comment-types';

export function convertToCamelCase(snakeCaseComment: CommentWithEngagement) {
  return {
    __typename: "Comment" as const,
    commentId: snakeCaseComment.comment_id,
    userId: snakeCaseComment.user_id,
    postId: snakeCaseComment.post_id,
    content: snakeCaseComment.content,
    parentCommentId: snakeCaseComment.parent_comment_id,
    path: snakeCaseComment.path,
    depth: snakeCaseComment.depth,
    rootCommentId: snakeCaseComment.root_comment_id,
    user: snakeCaseComment.user ? {
      __typename: "User" as const,
      userId: snakeCaseComment.user.user_id,
      username: snakeCaseComment.user.username,
      email: snakeCaseComment.user.email,
      avatarImg: snakeCaseComment.user.avatar_img,
      reputationScore: snakeCaseComment.user.reputation_score,
      expertiseArea: snakeCaseComment.user.expertise_area,
      credentials: snakeCaseComment.user.credentials,
      createdAt: snakeCaseComment.user.created_at,
      updatedAt: snakeCaseComment.user.updated_at
    } : null,
    username: snakeCaseComment.username || '',
    avatarImg: snakeCaseComment.avatar_img,
    reputationScore: snakeCaseComment.reputation_score,
    metrics: {
      __typename: "CommentMetrics" as const,
      likeCount: snakeCaseComment.metrics.like_count,
      dislikeCount: snakeCaseComment.metrics.dislike_count,
      replyCount: snakeCaseComment.metrics.reply_count,
      reportCount: snakeCaseComment.metrics.report_count
    },
    interactionState: {
      __typename: "CommentInteractionState" as const,
      like: snakeCaseComment.interaction_state.like,
      dislike: snakeCaseComment.interaction_state.dislike,
      report: snakeCaseComment.interaction_state.report
    },
    isEdited: snakeCaseComment.is_edited,
    isDeleted: snakeCaseComment.is_deleted,
    createdAt: snakeCaseComment.created_at,
    updatedAt: snakeCaseComment.updated_at,
    lastActivity: snakeCaseComment.last_activity,
    activeViewers: snakeCaseComment.active_viewers,
    replies: snakeCaseComment.replies?.map(convertToCamelCase) || []
  };
}

export function convertToSnakeCase(graphqlComment: any): CommentWithEngagement {
  return {
    comment_id: graphqlComment.commentId,
    user_id: graphqlComment.userId,
    post_id: graphqlComment.postId,
    content: graphqlComment.content,
    parent_comment_id: graphqlComment.parentCommentId,
    path: graphqlComment.path,
    depth: graphqlComment.depth,
    root_comment_id: graphqlComment.rootCommentId,
    user: graphqlComment.user ? {
      user_id: graphqlComment.user.userId,
      username: graphqlComment.user.username,
      email: graphqlComment.user.email,
      avatar_img: graphqlComment.user.avatarImg,
      reputation_score: graphqlComment.user.reputationScore,
      expertise_area: graphqlComment.user.expertiseArea,
      credentials: graphqlComment.user.credentials,
      created_at: graphqlComment.user.createdAt,
      updated_at: graphqlComment.user.updatedAt
    } : undefined,
    username: graphqlComment.username,
    avatar_img: graphqlComment.avatarImg,
    reputation_score: graphqlComment.reputationScore,
    is_edited: graphqlComment.isEdited,
    is_deleted: graphqlComment.isDeleted,
    created_at: graphqlComment.createdAt,
    updated_at: graphqlComment.updatedAt,
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
    replies: graphqlComment.replies?.map(convertToSnakeCase) || []
  };
}