import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, createContext, useContext, useEffect, useCallback, useRef } from 'react';
import Landing from './pages/Landing';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import Login from './pages/Login';
import AuthGuard from './components/auth/AuthGuard';
import PageTransition from './components/PageTransition';

// Dashboard components
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import DashboardWelcome from './pages/Dashboard/DashboardWelcome';
import DashboardProfileEdit from './pages/Dashboard/DashboardProfileEdit';
import DashboardPlan from './pages/Dashboard/DashboardPlan';
import DashboardHelp from './pages/Dashboard/DashboardHelp';
import RecentUploads from './pages/Dashboard/RecentUploads';
import ResumeAnalysis from './pages/Dashboard/ResumeAnalysis';
import DashboardJobs from './pages/Dashboard/DashboardJobs';

// Create a global loading context
export const LoadingContext = createContext({
  isLoading: false,
  loadingMessage: '',
  setLoading: () => {},
  setLoadingMessage: () => {},
  disableLoadingTransitions: () => {}
});

// Loading Provider Component
export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMsgState] = useState('');
  const [skipTransitions, setSkipTransitions] = useState(false);

  const setLoadingMessage = useCallback((message) => {
    setLoadingMsgState(message);
  }, []);

  const setLoading = useCallback((status) => {
    setIsLoading(status);
    if (!status) {
      // Clear the loading message when loading is done
      setLoadingMsgState('');
    }
  }, []);

  const disableLoadingTransitions = useCallback((disable = true) => {
    setSkipTransitions(disable);
  }, []);

  // Create the context value
  const contextValue = {
    isLoading,
    loadingMessage,
    setLoading,
    setLoadingMessage,
    skipTransitions,
    disableLoadingTransitions
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
}

// Custom hook to use loading context
export function useLoading() {
  return useContext(LoadingContext);
}

// Animation wrapper component
function AnimatedRoutes() {
  const { isLoading, loadingMessage, skipTransitions, setLoading } = useLoading();
  const location = useLocation();
  const loadingTimeoutRef = useRef(null);
  
  // Prevent infinite loading by adding a timeout
  useEffect(() => {
    if (isLoading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Set a new timeout to force end loading after 10 seconds
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Forced loading state off after timeout');
        setLoading(false);
      }, 10000);
    } else {
      // Clear timeout when loading ends naturally
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, setLoading]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="global-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center z-[100]"
          >
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              {loadingMessage && (
                <p className="mt-4 text-sm font-medium text-zinc-400">{loadingMessage}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/success-stories" element={<PageTransition><SuccessStoriesPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          
          {/* Dashboard routes with auth protection */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <PageTransition>
                <DashboardLayout />
              </PageTransition>
            </AuthGuard>
          }>
            <Route index element={<DashboardWelcome />} />
            <Route path="profile" element={<DashboardProfileEdit />} />
            <Route path="plans" element={<DashboardPlan />} />
            <Route path="help" element={<DashboardHelp />} />
            <Route path="recent-uploads" element={<RecentUploads />} />
            <Route path="resume-analysis" element={<ResumeAnalysis />} />
            <Route path="jobs" element={<DashboardJobs />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <LoadingProvider>
        <AnimatedRoutes />
      </LoadingProvider>
    </Router>
  );
}