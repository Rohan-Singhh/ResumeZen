import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useState, createContext, useContext, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import Landing from './pages/Landing';
import AuthGuard from './components/auth/AuthGuard';
import PageTransition from './components/PageTransition';

// Landing is the entry point for logged-out visitors and stays eager. Everything
// else is split out so a first-time visitor does not download the whole
// dashboard, its charts, and the auth flow before seeing the marketing page.
const loadSuccessStories = () => import('./pages/SuccessStoriesPage');
const loadLogin = () => import('./pages/Login');
const loadDashboardLayout = () => import('./pages/Dashboard/DashboardLayout');
const loadDashboardWelcome = () => import('./pages/Dashboard/DashboardWelcome');

const SuccessStoriesPage = lazy(loadSuccessStories);
const Login = lazy(loadLogin);
const DashboardLayout = lazy(loadDashboardLayout);
const DashboardWelcome = lazy(loadDashboardWelcome);
const DashboardProfileEdit = lazy(() => import('./pages/Dashboard/DashboardProfileEdit'));
const DashboardPlan = lazy(() => import('./pages/Dashboard/DashboardPlan'));
const Studio = lazy(() => import('./pages/Dashboard/Studio'));
const DashboardJobs = lazy(() => import('./pages/Dashboard/DashboardJobs'));

// Warm the chunks a landing visitor is most likely to open next, once the
// browser is idle, so "Get started" doesn't stall on a network round trip.
function preloadLikelyRoutes() {
  const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 1500));
  idle(() => {
    loadLogin();
    loadSuccessStories();
    loadDashboardLayout();
    loadDashboardWelcome();
  });
}

// Page-sized fallback that stays blank for the first 400ms: a chunk that
// arrives quickly shows no spinner flash at all.
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-void">
      <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent [animation:spin_1s_linear_infinite,fadeIn_0.2s_ease-out_0.4s_both]" />
    </div>
  );
}

// Suspense per route: a lazy page suspends inside its own transition wrapper
// instead of blanking the whole app through one global boundary.
const withSuspense = (element) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

// One key per top-level page. Keying on the full pathname remounted the whole
// dashboard layout (nav included) on every tab switch; the layout animates its
// own tab content.
const routeKeyFor = (pathname) =>
  pathname.startsWith('/dashboard') ? '/dashboard' : pathname;

// Jump to the top between pages, after the old page has faded out and before
// the new one fades in. 'instant' bypasses html { scroll-behavior: smooth }.
const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

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

  useEffect(() => {
    preloadLikelyRoutes();
  }, []);

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
      
      {/* AnimatePresence must wrap the keyed <Routes> directly. It used to wrap
          an unkeyed <Suspense>, so it never saw a child leave: exit animations
          never ran and pages swapped abruptly. mode="wait" fades the old page
          out before the new one fades in, so the two never stack. */}
      <AnimatePresence mode="wait" initial={false} onExitComplete={scrollToTop}>
        <Routes location={location} key={routeKeyFor(location.pathname)}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/success-stories" element={<PageTransition>{withSuspense(<SuccessStoriesPage />)}</PageTransition>} />
          <Route path="/login" element={<PageTransition>{withSuspense(<Login />)}</PageTransition>} />

          {/* Dashboard routes with auth protection */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <PageTransition>
                {withSuspense(<DashboardLayout />)}
              </PageTransition>
            </AuthGuard>
          }>
            <Route index element={withSuspense(<DashboardWelcome />)} />
            <Route path="profile" element={withSuspense(<DashboardProfileEdit />)} />
            <Route path="plans" element={withSuspense(<DashboardPlan />)} />
            <Route path="studio" element={withSuspense(<Studio />)} />
            <Route path="jobs" element={withSuspense(<DashboardJobs />)} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    // reducedMotion="user" makes every framer-motion animation respect the
    // OS "reduce motion" setting without per-component guards.
    <MotionConfig reducedMotion="user">
      <Router>
        <LoadingProvider>
          <AnimatedRoutes />
        </LoadingProvider>
      </Router>
    </MotionConfig>
  );
}