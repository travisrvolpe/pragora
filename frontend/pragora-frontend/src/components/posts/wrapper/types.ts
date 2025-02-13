// components/posts/wrapper/types.ts
import { ReactNode } from 'react';
import { PostVariant } from '@/types/posts/post-types';
import { PostWithEngagement } from '@/types/posts/engagement';
import { BaseComponentProps } from '@/types/posts/component-types';

export interface PostComponentProps {
  post: PostWithEngagement;
  className?: string;
}

export interface PostHeaderProps extends PostComponentProps {
  onReport: () => Promise<void>;
  isReportLoading?: boolean;
}

export interface PostFooterProps extends PostComponentProps {
  variant: PostVariant;
  metrics: {
    like_count: number;
    dislike_count: number;
    save_count: number;
    share_count: number;
    report_count: number;
  };
  interactionState: {
    like: boolean;
    dislike: boolean;
    save: boolean;
    report: boolean;
  };
  loading: {
    like: boolean;
    dislike: boolean;
    save: boolean;
    share: boolean;
    report: boolean;
  };
  error: {
    like: boolean;
    dislike: boolean;
    save: boolean;
    share: boolean;
    report: boolean;
  };
  onComment?: () => void;
  onLike: () => Promise<void>;
  onDislike: () => Promise<void>;
  onShare: () => Promise<void>;
  onSave: () => Promise<void>;
}

export interface PostWrapperProps extends BaseComponentProps {
  post: PostWithEngagement;
  variant?: PostVariant;
  onComment?: () => void;
  onThreadedReply?: () => void;
  showAnalytics?: boolean;
}