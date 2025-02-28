// components/auth/AuthErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { authService } from '@/applib/services/auth/authService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);

    // Check if error is auth-related
    if (
      error.message.includes('auth') ||
      error.message.includes('token') ||
      error.message.includes('unauthorized') ||
      error.message.includes('401')
    ) {
      console.log('Auth-related error detected, logging out...');
      authService.logout();
    }
  }

  public render() {
    if (this.state.hasError) {
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h2 className="text-red-800 font-semibold">Authentication Error</h2>
            <p className="text-red-600 text-sm mt-2">{this.state.error?.message}</p>
          </div>
        );
      }
      // In production, just render children to avoid showing error details
      return this.props.children;
    }

    return this.props.children;
  }
}