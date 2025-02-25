// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ProfileProvider } from '@/contexts/profile/ProfileContext';
import { LayoutProvider } from '@/components/layout/LayoutProvider';
import { PostProvider } from '@/contexts/PostContext';
import { CommentProvider } from '@/contexts/comment/CommentContext';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/graphql/apollo-client';
import { useEffect, useState } from 'react';
import { AuthErrorBoundary } from '@/components/debug/AuthErrorBoundary';
import dynamic from 'next/dynamic';
import { setQueryClient } from '@/lib/services/auth/authService';

// Dynamically import DebugPanel for development only
const DebugPanel = dynamic(
  () => process.env.NODE_ENV === 'development'
    ? import('@/components/debug/DebugPanel')
    : Promise.resolve(() => null),
  { ssr: false }
);

// Create a new QueryClient for each session
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Initialize QueryClient with enhanced settings
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
        retry: 1,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    },
  }));

  useEffect(() => {
    setMounted(true);
    // Set the queryClient for auth service
    setQueryClient(queryClient);
  }, [queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <AuthErrorBoundary>
          <AuthProvider>
            <ProfileProvider>
              <PostProvider>
                <CommentProvider>
                  <LayoutProvider>
                    {children}
                    {process.env.NODE_ENV === 'development' && <DebugPanel />}
                    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
                  </LayoutProvider>
                </CommentProvider>
              </PostProvider>
            </ProfileProvider>
          </AuthProvider>
        </AuthErrorBoundary>
      </ApolloProvider>
    </QueryClientProvider>
  );
}