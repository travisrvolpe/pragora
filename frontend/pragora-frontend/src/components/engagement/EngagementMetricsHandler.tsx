// components/engagement/EngagementMetricsHandler.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { LikeButton } from '@/components/buttons/LikeButton'
import { DislikeButton } from '@/components/buttons/DislikeButton'
import { SaveButton } from '@/components/buttons/SaveButton'
import { ShareButton } from '@/components/buttons/ShareButton'
import { EngagementButton } from '@/components/buttons/EngagementButton'
import type { MetricsData, MetricStates, LoadingStates, ErrorStates } from '@/types/posts/engagement'

interface EngagementMetricsHandlerProps {
  type: 'post' | 'comment';
  metrics: MetricsData;
  states: MetricStates;
  loading: LoadingStates;
  error: ErrorStates;
  onLike: () => Promise<void>;
  onDislike: () => Promise<void>;
  onComment?: () => void;
  onShare: () => Promise<void>;
  onSave: () => Promise<void>;
  className?: string;
}

export const EngagementMetricsHandler: React.FC<EngagementMetricsHandlerProps> = ({
  type,
  metrics: initialMetrics,
  states: initialStates,
  loading,
  error,
  onLike,
  onDislike,
  onComment,
  onShare,
  onSave,
  className
}) => {
  // Local state for optimistic updates
  const [metrics, setMetrics] = useState<MetricsData>(initialMetrics)
  const [states, setStates] = useState<MetricStates>(initialStates)

  // Update local state when props change
  useEffect(() => {
    setMetrics(initialMetrics)
    setStates(initialStates)
  }, [initialMetrics, initialStates])

  // Generic handler for interactions
  const handleInteraction = useCallback(async (
    handler: () => Promise<void>,
    type: keyof MetricStates,
    countKey: keyof MetricsData
  ) => {
    try {
      // Optimistic update
      setStates(prev => ({
        ...prev,
        [type]: !prev[type]
      }))
      setMetrics(prev => ({
        ...prev,
        [countKey]: prev[countKey] + (states[type] ? -1 : 1)
      }))

      // Handle opposite state for like/dislike
      if (type === 'like' && states.dislike) {
        setStates(prev => ({ ...prev, dislike: false }))
        setMetrics(prev => ({
          ...prev,
          dislike_count: Math.max(0, prev.dislike_count - 1)
        }))
      } else if (type === 'dislike' && states.like) {
        setStates(prev => ({ ...prev, like: false }))
        setMetrics(prev => ({
          ...prev,
          like_count: Math.max(0, prev.like_count - 1)
        }))
      }

      // Call the actual handler
      await handler()
    } catch (err) {
      // Revert optimistic updates on error
      console.error(`Error handling ${type}:`, err)
      setStates(prev => ({
        ...prev,
        [type]: !prev[type]
      }))
      setMetrics(prev => ({
        ...prev,
        [countKey]: prev[countKey] + (states[type] ? 1 : -1)
      }))
    }
  }, [states])

  const handleLike = useCallback(async () => {
    await handleInteraction(onLike, 'like', 'like_count')
  }, [handleInteraction, onLike])

  const handleDislike = useCallback(async () => {
    await handleInteraction(onDislike, 'dislike', 'dislike_count')
  }, [handleInteraction, onDislike])

  const handleSave = useCallback(async () => {
    await handleInteraction(onSave, 'save', 'save_count')
  }, [handleInteraction, onSave])

    const handleShare = useCallback(async () => {
      try {
        // Share doesn't need state toggle, just increment the count
        setMetrics(prev => ({
          ...prev,
          share_count: prev.share_count + 1
        }));

        await onShare();
      } catch (err) {
        // Revert on error
        setMetrics(prev => ({
          ...prev,
          share_count: Math.max(0, prev.share_count - 1)
        }));
        console.error('Error handling share:', err);
      }
    }, [onShare]);

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <LikeButton
        count={metrics.like_count}
        onClick={handleLike}
        disabled={loading.like}
        active={states.like}
        error={error.like}
      />

      <DislikeButton
        count={metrics.dislike_count}
        onClick={handleDislike}
        disabled={loading.dislike}
        active={states.dislike}
        error={error.dislike}
      />

      {type === 'post' && onComment && (
        <EngagementButton
          icon={MessageCircle}
          count={metrics.comment_count}
          onClick={onComment}
          disabled={false}
          tooltip="Comment"
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
        />
      )}

      <ShareButton
        count={metrics.share_count}
        onClick={handleShare}
        disabled={loading.share}
        active={states.share}
        error={error.share}
      />

      <SaveButton
        count={metrics.save_count}
        onClick={handleSave}
        disabled={loading.save}
        active={states.save}
        error={error.save}
      />
    </div>
  )
}

export default EngagementMetricsHandler