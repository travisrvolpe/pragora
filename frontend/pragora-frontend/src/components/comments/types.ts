// components/comments/types.ts
import type { WebSocket } from 'ws';
import type { CommentWithEngagement } from '@/types/comments';

export interface CommentFormProps {
  postId: number;
  parentId?: number;
  wsConnection?: WebSocket | null;
  defaultContent?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export interface CommentCardProps {
  comment: CommentWithEngagement;
  wsConnection?: WebSocket | null;
}