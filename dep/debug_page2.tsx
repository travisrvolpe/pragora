'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PostWrapper } from '@/components/posts/wrapper';
import { PostCardFactory } from '@/components/posts/PostCardFactory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CommentThread } from '@/components/comments/CommentThread';
import { EngagementStateDebugger } from '@/components/debug/EngagementStateDebugger';
import { PostDetailDebug } from '@/components/debug/PostDetailDebug';
import AuthDebug from '@/components/debug/AuthDebug';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast/use-toast';
import { engagementService } from '@/lib/services/engagement/engageService';
import { updatePostCache } from '@/lib/utils/postCache';
import type { PostWithEngagement, PostMetrics, PostInteractionState } from '@/types/posts/engagement';

interface PostViewPageProps {
  params: {
    postId: string;
  };
}

export default function PostViewPage({ params }: PostViewPageProps) {
  const { postId } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEngaging, setIsEngaging] = useState(false);

  const checkApiConnection = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Testing connection to API endpoint:', apiUrl);

      // Make a simple OPTIONS request
      const response = await fetch(`${apiUrl}/healthcheck`, {
        method: 'OPTIONS',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Connection test response:', {
        status: response.status,
        ok: response.ok
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  };

  // Function to normalize post data ensuring consistent structure
  const normalizePostData = useCallback((response: any): PostWithEngagement => {
    // Get post data from any response structure
    const postData = response?.data?.post || response;

    // Log the raw data for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw post data:', postData);
    }

    // Ensure metrics have a consistent structure
    const metrics: PostMetrics = {
      like_count: postData.metrics?.like_count ?? postData.like_count ?? 0,
      dislike_count: postData.metrics?.dislike_count ?? postData.dislike_count ?? 0,
      save_count: postData.metrics?.save_count ?? postData.save_count ?? 0,
      share_count: postData.metrics?.share_count ?? postData.share_count ?? 0,
      comment_count: postData.metrics?.comment_count ?? postData.comment_count ?? 0,
      report_count: postData.metrics?.report_count ?? postData.report_count ?? 0,
    };

    // Ensure interaction state has a consistent structure with strict boolean values
    const interaction_state: PostInteractionState = {
      like: Boolean(postData.interaction_state?.like === true),
      dislike: Boolean(postData.interaction_state?.dislike === true),
      save: Boolean(postData.interaction_state?.save === true),
      share: Boolean(postData.interaction_state?.share === true),
      report: Boolean(postData.interaction_state?.report === true),
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

  // Query for detailed post data using direct fetch for reliability
  const { data: post, isLoading, isError, error, refetch } = useQuery<PostWithEngagement>({
    queryKey: ['post', parseInt(postId)],
    queryFn: async () => {
      try {
        // Get auth token
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const timestamp = new Date().getTime();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        console.log('Fetching post data...');
        const response = await fetch(`${apiUrl}/posts/${postId}?_t=${timestamp}`, {
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
        const normalizedData = normalizePostData(data);

        // Update cache with normalized data
        await updatePostCache({
          queryClient,
          postId: parseInt(postId),
          updates: {
            metrics: normalizedData.metrics,
            interaction_state: normalizedData.interaction_state
          }
        });

        return normalizedData;
      } catch (error) {
        console.error('Error in post query:', error);
        throw error;
      }
    },
    staleTime: 30000, // Same as in PostFeed
    refetchOnWindowFocus: false,
    gcTime: 60000,
    retry: false, // We'll handle retries manually
  });

  // Handle direct engagement interactions
  const handleEngagement = useCallback(async (actionType: 'like' | 'dislike' | 'save' | 'share') => {
    if (isEngaging || !post) return;

    setIsEngaging(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log(`Making ${actionType} request for post ${post.post_id}...`);

      // Use engagementService instead of direct API calls
      let response;
      switch(actionType) {
        case 'like':
          response = await engagementService.like(post.post_id);
          break;
        case 'dislike':
          response = await engagementService.dislike(post.post_id);
          break;
        case 'save':
          response = await engagementService.save(post.post_id);
          break;
        case 'share':
          response = await engagementService.share(post.post_id);
          break;
      }

      console.log(`${actionType} response:`, response);

      // Create updated metrics and interaction state
      const updatedMetrics = { ...post.metrics };
      const updatedInteractionState = { ...post.interaction_state };

      // Update metrics based on response
      if (response.metrics) {
        // If the backend returns a full metrics object, use it
        Object.assign(updatedMetrics, response.metrics);
      } else {
        // Otherwise, update individual counts if provided
        if (typeof response.like_count === 'number') updatedMetrics.like_count = response.like_count;
        if (typeof response.dislike_count === 'number') updatedMetrics.dislike_count = response.dislike_count;
        if (typeof response.save_count === 'number') updatedMetrics.save_count = response.save_count;
        if (typeof response.share_count === 'number') updatedMetrics.share_count = response.share_count;
        if (typeof response.comment_count === 'number') updatedMetrics.comment_count = response.comment_count;
      }

      // Update interaction state
      updatedInteractionState[actionType] = response[actionType] ?? !post.interaction_state[actionType];

      // Handle mutual exclusivity
      if (actionType === 'like' && updatedInteractionState.like && post.interaction_state.dislike) {
        updatedInteractionState.dislike = false;
        // If no dislike_count was returned, decrement it
        if (typeof response.dislike_count !== 'number') {
          updatedMetrics.dislike_count = Math.max(0, updatedMetrics.dislike_count - 1);
        }
      } else if (actionType === 'dislike' && updatedInteractionState.dislike && post.interaction_state.like) {
        updatedInteractionState.like = false;
        // If no like_count was returned, decrement it
        if (typeof response.like_count !== 'number') {
          updatedMetrics.like_count = Math.max(0, updatedMetrics.like_count - 1);
        }
      }

      // Update cache
      await updatePostCache({
        queryClient,
        postId: post.post_id,
        updates: {
          metrics: updatedMetrics,
          interaction_state: updatedInteractionState
        }
      });

      // Force refetch after a short delay to ensure consistent state
      setTimeout(() => {
        refetch();
      }, 500);

    } catch (error) {
      console.error(`Engagement error (${actionType}):`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process action",
        variant: "destructive"
      });
    } finally {
      setIsEngaging(false);
    }
  }, [post, queryClient, refetch, router, isEngaging]);

  // Create handler functions for each engagement type
  const handleLike = useCallback(() => handleEngagement('like'), [handleEngagement]);
  const handleDislike = useCallback(() => handleEngagement('dislike'), [handleEngagement]);
  const handleSave = useCallback(() => handleEngagement('save'), [handleEngagement]);
  const handleShare = useCallback(() => handleEngagement('share'), [handleEngagement]);

  // Handle comment actions
  const handleComment = useCallback(() => {
    const commentSection = document.getElementById('comments-section');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleThreadedReply = useCallback(() => {
    handleComment();
  }, [handleComment]);

  // Test direct engagement for debugging
  const testEngagement = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to perform this action"
        });
        return;
      }

      // Test direct API call to like endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Making POST request to /posts/engagement/' + postId + '/like with token:', token.substring(0, 10) + '...');

      const response = await fetch(`${apiUrl}/posts/engagement/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Engagement response status:', response.status);
      const data = await response.json();
      console.log('Response from /posts/engagement/' + postId + '/like:', data);

      // Fetch updated post data
      console.log('Fetching updated post data for post ' + postId);
      const postResponse = await fetch(`${apiUrl}/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Post fetch response status:', postResponse.status);
      const updatedPost = await postResponse.json();
      console.log('Updated post data:', updatedPost.data?.post || updatedPost);

      // Update cache with new data
      const normalizedData = normalizePostData(updatedPost);
      await updatePostCache({
        queryClient,
        postId: parseInt(postId),
        updates: {
          metrics: normalizedData.metrics,
          interaction_state: normalizedData.interaction_state
        }
      });

      // Refetch to update UI
      refetch();

    } catch (error) {
      console.error('API test error:', error);
    }
  }, [postId, queryClient, refetch, normalizePostData]);

  // Verify auth status for debugging
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Current token:', token ? token.substring(0, 10) + '...' : 'No token');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        }
      });

      console.log('Auth status response:', {
        status: response.status,
        ok: response.ok
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }, []);

  // Debug & diagnostics on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      checkAuthStatus();
    }
  }, [checkAuthStatus]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-48 w-full flex items-center justify-center">
              <LoadingSpinner/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
          Error loading post. Please try again later.
          {error instanceof Error && (
            <p className="text-sm mt-2">{error.message}</p>
          )}
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!post) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">Post not found.</p>
          <button
            onClick={() => router.push('/dialectica')}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Wrap the post in our PostWrapper component */}
      <PostWrapper
        post={post}
        variant="detail"
        onComment={handleComment}
        onThreadedReply={handleThreadedReply}
      >
        <PostCardFactory
          post={post}
          variant="detail"
        />
      </PostWrapper>

      {/* Debug tools in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Debug Tools</h3>
          <button
            onClick={testEngagement}
            className="px-3 py-2 bg-blue-500 text-white rounded mr-2"
          >
            Test Direct API Call
          </button>
          <button
            onClick={checkAuthStatus}
            className="px-3 py-2 bg-green-500 text-white rounded mr-2"
          >
            Check Auth Status
          </button>
          <button
            onClick={() => refetch()}
            className="px-3 py-2 bg-purple-500 text-white rounded"
          >
            Force Refresh
          </button>
          <div className="mt-2 text-xs text-gray-500">
            <p>Post ID: {post.post_id}</p>
            <p>Like count: {post.metrics.like_count}</p>
            <p>Liked by user: {post.interaction_state.like ? 'Yes' : 'No'}</p>
            <p>Dislike count: {post.metrics.dislike_count}</p>
            <p>Disliked by user: {post.interaction_state.dislike ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <>
          <EngagementStateDebugger postId={parseInt(postId)} />
          <PostDetailDebug postId={parseInt(postId)} />
        </>
      )}

      {/* Comments Section */}
      <div id="comments-section" className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>
        <div className="p-4">
          <AuthDebug />
          <CommentThread
            postId={parseInt(postId)}
            initialComments={[]}
          />
        </div>
      </div>
    </div>
  );
}