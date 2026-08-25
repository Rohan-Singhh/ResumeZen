import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginOptions from '../components/auth/LoginOptions';
import { useLoading } from '../App';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import SceneBackdrop from '../components/three/SceneBackdrop';

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
        // Only navigate away if clicking outside the form area (for non-modal approach, we don't necessarily want this behavior anymore since it's a full page)
        // Let's remove the click-outside-to-home behavior as it's annoying on a split screen layout
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

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070b] selection:bg-primary/30">
        <div className="w-16 h-16 border-4 border-white/10 border-t-[#7c6cf6] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col lg:flex-row overflow-hidden relative selection:bg-primary/30 bg-[#07070b]"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.6 }}
    >
      {/* ATMOSPHERE: real-3D studio void behind everything */}
      <SceneBackdrop className="z-0" />

      {/* LEFT COLUMN: Login Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 lg:py-0 relative z-10">
        
        {/* Back to Home / Logo */}
        <div 
          onClick={() => navigate('/')}
          className="absolute top-8 left-6 sm:left-12 lg:left-20 flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-10 h-10 glass-panel rounded-xl group-hover:border-[#7c6cf6]/40 transition-colors shadow-[inset_-2px_0_0_0_rgba(124,108,246,0.85)]">
            <span className="text-[#f4f2ec] font-bold font-display text-sm">RZ</span>
          </div>
          <span className="text-[#a1a1ae] font-semibold text-sm group-hover:text-white transition-colors tracking-wide">Back to Home</span>
        </div>

        <div className="max-w-[460px] w-full mx-auto mt-16 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[#7c6cf6] text-xs font-bold uppercase tracking-[0.22em] mb-4">
              ResumeZen Studio
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#f4f2ec] font-display tracking-tight mb-3">
              Welcome back
            </h2>
            <p className="text-[#a1a1ae] text-base mb-10 font-medium">
              Sign in to engineer your next career move.
            </p>
          </motion.div>

          <motion.div 
            ref={loginBoxRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl mb-6 overflow-hidden"
                >
                  <div className="px-5 py-4 flex items-start">
                    <svg className="w-5 h-5 mr-3 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 text-sm font-medium leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Box — frosted glass over the monolith */}
            <div className="glass-panel p-6 sm:p-8 rounded-[28px] relative overflow-hidden lift">
              {/* Top-lit hairline */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#7c6cf6]/60 to-transparent"></div>
              
              <LoginOptions 
                onError={handleError}
                onSuccessNavigation={handleNavigate} 
              />
            </div>
            
            {/* Footer */}
            <div className="text-center mt-10 text-[#6b6b78] text-xs font-semibold uppercase tracking-wider">
              <p>© {new Date().getFullYear()} ResumeZen</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT COLUMN: the monolith does the talking — copy + proof chips only */}
      <div className="hidden lg:flex flex-1 relative items-stretch justify-stretch p-14 xl:p-20 z-10 pointer-events-none">
        <div className="flex flex-col justify-between w-full max-w-3xl ml-auto">
          
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="pt-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-panel rounded-full text-[#c9c4f2] text-sm font-bold mb-8">
              <SparklesIcon className="w-4 h-4 text-[#7c6cf6]" />
              The Engine
            </div>
            <h1 className="text-5xl xl:text-[3.6rem] font-extrabold text-[#f4f2ec] font-display leading-[1.08] tracking-tight mb-7">
              A relentless<br />
              <span className="text-[#a99cf9]">optimization pipeline.</span>
            </h1>
            <p className="text-lg xl:text-xl text-[#a1a1ae] max-w-lg leading-relaxed font-medium">
              We built the exact tool we wish we had when interviewing at FAANG.
              Stop guessing — start engineering your resume with data.
            </p>
          </motion.div>

          {/* Proof chips floating over the scene floor */}
          <div className="flex flex-wrap items-end gap-5 pb-6 pointer-events-auto">
            <motion.div 
              variants={floatVariants}
              animate="animate"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="glass-panel lift rounded-2xl p-6 w-64"
            >
              <h3 className="text-[#a1a1ae] text-xs font-bold uppercase tracking-wider mb-4">ATS Match Score</h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-[#f4f2ec] font-display leading-none">98</span>
                <span className="text-[#7c6cf6] font-bold mb-0.5">/100</span>
              </div>
              <div className="mt-5 h-1.5 w-full bg-white/[0.07] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '98%' }}
                  transition={{ duration: 1.5, delay: 0.9, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#7c6cf6] to-[#a99cf9]"
                ></motion.div>
              </div>
            </motion.div>

            <motion.div 
              variants={floatVariants}
              animate="animate"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="glass-panel lift rounded-2xl p-6 w-56"
            >
               <h3 className="text-[#a1a1ae] text-xs font-bold uppercase tracking-wider mb-4">Impact Quantified</h3>
               <div className="flex items-center gap-4">
                 <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#7c6cf6]/10 border border-[#7c6cf6]/25">
                   <CheckCircleIcon className="w-6 h-6 text-[#a99cf9]" />
                 </div>
                 <div>
                   <div className="text-3xl font-extrabold text-[#f4f2ec] font-display leading-none mb-1">+340%</div>
                   <div className="text-xs font-semibold text-[#6b6b78]">Performance</div>
                 </div>
               </div>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
