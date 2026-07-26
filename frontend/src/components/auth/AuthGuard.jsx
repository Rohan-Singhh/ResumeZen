import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../App';

/**
 * AuthGuard Component
 * Protects routes that require authentication by redirecting to login page
 * if user is not authenticated
 */
export default function AuthGuard({ children }) {
  const { currentUser, loading, authStatusChecked } = useAuth();
  const { setLoading } = useLoading();
  const location = useLocation();
  const navigate = useNavigate();

  // Reset global loading when component mounts/unmounts
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // If loading is still true after 3 seconds, force it off
      // This prevents infinite loading states
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      setLoading(false);
    };
  }, [setLoading]);

  // Handle redirection when user is not authenticated
  useEffect(() => {
    if (authStatusChecked && !currentUser) {
      const isLoggingOut = sessionStorage.getItem('logoutInProgress') === 'true';
      const targetUrl = isLoggingOut ? '/' : '/login';
      
      // Prevent infinite redirect loops during AnimatePresence exit animations
      // Check window.location directly because useLocation() is stale in exiting trees
      if (window.location.pathname !== targetUrl && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        console.log(`AuthGuard: Redirecting to ${targetUrl}`);
        navigate(targetUrl, { replace: true, state: { from: location } });
      }
    }
  }, [authStatusChecked, currentUser, location, navigate]);

  // If authentication status is still being determined, show loading spinner
  if (loading && !authStatusChecked) {
    console.log('AuthGuard: Loading state, waiting for auth check');
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-zinc-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (authStatusChecked && !currentUser) {
    return null; // Render nothing while redirecting
  }

  // If the user is authenticated, render the protected component
  return children;
} 