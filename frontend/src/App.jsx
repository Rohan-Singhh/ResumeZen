import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, createContext, useContext, useEffect, useCallback, useRef } from 'react';
import Landing from './pages/Landing';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import Login from './pages/Login';
import Dashboard from './dashboard/Dashboard';
import LoadingOverlay from './components/LoadingOverlay';

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
  const [loadingMessage, setLoadingMsgState] = useState('Loading your dashboard...');
  const [loadingTimerId, setLoadingTimerId] = useState(null);
  const [transitionsDisabled, setTransitionsDisabled] = useState(false);

  // Check for logout in progress flag
  useEffect(() => {
    const checkLogoutFlag = () => {
      const isLogoutInProgress = sessionStorage.getItem('logoutInProgress') === 'true';
      if (isLogoutInProgress) {
        // Logout is in progress, disable loading transitions
        setTransitionsDisabled(true);
        setIsLoading(false);
        
        if (loadingTimerId) {
          clearTimeout(loadingTimerId);
          setLoadingTimerId(null);
        }
      }
    };
    
    // Check immediately
    checkLogoutFlag();
    
    // Also set up an interval to check regularly
    const intervalId = setInterval(checkLogoutFlag, 100);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [loadingTimerId]);

  // Improved loading state setter with debounce to prevent flickering
  const setLoading = useCallback((loading, duration = 0) => {
    // Always check logout flag before showing loading screen
    if (sessionStorage.getItem('logoutInProgress') === 'true' || transitionsDisabled) {
      // Never show loading during logout
      return;
    }
    
    if (loadingTimerId) {
      clearTimeout(loadingTimerId);
      setLoadingTimerId(null);
    }

    if (loading) {
      setIsLoading(true);
      
      if (duration > 0) {
        const timerId = setTimeout(() => {
          setIsLoading(false);
        }, duration);
        setLoadingTimerId(timerId);
      }
    } else {
      // For dashboard navigation, immediately hide the loading overlay
      // to prevent visual flash between loading and welcome animation
      if (window.location.pathname.includes('/dashboard')) {
        setIsLoading(false);
      } else {
        // For other routes, add small delay before hiding to ensure smooth transitions
        const timerId = setTimeout(() => {
          setIsLoading(false);
        }, 300);
        setLoadingTimerId(timerId);
      }
    }
  }, [loadingTimerId, transitionsDisabled]);

  const setLoadingMessage = useCallback((message) => {
    setLoadingMsgState(message);
  }, []);
  
  // Special function to disable loading transitions entirely (for logout)
  const disableLoadingTransitions = useCallback((disable = true) => {
    setTransitionsDisabled(disable);
    if (disable) {
      // Immediately hide any active loading states
      setIsLoading(false);
      if (loadingTimerId) {
        clearTimeout(loadingTimerId);
        setLoadingTimerId(null);
      }
    }
  }, [loadingTimerId]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerId) {
        clearTimeout(loadingTimerId);
      }
    };
  }, [loadingTimerId]);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      loadingMessage, 
      setLoading, 
      setLoadingMessage,
      disableLoadingTransitions 
    }}>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingOverlay message={loadingMessage} />}
      </AnimatePresence>
      {children}
    </LoadingContext.Provider>
  );
}

// Hook to use loading context
export const useLoading = () => useContext(LoadingContext);

// AnimatedRoutes component with page transitions
function AnimatedRoutes() {
  const location = useLocation();
  const { setLoading, disableLoadingTransitions } = useLoading();
  
  // Use a ref to detect navigation from dashboard to home (logout)
  const lastPathRef = useRef(location.pathname);
  
  // Check if this is a logout navigation (from dashboard to home)
  useEffect(() => {
    // Detect logout navigation (from dashboard to home)
    if (lastPathRef.current.includes('/dashboard') && location.pathname === '/') {
      // This is a logout navigation - disable all loading transitions
      console.log('Detected logout navigation, disabling loading transitions');
      
      // Set logout flag to prevent loading screens
      sessionStorage.setItem('logoutInProgress', 'true');
      
      // Disable all loading transitions
      disableLoadingTransitions(true);
      
      // Prevent any loading states
      setLoading(false);
      
      // Force hide any loading overlays that might be visible
      const loadingElements = document.querySelectorAll('.loading-element, .overlay, #loading-overlay');
      loadingElements.forEach(el => {
        if (el) el.style.display = 'none';
      });
      
      // Clear the flag after a delay
      setTimeout(() => {
        sessionStorage.removeItem('logoutInProgress');
      }, 2000);
    }
    
    // Update the last path for future comparisons
    lastPathRef.current = location.pathname;
  }, [location.pathname, setLoading, disableLoadingTransitions]);
  
  // Reset loading state on route changes and handle transitions
  useEffect(() => {
    // Skip effect if we're navigating away from dashboard (logout case)
    const isLogoutNavigation = lastPathRef.current.includes('/dashboard') && location.pathname === '/';
    if (isLogoutNavigation) {
      return; // Don't do anything during logout navigation
    }
    
    // If navigating to dashboard, clear loading immediately
    // This allows the dashboard's welcome animation to show without flashing
    if (location.pathname === '/dashboard') {
      // For dashboard, we want to immediately hide the loading overlay
      // since the dashboard will handle its own welcome animation
      setLoading(false);
    } else {
      // For other routes, add a small delay for smooth transitions
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, setLoading]); // Only depend on location.pathname and setLoading, not the ref
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
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