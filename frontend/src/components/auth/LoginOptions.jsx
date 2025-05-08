import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginOptions({ onPhoneLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the ID token
      const idToken = await result.user.getIdToken();
      
      // Send token to backend for verification
      const response = await axios.post('/api/auth/google', { idToken });
      
      // Handle successful authentication
      await login(response.data.user, response.data.token);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Google auth error:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      // Provide more specific error messages
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked. Please enable popups and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another authentication popup is already open.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
          Choose your preferred sign-in method. Both options work with your ResumeZen account.
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Login Option */}
          <motion.button
            onClick={onPhoneLogin}
            disabled={isLoading}
            className="flex flex-col items-center justify-center w-full px-4 py-6 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary/30 transition-colors"
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <span className="font-medium text-gray-800">Phone Number</span>
            <span className="text-xs text-gray-500 mt-1">Verify with SMS code</span>
          </motion.button>

          {/* Google Login Option */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex flex-col items-center justify-center w-full px-4 py-6 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary/30 transition-colors"
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full flex items-center justify-center mb-3">
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-6 h-6" 
              />
            </div>
            <span className="font-medium text-gray-800">Google</span>
            <span className="text-xs text-gray-500 mt-1">Sign in with your Google account</span>
            {isLoading && (
              <svg className="animate-spin mt-2 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </motion.button>
        </div>
        
        <div className="pt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to ResumeZen's <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
} 