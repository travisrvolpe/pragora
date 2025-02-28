// components/engagement/EngagementMetricsHandler.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react'
import { cn } from '@/applib/utils/utils'
import { LikeButton } from '@/components/buttons/LikeButton'
import { DislikeButton } from '@/components/buttons/DislikeButton'
import { SaveButton } from '@/components/buttons/SaveButton'
import { ShareButton } from '@/components/buttons/ShareButton'
import { EngagementButton } from '@/components/buttons/EngagementButton'
import { MetricsData, MetricStates, LoadingStates, ErrorStates } from '@/types/posts/engagement';
import { authService } from '@/applib/services/auth/authService';
import {router} from "next/client";

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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [metrics, setMetrics] = useState<MetricsData>(initialMetrics);
  const [states, setStates] = useState<MetricStates>(initialStates);
  const pendingInteraction = useRef<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMetrics(initialMetrics);
    setStates(initialStates);
  }, [initialMetrics, initialStates]);

  const handleInteraction = useCallback(async (
    handler: () => Promise<void>,
    type: keyof MetricStates,
    countKey: keyof MetricsData
  ) => {
    if (isAuthenticating || pendingInteraction.current === type) {
      return;
    }

    try {
      setIsAuthenticating(true);
      pendingInteraction.current = type;

      // Verify auth before any state updates
      const token = authService.getToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Optimistic update after auth check
      setStates(prev => ({
        ...prev,
        [type]: !prev[type]
      }));

      setMetrics(prev => ({
        ...prev,
        [countKey]: prev[countKey] + (states[type] ? -1 : 1)
      }));

      await handler();

    } catch (err) {
      // Revert updates on error
      setStates(prev => ({
        ...prev,
        [type]: prev[type]
      }));

      setMetrics(prev => ({
        ...prev,
        [countKey]: prev[countKey]
      }));

      if (err instanceof Error && err.message === 'Authentication required') {
        router.push('/auth/login');
      }
    } finally {
      setIsAuthenticating(false);
      pendingInteraction.current = null;
    }
  }, [states, router]);

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

  useEffect(() => {
    // Cleanup timeouts
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

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