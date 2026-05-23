import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginOptions from '../components/auth/LoginOptions';
import { useLoading } from '../App';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

// Page transition variants
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const loginBoxRef = useRef(null);
  const navigatingRef = useRef(false);
  const { setLoading } = useLoading();
  const { currentUser } = useAuth();

  const { from } = location.state || { from: { pathname: '/dashboard' } };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsCheckingAuth(false);
      if (user) {
        console.log("User is already authenticated with Firebase:", user.email);
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const navigateFunction = navigate;
    
    const handleClickOutside = (event) => {
      if (loginBoxRef.current && !loginBoxRef.current.contains(event.target)) {
        navigateFunction('/');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleError = useCallback((message) => {
    setError(message);
  }, []);
  
  const handleNavigate = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    
    setLoading(false);
    
    setTimeout(() => {
      navigate(from.pathname, { replace: true });
    }, 100);
  }, [navigate, from, setLoading]);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (currentUser && !navigatingRef.current) {
      console.log("User fully authenticated, proceeding to dashboard...");
      handleNavigate();
    }
  }, [currentUser, handleNavigate]);

  const Decorations = () => (
    <>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
      <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-secondary/20 rounded-full blur-[80px] pointer-events-none"></div>
    </>
  );

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg selection:bg-primary/30">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-dark-bg selection:bg-primary/30 overflow-hidden relative"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.6 }}
    >
      <Decorations />
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[440px] px-4 py-8">
        
        {/* Logo */}
        <motion.div 
          className="flex flex-col items-center justify-center mb-10 cursor-pointer group"
          onClick={() => navigate('/')}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-center w-16 h-16 bg-white/5 border border-white/10 rounded-2xl shadow-glow-primary/20 mb-6 group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300">
             <span className="text-white text-2xl font-bold font-display">RZ</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white font-display tracking-tight text-center">
            Welcome to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-shimmer bg-[length:200%_auto]">ResumeZen</span>
          </h2>
        </motion.div>
        
        {/* Main card */}
        <motion.div 
          ref={loginBoxRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="w-full bg-dark-card border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden relative"
        >
          {/* Card Top Border Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary"></div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border-b border-red-500/20"
              >
                <div className="px-6 py-4 flex items-start">
                  <svg className="w-5 h-5 mr-3 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm font-medium leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login form content */}
          <div className="p-8 sm:p-10">
             <p className="text-gray-400 text-center mb-8 font-light text-sm">
                Get started or sign in to your account. We'll handle the rest.
             </p>
            <LoginOptions 
              onError={handleError}
              onSuccessNavigation={handleNavigate} 
            />
          </div>
        </motion.div>
        
        {/* Footer */}
        <motion.div 
          className="text-center mt-8 text-gray-500 text-xs font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>© {new Date().getFullYear()} ResumeZen. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}