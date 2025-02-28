// app/dialectica/[postId]/page.tsx
'use client';

import React, { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PostWrapper } from 'frontend/pragora-frontend/src/components/posts/wrapper';
import { PostCardFactory } from 'frontend/pragora-frontend/src/components/posts/PostCardFactory';
import { LoadingSpinner } from 'frontend/pragora-frontend/src/components/ui/loading-spinner';
import { CommentThread } from 'frontend/pragora-frontend/src/components/comments/CommentThread';
import postService from 'frontend/pragora-frontend/src/lib/services/post/postService';
import { EngagementStateDebugger } from 'frontend/pragora-frontend/src/components/debug/EngagementStateDebugger';
import type { PostWithEngagement } from 'frontend/pragora-frontend/src/types/posts/engagement';
import AuthDebug from "frontend/pragora-frontend/src/components/debug/AuthDebug";
import { PostDetailDebug } from 'frontend/pragora-frontend/src/components/debug/PostDetailDebug';

const testDirectEngagement = async (postId: number) => {
  try {
    const token = localStorage.getItem('access_token') || '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Direct API call to like endpoint
    const response = await fetch(`${apiUrl}/posts/engagement/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Direct API engagement response:', data);

    // Immediately fetch updated post data
    const updatedPostResponse = await fetch(`${apiUrl}/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const updatedPost = await updatedPostResponse.json();
    console.log('Updated post data after direct API call:', updatedPost);

    return data;
  } catch (error) {
    console.error('Direct API call error:', error);
    return null;
  }
};

interface PostViewPageProps {
  params: {
    postId: string;
  };
}

export default function PostViewPage({ params }: PostViewPageProps) {
  const { postId } = params;
  const queryClient = useQueryClient();

  // Function to normalize post data ensuring consistent structure
  const normalizePostData = useCallback((response: any): PostWithEngagement => {
    // Get post data from any response structure
    const postData = response?.data?.post || response;

    // Log the raw data for debugging
    console.log('Raw post data:', postData);

    // Ensure metrics have a consistent structure
    const metrics = {
      like_count: postData.metrics?.like_count ?? postData.like_count ?? 0,
      dislike_count: postData.metrics?.dislike_count ?? postData.dislike_count ?? 0,
      save_count: postData.metrics?.save_count ?? postData.save_count ?? 0,
      share_count: postData.metrics?.share_count ?? postData.share_count ?? 0,
      comment_count: postData.metrics?.comment_count ?? postData.comment_count ?? 0,
      report_count: postData.metrics?.report_count ?? postData.report_count ?? 0,
    };

    // Ensure interaction state has a consistent structure
    const interaction_state = {
      like: postData.interaction_state?.like === true,
      dislike: postData.interaction_state?.dislike === true,
      save: postData.interaction_state?.save === true,
      share: postData.interaction_state?.share === true, // Make sure 'share' is included
      report: postData.interaction_state?.report === true,
    };

    // Return normalized post data
    return {
      ...postData,
      metrics,
      interaction_state,
      post_id: postData.post_id,
      user_id: postData.user_id,
      content: postData.content || '',
      post_type_id: postData.post_type_id || 1,
      status: postData.status || 'active',
      created_at: postData.created_at || new Date().toISOString(),
    } as PostWithEngagement;
  }, []);

  // Query for detailed post data
  const { data: post, isLoading, isError, error, refetch } = useQuery<PostWithEngagement>({
    queryKey: ['post', postId],
    queryFn: async ({ signal }) => {
      try {
        // Get fresh auth token
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const timestamp = new Date().getTime();
        // Use a direct fetch with auth headers to ensure token is sent
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        console.log('Fetching post with fresh token...');
        const response = await fetch(`${apiUrl}/posts/${postId}?_t=${timestamp}`, {
          signal,
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required');
          }
          throw new Error(`Failed to fetch post: ${response.status}`);
        }

        const data = await response.json();
        return normalizePostData(data);
      } catch (error) {
        console.error('Error in post query:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    gcTime: 15000,
    staleTime: 10000,
    enabled: !!postId,
    // Add a retry function to handle auth failures
    retry: (failureCount, error) => {
      // Don't retry on auth failures
      if (error instanceof Error && error.message.includes('Authentication required')) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    }
  });

  // Force refresh post data on component mount
  useEffect(() => {
    refetch();

    // Set up periodic refresh
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Interactive handlers
  const handleComment = () => {
    const commentSection = document.getElementById('comments-section');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleThreadedReply = () => {
    handleComment();
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const token = localStorage.getItem('access_token');
      console.log('Current auth token:', token ?
        `${token.substring(0, 10)}...${token.substring(token.length - 5)}` :
        'No token'
      );
    }
    }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-red-800 font-semibold">Error Loading Post</h2>
        <p className="text-red-600">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show not found state
  if (!post) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="text-yellow-800 font-semibold">Post Not Found</h2>
        <p className="text-yellow-600">The post you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  // Cast post to correct type to satisfy TypeScript
  const typedPost = post as PostWithEngagement;

  // Log post data for debugging
  console.log("Using post data:", {
    id: typedPost.post_id,
    metrics: typedPost.metrics,
    interaction_state: typedPost.interaction_state
  });

  return (
    <div className="space-y-8">
      {/* Display the post */}
      <PostWrapper
        post={typedPost}
        variant="detail"
        onComment={handleComment}
        onThreadedReply={handleThreadedReply}
      >
        <PostCardFactory
          post={typedPost}
          variant="detail"
        />
      </PostWrapper>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4">
          <button
            onClick={() => testDirectEngagement(Number(postId))}
            className="px-3 py-2 bg-blue-500 text-white rounded"
          >
            Test Direct API Call
          </button>
        </div>
      )}

      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && (
        <EngagementStateDebugger postId={Number(postId)} />
      )}

      {process.env.NODE_ENV === 'development' && (
        <PostDetailDebug postId={Number(postId)} />
      )}

      {/* Comments Section */}
      <div id="comments-section" className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>
        <div className="p-4">
          <AuthDebug />
          <CommentThread
            postId={Number(postId)}
            initialComments={[]}
          />
        </div>
      </div>
    </div>
  );
}