'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PostWrapper } from '@/components/posts/wrapper';
import { PostCardFactory } from '@/components/posts/PostCardFactory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CommentThread } from '@/components/comments/CommentThread';
import { EngagementStateDebugger } from '@/components/debug/EngagementStateDebugger';
import { PostDetailDebug } from '@/components/debug/PostDetailDebug';
import { WebSocketDebug } from '@/components/debug/WebSocketDebug';
import AuthDebug from '@/components/debug/AuthDebug';
import { PostMetricsDebug } from '@/components/debug/PostMetricsDebug';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast/use-toast';
import postService from '@/lib/services/post/postService';
import { authService } from '@/lib/services/auth/authService';
import type { PostWithEngagement } from '@/types/posts/engagement';

interface PostViewPageProps {
  params: {
    postId: string;
  };
}

export default function PostViewPage({ params }: PostViewPageProps) {
  const { postId } = params;
  const numericPostId = parseInt(postId);
  const queryClient = useQueryClient();
  const fetchCount = useRef(0);
  const router = useRouter();

  // Authentication and token management
  const originalToken = useRef<string | null>(null);
  const isHandlingEngagement = useRef(false);

  // Track API and auth state for debugging
  const [authState, setAuthState] = useState({
    hasToken: false,
    tokenPrefix: ''
  });
  const [apiState, setApiState] = useState({
    lastChecked: '',
    isConnected: true,
    error: ''
  });

  // Store original token when component mounts
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (token) {
      originalToken.current = token;
      // Also save to sessionStorage as additional backup
      try {
        sessionStorage.setItem('backup_token', token);
      } catch (e) {
        console.error('Failed to backup token to sessionStorage:', e);
      }

      console.log('Initial token stored (first few chars):', token.substring(0, 10) + '...');
      setAuthState({
        hasToken: true,
        tokenPrefix: token.substring(0, 10) + '...'
      });
    } else {
      console.log('No token found on initial load');
      setAuthState({
        hasToken: false,
        tokenPrefix: ''
      });
    }
  }, []);

  // Token integrity monitor - runs every second to ensure token availability
  useEffect(() => {
    // Skip if no backup token available
    if (!originalToken.current) return;

    console.log('Setting up token integrity monitor');

    const tokenIntegrityInterval = setInterval(() => {
      const currentToken = localStorage.getItem('access_token');

      // Restore token if missing but we have a backup
      if (!currentToken) {
        console.log('Token integrity check: Token missing, attempting restoration');

        // Try primary backup first
        if (originalToken.current) {
          console.log('Restoring from originalToken.current');
          authService.setToken(originalToken.current);
        }
        // Try session storage backup as fallback
        else {
          const backupToken = sessionStorage.getItem('backup_token');
          if (backupToken) {
            console.log('Restoring from sessionStorage backup');
            authService.setToken(backupToken);
            originalToken.current = backupToken;
          }
        }

        // Force refetch post data after token restoration
        setTimeout(() => {
          console.log('Refetching post data after token restoration');
          queryClient.invalidateQueries({ queryKey: ['post', numericPostId] });
        }, 100);
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(tokenIntegrityInterval);
      console.log('Token integrity monitor cleared');
    };
  }, [numericPostId, queryClient]);

  // Helper to ensure token is available before API requests
  const ensureTokenBeforeRequest = useCallback(() => {
    const currentToken = localStorage.getItem('access_token');

    if (!currentToken) {
      console.log('Ensuring token before API request: Attempting restoration');

      // Try primary backup
      if (originalToken.current) {
        console.log('Restoring from originalToken.current');
        authService.setToken(originalToken.current);
        return true;
      }

      // Try session storage backup
      const backupToken = sessionStorage.getItem('backup_token');
      if (backupToken) {
        console.log('Restoring from sessionStorage backup');
        authService.setToken(backupToken);
        originalToken.current = backupToken;
        return true;
      }
    }

    return false;
  }, []);

  // Pre-engagement handler to back up token and prepare for engagement operations
  const handleEngagement = useCallback(() => {
    // Prevent recursive calls
    if (isHandlingEngagement.current) {
      console.log('Already handling engagement, skipping recursive call');
      return true;
    }

    isHandlingEngagement.current = true;
    console.log('Handling pre-engagement for post', numericPostId);

    // Backup current token
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('Backing up token before engagement');
      originalToken.current = token;

      // Also save to sessionStorage as additional backup
      try {
        sessionStorage.setItem('backup_token', token);
      } catch (e) {
        console.error('Failed to backup token to sessionStorage:', e);
      }
    }

    // Check token after engagement completes
    setTimeout(() => {
      const currentToken = localStorage.getItem('access_token');

      if (!currentToken) {
        console.log('Token was lost after engagement, attempting restoration');

        // Try primary backup first
        if (originalToken.current) {
          console.log('Restoring from originalToken.current');
          authService.setToken(originalToken.current);
        }
        // Try session storage backup as fallback
        else {
          const backupToken = sessionStorage.getItem('backup_token');
          if (backupToken) {
            console.log('Restoring from sessionStorage backup');
            authService.setToken(backupToken);
            originalToken.current = backupToken;
          }
        }

        // Trigger a refresh after restoration
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['post', numericPostId] });
        }, 100);
      }

      // Reset the flag after handling is complete
      isHandlingEngagement.current = false;
    }, 500);

    return true;
  }, [numericPostId, queryClient]);

  // Set up pre-engagement event listener
  useEffect(() => {
    const preEngagementHandler = () => {
      // Only process if not already handling
      if (!isHandlingEngagement.current) {
        handleEngagement();
      }
    };

    window.addEventListener('pre-engagement', preEngagementHandler);

    return () => {
      window.removeEventListener('pre-engagement', preEngagementHandler);
    };
  }, [handleEngagement]);

  // Fetch the post with enhanced error handling and token management
  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<PostWithEngagement>({
    queryKey: ['post', numericPostId],
    queryFn: async () => {
      fetchCount.current += 1;
      console.log(`Fetching post ${numericPostId} (attempt ${fetchCount.current})`);

      // Ensure token is available before fetch
      ensureTokenBeforeRequest();

      try {
        // Primary fetch attempt using service
        return await postService.getPostById(numericPostId);
      } catch (primaryError) {
        console.error('Primary fetch method failed:', primaryError);

        // Try token restoration before fallback
        ensureTokenBeforeRequest();

        // Fallback to API route
        console.log('Falling back to API route');
        const currentToken = localStorage.getItem('access_token') || '';

        const response = await fetch(`/api/posts/${numericPostId}`, {
          method: 'GET',
          headers: {
            'Authorization': currentToken ? `Bearer ${currentToken}` : '',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.status}`);
        }

        const data = await response.json();
        console.log('API route fallback response:', data);

        // Process the response data consistently
        const postData = data?.data?.post || data?.post || data;

        return {
          ...postData,
          metrics: {
            like_count: postData.metrics?.like_count ?? postData.like_count ?? 0,
            dislike_count: postData.metrics?.dislike_count ?? postData.dislike_count ?? 0,
            save_count: postData.metrics?.save_count ?? postData.save_count ?? 0,
            share_count: postData.metrics?.share_count ?? postData.share_count ?? 0,
            comment_count: postData.metrics?.comment_count ?? postData.comment_count ?? 0,
            report_count: postData.metrics?.report_count ?? postData.report_count ?? 0,
          },
          interaction_state: {
            like: Boolean(postData.interaction_state?.like === true),
            dislike: Boolean(postData.interaction_state?.dislike === true),
            save: Boolean(postData.interaction_state?.save === true),
            share: Boolean(postData.interaction_state?.share === true),
            report: Boolean(postData.interaction_state?.report === true),
          }
        };
      }
    },
    staleTime: 15000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attempt => Math.min(attempt * 1000, 5000), // Exponential backoff
  });

  // Debug function to test API connectivity
  const debugEngagement = async (type: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const timestamp = new Date().toISOString();
      setApiState(prev => ({ ...prev, lastChecked: timestamp }));

      console.log(`Debug ${type} - Using token: ${token ? token.substring(0, 15) + '...' : 'NO TOKEN'}`);

      // Test API connectivity through API route for consistency
      const response = await fetch(`/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      console.log(`Debug ${type} - Auth validation status:`, response.status);
      setApiState(prev => ({
        ...prev,
        isConnected: response.ok,
        error: response.ok ? '' : `Status: ${response.status}`
      }));

      if (response.ok) {
        const data = await response.json();
        console.log(`Debug ${type} - Validation response:`, data);
      }

      return response.ok;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Debug ${type} - API error:`, error);
      setApiState(prev => ({
        ...prev,
        isConnected: false,
        error: errorMessage
      }));
      return false;
    }
  };

  // Comment handlers
  const handleComment = useCallback(() => {
    const commentSection = document.getElementById('comments-section');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleThreadedReply = useCallback(() => {
    handleComment();
  }, [handleComment]);

  // Track authentication state
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');

      // Only update state if token status changed
      const hasToken = !!token;
      const tokenPrefix = token ? token.substring(0, 10) + '...' : 'no token';

      if (hasToken !== authState.hasToken || tokenPrefix !== authState.tokenPrefix) {
        setAuthState({
          hasToken,
          tokenPrefix
        });
      }

      // Update backup if token changed
      if (token && token !== originalToken.current) {
        console.log('Token changed, updating backup');
        originalToken.current = token;

        try {
          sessionStorage.setItem('backup_token', token);
        } catch (e) {
          console.error('Failed to backup token to sessionStorage:', e);
        }
      }
    };

    checkAuth();

    // Lower frequency auth check for general monitoring
    const interval = setInterval(checkAuth, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [authState.hasToken, authState.tokenPrefix]);

  // Force refresh for debugging
  const handleForceRefresh = () => {
    fetchCount.current = 0; // Reset counter
    queryClient.invalidateQueries({ queryKey: ['post', numericPostId] });
    refetch();
    toast({
      title: "Refreshing",
      description: "Forcing a refresh of post data"
    });
  };

  // Test basic fetch for debugging
  const testBasicFetch = async () => {
    try {
      // Use the API route for consistency
      const response = await fetch('/api', {
        method: 'GET',
        credentials: 'include'
      });

      console.log('Basic fetch test response:', {
        status: response.status,
        ok: response.ok
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Basic fetch data:', data);
      }
    } catch (error) {
      console.error('Basic fetch error:', error);
    }
  };

  // Clear auth token for debugging
  const clearToken = () => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('backup_token');
    setAuthState({hasToken: false, tokenPrefix: 'no token'});
    toast({
      title: "Token Cleared",
      description: "Auth token has been removed"
    });
  };

  // Restore token from backup for debugging
  const restoreToken = () => {
    if (originalToken.current) {
      authService.setToken(originalToken.current);
      setAuthState({
        hasToken: true,
        tokenPrefix: originalToken.current.substring(0, 10) + '...'
      });
      toast({
        title: "Token Restored",
        description: "Auth token has been restored from backup"
      });
    } else {
      const backupToken = sessionStorage.getItem('backup_token');
      if (backupToken) {
        authService.setToken(backupToken);
        originalToken.current = backupToken;
        setAuthState({
          hasToken: true,
          tokenPrefix: backupToken.substring(0, 10) + '...'
        });
        toast({
          title: "Token Restored",
          description: "Auth token has been restored from session storage"
        });
      } else {
        toast({
          title: "No Backup",
          description: "No backup token available to restore",
          variant: "destructive"
        });
      }
    }
  };

  // Loading state UI
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-100 rounded-lg h-48 w-full flex items-center justify-center">
            <LoadingSpinner/>
          </div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (isError || !post) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
          <h3 className="font-bold mb-2">Error Loading Post</h3>
          <p>There was a problem loading this post.</p>
          {error instanceof Error && (
            <p className="text-sm mt-2">{error.message}</p>
          )}

          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dialectica')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
            >
              Back to Feed
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 bg-black rounded p-2 text-left">
              <pre className="text-red-300 text-xs overflow-x-auto">
                {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-8">
      {/* Post content */}
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

      {/* Comments section */}
      <div id="comments-section" className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>
        <div className="p-4">
          <CommentThread
            postId={numericPostId}
            initialComments={[]}
          />
        </div>
      </div>

      {/* Debug tools in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700">Debug Tools</h3>
            <div className="text-xs text-gray-500">Fetch count: {fetchCount.current}</div>
          </div>

          {/* API Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${apiState.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs">
              API {apiState.isConnected ? 'Connected' : 'Disconnected'}
              {apiState.error && ` - ${apiState.error}`}
            </span>
          </div>

          {/* Original Token Status */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${originalToken.current ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs">
              Backup Token: {originalToken.current ? originalToken.current.substring(0, 10) + '...' : 'None'}
            </span>
          </div>

          {/* Debug Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={handleForceRefresh}
              size="sm"
              variant="default"
            >
              Force Refresh
            </Button>
            <Button
              onClick={() => debugEngagement('test')}
              size="sm"
              variant="outline"
            >
              Test API Connectivity
            </Button>
            <Button
              onClick={restoreToken}
              size="sm"
              variant="outline"
              className="bg-green-100 text-green-800 hover:bg-green-200"
            >
              Restore Token
            </Button>
          </div>

          {/* Collapsible Debug Sections */}
          <div className="space-y-4">
            {/* Include existing debug components */}
            <EngagementStateDebugger postId={numericPostId} />
            <PostDetailDebug postId={numericPostId} />
            <WebSocketDebug postId={numericPostId} />
            <PostMetricsDebug postId={numericPostId} />

            {/* Auth Debug */}
            <details className="bg-white rounded border p-2">
              <summary className="cursor-pointer font-medium text-sm">Auth Status</summary>
              <div className="mt-2 p-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${authState.hasToken ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Token: {authState.hasToken ? authState.tokenPrefix : 'Not found'}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={clearToken}
                    size="sm"
                    variant="destructive"
                  >
                    Clear Token
                  </Button>
                  <Button
                    onClick={testBasicFetch}
                    size="sm"
                    variant="outline"
                  >
                    Test Basic Fetch
                  </Button>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}