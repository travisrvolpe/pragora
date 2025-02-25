// Create a new file: components/debug/PostMetricsDebug.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';

export const PostMetricsDebug = ({ postId }: { postId: number }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['post-debug', postId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch post data: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: 3000 // Refresh every 3 seconds for debugging
  });

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-4 bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold">Debug Info for Post {postId}</h3>

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{(error as Error).message}</p>
      ) : (
        <div className="mt-2">
          <p className="font-semibold">Raw Post Metrics:</p>
          <pre className="bg-gray-800 text-white p-2 rounded mt-1 text-xs overflow-auto">
            {JSON.stringify(data?.metrics || {}, null, 2)}
          </pre>

          <p className="font-semibold mt-3">Raw Interaction State:</p>
          <pre className="bg-gray-800 text-white p-2 rounded mt-1 text-xs overflow-auto">
            {JSON.stringify(data?.interaction_state || {}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};