// components/engagement/EngagementMetricsHandler.tsx
'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { LikeButton } from '@/components/buttons/LikeButton'
import { DislikeButton } from '@/components/buttons/DislikeButton'
import { SaveButton } from '@/components/buttons/SaveButton'
import { ShareButton } from '@/components/buttons/ShareButton'
import { EngagementButton } from '@/components/buttons/EngagementButton'
import { MetricsData, MetricStates, LoadingStates, ErrorStates } from '@/types/posts/engagement'

interface EngagementMetricsHandlerProps {
  type: 'post' | 'comment'
  metrics: MetricsData
  states: MetricStates
  loading: LoadingStates
  error: ErrorStates
  onLike: () => Promise<void>
  onDislike: () => Promise<void>
  onComment?: () => void
  onShare: () => Promise<void>
  onSave: () => Promise<void>
  className?: string
}

export const EngagementMetricsHandler: React.FC<EngagementMetricsHandlerProps> = ({
  type,
  metrics,
  states,
  loading,
  error,
  onLike,
  onDislike,
  onComment,
  onShare,
  onSave,
  className
}) => {
  const handleInteraction = async (handler: () => Promise<void>) => {
    try {
      await handler()
    } catch (err) {
      console.error('Error handling interaction:', err)
    }
  }

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <LikeButton
        count={metrics.like_count}
        onClick={() => handleInteraction(onLike)}
        disabled={loading.like}
        active={states.like}
        error={error.like}
      />

      <DislikeButton
        count={metrics.dislike_count}
        onClick={() => handleInteraction(onDislike)}
        disabled={loading.dislike}
        active={states.dislike}
        error={error.dislike}
      />

      {type === 'post' && onComment && (
        <EngagementButton
          icon={MessageCircle}
          count={metrics.comment_count || 0}
          onClick={onComment}
          disabled={false}
          tooltip="Comment"
          className="text-gray-600"
        />
      )}

      <ShareButton
        count={metrics.share_count}
        onClick={() => handleInteraction(onShare)}
        disabled={loading.share}
        error={error.share}
      />

      <SaveButton
        count={metrics.save_count}
        onClick={() => handleInteraction(onSave)}
        disabled={loading.save}
        active={states.save}
        error={error.save}
      />
    </div>
  )
}

export default EngagementMetricsHandler