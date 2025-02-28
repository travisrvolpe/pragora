// src/applib/graphql/operations/comments.ts
import { gql } from "@apollo/client";

/**
 * Update CommentFields to ensure all fields match backend schema
 */
export const COMMENT_FIELDS = gql`
  fragment CommentFields on Comment {
    commentId
    content
    userId
    postId
    parentCommentId
    path
    depth
    rootCommentId
    user {
      userId
      username
      email
      avatarImg
      reputationScore
      expertiseArea
      credentials
      createdAt
      updatedAt
    }
    username # Add this field as it's directly on Comment in backend
    avatarImg # Add this field as it's directly on Comment in backend
    reputationScore # Add this field as it's directly on Comment in backend
    metrics {
      likeCount
      dislikeCount
      replyCount
      reportCount
    }
    interactionState {
      like
      dislike
      report
    }
    isEdited
    isDeleted
    createdAt
    updatedAt
    lastActivity
    activeViewers
    replies {
      # Nested replies should include the same fields
      commentId
      content
      userId
      postId
      parentCommentId
      path
      depth
      rootCommentId
      metrics {
        likeCount
        dislikeCount
        replyCount
        reportCount
      }
      interactionState {
        like
        dislike
        report
      }
      isEdited
      isDeleted
      createdAt
      updatedAt
      lastActivity
      activeViewers
    }
  }
`;
/* =====================
 *  QUERIES
 * ===================== */

/**
 * Query a single comment by ID using `comment(commentId: Int!)`.
 */
export const GET_COMMENT = gql`
query GetComments($postId: Int!, $parentCommentId: Int, $page: Int, $pageSize: Int) {
  comments(
    postId: $postId
    parentCommentId: $parentCommentId
    page: $page
    pageSize: $pageSize
  ) {
    ...CommentFields
    replies {
      ...CommentFields
      replies {
        ...CommentFields
        replies {
          ...CommentFields
        }
      }
    }
  }
}
  ${COMMENT_FIELDS}
`;

/**
 * Query multiple comments with `comments(postId: Int!, parentCommentId: Int, page: Int, pageSize: Int)`.
 */
export const GET_COMMENTS = gql`
  query GetComments($postId: Int!, $parentCommentId: Int, $page: Int, $pageSize: Int) {
    comments(
      postId: $postId
      parentCommentId: $parentCommentId
      page: $page
      pageSize: $pageSize
    ) {
      ...CommentFields
      # We need to explicitly request nested replies with their fields
      replies {
        ...CommentFields
        replies {
          ...CommentFields
        }
      }
    }
  }
  ${COMMENT_FIELDS}
`;


/* =====================
 *  MUTATIONS
 * ===================== */

/**
 * createComment(input: CreateCommentInput!)
 */


export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      ...CommentFields
      replies {
        ...CommentFields
      }
    }
  }
  ${COMMENT_FIELDS}
`;

// Add error type for better error handling
export interface CommentError {
  message: string;
  extensions?: {
    code: string;
    requiresAuth?: boolean;
  };
}
/**
 * updateComment(input: UpdateCommentInput!)
 */
export const UPDATE_COMMENT = gql`
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

/**
 * deleteComment(commentId: Int!)
 */
export const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: Int!) {
    deleteComment(commentId: $commentId)
  }
`;

/**
 * likeComment(commentId: Int!)
 */
export const LIKE_COMMENT = gql`
  mutation LikeComment($commentId: Int!) {
    likeComment(commentId: $commentId) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

/**
 * dislikeComment(commentId: Int!)
 */
export const DISLIKE_COMMENT = gql`
  mutation DislikeComment($commentId: Int!) {
    dislikeComment(commentId: $commentId) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

/**
 * reportComment(commentId: Int!, reason: String!)
 */
export const REPORT_COMMENT = gql`
  mutation ReportComment($commentId: Int!, $reason: String!) {
    reportComment(commentId: $commentId, reason: $reason) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

/* =====================
 *  SUBSCRIPTIONS
 * ===================== */

/**
 * subscribe to commentAdded(postId: Int!)
 */
export const COMMENT_ADDED_SUBSCRIPTION = gql`
  subscription OnCommentAdded($postId: Int!) {
    commentAdded(postId: $postId) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

/**
 * subscribe to commentUpdated(postId: Int!)
 */
export const COMMENT_UPDATED_SUBSCRIPTION = gql`
  subscription OnCommentUpdated($postId: Int!) {
    commentUpdated(postId: $postId) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

/**
 * subscribe to commentDeleted(postId: Int!)
 */
export const COMMENT_DELETED_SUBSCRIPTION = gql`
  subscription OnCommentDeleted($postId: Int!) {
    commentDeleted(postId: $postId)
  }
`;

/**
 * subscribe to commentActivity(postId: Int!)
 */
export const COMMENT_ACTIVITY_SUBSCRIPTION = gql`
  subscription OnCommentActivity($postId: Int!) {
    commentActivity(postId: $postId) {
      commentId
      activeViewers
      lastActivity
    }
  }
`;
