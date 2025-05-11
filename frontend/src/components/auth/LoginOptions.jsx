import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../App';

export default function LoginOptions({ onPhoneLogin, onError, onSuccessNavigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  // Keep reference to loading context for backward compatibility
  const { setLoading } = useLoading();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Use useCallback to prevent recreating this function on every render
  const handleGoogleSignIn = useCallback(async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Backend authentication
      const response = await axios.post('/api/auth/google', { idToken });
      
      // Success
      await login(response.data.user, response.data.token);
      if (onSuccessNavigation) onSuccessNavigation();
    } catch (err) {
      setIsLoading(false);
      
      console.error('Google sign-in error:', err);
      
      // Handle specific error types
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.response && err.response.data && err.response.data.error) {
        if (err.response.data.error.includes('duplicate key')) {
          // This is a server-side duplicate key error (likely on phone field)
          if (retryCount < 3) {
            // Auto-retry a few times
            setRetryCount(prev => prev + 1);
            setError('Account information is being updated. Please wait...');
            setTimeout(() => handleGoogleSignIn(), 1500);
            return;
          } else {
            setError('Unable to create account. Please try again later or contact support.');
          }
        } else {
          setError(err.response.data.error);
        }
      } else {
        setError('Error signing in with Google. Please try again.');
      }
    }
  }, [isLoading, login, onSuccessNavigation, retryCount, onError]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
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
      
      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="mx-4 text-sm text-gray-500">or</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
      
      {/* Phone login button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-center py-3 px-4 rounded-xl ${
          isLoading ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
        } border border-gray-300 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
        onClick={onPhoneLogin}
        disabled={isLoading}
      >
        <span className="mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </span>
        <span className="text-sm font-medium">Sign in with Phone</span>
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