import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginOptions from '../components/auth/LoginOptions';
import { useLoading } from '../App';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  }
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const loginBoxRef = useRef(null);
  const navigatingRef = useRef(false);
  // Keep reference to loading context for backward compatibility
  const { setLoading } = useLoading();

  // Get the redirect location from state, if any
  const { from } = location.state || { from: { pathname: '/dashboard' } };

  // Check if user is already authenticated with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsCheckingAuth(false);
      if (user) {
        console.log("User is already authenticated with Firebase:", user.email);
        // If user is already authenticated, they can proceed directly
        // The AuthContext will handle getting the token from localStorage
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Consolidated useEffect to handle both loading state management and cleanup
  useEffect(() => {
    // Get a ref to the current navigate function to avoid stale closures
    const navigateFunction = navigate;
    
    // Add click outside handler
    const handleClickOutside = (event) => {
      if (loginBoxRef.current && !loginBoxRef.current.contains(event.target)) {
        navigateFunction('/');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup function for unmounting
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array since we capture values at the start

  const handleError = useCallback((message) => {
    setError(message);
  }, []);
  
  // Mark when we're navigating away to prevent turning off global loading
  const handleNavigate = useCallback(() => {
    navigatingRef.current = true;
    console.log('Login: Navigating to dashboard or original location', from.pathname);
    
    // Ensure loading state is off before navigation
    setLoading(false);
    
    // Add a small delay to ensure loading state is updated before navigation
    setTimeout(() => {
      // Navigate to the dashboard after login or to the original location if redirected
      navigate(from.pathname, { replace: true });
      console.log('Login: Navigation complete');
    }, 100);
  }, [navigate, from, setLoading]);

  // Decorative elements for visual appeal
  const Decorations = () => (
    <>
      {/* Top-left decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Bottom-right decoration */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      {/* Extra decorations */}
      <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-yellow-400 opacity-70 rounded-full blur-sm"></div>
      <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-purple-500 opacity-70 rounded-full blur-sm"></div>
      <div className="absolute top-2/3 right-1/3 w-5 h-5 bg-primary opacity-70 rounded-full blur-sm"></div>
    </>
  );

  // If checking auth, show a loading indicator
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4 }}
    >
      {/* Decorative elements */}
      <Decorations />
      
      {/* Login container */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">RZ</span>
          </div>
        </div>
        
        {/* Main card */}
        <motion.div 
          ref={loginBoxRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Card header with gradient */}
          <div className="bg-gradient-to-r from-primary/90 to-blue-600/90 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold mb-1">Welcome</h1>
            <p className="text-blue-100">Sign in to your ResumeZen account</p>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-8 py-4 bg-red-50"
              >
                <p className="text-red-600 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login form content */}
          <div className="px-8 py-6">
            <LoginOptions 
              onError={handleError}
              onSuccessNavigation={handleNavigate} 
            />
          </div>
        </motion.div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ResumeZen. All rights reserved.</p>
        </div>
      </div>
    </motion.div>
  );
} 