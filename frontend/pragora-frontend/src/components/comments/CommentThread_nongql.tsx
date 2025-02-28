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
import {useToast, toast } from '@/applib/hooks/use-toast/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { CommentWithEngagement } from '@/types/comments';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';

// CommentThread Component
export const CommentThread: React.FC<{
  postId: number;
  initialComments?: CommentWithEngagement[];
}> = ({ postId, initialComments = [] }) => {
  const queryClient = useQueryClient();
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const commentListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Query for fetching comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    initialData: initialComments
  });

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token'); // or however you store your token
    const ws = new WebSocket(`ws://localhost:8000/ws/post/${postId}?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnection(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_comment') {
        // Update comments cache
        queryClient.setQueryData(['comments', postId], (old: any) => ({
          ...old,
          comments: [data.comment, ...(old?.comments || [])]
        }));

        // Scroll to new comment if at bottom
        if (commentListRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = commentListRef.current;
          if (scrollHeight - scrollTop === clientHeight) {
            commentListRef.current.scrollTop = scrollHeight;
          }
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to comment stream",
        variant: "destructive"
      });
    };

    return () => {
      ws.close();
    };
  }, [postId]);

  if (isLoading) {
    return <div className="animate-pulse">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <CommentForm postId={postId} wsConnection={wsConnection} />
      <div
        ref={commentListRef}
        className="space-y-4 max-h-[600px] overflow-y-auto"
      >
        {comments?.map((comment: CommentWithEngagement) => (
          <CommentCard
            key={comment.comment_id}
            comment={comment}
            wsConnection={wsConnection}
          />
        ))}
      </div>
    </div>
  );
};