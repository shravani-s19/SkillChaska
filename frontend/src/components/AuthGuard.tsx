import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Small delay to allow checkAuth to run, or check if we are definitely not authed
    const isLocalLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLocalLoggedIn && !isAuthenticated) {
        // Redirect to login (assuming your teammate makes /login)
        // For now, we might just alert or redirect to a placeholder
        console.log("User not logged in - Redirecting to /login");
        // navigate('/login'); 
    }
  }, [isAuthenticated, navigate]);

  // If we wanted to be strict, we would return null here until auth is checked
  return <>{children}</>;
};