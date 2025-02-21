// components/posts/wrapper/PostFooter.tsx
'use client'

import { FC } from 'react'
import { ViewPostButton } from '@/components/buttons/ViewPostButton'
import { BackButton } from '@/components/buttons/BackButton'
import { Button } from '@/components/ui/button'  // Add this import
import { EngagementMetricsHandler } from '@/components/engagement/EngagementMetricsHandler'
import { PostComponentProps } from './types'
import { PostVariant } from '@/types/posts/post-types';
import {MetricsData, MetricStates, LoadingStates, ErrorStates, PostInteractionState} from '@/types/posts/engagement'

export interface PostFooterProps extends PostComponentProps {
  variant: PostVariant;
  metrics: MetricsData;
  interactionState: PostInteractionState;
  loading: LoadingStates;
  error: ErrorStates;
  onComment?: () => void;
  onLike: () => Promise<void>;
  onDislike: () => Promise<void>;
  onShare: () => Promise<void>;
  onSave: () => Promise<void>;
  onThreadedReply?: () => void;  // Add this line
}

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
}) => (
  <div className="p-4 border-t">
    <div className="flex items-center justify-between">
      <EngagementMetricsHandler
        type="post"
        metrics={metrics}
        states={interactionState}
        loading={loading}
        error={error}
        onLike={onLike}
        onDislike={onDislike}
        onComment={onComment}
        onShare={onShare}
        onSave={onSave}
      />
      <div className="flex items-center space-x-2">
        {variant === ('feed' as PostVariant) && <ViewPostButton postId={post.post_id} />}
        {variant === ('detail' as PostVariant) && (
          <>
            <BackButton />
            {onThreadedReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onThreadedReply}
                className="text-gray-600"
              >
                Reply
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);