// types/posts/component-types.ts
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Post, PostTypeId, PostVariant } from './post-types';
import type {
  PostMetrics,
  PostInteractionState,
  PostWithEngagement,
  MetricsData,
  LoadingStates,
  ErrorStates
} from './engagement';

// Base component props interface
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Post metrics interface
export interface PostMetricsProps {
  post: PostWithEngagement;
  variant: 'feed' | 'detail';
  metrics: PostMetrics;
  interactionState: PostInteractionState;
  loading: LoadingStates;
  error: ErrorStates;
  onComment?: () => void;
  onLike: () => Promise<void>;
  onDislike: () => Promise<void>;
  onShare: () => Promise<void>;
  onSave: () => Promise<void>;
  onThreadedReply?: () => void;
  className?: string;
}

// Post card interfaces
export interface PostCardProps extends BaseComponentProps {
  post: PostWithEngagement;
  variant?: 'feed' | 'detail';  // Use literal type instead of PostVariant = why was this change made?
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
  post: Post & {
    metrics: MetricsData;
    interaction_state: PostInteractionState;
    analysis?: any; // Replace with proper analysis type
  };
  children: ReactNode;
  variant?: 'feed' | 'detail'; //variant?: PostVariant;
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
  variant?: 'feed' | 'detail';
  className?: string;
  onBack?: () => void;
  onViewPost?: (id: number) => void;
  onComment?: () => void;
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