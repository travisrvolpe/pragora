// CommentForm Component
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreVertical,
  Reply,
  Edit,
  Trash
} from 'lucide-react';
import {useToast, toast } from '../../lib/hooks/use-toast/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { CommentWithEngagement } from '@/types/comments';

interface CommentFormProps {
  postId: number;
  parentId?: number;
  wsConnection: WebSocket | null;
  defaultContent?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId,
  wsConnection,
  defaultContent = '',
  onCancel,
  onSuccess
}) => {
  const [content, setContent] = useState(defaultContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async () => {
      const endpoint = defaultContent
        ? `/api/comments/${parentId}`  // Edit existing comment
        : '/api/posts/comments';       // Create new comment

      const response = await fetch(endpoint, {
        method: defaultContent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          post_id: postId,
          parent_comment_id: parentId
        })
      });

      if (!response.ok) throw new Error('Failed to save comment');
      return response.json();
    },
    onSuccess: (data) => {
      setContent('');
      // Broadcast new/updated comment via WebSocket
      if (wsConnection?.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          type: defaultContent ? 'update_comment' : 'new_comment',
          comment: data
        }));
      }
      onSuccess?.();
      // Invalidate comments query
      queryClient.invalidateQueries({
        queryKey: ['comments', postId]
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await createCommentMutation.mutateAsync();
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