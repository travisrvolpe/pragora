// components/posts/metrics/PostMetrics.tsx
import React, { useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from '@/applib/hooks/use-toast/use-toast';
import { cn } from '@/applib/utils/utils';
import { LikeButton } from '@/components/buttons/LikeButton';
import { DislikeButton } from '@/components/buttons/DislikeButton';
import { SaveButton } from '@/components/buttons/SaveButton';
import { ShareButton } from '@/components/buttons/ShareButton';
import { EngagementButton } from '@/components/buttons/EngagementButton';
import { ViewPostButton } from '@/components/buttons/ViewPostButton';
import { BackButton } from '@/components/buttons/BackButton';
import { Button } from '@/components/ui/button';
import type { PostMetricsProps } from '@/types/posts/component-types';

const PostMetrics: React.FC<PostMetricsProps> = ({
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
  onThreadedReply,
  className
}) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Log rendering info for debugging
  console.log('Rendering PostMetrics for post', post.post_id, 'with state:', interactionState);

  // Handle authentication check and wrap action in Promise for type compatibility
  const handleAuthCheck = useCallback(
    async (action: () => Promise<void>): Promise<void> => {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return Promise.resolve();
      }

      try {
        // Execute the action and return its promise
        return await action();
      } catch (error) {
        console.error('Action failed:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to process interaction",
          variant: "destructive"
        });
        throw error;
      }
    },
    [isAuthenticated, router]
  );

  // Handle interactions with proper error handling
  const handleLikeClick = useCallback(async (): Promise<void> => {
    console.log("Like button clicked in PostMetrics");
    return handleAuthCheck(onLike);
  }, [handleAuthCheck, onLike]);

  const handleDislikeClick = useCallback(async (): Promise<void> => {
    console.log("Dislike button clicked in PostMetrics");
    return handleAuthCheck(onDislike);
  }, [handleAuthCheck, onDislike]);

  const handleSaveClick = useCallback(async (): Promise<void> => {
    console.log("Save button clicked in PostMetrics");
    return handleAuthCheck(onSave);
  }, [handleAuthCheck, onSave]);

  const handleShareClick = useCallback(async (): Promise<void> => {
    console.log("Share button clicked in PostMetrics");
    return handleAuthCheck(async () => {
      await onShare();
      toast({
        title: "Success",
        description: "Post shared successfully"
      });
    });
  }, [handleAuthCheck, onShare]);

  const handleCommentClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (onComment) {
      onComment();
    }
  }, [isAuthenticated, router, onComment]);

  const handleThreadedReplyClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (onThreadedReply) {
      onThreadedReply();
    }
  }, [isAuthenticated, router, onThreadedReply]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-t">
        <div className={cn("flex items-center space-x-4", className)}>
          <LikeButton
            count={metrics.like_count}
            onClick={handleLikeClick}
            disabled={loading?.like || false}
            active={interactionState.like}
            error={error?.like || false}
          />

          <DislikeButton
            count={metrics.dislike_count}
            onClick={handleDislikeClick}
            disabled={loading?.dislike || false}
            active={interactionState.dislike}
            error={error?.dislike || false}
          />

          <EngagementButton
            icon={MessageCircle}
            count={metrics.comment_count}
            onClick={handleCommentClick}
            disabled={false}
            tooltip="Comment"
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          />

          <ShareButton
            count={metrics.share_count}
            onClick={handleShareClick}
            disabled={loading?.share || false}
            active={interactionState.share}
            error={error?.share || false}
          />

          <SaveButton
            count={metrics.save_count}
            onClick={handleSaveClick}
            disabled={loading?.save || false}
            active={interactionState.save}
            error={error?.save || false}
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
                  onClick={handleThreadedReplyClick}
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