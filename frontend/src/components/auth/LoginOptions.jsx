import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../App';

export default function LoginOptions({ onError, onSuccessNavigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [authState, setAuthState] = useState({ isSignedIn: false, user: null });
  // Keep reference to loading context for backward compatibility
  const { setLoading } = useLoading();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        isSignedIn: !!user,
        user: user
      });
      
      if (user) {
        console.log("User already signed in with Firebase:", user.email);
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Handle Google Sign In
  const handleGoogleSignIn = useCallback(async () => {
    // Prevent multiple submissions
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setLoading(true); // Global loading indicator
      setError('');
      
      console.log("Initiating Google sign-in process...");
      
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get credential information
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      
      console.log("Google sign-in successful for:", user.email);
      
      // Get Google token
      const idToken = await user.getIdToken();
      
      console.log("Firebase ID token obtained, sending to backend...");
      
      // Send token to our backend to verify and create session
      const response = await axios.post('/api/auth/google', { idToken });
      
      console.log('Google auth successful:', response.data);
      
      // Handle successful authentication
      await login(response.data.user, response.data.token);
      
      // IMPORTANT: Reset loading state
      setIsLoading(false);
      setLoading(false);
      
      // Navigate to the desired location after login
      if (onSuccessNavigation) {
        onSuccessNavigation();
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setLoading(false); // Make sure to turn off global loading
      setIsLoading(false);
      
      console.error('Google sign in error:', err);
      
      // Handle Firebase errors with detailed messages
      if (err.code === 'auth/popup-closed-by-user') {
        setError('You closed the login popup. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // This is normal when multiple popups are triggered, so we don't need to show an error
        console.log('Popup request cancelled due to multiple requests');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Login popup was blocked by your browser. Please enable popups for this site and try again.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('A network error occurred. Please check your internet connection and try again.');
      } else if (err.code === 'auth/internal-error') {
        setError('An internal error occurred. Please try again later.');
      } else {
        // For backend/other errors
        setError(err.response?.data?.error || err.message || 'Authentication failed. Please try again.');
        if (onError) onError(err.response?.data?.error || err.message || 'Authentication failed. Please try again.');
      }
      
      // Track retry count for potential fallback logic
      setRetryCount(prev => prev + 1);
    }
  }, [isLoading, navigate, login, onSuccessNavigation, onError, setLoading]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {authState.isSignedIn && (
        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500 mb-4">
          <p className="text-green-700 text-sm">
            Already signed in with Google as {authState.user?.email}. 
            Proceeding to dashboard...
          </p>
        </div>
      )}
      
      <h2 className="text-xl font-semibold mb-6">Sign in</h2>
      
      {/* Google login button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-center py-3 px-4 rounded-xl ${
          isLoading ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
        } border border-gray-300 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <span className="mr-3">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </span>
        <span className="text-sm font-medium">
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </span>
      </motion.button>
      
      {/* Terms */}
      <p className="text-xs text-center text-gray-500 mt-6">
        By signing in, you agree to our 
        <a href="#" className="text-primary hover:underline mx-1">Terms of Service</a>
        and
        <a href="#" className="text-primary hover:underline mx-1">Privacy Policy</a>
      </p>
    </div>
  );
} 