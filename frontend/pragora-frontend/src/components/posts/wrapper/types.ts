// components/posts/wrapper/types.ts
import { ReactNode } from 'react';
import { PostVariant } from '@/types/posts/post-types';
import { BasePostWithEngagement } from '@/types/posts/engagement';

export interface PostComponentProps {
  post: BasePostWithEngagement;
  className?: string;
}

export interface PostWrapperProps extends PostComponentProps {
  children: ReactNode;
  variant?: PostVariant;
  onComment?: () => void;
  onThreadedReply?: () => void;
}