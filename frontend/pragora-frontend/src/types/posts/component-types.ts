// types/posts/component-types.ts
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Post, PostTypeId } from './post-types';
import type { PostMetrics, PostInteractionState } from './engagement';

// Base component props interface
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Post card interfaces
export interface PostCardProps extends BaseComponentProps {
  post: Post;
  variant?: 'feed' | 'detail';  // Use literal type instead of PostVariant
  onBack?: () => void;
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
export interface PostFactoryProps extends PostCardProps {
  post: Post & {
    post_type_id: PostTypeId;
  };
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