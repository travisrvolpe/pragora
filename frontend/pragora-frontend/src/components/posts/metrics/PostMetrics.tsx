import React, { useState, useEffect, useCallback } from 'react';
import { usePostEngagement } from '@/lib/hooks/usePostEngagement';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { toast } from '@/lib/hooks/use-toast/use-toast';
import { cn } from '@/lib/utils/utils';
import { LikeButton } from '@/components/buttons/LikeButton';
import { DislikeButton } from '@/components/buttons/DislikeButton';
import { SaveButton } from '@/components/buttons/SaveButton';
import { ShareButton } from '@/components/buttons/ShareButton';
import { EngagementButton } from '@/components/buttons/EngagementButton';
import { ViewPostButton } from '@/components/buttons/ViewPostButton';
import { BackButton } from '@/components/buttons/BackButton';
import { Button } from '@/components/ui/button';
import type {
  PostWithEngagement,
  MetricsData,
  PostInteractionState,
  EngagementResponse,
  EngagementHandlers
} from '@/types/posts/engagement';
import type { PostMetricsProps } from '@/types/posts/component-types';

// Define stricter type for engagement handlers
type EngagementHandler = () => Promise<EngagementResponse>;

export const PostMetrics: React.FC<PostMetricsProps> = ({
  post,
  variant,
  metrics: initialMetrics,
  interactionState: initialInteractionState,
  loading,
  error,
  onComment,
  onLike,
  onDislike,
  onShare,
  onSave,
  onThreadedReply,
  className
}) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const {
    handleLike,
    handleDislike,
    handleSave,
    handleShare,
    isLoading,
    isError
  } = usePostEngagement(post);

  const [currentMetrics, setCurrentMetrics] = useState<MetricsData>(initialMetrics);
  const [currentInteractionState, setCurrentInteractionState] = useState<PostInteractionState>(initialInteractionState);

  useEffect(() => {
    setCurrentMetrics(initialMetrics);
    setCurrentInteractionState(initialInteractionState);
  }, [initialMetrics, initialInteractionState]);

  const handleEngagementClick = useCallback(async (
    action: keyof EngagementHandlers,
    handler: EngagementHandler,
    type: keyof PostInteractionState,
    countKey: keyof MetricsData
  ): Promise<void> => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      // Optimistic update
      setCurrentInteractionState(prev => ({
        ...prev,
        [type]: !prev[type]
      }));

      setCurrentMetrics(prev => ({
        ...prev,
        [countKey]: prev[countKey] + (currentInteractionState[type] ? -1 : 1)
      }));

      const response = await handler();

      // Update with actual server response
      if (response) {
        const responseKey = countKey.replace('_count', '') as keyof EngagementResponse;

        setCurrentMetrics(prev => {
          const newCount = typeof response[responseKey] === 'number'
            ? response[responseKey] as number
            : prev[countKey];

          return {
            ...prev,
            [countKey]: newCount
          };
        });

        // Update interaction state if provided in response
        if (typeof response[type] === 'boolean') {
          setCurrentInteractionState(prev => ({
            ...prev,
            [type]: response[type] as boolean
          }));
        }
      }

    } catch (error) {
      // Revert optimistic update on error
      setCurrentInteractionState(prev => ({
        ...prev,
        [type]: !prev[type]
      }));

      setCurrentMetrics(prev => ({
        ...prev,
        [countKey]: prev[countKey] + (currentInteractionState[type] ? 1 : -1)
      }));

      console.error(`${action} action failed:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process interaction",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, router, currentInteractionState]);

  const handleLikeClick = useCallback(async () => {
    await handleEngagementClick(
      'onLike',
      async () => {
        await handleLike();
        return {
          message: 'Like processed',
          like: !currentInteractionState.like,
          like_count: currentMetrics.like_count + (currentInteractionState.like ? -1 : 1)
        } as EngagementResponse;
      },
      'like',
      'like_count'
    );

    // Handle mutual exclusivity with dislike
    if (currentInteractionState.dislike) {
      setCurrentInteractionState(prev => ({
        ...prev,
        dislike: false
      }));
      setCurrentMetrics(prev => ({
        ...prev,
        dislike_count: Math.max(0, prev.dislike_count - 1)
      }));
    }
  }, [handleEngagementClick, handleLike, currentInteractionState, currentMetrics]);

  const handleDislikeClick = useCallback(async () => {
    await handleEngagementClick(
      'onDislike',
      async () => {
        await handleDislike();
        return {
          message: 'Dislike processed',
          dislike: !currentInteractionState.dislike,
          dislike_count: currentMetrics.dislike_count + (currentInteractionState.dislike ? -1 : 1)
        } as EngagementResponse;
      },
      'dislike',
      'dislike_count'
    );

    // Handle mutual exclusivity with like
    if (currentInteractionState.like) {
      setCurrentInteractionState(prev => ({
        ...prev,
        like: false
      }));
      setCurrentMetrics(prev => ({
        ...prev,
        like_count: Math.max(0, prev.like_count - 1)
      }));
    }
  }, [handleEngagementClick, handleDislike, currentInteractionState, currentMetrics]);

  const handleSaveClick = useCallback(async () => {
    await handleEngagementClick(
      'onSave',
      async () => {
        await handleSave();
        return {
          message: 'Save processed',
          save: !currentInteractionState.save,
          save_count: currentMetrics.save_count + (currentInteractionState.save ? -1 : 1)
        } as EngagementResponse;
      },
      'save',
      'save_count'
    );
  }, [handleEngagementClick, handleSave, currentInteractionState, currentMetrics]);

  const handleShareClick = useCallback(async () => {
    await handleEngagementClick(
      'onShare',
      async () => {
        await handleShare();
        return {
          message: 'Share processed',
          share: !currentInteractionState.share,
          share_count: currentMetrics.share_count + (currentInteractionState.share ? -1 : 1)
        } as EngagementResponse;
      },
      'share',
      'share_count'
    );

    toast({
      title: "Success",
      description: "Post shared successfully"
    });
  }, [handleEngagementClick, handleShare, currentInteractionState, currentMetrics]);

  const handleCommentClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (onComment) {
      onComment();
    }
  }, [isAuthenticated, router, onComment]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-t">
        <div className={cn("flex items-center space-x-4", className)}>
          <LikeButton
            count={currentMetrics.like_count}
            onClick={handleLikeClick}
            disabled={isLoading.like}
            active={currentInteractionState.like}
            error={isError.like}
          />

          <DislikeButton
            count={currentMetrics.dislike_count}
            onClick={handleDislikeClick}
            disabled={isLoading.dislike}
            active={currentInteractionState.dislike}
            error={isError.dislike}
          />

          <EngagementButton
            icon={MessageCircle}
            count={currentMetrics.comment_count}
            onClick={handleCommentClick}
            disabled={false}
            tooltip="Comment"
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          />

          <ShareButton
            count={currentMetrics.share_count}
            onClick={handleShareClick}
            disabled={isLoading.share}
            active={currentInteractionState.share}
            error={isError.share}
          />

          <SaveButton
            count={currentMetrics.save_count}
            onClick={handleSaveClick}
            disabled={isLoading.save}
            active={currentInteractionState.save}
            error={isError.save}
          />
        </div>

        <div className="flex items-center space-x-2">
          {variant === 'feed' && (
            <ViewPostButton postId={post.post_id} />
          )}
          {variant === 'detail' && (
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
};

export default PostMetrics;