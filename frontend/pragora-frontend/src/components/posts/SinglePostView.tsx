'use client';

import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PostWrapper } from './wrapper';
import { PostCardFactory } from './PostCardFactory';
import postService from '@/lib/services/post/postService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
    queryKey: ['post', postId], // Changed from 'singlePost' to 'post' to match other components
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

  // Add a backup refresh mechanism to ensure UI stays updated
  useEffect(() => {
    // Create a dedicated post engagement handler for this view
    const handleLocalEngagement = () => {
      console.log(`Local engagement handler triggered for post ${postId}`);
      setTimeout(() => refetch(), 500);
    };

    // Listen for clicks on engagement buttons for this specific post
    const engagementButtons = document.querySelectorAll(
      '.post-engagement-button'
    );

    engagementButtons.forEach(button => {
      button.addEventListener('click', handleLocalEngagement);
    });

    return () => {
      engagementButtons.forEach(button => {
        button.removeEventListener('click', handleLocalEngagement);
      });
    };
  }, [postId, refetch]);

  // Transform the returned data to consistent engagement structure
  const post = useMemo(() => {
    if (!data) return null;
    return transformToEngagementPost(data);
  }, [data]);

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
          <div className="mt-4">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the single post with the same PostWrapper / PostCardFactory approach as the feed
  return (
    <div className="max-w-2xl mx-auto px-4">
      <PostWrapper post={post} variant="detail">
        <PostCardFactory post={post} variant="detail" />
      </PostWrapper>
    </div>
  );
}