// components/posts/wrapper/types.ts
import { ReactNode } from 'react';
import { PostVariant } from '@/types/posts/post-types';
import { BasePostWithEngagement, PostWithEngagement } from '@/types/posts/engagement';
import { BaseComponentProps } from '@/types/posts/component-types';

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

export interface PostWrapperProps extends BaseComponentProps {
  post: PostWithEngagement;  // Changed from Post to PostWithEngagement
  variant?: 'feed' | 'detail';
  onBack?: () => void;
  onComment?: () => void;
  onThreadedReply?: () => void;
  showAnalytics?: boolean;
}