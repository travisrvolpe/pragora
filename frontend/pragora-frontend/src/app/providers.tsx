// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ProfileProvider } from '@/contexts/profile/ProfileContext';
import { LayoutProvider } from '@/components/layout/LayoutProvider';
import { PostProvider } from '@/contexts/PostContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// app/providers.tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <PostProvider>
            <LayoutProvider>
              {children}
            </LayoutProvider>
          </PostProvider>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}