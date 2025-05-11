import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthGuard Component
 * Protects routes that require authentication by redirecting to login page
 * if user is not authenticated
 */
export default function AuthGuard({ children }) {
  const { currentUser, loading, authStatusChecked } = useAuth();
  const location = useLocation();

  // If authentication status is still being determined, show loading spinner
  if (loading || !authStatusChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login page with the original location in state
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the protected component
  return children;
} 