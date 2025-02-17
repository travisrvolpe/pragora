// components/comments/CommentForm.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/hooks/use-toast/use-toast';
import { ApolloError, useMutation } from '@apollo/client';
import {
  CREATE_COMMENT,
  UPDATE_COMMENT
} from '@/lib/graphql/operations/comments';
import type {
  CreateCommentInput,
  UpdateCommentInput,
  CreateCommentMutation,
  UpdateCommentMutation,
  CreateCommentMutationVariables,
  UpdateCommentMutationVariables
} from '@/lib/graphql/generated/types';

interface CommentFormProps {
  postId: number;
  parentId?: number;
  defaultContent?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId,
  defaultContent = '',
  onCancel,
  onSuccess
}) => {
  const [content, setContent] = useState(defaultContent);
  const { user } = useAuth();

  const [createComment, { loading: createLoading }] = useMutation<
    CreateCommentMutation,
    CreateCommentMutationVariables
  >(CREATE_COMMENT, {
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
    }
  });

  const [updateComment, { loading: updateLoading }] = useMutation<
    UpdateCommentMutation,
    UpdateCommentMutationVariables
  >(UPDATE_COMMENT, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      if (defaultContent && parentId) {
        await updateComment({
          variables: {
            input: {
              commentId: parentId,
              content: content.trim()
            }
          }
        });
      } else {
        await createComment({
          variables: {
            input: {
              content: content.trim(),
              postId,
              parentCommentId: parentId
            }
          }
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error submitting comment:', error.message);
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
        rows={3}
        disabled={isSubmitting}
      />
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