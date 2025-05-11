import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  // Keep reference to loading context for backward compatibility
  const { setLoading: setGlobalLoading } = useLoading();
  const navigate = useNavigate();
  const { login } = useAuth();
  const isNavigatingRef = useRef(false);
  const countdownIntervalRef = useRef(null);
  
  // Handle countdown for resend with useRef to prevent re-renders
  useEffect(() => {
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // Only set interval if countdown is active
    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount <= 1) {
            // Clear interval when we reach zero
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
    
    // Cleanup on unmount or when countdown changes
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [countdown]);

  // Combined cleanup function for unmounting
  useEffect(() => {
    // Store a local ref to the navigating state to avoid closure issues
    const isNavigating = isNavigatingRef.current;
    
    return () => {
      // Clear any running intervals
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
      // Clear reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error('Error clearing reCAPTCHA on unmount:', e);
        }
      }
    };
  }, []); // Empty dependency array since we use refs for state values

  // Memoized handlers to avoid recreation on every render
  const handleSendCode = useCallback(async (e) => {
    if (e) e.preventDefault();
    
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

    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    try {
      // Format the phone number with country code - already done by the component
      const formattedPhone = `+${phoneNumber}`;
      
      // Ensure the recaptcha container exists and clear any previous instances
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error('Error clearing existing reCAPTCHA:', e);
        }
      }
      
      // Firebase Auth Emulator specific handling for phone auth
      if (isDevelopment) {
        console.log('Using Firebase Auth Emulator for phone auth in development mode');
        
        // Hardcoded test phone for emulator - Firebase emulator accepts any phone number
        // but we'll use a standard test number
        const emulatorPhone = '+11234567890';
        
        try {
          // Create a simple emulator safe verifier
          const recaptchaContainerId = 'recaptcha-container';
          
          // Make sure the container exists
          let recaptchaContainer = document.getElementById(recaptchaContainerId);
          if (!recaptchaContainer) {
            recaptchaContainer = document.createElement('div');
            recaptchaContainer.id = recaptchaContainerId;
            document.body.appendChild(recaptchaContainer);
          }
          
          // In emulator mode, we shouldn't need a real reCAPTCHA, but we still need to 
          // provide a proper RecaptchaVerifier instance to the signInWithPhoneNumber function
          window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA resolved for emulator');
            }
          });
          
          console.log('Firebase Auth Emulator: sending code to', emulatorPhone);
          
          // Send verification code - in emulator, this should always work with code "123456"
          const confirmationResultObj = await signInWithPhoneNumber(
            auth,
            emulatorPhone, 
            window.recaptchaVerifier
          );
          
          console.log('Firebase Auth Emulator: verification code sent (emulator uses "123456")');
          setVerificationId(confirmationResultObj);
          setStep(2);
          setCountdown(60);
          setAttempts(0);
          setPreviousCode('');
          setVerificationCode('');
          
          // Show a helpful message about the emulator code
          setError('Using Firebase Auth Emulator. The verification code is always "123456"');
          
          setLoading(false);
          return;
        } catch (emulatorError) {
          console.error('Firebase Auth Emulator error:', emulatorError);
          
          // Fall back to development flow without reCAPTCHA if emulator is having issues
          console.log('Falling back to development mode flow');
          
          // Simulate success for development
          setTimeout(() => {
            // Move to step 2 in development mode with simulated verification
            setVerificationId({ 
              confirm: (code) => Promise.resolve({ 
                user: { getIdToken: () => Promise.resolve('development-token') }
              })
            });
            setStep(2);
            setCountdown(60);
            setAttempts(0);
            setPreviousCode('');
            setVerificationCode('');
            setError('Using development mode (emulator fallback). Any 6-digit code will work.');
            setLoading(false);
          }, 1000);
          
          return;
        }
      }
      
      // Production flow starts here
      
      // Set up invisible reCAPTCHA with a defined container ID
      const recaptchaContainerId = 'recaptcha-container';
      
      // Make sure the container exists and is visible
      let recaptchaContainer = document.getElementById(recaptchaContainerId);
      if (!recaptchaContainer) {
        console.log('reCAPTCHA container not found, creating new one');
        recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = recaptchaContainerId;
        document.body.appendChild(recaptchaContainer);
      }
      
      // Ensure the container is visible (not display:none)
      recaptchaContainer.style.display = 'block';
      recaptchaContainer.style.position = 'fixed';  // Position it fixed
      recaptchaContainer.style.bottom = '10px';     // At the bottom
      recaptchaContainer.style.right = '10px';      // At the right
      recaptchaContainer.style.zIndex = '9999';     // Ensure it's on top
      
      // Create new reCAPTCHA verifier with error handling
      try {
        // Production reCAPTCHA initialization
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth, 
          recaptchaContainerId, 
          {
            size: 'invisible',
            callback: (response) => {
              console.log('reCAPTCHA verified successfully');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
              setError('Verification timeout. Please try again.');
              if (onError) onError('Verification timeout. Please try again.');
            }
          }
        );
        
        console.log('reCAPTCHA initialized successfully');
      } catch (recaptchaError) {
        console.error('Failed to initialize reCAPTCHA:', recaptchaError);
        throw new Error('Failed to initialize verification system. Please try again later.');
      }

      // Use Firebase phone auth flow with better error handling
      try {
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
      } catch (phoneAuthError) {
        console.error('Phone authentication error:', phoneAuthError);
        
        // Handle Firebase Auth Emulator issues
        if (phoneAuthError.message && phoneAuthError.message.includes('auth/missing-app-credential')) {
          if (process.env.NODE_ENV === 'development') {
            setError('Firebase Auth Emulator is not configured correctly. In development mode, you can continue to dashboard directly.');
            setTimeout(() => {
              if (onSuccessNavigation) {
                onSuccessNavigation();
              } else {
                navigate('/dashboard', { replace: true });
              }
            }, 3000);
            return;
          }
        }
        
        throw phoneAuthError; // Re-throw for the outer catch to handle
      }
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
        // Handle rate limiting with a longer countdown
        setCountdown(180); // 3 minutes
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
    }
    
    setLoading(false);
  }, [loading, navigate, onError, onSuccessNavigation, phoneNumber]);

  // Handle verifying the code
  const handleVerifyCode = useCallback(async (e) => {
    if (e) e.preventDefault();
    
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
      
      // Special development mode handling - Skip Firebase auth in development
      if (process.env.NODE_ENV === 'development' || 
          window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1') {
        console.log('Using development mode for code verification');
        
        // With Firebase Auth Emulator, try confirmation with the standard test code
        if (verificationCode === '123456') {
          console.log('Using emulator test code (123456)');
        }
        
        try {
          // First try with the actual verificationId (for emulator)
          try {
            const result = await verificationId.confirm(verificationCode);
            console.log('Firebase Auth Emulator: Code verification successful!');
            
            // Get the user
            const user = result.user;
            
            // Get ID token for backend auth
            const idToken = await user.getIdToken();
            
            console.log('Sending emulator ID token to backend');
            const response = await axios.post('/api/auth/phone', { idToken });
            console.log('Backend authentication successful with emulator token:', response.data);
            
            // Set navigating flag to prevent clearing loading state on unmount
            isNavigatingRef.current = true;
            
            // Handle authentication
            await login(response.data.user, response.data.token);
            
            // Navigate to dashboard
            if (onSuccessNavigation) {
              onSuccessNavigation();
            } else {
              navigate('/dashboard', { replace: true });
            }
            return;
          } catch (emulatorError) {
            console.log('Could not verify with emulator:', emulatorError);
            console.log('Falling back to development token');
            
            // Fall back to development token
            const response = await axios.post('/api/auth/phone', { 
              idToken: 'development-token' 
            });
            
            console.log('Development mode authentication successful:', response.data);
            
            // Set navigating flag to prevent clearing loading state on unmount
            isNavigatingRef.current = true;
            
            // Handle authentication
            await login(response.data.user, response.data.token);
            
            // Navigate to dashboard
            if (onSuccessNavigation) {
              onSuccessNavigation();
            } else {
              navigate('/dashboard', { replace: true });
            }
            return;
          }
        } catch (apiError) {
          console.error('API error in development mode:', apiError);
          
          // Show specific error message for development mode
          let errorMsg = 'Development server error. ';
          if (apiError.response) {
            errorMsg += apiError.response.data?.error || `Status: ${apiError.response.status}`;
          } else if (apiError.request) {
            errorMsg += 'No response received from server. Check if backend is running.';
          } else {
            errorMsg += apiError.message || 'Unknown error';
          }
          
          setError(errorMsg);
          if (onError) onError(errorMsg);
          setLoading(false);
          return;
        }
      }
      
      // Production flow: Confirm the verification code with Firebase
      let idToken = null;
      try {
        const result = await verificationId.confirm(verificationCode);
        console.log('Authentication successful with Firebase');
        
        // Get the user
        const user = result.user;
        
        // Get ID token for backend auth
        idToken = await user.getIdToken();
      } catch (firebaseError) {
        console.error('Firebase verification error:', firebaseError);
        
        // Handle specific Firebase errors
        let errorMessage = 'Verification failed. ';
        
        if (firebaseError.code === 'auth/invalid-verification-code') {
          errorMessage = 'The verification code is invalid. Please check and try again.';
        } else if (firebaseError.code === 'auth/code-expired') {
          errorMessage = 'The verification code has expired. Please request a new one.';
          setStep(1);
        } else if (firebaseError.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage += firebaseError.message || 'Please try again.';
        }
        
        setError(errorMessage);
        if (onError) onError(errorMessage);
        setLoading(false);
        return;
      }
      
      // If we got a token, proceed with backend authentication
      if (!idToken) {
        setError('Failed to authenticate with Firebase. Please try again.');
        setLoading(false);
        return;
      }
      
      try {
        // Send token to backend to create/verify user session
        console.log('Sending ID token to backend for authentication');
        const response = await axios.post('/api/auth/phone', { idToken });
        console.log('Backend authentication successful:', response.data);
        
        // Set navigating flag to prevent clearing loading state on unmount
        isNavigatingRef.current = true;
        
        // Handle authentication
        await login(response.data.user, response.data.token);
        
        // Reset all auth-related state
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
        
        // Hide recaptcha container
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
          recaptchaContainer.style.display = 'none';
        }
        
        // Navigate to dashboard
        if (onSuccessNavigation) {
          onSuccessNavigation();
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (apiError) {
        console.error('API error during phone verification:', apiError.response || apiError);
        
        // Check for duplicate key error
        const isDuplicateKeyError = 
          apiError.response?.data?.details?.includes('duplicate key error') ||
          apiError.response?.data?.details?.includes('E11000');
        
        if (isDuplicateKeyError) {
          // Wait a bit and retry once for duplicate key errors
          setError('Account information is being synchronized. Please wait...');
          
          setTimeout(async () => {
            try {
              // Retry the request
              const retryResponse = await axios.post('/api/auth/phone', { idToken });
              
              // If successful, proceed with login
              isNavigatingRef.current = true;
              await login(retryResponse.data.user, retryResponse.data.token);
              
              // Navigate after successful login
              if (onSuccessNavigation) {
                onSuccessNavigation();
              } else {
                navigate('/dashboard', { replace: true });
              }
            } catch (retryError) {
              // If retry fails, show appropriate error
              const errorMessage = 'There was an issue with your account. Please try again in a few minutes or contact support.';
              setError(errorMessage);
              if (onError) onError(errorMessage);
              setLoading(false);
            }
          }, 2000);
          return;
        }
        
        // Handle other API errors
        let errorMessage = 'Server error during verification.';
        
        if (apiError.response?.status === 401) {
          errorMessage = 'Verification failed. Please check the code and try again.';
        } else if (apiError.response?.status === 429) {
          errorMessage = 'Too many login attempts. Please try again in a few minutes.';
        } else if (apiError.response?.status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.';
        } else {
          errorMessage = apiError.response?.data?.error || 'Server error during verification. Please try again.';
        }
        
        setError(errorMessage);
        if (onError) onError(errorMessage);
        setLoading(false);
      }
    } catch (error) {
      console.error('Phone verification global error:', error);
      
      // Handle general errors
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
      setLoading(false);
    }
  }, [loading, verificationCode, previousCode, attempts, verificationId, navigate, login, onSuccessNavigation, onError, setLoading]);

  // Handle resending code
  const handleResendCode = useCallback(async () => {
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
  }, [countdown, phoneNumber, onError]);

  // Memoized handler for going back to step 1
  const handleBackToStep1 = useCallback(() => {
    setStep(1);
  }, []);

  return (
    <div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Dedicated reCAPTCHA container */}
      <div id="recaptcha-container" style={{position: 'fixed', bottom: '10px', right: '10px', zIndex: 9999}}></div>

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
              onClick={handleBackToStep1}
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