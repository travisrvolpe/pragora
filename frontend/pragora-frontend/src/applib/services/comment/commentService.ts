// applib/services/comment/commentService.ts
import { ApolloClient, ApolloCache } from '@apollo/client';
import {
  GetCommentsDocument,
  CreateCommentDocument,
  UpdateCommentDocument,
  DeleteCommentDocument,
  LikeCommentDocument,
  DislikeCommentDocument,
  ReportCommentDocument,
  CreateCommentInput,
  Comment,
  CommentMetrics,
  CommentInteractionState
} from '@/applib/graphql/generated/types';

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
    const { data } = await this.apolloClient.query({
      query: GetCommentsDocument,
      variables: {
        postId,
        page,
        pageSize
      }
    });
    return data.comments;
  }

  async getUserComments(): Promise<CommentWithEngagement[]> {
  try {
    const response = await this.apolloClient.query({
      query: GetCommentsDocument,
      variables: {
        page: 1,
        pageSize: 20,
      }
    });
    return response.data.comments;
  } catch (error) {
    console.error('Error fetching user comments:', error);
    throw error;
  }
}

  async createComment(input: CreateCommentInput) {
    const { data } = await this.apolloClient.mutate({
      mutation: CreateCommentDocument,
      variables: { input }
    });
    return data.createComment;
  }

  async updateComment(commentId: number, content: string) {
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
  }

  async deleteComment(commentId: number) {
    const { data } = await this.apolloClient.mutate({
      mutation: DeleteCommentDocument,
      variables: { commentId }
    });
    return data.deleteComment;
  }

  async likeComment(commentId: number) {
    const { data } = await this.apolloClient.mutate({
      mutation: LikeCommentDocument,
      variables: { commentId }
    });
    return data.likeComment;
  }

  async dislikeComment(commentId: number) {
    const { data } = await this.apolloClient.mutate({
      mutation: DislikeCommentDocument,
      variables: { commentId }
    });
    return data.dislikeComment;
  }

  async reportComment(commentId: number, reason: string) {
    const { data } = await this.apolloClient.mutate({
      mutation: ReportCommentDocument,
      variables: { commentId, reason }
    });
    return data.reportComment;
  }
}



// Export a singleton instance
import { apolloClient } from '@/applib/graphql/apollo-client';
import {CommentWithEngagement} from "@/types/comments";
export const commentService = new CommentService(apolloClient);