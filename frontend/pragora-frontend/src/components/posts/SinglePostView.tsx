'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PostWrapper } from './wrapper';
import { PostCardFactory } from './PostCardFactory';
import postService from '@/applib/services/post/postService';
import { diagnoseSinglePostView } from '@/applib/services/post/postService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CommentThread } from '@/components/comments/CommentThread';
import type { Post } from '@/types/posts/post-types';
import type {
  PostWithEngagement,
  PostMetrics,
  PostInteractionState
} from '@/types/posts/engagement';

interface SinglePostViewProps {
  postId: number;
}

/**
 * Transform a raw Post into a PostWithEngagement shape,
 * same as the logic in PostFeed.tsx.
 */
function transformToEngagementPost(post: Post): PostWithEngagement {
  const metrics: PostMetrics = {
    like_count: post.metrics?.like_count ?? 0,
    dislike_count: post.metrics?.dislike_count ?? 0,
    save_count: post.metrics?.save_count ?? 0,
    share_count: post.metrics?.share_count ?? 0,
    report_count: post.metrics?.report_count ?? 0,
    comment_count: post.metrics?.comment_count ?? 0
  };

  const interaction_state: PostInteractionState = {
    like: post.interaction_state?.like ?? false,
    dislike: post.interaction_state?.dislike ?? false,
    share: post.interaction_state?.share ?? false,
    save: post.interaction_state?.save ?? false,
    report: post.interaction_state?.report ?? false
  };

  return {
    ...post,
    metrics,
    interaction_state
  };
}

/**
 * Renders a single post by ID with the same PostWrapper/PostCardFactory
 * logic used in the feed.
 */
export function SinglePostView({ postId }: SinglePostViewProps) {
  // Fetch this single post using React Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['post', postId], // Using 'post' key to match other components
    queryFn: async () => {
      return postService.getPostById(postId);
    },
    staleTime: 30000,     // same as feed
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Add event listener for post engagement changes
  useEffect(() => {
    // Function to handle post engagement changes
    const handlePostEngagement = (event: CustomEvent<{ postId: number }>) => {
      const changedPostId = event.detail?.postId;
      console.log(`Detected engagement change for post ${changedPostId}`);

      if (changedPostId === postId) {
        console.log(`Refreshing post ${postId} data after engagement action`);
        refetch();
      }
    };

    // Add event listener for custom post-engagement-changed event
    window.addEventListener('post-engagement-changed',
      handlePostEngagement as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('post-engagement-changed',
        handlePostEngagement as EventListener);
    };
  }, [postId, refetch]);

  // Transform the returned data to consistent engagement structure
  const post = useMemo(() => {
    if (!data) return null;
    return transformToEngagementPost(data);
  }, [data]);

  // Handle comment and threaded reply actions
  const handleComment = useCallback(() => {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleThreadedReply = useCallback(() => {
    handleComment();
  }, [handleComment]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

if (isError || !post) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
        <h3 className="font-bold mb-2">Error Loading Post</h3>
        {error instanceof Error && (
          <p className="text-sm mt-2">{error.message}</p>
        )}
        <div className="mt-4 space-x-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md"
          >
            Try Again
          </button>
          <button
            onClick={async () => {
              try {
                const result = await diagnoseSinglePostView(postId);
                console.log('Diagnostic result:', result);
                alert('Check console for diagnostic results');
              } catch (e) {
                console.error('Diagnostic error:', e);
                alert('Diagnostic error: ' + e);
              }
            }}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md"
          >
            Run Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}

  // Render the single post with the same PostWrapper / PostCardFactory approach as the feed
  return (
    <div className="max-w-2xl mx-auto px-4 space-y-8">
      <PostWrapper
        post={post}
        variant="detail"
        onComment={handleComment}
        onThreadedReply={handleThreadedReply}
      >
        <PostCardFactory post={post} variant="detail" />
      </PostWrapper>

      {/* Comments Section */}
      <div id="comments-section" className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>
        <div className="p-4">
          <CommentThread
            postId={postId}
            initialComments={[]}
          />
        </div>
      </div>
    </div>
  );
}