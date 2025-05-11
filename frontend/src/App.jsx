import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, createContext, useContext, useEffect, useCallback, useRef } from 'react';
import Landing from './pages/Landing';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import Login from './pages/Login';
import AuthGuard from './components/auth/AuthGuard';

// Dashboard components
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import DashboardWelcome from './pages/Dashboard/DashboardWelcome';
import DashboardProfileEdit from './pages/Dashboard/DashboardProfileEdit';
import DashboardPlan from './pages/Dashboard/DashboardPlan';
import DashboardHelp from './pages/Dashboard/DashboardHelp';

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
  const { isLoading, loadingMessage, skipTransitions } = useLoading();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isLoading ? (
        <div key="loading" className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            {loadingMessage && (
              <p className="mt-4 text-lg text-gray-600">{loadingMessage}</p>
            )}
          </div>
        </div>
      ) : (
        <Routes location={location} key={skipTransitions ? 'no-animation' : location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard routes with auth protection */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }>
            <Route index element={<DashboardWelcome />} />
            <Route path="profile" element={<DashboardProfileEdit />} />
            <Route path="plans" element={<DashboardPlan />} />
            <Route path="help" element={<DashboardHelp />} />
          </Route>
        </Routes>
      )}
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