// applib/services/comment/commentService.ts
import { ApolloClient, ApolloCache, gql } from '@apollo/client';
import {
  GetCommentsDocument,
  CreateCommentDocument,
  UpdateCommentDocument,
  DeleteCommentDocument,
  LikeCommentDocument,
  DislikeCommentDocument,
  ReportCommentDocument,
  CreateCommentInput,
  Comment
} from '@/applib/graphql/generated/types';
import {CommentWithEngagement, convertToGraphQLComment} from '@/types/comments';

// Define a new query for fetching user comments - this is for future implementation
// The backend doesn't support this query yet
const GET_USER_COMMENTS = gql`
  query GetUserComments($userId: Int!, $page: Int, $pageSize: Int) {
    userComments(userId: $userId, page: $page, pageSize: $pageSize) {
      commentId
      content
      userId
      postId
      parentCommentId
      path
      depth
      rootCommentId
      username
      avatarImg
      reputationScore
      isEdited
      isDeleted
      createdAt
      updatedAt
      lastActivity
      activeViewers
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
    }
  }
`;

interface OptimisticResponse {
  createComment?: Partial<Comment>;
  updateComment?: Partial<Comment>;
  deleteComment?: boolean;
  likeComment?: Partial<Comment>;
  dislikeComment?: Partial<Comment>;
}

interface MutationOptions {
  optimisticResponse?: OptimisticResponse;
  update?: (cache: ApolloCache<any>) => void;
}

class CommentService {
  constructor(private apolloClient: ApolloClient<any>) {}

  async getComments(postId: number, page: number = 1, pageSize: number = 20) {
    try {
      const { data } = await this.apolloClient.query({
        query: GetCommentsDocument,
        variables: {
          postId,
          page,
          pageSize
        }
      });
      return data.comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async getUserComments(userIdParam: number, pageParam: number = 1, pageSizeParam: number = 20): Promise<CommentWithEngagement[]> {
    try {
      // Generate mock data that uses snake_case to match your frontend types
      /*const mockComments: CommentWithEngagement[] = [
        {
          comment_id: 1,
          content: "This is a sample comment on a post discussing technology trends.",
          user_id: 2,
          post_id: 101,
          parent_comment_id: undefined,
          path: "0.1",
          depth: 1,
          root_comment_id: undefined,
          username: "SampleUser",
          avatar_img: undefined,
          reputation_score: 25,
          is_edited: false,
          is_deleted: false,
          created_at: new Date().toISOString(),
          updated_at: undefined,
          last_activity: new Date().toISOString(),
          metrics: {
            like_count: 5,
            dislike_count: 1,
            reply_count: 2,
            report_count: 0
          },
          interaction_state: {
            like: true,
            dislike: false,
            report: false
          },
          active_viewers: 3
        },
        {
          comment_id: 2,
          content: "I agree with the author's perspective on renewable energy sources.",
          user_id: 2,
          post_id: 102,
          parent_comment_id: undefined,
          path: "0.2",
          depth: 1,
          root_comment_id: undefined,
          username: "SampleUser",
          avatar_img: undefined,
          reputation_score: 25,
          is_edited: true,
          is_deleted: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          metrics: {
            like_count: 12,
            dislike_count: 0,
            reply_count: 4,
            report_count: 0
          },
          interaction_state: {
            like: false,
            dislike: false,
            report: false
          },
          active_viewers: 1
        }
      ];

      console.log("Using mock data for user comments - API endpoint not yet implemented");
      return mockComments; */

      // TODO: When the backend is ready with a userComments query, implement this:
    const { data } = await this.apolloClient.query({
      query: GET_USER_COMMENTS,
      variables: {
        userId: userIdParam,
        page: pageParam,
        pageSize: pageSizeParam
      }
    });
    const convertComment = (graphqlComment: any): CommentWithEngagement => ({
      comment_id: graphqlComment.commentId,
      content: graphqlComment.content,
      user_id: graphqlComment.userId,
      post_id: graphqlComment.postId,
      parent_comment_id: graphqlComment.parentCommentId,
      path: graphqlComment.path,
      depth: graphqlComment.depth,
      root_comment_id: graphqlComment.rootCommentId,
      username: graphqlComment.username,
      avatar_img: graphqlComment.avatarImg,
      reputation_score: graphqlComment.reputationScore,
      is_edited: graphqlComment.isEdited,
      is_deleted: graphqlComment.isDeleted,
      created_at: graphqlComment.createdAt,
      updated_at: graphqlComment.updatedAt,
      last_activity: graphqlComment.lastActivity,
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
      active_viewers: graphqlComment.activeViewers,
      replies: graphqlComment.replies ? graphqlComment.replies.map((reply: any) => convertComment(reply)) : []
    });

    // Convert all comments
    return data.userComments.map((comment: any) => convertComment(comment));
  } catch (error) {
    console.error('Error fetching user comments:', error);
    throw error;
  }
  }

  async createComment(input: CreateCommentInput) {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: CreateCommentDocument,
        variables: { input }
      });
      return data.createComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async updateComment(commentId: number, content: string) {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: UpdateCommentDocument,
        variables: {
          input: {
            commentId,
            content
          }
        }
      });
      return data.updateComment;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: number) {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: DeleteCommentDocument,
        variables: { commentId }
      });
      return data.deleteComment;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  async likeComment(commentId: number) {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: LikeCommentDocument,
        variables: { commentId }
      });
      return data.likeComment;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }

  async dislikeComment(commentId: number) {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: DislikeCommentDocument,
        variables: { commentId }
      });
      return data.dislikeComment;
    } catch (error) {
      console.error('Error disliking comment:', error);
      throw error;
    }
  }

  async reportComment(commentId: number, reason: string) {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: ReportCommentDocument,
        variables: { commentId, reason }
      });
      return data.reportComment;
    } catch (error) {
      console.error('Error reporting comment:', error);
      throw error;
    }
  }
}

// Export a singleton instance
import { apolloClient } from '@/applib/graphql/apollo-client';
export const commentService = new CommentService(apolloClient);