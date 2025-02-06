// src/App.tsx
import React from "react";
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { ProfileProvider } from "./contexts/profile/ProfileContext";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AuthDebug from './components/debug/AuthDebug';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      retry: 1,                 // Only retry failed requests once
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <AppRoutes />
          {/* Only show AuthDebug in development */}
          {process.env.NODE_ENV === 'development' && <AuthDebug />}
        </ProfileProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;