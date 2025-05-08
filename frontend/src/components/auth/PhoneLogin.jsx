import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useLoading } from '../../App';

export default function PhoneLogin({ onBack, onError, onSuccessNavigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [step, setStep] = useState(1); // 1: phone input, 2: code verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [previousCode, setPreviousCode] = useState('');
  const { setLoading: setGlobalLoading, setLoadingMessage } = useLoading();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Clean up loading state on unmount
  useEffect(() => {
    return () => {
      // Only if we're not navigating to dashboard
      const currentPath = window.location.pathname;
      if (currentPath.includes('/login')) {
        setGlobalLoading(false);
      }
    };
  }, [setGlobalLoading]);

  // Handle sending verification code
  const handleSendCode = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }
    
    try {
      // Format the phone number with country code - already done by the component
      const formattedPhone = `+${phoneNumber}`;
      
      // Set up invisible reCAPTCHA
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log('reCAPTCHA verified:', response);
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            console.log('reCAPTCHA expired');
            setError('Verification timeout. Please try again.');
            if (onError) onError('Verification timeout. Please try again.');
          }
        });
      }

      // Use Firebase phone auth flow
      const confirmationResultObj = await signInWithPhoneNumber(
        auth,
        formattedPhone, 
        window.recaptchaVerifier
      );
      
      // Store the confirmationResult
      setVerificationId(confirmationResultObj);
      
      // Move to step 2: entering verification code
      setStep(2);
      
      // Start countdown for resend
      setCountdown(60);
      
      // Reset verification attempts
      setAttempts(0);
      setPreviousCode('');
      setVerificationCode('');
    } catch (error) {
      console.error('Error sending verification code:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to send verification code. ';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'The phone number is not valid. Please check and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'CAPTCHA verification failed. Please try again.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'Too many verification attempts. Please try again later.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/missing-phone-number') {
        errorMessage = 'Please enter a phone number.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again in a few minutes.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
      
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error('Error clearing reCAPTCHA:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle verifying the code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      setLoading(false);
      return;
    }
    
    // Prevent repeated submissions of the same code
    if (verificationCode === previousCode) {
      setError('Please enter a different code. This one was already tried.');
      setLoading(false);
      return;
    }
    
    // Track attempts and codes
    setAttempts(prev => prev + 1);
    setPreviousCode(verificationCode);
    
    // If too many attempts, suggest requesting a new code
    if (attempts >= 3) {
      setError('Too many failed attempts. Please request a new verification code.');
      setStep(1);
      setLoading(false);
      return;
    }
    
    try {
      // Check if verificationId is valid
      if (!verificationId) {
        setError('Verification session expired. Please request a new code.');
        setStep(1);
        setLoading(false);
        return;
      }
      
      // Confirm the verification code with Firebase
      const result = await verificationId.confirm(verificationCode);
      console.log('Authentication successful with Firebase');
      
      // Get the ID token
      const idToken = await result.user.getIdToken();
      
      // Send the ID token to the backend for verification
      const response = await axios.post('/api/auth/phone', { 
        idToken,
        headers: {
          'Cache-Control': 'no-cache' // Prevent caching on this critical request
        }
      });
      console.log('Backend authentication successful:', response.data);
      
      // Handle authentication
      await login(response.data.user, response.data.token);
      
      // Set welcome message with user's first name if available
      const firstName = response.data.user.name?.split(' ')[0] || 'User';
      setLoadingMessage(`Welcome, ${firstName}!`);
      
      // Enable global loading state
      setGlobalLoading(true);
      
      // Notify parent about navigation if provided
      if (onSuccessNavigation) onSuccessNavigation();
      
      // Navigate to dashboard after consistent delay
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            justLoggedIn: true,
            authMethod: 'phone' 
          } 
        });
      }, 2000);
      
      return; // Stop execution here to prevent setting loading to false
    } catch (firebaseError) {
      console.error('Error verifying code:', firebaseError);
      
      try {
        // Clean up reCAPTCHA
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          } catch (e) {
            console.error('Error clearing reCAPTCHA:', e);
          }
        }
        
        // Handle specific error cases
        let errorMessage = 'Failed to verify code. ';
        if (firebaseError.code === 'auth/invalid-verification-code') {
          errorMessage = 'The verification code is not valid. Please check and try again.';
        } else if (firebaseError.code === 'auth/code-expired') {
          errorMessage = 'The verification code has expired. Please request a new code.';
        } else if (firebaseError.code === 'auth/missing-verification-code') {
          errorMessage = 'Please enter the verification code.';
        } else if (firebaseError.code === 'auth/invalid-verification-id') {
          errorMessage = 'Verification session expired. Please request a new code.';
          setStep(1); // Go back to phone input
        } else if (firebaseError.response?.status === 429) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
          // Start a longer countdown to prevent immediate retries
          setCountdown(30);
        } else if (firebaseError.response?.data?.error) {
          errorMessage = firebaseError.response.data.error;
        } else {
          errorMessage += firebaseError.message || 'Please try again.';
        }
        
        setError(errorMessage);
        if (onError) onError(errorMessage);
        
        // Reset global loading
        setGlobalLoading(false);
      } catch (e) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Error handling verification code error:', e);
        if (onError) onError('An unexpected error occurred. Please try again.');
        
        // Reset global loading
        setGlobalLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resending code
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.error('Error clearing reCAPTCHA:', e);
        }
      }
      
      // Recreate reCAPTCHA verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          console.log('reCAPTCHA verified:', response);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          setError('Verification timeout. Please try again.');
          if (onError) onError('Verification timeout. Please try again.');
        }
      });
      
      // Format phone number
      const formattedPhone = `+${phoneNumber}`;
      
      // Resend verification code
      const confirmationResultObj = await signInWithPhoneNumber(
        auth,
        formattedPhone, 
        window.recaptchaVerifier
      );
      
      // Update verification ID
      setVerificationId(confirmationResultObj);
      
      // Start countdown
      setCountdown(60);
      
      // Reset verification attempts
      setAttempts(0);
      setPreviousCode('');
      setVerificationCode('');
      
      setError('');
    } catch (error) {
      console.error('Error resending code:', error);
      
      let errorMessage = 'Failed to resend verification code. ';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again in a few minutes.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle countdown for resend
  useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  // Clear reCAPTCHA when unmounting
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error('Error clearing reCAPTCHA on unmount:', e);
        }
      }
    };
  }, []);

  return (
    <div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your phone number
            </label>
            <div className="relative">
              <PhoneInput
                country={'us'}
                value={phoneNumber}
                onChange={setPhoneNumber}
                inputProps={{
                  id: 'phoneNumber',
                  name: 'phoneNumber',
                  required: true,
                  disabled: loading,
                  placeholder: 'Enter your phone number',
                }}
                containerClass="w-full"
                buttonClass="rounded-l-xl"
                dropdownClass="shadow-lg rounded-lg"
                enableSearch
                disableSearchIcon
                searchPlaceholder="Search countries"
                inputClass="!bg-white !text-black !w-full !rounded-xl !border !border-gray-200"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">We'll send a verification code to this number</p>
          </div>

          <div id="recaptcha-container"></div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between space-y-4 space-y-reverse sm:space-y-0">
            <motion.button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-4 py-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              Back
            </motion.button>
            <motion.button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all"
              whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(99,102,241,0.15)" }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || phoneNumber.length < 8}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send Code'
              )}
            </motion.button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
              Enter verification code
            </label>
            <input
              id="verificationCode"
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-primary focus:border-primary text-center text-xl tracking-wider bg-white text-gray-900 font-medium transition-colors"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to your phone</p>
          </div>

          {countdown > 0 ? (
            <p className="text-sm text-gray-600">
              Resend code in <span className="font-medium text-primary">{countdown}</span> seconds
            </p>
          ) : (
            <motion.button
              type="button"
              onClick={handleResendCode}
              className="text-primary hover:text-primary-dark text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              Resend Code
            </motion.button>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between space-y-4 space-y-reverse sm:space-y-0">
            <motion.button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-4 py-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              Back
            </motion.button>
            <motion.button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all"
              whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(99,102,241,0.15)" }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
} 