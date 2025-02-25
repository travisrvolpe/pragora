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

interface DebugResponse {
  stored_counts: EngagementCounts;
  actual_counts: EngagementCounts;
}

export function EngagementStateDebugger({ postId }: { postId: number }) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<DebugResponse>({
    queryKey: ['post-debug', postId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/engagement/${postId}/debug`);
      if (!response.ok) {
        throw new Error(`Failed to fetch post engagement data: ${response.status}`);
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000, // 10 seconds
    enabled: expanded // Only fetch when expanded
  });

  useEffect(() => {
    if (expanded) {
      refetch();
    }
  }, [expanded, refetch]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

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
          ) : data ? (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="font-medium">Database Counts:</div>
                <div>
                  {Object.entries(data.stored_counts || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="font-medium">Actual Counts:</div>
                <div>
                  {Object.entries(data.actual_counts || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => refetch()}
                className="mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
              >
                Refresh Data
              </button>
            </div>
          ) : (
            <div className="text-gray-500">No data available</div>
          )}
        </div>
      </details>
    </div>
  );
}