// components/posts/wrapper/index.tsx
'use client';

import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { PostHeader } from './PostHeader';
import { PostFooter } from './PostFooter';
import { PostAnalytics } from './PostAnalytics';
import { PostWrapperProps } from './types';
import { usePostEngagement } from '@/lib/hooks/usePostEngagement';

export const PostWrapper: FC<PostWrapperProps> = ({
  post,
  children,
  variant = 'feed',
  onComment,
  onThreadedReply
}) => {
  const {
    handleLike,
    handleDislike,
    handleSave,
    handleShare,
    handleReport,
    isLoading,
    isError
  } = usePostEngagement(post);

  // Create a wrapper function that matches the expected type
  const handleReportWrapper = () => {
    // This function doesn't need to do anything as it's just for type compatibility
    return;
  };

  return (
      <Card className="w-full bg-white">
        <div className="flex flex-col">
          <PostHeader
              post={post}
              onReport={() => handleReport('Report reason')}
              isReportLoading={isLoading.report}
          />

          <div className="flex-1">
            {children}
          </div>

          <PostFooter
              post={post}
              variant={variant}
              metrics={post.metrics}
              interactionState={post.interaction_state}
              loading={isLoading}
              error={isError}
              onComment={onComment}
              onLike={async () => await handleLike()}
              onDislike={async () => await handleDislike()}
              onShare={async () => await handleShare()}
              onSave={async () => await handleSave()}
          />

          {post.analysis && (
              <PostAnalytics analysis={post.analysis}/>
          )}
        </div>
      </Card>
  );
};
export default PostWrapper;