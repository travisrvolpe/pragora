// components/posts/wrapper/PostFooter.tsx
'use client'

import { FC } from 'react'
import { ViewPostButton } from '@/components/buttons/ViewPostButton'
import { BackButton } from '@/components/buttons/BackButton'
import { EngagementMetricsHandler } from '@/components/engagement/EngagementMetricsHandler'
import { PostComponentProps } from './types'
import { PostVariant } from '@/types/posts/post-types';
import { MetricsData, MetricStates, LoadingStates, ErrorStates } from '@/types/posts/engagement'

interface PostFooterProps extends PostComponentProps {
  variant: PostVariant
  metrics: MetricsData
  interactionState: MetricStates
  loading: LoadingStates
  error: ErrorStates
  onComment?: () => void
  onLike: () => Promise<void>
  onDislike: () => Promise<void>
  onShare: () => Promise<void>
  onSave: () => Promise<void>
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

      {variant === ('feed' as PostVariant) && <ViewPostButton postId={post.post_id} />}
      {variant === ('detail' as PostVariant) && <BackButton />}
    </div>
  </div>
)