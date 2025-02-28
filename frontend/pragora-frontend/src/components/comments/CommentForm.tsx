// components/comments/CommentForm.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/applib/hooks/use-toast/use-toast';
import { ApolloError, useMutation, ApolloCache, DocumentNode } from '@apollo/client';
import {
  CREATE_COMMENT,
  UPDATE_COMMENT,
  GET_COMMENTS
} from '@/applib/graphql/operations/comments';
import type {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
  GetCommentsQuery,
  User,
  CommentMetrics,
  CommentInteractionState,
  Mutation,
  Scalars
} from '@/applib/graphql/generated/types';

interface CommentFormProps {
  postId: Scalars['Int']['input'];  // Match the scalar type postId: number;
  parentId?: Scalars['Int']['input'];  // Match the scalar type  parentId?: number; postId: number;
  defaultContent?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

// Define response types for mutations
interface CreateCommentResult {
  createComment: Comment;
}

interface UpdateCommentResult {
  updateComment: Comment;
}

// Define variable types for mutations
interface CreateCommentVariables {
  input: CreateCommentInput;
}

interface UpdateCommentVariables {
  input: UpdateCommentInput;
}

// Helper type for complete comment structure
type CompleteComment = Required<Comment> & {
  user: User;
  username: string;
  metrics: CommentMetrics;
  interactionState: CommentInteractionState;
};

interface CreateCommentData {
  createComment: {
    commentId: number;
    content: string;
    postId: number;
    parentCommentId?: number | null;
    user: {
      userId: number;
      username: string;
    };
    createdAt: string;
  };
}

const ensureCompleteComment = (comment: Partial<Comment>): CompleteComment => {
  if (!comment.user || !comment.username || !comment.metrics || !comment.interactionState) {
    throw new Error('Incomplete comment data');
  }

  return {
    __typename: 'Comment',
    commentId: comment.commentId!,
    content: comment.content!,
    userId: comment.userId!,
    postId: comment.postId!,
    parentCommentId: comment.parentCommentId || null,
    path: comment.path!,
    depth: comment.depth!,
    rootCommentId: comment.rootCommentId || null,
    user: {
      __typename: 'User',
      ...comment.user
    },
    username: comment.username,
    avatarImg: comment.avatarImg || null,
    reputationScore: comment.reputationScore || null,
    metrics: {
      __typename: 'CommentMetrics',
      ...comment.metrics
    },
    interactionState: {
      __typename: 'CommentInteractionState',
      ...comment.interactionState
    },
    isEdited: comment.isEdited || false,
    isDeleted: comment.isDeleted || false,
    createdAt: comment.createdAt!,
    updatedAt: comment.updatedAt || null,
    lastActivity: comment.lastActivity!,
    activeViewers: comment.activeViewers || 0,
    replies: comment.replies?.map(reply => ensureCompleteComment(reply as Partial<Comment>)) || []
  };
};

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId,
  defaultContent = '',
  onCancel,
  onSuccess
}) => {
  const [content, setContent] = useState(defaultContent);
  // Sync content with defaultContent changes
  useEffect(() => {
    setContent(defaultContent);
  }, [defaultContent]);

  const { user } = useAuth();
  const [createCommentMutation, { loading: createLoading }] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      setContent('');
      onSuccess?.();
      toast({
        title: 'Success',
        description: 'Comment posted successfully'
      });
    },
    onError: (error: ApolloError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    update: (cache: ApolloCache<any>, { data }: { data?: { createComment: Comment } }) => {
      if (!data?.createComment) return;

      try {
        const existingData = cache.readQuery<GetCommentsQuery>({
          query: GET_COMMENTS,
          variables: { postId, parentCommentId: null, page: 1, pageSize: 50 }
        });

        if (!existingData?.comments) return;

        if (parentId) {
          // Update for replies
          const updateReplies = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.commentId === parentId) {
                const newReply = {
                  ...data.createComment,
                  __typename: 'Comment' as const,
                  user: data.createComment.user,
                  username: data.createComment.user.username,
                  replies: []
                };
                return {
                  ...comment,
                  metrics: {
                    ...comment.metrics,
                    replyCount: comment.metrics.replyCount + 1
                  },
                  replies: [...(comment.replies || []), newReply]
                };
              }
              if (comment.replies?.length) {
                return {
                  ...comment,
                  replies: updateReplies(comment.replies)
                };
              }
              return comment;
            });
          };

          cache.writeQuery<GetCommentsQuery>({
            query: GET_COMMENTS,
            variables: { postId, parentCommentId: null, page: 1, pageSize: 50 },
            data: {
              __typename: 'Query',
              comments: updateReplies(existingData.comments)
            }
          });
        } else {
          // Update for top-level comments
          const newComment = {
            ...data.createComment,
            __typename: 'Comment' as const,
            user: data.createComment.user,
            username: data.createComment.user.username,
            replies: []
          };

          cache.writeQuery<GetCommentsQuery>({
            query: GET_COMMENTS,
            variables: { postId, parentCommentId: null, page: 1, pageSize: 50 },
            data: {
              __typename: 'Query',
              comments: [newComment, ...existingData.comments]
            }
          });
        }
      } catch (error) {
        console.error('Cache update error:', error);
      }
    }
  });

  const [updateCommentMutation, { loading: updateLoading }] = useMutation(UPDATE_COMMENT, {
    onCompleted: () => {
      onSuccess?.();
      toast({
        title: 'Success',
        description: 'Comment updated successfully'
      });
    },
    onError: (error: ApolloError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const validateContent = (text: string) => {
    if (!text.trim()) return 'Content cannot be empty';
    if (text.length > 1000) return 'Content is too long';
    return null;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateContent(content);
    if (error) {
      toast({
        title: 'Validation Error',
        description: error,
        variant: 'destructive'
      });
      return;
    }
    if (!content.trim()) return;

    console.log('Submitting comment with:', {
      content: content.trim(),
      postId,
      parentId,
      defaultContent
    });

    try {
      if (defaultContent && parentId) {
        // Updating an existing comment
        await updateCommentMutation({
          variables: {
            input: {
              commentId: parentId,
              content: content.trim()
            }
          }
        });
      } else {
        // Creating a new comment or reply
        const input: CreateCommentInput = {
          content: content.trim(),
          postId: Number(postId), // Ensure postId is a number
          parentCommentId: parentId ? Number(parentId) : undefined // Convert to number or undefined
        };

        console.log('Creating new comment with:', input);

        await createCommentMutation({
          variables: { input }
        });
      }
    } catch (error) {
      console.error('Mutation error:', error);
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="text-center text-gray-500">
        Please log in to comment
      </div>
    );
  }

  const isSubmitting = createLoading || updateLoading;

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={parentId ? "Write a reply..." : "Write a comment..."}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}  // Fixed number of rows or make it dynamic
            disabled={isSubmitting}
            aria-label={parentId ? "Reply text" : "Comment text"}
            maxLength={1000}
        />
        {/* Add character count */}
        <div className="text-sm text-gray-500">
          {content.length}/1000 characters
        </div>
        <div className="flex justify-end space-x-2">
          {onCancel && (
              <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
              >
                Cancel
              </Button>
          )}
          <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-blue-500 text-white"
          >
            {isSubmitting
                ? 'Saving...'
                : defaultContent
                    ? 'Save'
                    : parentId
                        ? 'Reply'
                        : 'Comment'
            }
          </Button>
        </div>
      </form>
  );
};