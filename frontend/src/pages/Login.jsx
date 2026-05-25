import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginOptions from '../components/auth/LoginOptions';
import { useLoading } from '../App';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, CodeBracketIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] selection:bg-primary/30">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-[#0a0a0c] flex flex-col lg:flex-row overflow-hidden relative selection:bg-primary/30"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.6 }}
    >
      {/* LEFT COLUMN: Login Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 lg:py-0 relative z-10 bg-[#0a0a0c]">
        
        {/* Back to Home / Logo */}
        <div 
          onClick={() => navigate('/')}
          className="absolute top-8 left-6 sm:left-12 lg:left-20 flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-xl group-hover:bg-white/10 transition-colors shadow-glow-primary/10">
            <span className="text-white font-bold font-display text-sm">RZ</span>
          </div>
          <span className="text-zinc-500 font-semibold text-sm group-hover:text-white transition-colors tracking-wide">Back to Home</span>
        </div>

        <div className="max-w-[440px] w-full mx-auto mt-16 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight mb-3">
              Welcome back
            </h2>
            <p className="text-zinc-400 text-base mb-10 font-medium">
              Sign in to engineer your next career move.
            </p>
          </motion.div>

          <motion.div 
            ref={loginBoxRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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

            {/* Login Box */}
            <div className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Subtle top glow */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              
              <LoginOptions 
                onError={handleError}
                onSuccessNavigation={handleNavigate} 
              />
            </div>
            
            {/* Footer */}
            <div className="text-center mt-10 text-zinc-600 text-xs font-semibold uppercase tracking-wider">
              <p>© {new Date().getFullYear()} ResumeZen</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT COLUMN: SaaS Showcase */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden border-l border-white/5 bg-[#0f0f12]">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none -translate-x-1/4 translate-y-1/3"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] pointer-events-none"></div>

        {/* Feature UI */}
        <div className="relative z-10 w-full max-w-2xl px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-bold mb-8 shadow-lg">
              <SparklesIcon className="w-4 h-4 text-primary" />
              The Engine
            </div>
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white font-display leading-[1.1] tracking-tight mb-8">
              A relentless <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">Optimization pipeline</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-xl leading-relaxed font-medium">
              We built the exact tool we wish we had when interviewing at FAANG. Stop guessing and start engineering your resume with data.
            </p>
          </motion.div>

          {/* Floating UI Elements */}
          <div className="relative h-[340px] w-full">
            
            {/* ATS Score Card */}
            <motion.div 
              variants={floatVariants}
              animate="animate"
              className="absolute top-0 left-0 w-72 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20"
            >
              <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">ATS Match Score</h3>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-bold text-white font-display leading-none">98</span>
                <span className="text-emerald-400 font-bold mb-1">/100</span>
              </div>
              <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '98%' }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                ></motion.div>
              </div>
            </motion.div>

            {/* Keyword Injection Card */}
            <motion.div 
              variants={floatVariants}
              animate="animate"
              style={{ animationDelay: '-1s' }}
              className="absolute top-16 right-0 w-80 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl shadow-inner">
                  <CodeBracketIcon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-white font-bold text-sm">Keyword Injection</h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {['React.js', 'Node.js', 'PostgreSQL', 'AWS'].map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-300 font-mono font-medium">
                    {tag}
                  </span>
                ))}
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2, duration: 0.5 }}
                  className="px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-lg text-xs text-primary font-mono font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                >
                  + Kubernetes
                </motion.span>
              </div>
            </motion.div>

            {/* Impact Metric Card */}
            <motion.div 
              variants={floatVariants}
              animate="animate"
              style={{ animationDelay: '-2s' }}
              className="absolute bottom-4 left-16 w-64 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30"
            >
               <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">Impact Quantified</h3>
               <div className="flex items-center gap-5">
                 <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                   <CheckCircleIcon className="w-7 h-7 text-emerald-400" />
                 </div>
                 <div>
                   <div className="text-3xl font-extrabold text-white font-display leading-none mb-1">+340%</div>
                   <div className="text-xs font-semibold text-zinc-500">Performance</div>
                 </div>
               </div>
            </motion.div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}