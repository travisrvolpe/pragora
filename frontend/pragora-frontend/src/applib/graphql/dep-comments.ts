import { gql } from "@apollo/client";

export const GET_COMMENT = gql`
  query GetComment($commentId: Int!) {
    comment(commentId: $commentId) {
      commentId
      content
    }
  }
`;

export const GET_COMMENTS = gql`
  query GetComments(
    $postId: Int!
    $parentId: Int
    $page: Int
    $pageSize: Int
  ) {
    comments(
      postId: $postId
      parentId: $parentId
      page: $page
      pageSize: $pageSize
    ) {
      commentId
      content
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      commentId
      content
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      commentId
      content
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: Int!) {
    deleteComment(commentId: $commentId)
  }
`;

export const LIKE_COMMENT = gql`
  mutation LikeComment($commentId: Int!) {
    likeComment(commentId: $commentId) {
      commentId
      content
    }
  }
`;

export const DISLIKE_COMMENT = gql`
  mutation DislikeComment($commentId: Int!) {
    dislikeComment(commentId: $commentId) {
      commentId
      content
    }
  }
`;

export const REPORT_COMMENT = gql`
  mutation ReportComment($commentId: Int!, $reason: String!) {
    reportComment(commentId: $commentId, reason: $reason) {
      commentId
      content
    }
  }
`;
