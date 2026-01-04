// File: src/components/AuthGuard.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Check Auth on Mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 2. Handle Redirects after loading finishes
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Unauthorized access attempt. Redirecting to login...");
      // Pass the current location to redirect back after login
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, location]);

  // 3. Show Loading Spinner while verifying token
  if (isLoading) {
    return (
      <div className="min-h-screen min-w-[100dvw] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-textSecondary text-sm font-medium animate-pulse">Verifying Access...</p>
        </div>
      </div>
    );
  }

  // 4. If not authenticated (and not loading), don't render children
  // The useEffect above will handle the redirect.
  if (!isAuthenticated) {
    return null;
  }

  // 5. Render Protected Content
  return <>{children}</>;
};