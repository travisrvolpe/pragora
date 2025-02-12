// types/posts/component-types.ts
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Post, PostTypeId } from './post-types';
import type { PostMetrics, PostInteractionState, PostWithEngagement } from './engagement';

// Base component props interface
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Post card interfaces
export interface PostCardProps extends BaseComponentProps {
  post: PostWithEngagement;
  variant?: 'feed' | 'detail';  // Use literal type instead of PostVariant
  onBack?: () => void;
  className?: string;
  onViewPost?: (id: number) => void;
  onLike?: (id: number) => Promise<void>;
  onDislike?: (id: number) => Promise<void>;
  onSave?: (id: number) => Promise<void>;
  onShare?: (id: number) => Promise<void>;
  onReport?: (id: number, reason: string) => Promise<void>;
  onComment?: () => void;
}

// Post wrapper interfaces
export interface PostWrapperProps extends BaseComponentProps {
  post: Post;
  variant?: 'feed' | 'detail';
  onBack?: () => void;
  onComment?: () => void;
  onThreadedReply?: () => void;
  showAnalytics?: boolean;
}

// Post action interfaces
export interface PostActionProps {
  isLoading: boolean;
  isError: boolean;
  isActive: boolean;
  count: number;
  onClick: () => Promise<void>;
  icon: LucideIcon;
  label: string;
}

// Factory interfaces
export interface PostFactoryProps extends Omit<PostCardProps, 'post'> {
  post: PostWithEngagement;
}

// Engagement metrics interfaces
export interface EngagementMetricsProps {
  postId: number;
  metrics: PostMetrics;
  interactionState: PostInteractionState;
  variant?: 'feed' | 'detail';
  className?: string;
  onMetricsUpdate?: (metrics: PostMetrics) => void;
}

export interface PostFactoryProps {
  post: PostWithEngagement;
  variant?: 'feed' | 'detail';
  className?: string;
  onBack?: () => void;
  onViewPost?: (id: number) => void;
  onComment?: () => void;
}

export interface PostFactoryProps {
  post: PostWithEngagement;
  variant?: 'feed' | 'detail';
  className?: string;
}

export interface PostHeaderProps {
  post: PostWithEngagement;
  onReport: () => void;  // Changed to match expected type
  isReportLoading: boolean;
}

export interface PostFooterProps {
  post: PostWithEngagement;
  variant: 'feed' | 'detail';
  metrics: PostMetrics;
  interactionState: PostInteractionState;
  //loading: LoadingStates;
  //error: ErrorStates;
  onComment?: () => void;
  onLike: () => Promise<void>;
  onDislike: () => Promise<void>;
  onShare: () => Promise<void>;
  onSave: () => Promise<void>;
}