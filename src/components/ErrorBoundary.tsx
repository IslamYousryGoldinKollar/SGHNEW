'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    // You can add error tracking here (Sentry, LogRocket, etc.)
  }
  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              We encountered an unexpected error. Please try refreshing the page.
            </AlertDescription>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Alert>
        </div>
      );
    }
    return this.props.children;
  }
}
