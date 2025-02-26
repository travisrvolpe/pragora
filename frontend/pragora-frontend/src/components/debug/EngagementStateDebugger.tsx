// components/debug/EngagementStateDebugger.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface EngagementCounts {
  like_count?: number;
  dislike_count?: number;
  save_count?: number;
  share_count?: number;
  comment_count?: number;
  report_count?: number;
  [key: string]: number | undefined;
}

interface InteractionState {
  like: boolean;
  dislike: boolean;
  save: boolean;
  share: boolean;
  report: boolean;
}

interface DebugResponse {
  stored_counts: EngagementCounts;
  actual_counts: EngagementCounts;
}

export function EngagementStateDebugger({ postId }: { postId: number }) {
  const [expanded, setExpanded] = useState(false);

  // Add a query to get post data directly
  const postQuery = useQuery({
    queryKey: ['post-debug-full', postId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch post data: ${response.status}`);
      }
      const data = await response.json();
      return data?.data?.post || data;
    },
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000,
    enabled: expanded
  });

  // Keep the engagement debug query
  const engagementQuery = useQuery<DebugResponse>({
    queryKey: ['post-debug', postId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/engagement/${postId}/debug`);
      if (!response.ok) {
        throw new Error(`Failed to fetch post engagement data: ${response.status}`);
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000,
    enabled: expanded
  });

  useEffect(() => {
    if (expanded) {
      postQuery.refetch();
      engagementQuery.refetch();
    }
  }, [expanded, postQuery, engagementQuery]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const isLoading = postQuery.isLoading || engagementQuery.isLoading;
  const error = postQuery.error || engagementQuery.error;

  return (
    <div className="mt-4 text-xs">
      <details
        className="bg-gray-100 rounded p-2"
        open={expanded}
        onToggle={(e) => setExpanded(e.currentTarget.open)}
      >
        <summary className="cursor-pointer font-medium text-gray-700">
          Post Engagement Debug Info
        </summary>

        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Loading engagement data...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 p-2">
              Error: {error instanceof Error ? error.message : 'Failed to load data'}
            </div>
          ) : (
            <div>
              {/* Post API Response */}
              <div className="mb-4">
                <div className="font-medium mb-1">Post API Data:</div>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded">
                  <div className="font-medium">Metrics from API:</div>
                  <div>
                    {postQuery.data?.metrics && Object.entries(postQuery.data.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="font-medium">Interaction State:</div>
                  <div>
                    {postQuery.data?.interaction_state && Object.entries(postQuery.data.interaction_state).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engagement Debug Info */}
              {engagementQuery.data && (
                <div className="mb-4">
                  <div className="font-medium mb-1">Backend Verification:</div>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded">
                    <div className="font-medium">Database Counts:</div>
                    <div>
                      {Object.entries(engagementQuery.data.stored_counts || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="font-medium">Actual Counts:</div>
                    <div>
                      {Object.entries(engagementQuery.data.actual_counts || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Discrepancies */}
              {postQuery.data?.metrics && engagementQuery.data?.stored_counts && (
                <div className="mb-4">
                  <div className="font-medium mb-1">Data Analysis:</div>
                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                    {Object.entries(postQuery.data.metrics).map(([key, apiValue]) => {
                      const dbValue = engagementQuery.data.stored_counts[key];
                      const actualValue = engagementQuery.data.actual_counts[key.replace('_count', '')];
                      const hasDiscrepancy = apiValue !== dbValue || dbValue !== actualValue;

                      return (
                        <div key={key} className={`flex justify-between ${hasDiscrepancy ? 'text-red-600 font-bold' : ''}`}>
                          <span>{key}:</span>
                          <span>API: {String(apiValue)} | DB: {String(dbValue)} | Actual: {String(actualValue)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  postQuery.refetch();
                  engagementQuery.refetch();
                }}
                className="mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}