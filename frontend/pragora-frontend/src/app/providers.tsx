// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ProfileProvider } from '@/contexts/profile/ProfileContext';
import { LayoutProvider } from '@/components/layout/LayoutProvider';

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}