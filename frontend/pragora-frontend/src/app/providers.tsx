// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ProfileProvider } from '@/contexts/profile/ProfileContext';
import { LayoutProvider } from '@/components/layout/LayoutProvider';
import { PostProvider } from '@/contexts/PostContext';
import { CommentProvider } from '@/contexts/comment/CommentContext';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/graphql/apollo-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProfileProvider>
            <PostProvider>
              <CommentProvider>
                <LayoutProvider>
                  {children}
                </LayoutProvider>
              </CommentProvider>
            </PostProvider>
          </ProfileProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}