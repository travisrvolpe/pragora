// components/comments/CommentForm.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useComment } from '@/contexts/comment/CommentContext';
import { Button } from '@/components/ui/button';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { createComment, updateComment } = useComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      if (defaultContent) {
        // If defaultContent exists, we're editing an existing comment
        await updateComment(parentId!, content);
      } else {
        // Otherwise, we're creating a new comment
        await createComment(postId, content, parentId);
      }
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center text-gray-500">
        Please log in to comment
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Write a comment..."}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="bg-blue-500 text-white"
        >
          {isSubmitting ? 'Saving...' : defaultContent ? 'Save' : parentId ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;