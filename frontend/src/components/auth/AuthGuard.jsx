import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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

  // If authentication status is still being determined, show loading spinner
  if (loading && !authStatusChecked) {
    console.log('AuthGuard: Loading state, waiting for auth check');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If auth check is done but still no user after a reasonable time
  if (authStatusChecked && !currentUser) {
    console.log('AuthGuard: Auth checked, no user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the protected component
  console.log('AuthGuard: User authenticated, rendering children');
  return children;
} 