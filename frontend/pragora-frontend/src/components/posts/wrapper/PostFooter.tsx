// components/posts/wrapper/PostFooter.tsx
'use client'

import { FC, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ViewPostButton } from '@/components/buttons/ViewPostButton'
import { BackButton } from '@/components/buttons/BackButton'
import { Button } from '@/components/ui/button'
import { PostComponentProps } from './types'
import type { PostVariant } from '@/types/posts/post-types';
import type { PostMetrics, LoadingStates, ErrorStates, PostInteractionState } from '@/types/posts/engagement'

export interface PostFooterProps extends PostComponentProps {
  variant: PostVariant;
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
}

const DynamicPostMetrics = dynamic(
  () => import('@/components/posts/metrics/PostMetrics'),
  { ssr: false }
);

export const PostFooter: FC<PostFooterProps> = ({
  post,
  variant,
  metrics,
  interactionState,
  loading,
  error,
  onComment,
  onLike,
  onDislike,
  onShare,
  onSave,
  onThreadedReply
}) => {
  // Debug props received by PostFooter
  useEffect(() => {
    console.log("PostFooter received props:", {
      postId: post.post_id,
      metrics,
      interactionState,
      loading,
      error
    });
  }, [post.post_id, metrics, interactionState, loading, error]);

  return (
    <div className="p-4 border-t">
      <div className="flex items-center justify-between">
        <DynamicPostMetrics
          post={post}
          variant={variant}
          metrics={metrics}
          interactionState={interactionState}
          loading={loading}
          error={error}
          onComment={onComment}
          onLike={onLike}
          onDislike={onDislike}
          onShare={onShare}
          onSave={onSave}
          onThreadedReply={onThreadedReply}
        />
      </div>
    </div>
  );
};