import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardState } from './dashboardState';
import dummyData from './dashboardData';
import {
  getFirstName,
  handleProfileUpdate,
  handleFileSelect,
  handleUploadConfirm,
  handlePurchasePlan,
  handleViewFeedback,
  clearUploadArea
} from './dashboardUtils';
import { ProfileCard, PlanSection, HelpSection, UploadBox, ResumeHistory, VlogList } from './sections';
import ModalRenderer from './ModalRenderer';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../App';
import axios from 'axios';
import WelcomeAnimation from '../components/auth/WelcomeAnimation';

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

export default function Dashboard() {
  // ========== ALL HOOKS DECLARED FIRST ==========
  const navigate = useNavigate();
  const location = useLocation();
  const state = useDashboardState();
  const { currentUser, loading: authLoading, fetchUserData, purchasePlan } = useAuth();
  const { setLoading, isLoading, disableLoadingTransitions } = useLoading();
  
  // Dashboard state
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeAnimation, setWelcomeAnimation] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [planUpdated, setPlanUpdated] = useState(0);
  const [preloaded, setPreloaded] = useState(false);
  
  // Refs
  const lastFetchAttempt = useRef(0);
  const retryCount = useRef(0);
  const requestQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  const animationTimer = useRef(null);
  
  // ========== HELPER FUNCTIONS ==========
  
  // Map the backend user model to the frontend user model
  const mapUserData = (userData) => {
    if (!userData) return null;
    
    // Generate initials if name exists
    let initials = 'GU';
    if (userData.name) {
      const nameParts = userData.name.split(' ');
      if (nameParts.length >= 2) {
        initials = `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        initials = nameParts[0][0].toUpperCase();
      }
    }
    
    return {
      ...userData,
      plan: userData.currentPlan || userData.plan || 'no_plan',
      remainingChecks: userData.remainingChecks || 0,
      hasUnlimitedChecks: userData.hasUnlimitedChecks || false,
      planEndDate: userData.planEndDate ? new Date(userData.planEndDate) : null,
      initials: initials
    };
  };
  
  // Create a mapped version of the currentUser with consistent property names
  const user = mapUserData(currentUser) || {
    name: 'Guest User',
    email: 'Not logged in',
    phone: '',
    plan: 'no_plan',
    initials: 'GU',
    remainingChecks: 0,
    hasUnlimitedChecks: false,
    planEndDate: null
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser?.name) return 'GU';
    
    const nameParts = currentUser.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };
  
  // Add default initials if not available
  if (!user.initials) {
    user.initials = getUserInitials();
  }
  
  // Simulate successful purchase
  const simulateSuccessfulPurchase = (plan, userData) => {
    console.log('Simulating successful purchase for plan:', plan.title);
    
    // Clone user data to avoid mutations
    const userCopy = { ...(userData || {}) };
    
    // Create simulated updated user data
    const simulatedUser = {
      ...userCopy,
      plan: plan.title,
      hasUnlimitedChecks: plan.title === "Unlimited Pack",
      remainingChecks: plan.title === "Unlimited Pack" ? 
        999 : 
        (userCopy.remainingChecks || 0) + (plan.checks || 
          (plan.title === "Basic Check" ? 1 : 
           plan.title === "Standard Pack" ? 5 : 0))
    };
    
    // Set UI state based on the plan
    if (plan.title === "Unlimited Pack") {
      state.setIsPlanUnlimited(true);
      state.setPurchaseMessage("Successfully upgraded to Unlimited Plan! (Simulated)");
    } else {
      const addedChecks = plan.checks || 
                         (plan.title === "Basic Check" ? 1 : 
                          plan.title === "Standard Pack" ? 5 : 0);
      
      state.setRemainingChecks(simulatedUser.remainingChecks);
      state.setPurchaseMessage(`Successfully added ${addedChecks} checks to your plan! (Simulated)`);
    }
    
    // Return a simulated API response
    return {
      success: true,
      user: simulatedUser,
      message: `Successfully purchased ${plan.title} (simulated)`
    };
  };
  
  // ========== API REQUEST HANDLER ==========
  
  // Process request queue
  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || requestQueue.current.length === 0) return;
    
    isProcessingQueue.current = true;
    
    try {
      const nextRequest = requestQueue.current[0];
      const now = Date.now();
      
      // Respect rate limiting with a minimum delay between requests
      const timeSinceLastRequest = now - lastFetchAttempt.current;
      if (timeSinceLastRequest < 1000) {
        // Wait before processing the next request
        await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
      }
      
      lastFetchAttempt.current = Date.now();
      await nextRequest.request();
      
      // Remove the completed request from the queue
      requestQueue.current.shift();
      
      // Reset retry count on success
      retryCount.current = 0;
    } catch (error) {
      console.error('Error processing request queue:', error);
      
      // If rate limited, retry with backoff
      if (error.response?.status === 429) {
        retryCount.current++;
        console.log(`Rate limited, retry #${retryCount.current}`);
        
        // Implement exponential backoff for retries
        const delayMs = Math.min(2000 * Math.pow(2, retryCount.current - 1), 30000);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // For other errors, remove the request from the queue
        requestQueue.current.shift();
        retryCount.current = 0;
      }
    } finally {
      isProcessingQueue.current = false;
      
      // Continue processing queue if items remain
      if (requestQueue.current.length > 0) {
        processQueue();
      }
    }
  }, []);

  // Add request to queue
  const queueRequest = useCallback((request, priority = false) => {
    // Add to front of queue if high priority
    if (priority) {
      requestQueue.current.unshift({ request });
    } else {
      requestQueue.current.push({ request });
    }
    
    // Start processing if not already
    if (!isProcessingQueue.current) {
      processQueue();
    }
  }, [processQueue]);
  
  // Fetch user data safely
  const fetchUserDataSafely = useCallback(async () => {
    if (!currentUser || dataFetched) return;
    
    try {
      queueRequest(async () => {
        try {
          await fetchUserData();
        } catch (err) {
          console.error('Error fetching user data:', err);
          
          // If in development, use dummy data as fallback
          if (process.env.NODE_ENV === 'development' || !window.location.hostname.includes('.')) {
            console.log('Using dummy data as fallback in development');
            // No need to actually set data here, just prevent error state
          } else {
            throw err; // Re-throw in production
          }
        }
      }, true); // High priority
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      if (error.response?.status === 429) {
        console.log('Rate limited, will retry later');
      } else {
        setFetchError('Failed to fetch user data. Please try refreshing the page.');
      }
    }
  }, [currentUser, fetchUserData, dataFetched, queueRequest]);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async () => {
    if (loadingPayments || !currentUser || dataFetched) return;
    
    try {
      setLoadingPayments(true);
      
      queueRequest(async () => {
        const response = await axios.get('/api/users/me/payments', {
          // Add cache headers
          headers: {
            'Cache-Control': 'max-age=300' // Cache for 5 minutes
          }
        });
        setPayments(response.data.payments || []);
        setDataFetched(true);
        setLoadingPayments(false);
      });
    } catch (error) {
      console.error('Error queueing payment history fetch:', error);
      setLoadingPayments(false);
    }
  }, [currentUser, loadingPayments, dataFetched, queueRequest]);
  
  // Retry data fetch
  const handleRetryFetch = () => {
    setFetchError(null);
    setDataFetched(false);
    
    // Clear and restart the request queue
    requestQueue.current = [];
    isProcessingQueue.current = false;
    
    // Retry fetch operations
    fetchUserDataSafely();
    
    // Add delay before fetching payment history
    setTimeout(() => {
      fetchPaymentHistory();
    }, 1500);
  };
  
  // ========== EVENT HANDLERS ==========
  
  // UI Event handlers
  const onEditProfile = () => state.setIsEditProfileOpen(true);
  const onFileSelect = file => handleFileSelect(
    file,
    state.remainingChecks,
    state.isPlanUnlimited,
    state.setShowPlanAlert,
    state.setSelectedFile,
    user.plan
  );
  const onUploadConfirm = () => handleUploadConfirm({
    selectedFile: state.selectedFile,
    resumes: state.resumes,
    setResumes: state.setResumes,
    setAnalysisResult: state.setAnalysisResult,
    setIsProcessing: state.setIsProcessing,
    setShowAnalysis: state.setShowAnalysis,
    isPlanUnlimited: state.isPlanUnlimited,
    remainingChecks: state.remainingChecks,
    setRemainingChecks: state.setRemainingChecks
  });
  const onViewFeedback = resume => handleViewFeedback(resume, state.setSelectedResume, state.setShowFeedback);
  const onVlogSelect = vlog => state.setSelectedVlog(vlog);
  const onEmail = () => window.location = 'mailto:support@resumezen.com';
  const onLiveChat = () => state.setShowLiveChat(true);
  const onFAQ = () => state.setShowFAQ(true);
  const onSchedule = () => state.setShowSchedule(true);
  
  // Plan purchase handler
  const onPurchasePlan = async (plan) => {
    try {
      // Show loading state
      state.setPurchaseMessage("Processing purchase...");
      state.setShowPurchaseSuccess(true);
      
      // Check if user is authenticated
      if (!currentUser || !currentUser._id) {
        state.setPurchaseMessage("You need to be logged in to purchase a plan. Please refresh the page and try again.");
        setTimeout(() => state.setShowPurchaseSuccess(false), 3000);
        return;
      }
      
      // Prepare plan details
      const planDetails = {
        planId: plan.planId || `plan-${plan.title.toLowerCase().replace(/\s+/g, '-')}`,
        planName: plan.title,
        amount: parseFloat(plan.price.toString().replace(/[^0-9.]/g, '')),
        paymentMethod: 'credit_card',
        paymentDetails: {
          plan: plan.title,
          checks: plan.checks || (plan.title === "Basic Check" ? 1 : 
                                 plan.title === "Standard Pack" ? 5 : 
                                 'unlimited')
        }
      };
      
      console.log('Processing payment for plan:', planDetails);
      
      // Flag to track if we used simulation
      let usedSimulation = false;
      let response;
      
      // Process payment - wrapped in try-catch to handle API errors safely
      try {
        response = await purchasePlan(planDetails);
        console.log('Purchase response:', response);
      } catch (apiError) {
        console.error('API Error during purchase:', apiError);
        
        // Check if we're in development environment
        const isDev = process.env.NODE_ENV === 'development' || !window.location.hostname.includes('.');
        
        if (isDev) {
          // Use simulation in development when API fails
          console.log('Falling back to simulated purchase in development');
          response = simulateSuccessfulPurchase(plan, currentUser);
          usedSimulation = true;
        } else {
          // In production, show error message
          state.setPurchaseMessage("Payment failed. Please try again later.");
          setTimeout(() => state.setShowPurchaseSuccess(false), 3000);
          return;
        }
      }
      
      // DIRECT UI UPDATE - Don't wait for fetchUserData which might be delayed
      let updatedUserData;
      
      // Immediately update the UI with the purchased plan info
      if (plan.title === "Unlimited Pack") {
        // Update state for unlimited plan
        state.setIsPlanUnlimited(true);
        state.setPurchaseMessage(usedSimulation ? 
          "Successfully upgraded to Unlimited Plan! (Simulated)" : 
          "Successfully upgraded to Unlimited Plan!");
          
        // Create updated user object
        updatedUserData = {
          ...currentUser,
          plan: plan.title,
          currentPlan: plan.title,
          hasUnlimitedChecks: true,
          remainingChecks: 999
        };
      } else {
        // For limited plans
        const addedChecks = plan.checks || (plan.title === "Basic Check" ? 1 : plan.title === "Standard Pack" ? 5 : 0);
        const newTotal = (currentUser?.remainingChecks || 0) + addedChecks;
        
        state.setRemainingChecks(newTotal);
        state.setPurchaseMessage(usedSimulation ?
          `Successfully added ${addedChecks} checks to your plan! (Simulated)` :
          `Successfully added ${addedChecks} checks to your plan!`);
          
        // Create updated user object
        updatedUserData = {
          ...currentUser,
          plan: plan.title,
          currentPlan: plan.title,
          remainingChecks: newTotal
        };
      }
      
      // Save updated user data to localStorage for persistence
      try {
        localStorage.setItem('dashboardPlanUpdate', JSON.stringify({
          timestamp: Date.now(),
          planDetails: planDetails,
          updatedUser: updatedUserData
        }));
      } catch (e) {
        console.error('Could not save plan update to localStorage:', e);
      }
      
      // Apply the update to currentUser to force immediate UI update
      Object.assign(currentUser, updatedUserData);
        
      // Force a re-render of components that use the plan
      setPlanUpdated(prev => prev + 1);
      
      // Show success message
      state.setShowPurchaseSuccess(true);
      
      // Now try to refresh the user data from backend
      try {
        const updatedUser = await fetchUserData();
        console.log('Updated user data from backend:', updatedUser);
        
        // Don't reload the page - it's unnecessary and causes extra rendering
        // The UI is already updated through the setPlanUpdated state and the object updates
        
      } catch (userDataError) {
        console.error('Error fetching updated user data:', userDataError);
        // Still continue with the UI updates we already have - no need to reload
      }
    } catch (error) {
      // Global error handler
      console.error("Purchase failed:", error);
      state.setPurchaseMessage("An unexpected error occurred. Please try again.");
      state.setShowPurchaseSuccess(true);
      setTimeout(() => state.setShowPurchaseSuccess(false), 3000);
    }
  };
  
  // ========== EFFECTS ==========
  
  // Check for plan updates from URL state (when redirected from purchase)
  useEffect(() => {
    if (location.state?.planUpdated && currentUser) {
      console.log('Plan update detected from purchase redirect');
      
      // Force immediate UI update
      setPlanUpdated(prev => prev + 1);
      
      // Force refresh user data from server to ensure latest plan info
      const refreshUserData = async () => {
        try {
          await fetchUserData();
          console.log('User data refreshed after plan purchase');
        } catch (error) {
          console.error('Error refreshing user data after plan purchase:', error);
        }
      };
      
      refreshUserData();
      
      // Clear the state to prevent repeated refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state, currentUser, fetchUserData]);
  
  // Debug log for plan information - only log once when user data changes
  useEffect(() => {
    if (currentUser) {
      const userKey = JSON.stringify({
        currentPlan: currentUser.currentPlan,
        plan: currentUser.plan,
        remainingChecks: currentUser.remainingChecks
      });
      
      console.log('Debug - Current user plan information (once):', {
        originalUser: {
          currentPlan: currentUser.currentPlan,
          plan: currentUser.plan,
          remainingChecks: currentUser.remainingChecks,
          hasUnlimitedChecks: currentUser.hasUnlimitedChecks
        },
        mappedUser: {
          plan: user.plan,
          remainingChecks: user.remainingChecks,
          hasUnlimitedChecks: user.hasUnlimitedChecks
        }
      });
    }
  }, [currentUser?.currentPlan, currentUser?.plan, currentUser?.remainingChecks, user]);
  
  // Force re-render of child components when user plan changes
  useEffect(() => {
    // This will trigger when the currentUser or mapped user plan changes
    if (currentUser?.plan || currentUser?.currentPlan) {
      setPlanUpdated(prev => prev + 1);
    }
  }, [currentUser?.plan, currentUser?.currentPlan]);
  
  // Turn off global loading when dashboard mounts
  useEffect(() => {
    // Give a slight delay to ensure smooth transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [setLoading]);

  // Update the useEffect that handles the welcome animation
  useEffect(() => {
    if (location.state?.justLoggedIn) {
      // Show welcome animation
      setWelcomeAnimation(true);
      
      // Set a fixed timer to ensure animation shows for the full duration
      animationTimer.current = setTimeout(() => {
        // Only close the animation if data has been preloaded
        if (preloaded) {
          setWelcomeAnimation(false);
        } else {
          // If data is not yet preloaded, wait for it
          const checkInterval = setInterval(() => {
            if (preloaded) {
              setWelcomeAnimation(false);
              clearInterval(checkInterval);
            }
          }, 200);
          
          // Failsafe: close animation after 5 seconds max
          setTimeout(() => {
            clearInterval(checkInterval);
            setWelcomeAnimation(false);
          }, 5000);
        }
      }, 3500); // Fixed duration for animation
      
      // Clear the location state to prevent showing welcome again on refresh
      window.history.replaceState({}, document.title);
    }
    
    return () => {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
      }
    };
  }, [location, preloaded]);

  // Function to preload essential data
  const preloadDashboardData = useCallback(async () => {
    if (!currentUser || preloaded) return;
    
    console.log('Preloading dashboard data during animation...');
    try {
      // Fetch user data first (most important)
      const userData = await fetchUserData();
      
      // Validate user data to ensure it has essential properties
      const isUserDataValid = userData && 
                              (userData.name !== undefined || 
                               userData.email !== undefined || 
                               userData._id !== undefined);
      
      if (!isUserDataValid) {
        console.warn('User data incomplete, may need to retry fetch');
      }
      
      // Try to fetch payments in parallel
      try {
        const paymentResponse = await axios.get('/api/users/me/payments', {
          headers: { 'Cache-Control': 'max-age=300' }
        });
        setPayments(paymentResponse.data.payments || []);
      } catch (paymentError) {
        console.warn('Could not preload payments, will try later:', paymentError);
      }
      
      // Mark data as preloaded and fetched only if user data is valid
      if (isUserDataValid) {
        setPreloaded(true);
        setDataFetched(true);
        console.log('Dashboard data preloading complete!');
      } else {
        // Try once more to get valid user data
        setTimeout(async () => {
          try {
            const retryUserData = await fetchUserData();
            if (retryUserData) {
              setPreloaded(true);
              setDataFetched(true);
              console.log('Dashboard data preloading complete after retry!');
            } else {
              // Mark as preloaded anyway to not block UI indefinitely
              setPreloaded(true);
              console.warn('Proceeding with incomplete user data');
            }
          } catch (retryError) {
            console.error('Error during data retry:', retryError);
            setPreloaded(true); // Allow UI to proceed despite errors
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error during preloading:', error);
      // We'll still mark as preloaded so the animation can close
      setPreloaded(true);
    }
  }, [currentUser, preloaded, fetchUserData]);

  // Add a new useEffect to handle preloading during animation
  useEffect(() => {
    if (welcomeAnimation && currentUser && !preloaded) {
      preloadDashboardData();
    }
  }, [welcomeAnimation, currentUser, preloaded, preloadDashboardData]);

  // Fetch user data and payment history only once on mount
  useEffect(() => {
    if (!currentUser && !authLoading) {
      // If not logged in and not loading, redirect to login
      navigate('/');
    } else if (currentUser && !dataFetched) {
      // If logged in and data not yet fetched, fetch data
      fetchUserDataSafely();
      
      // Wait a bit before fetching payment history to avoid rate limiting
      const timer = setTimeout(() => {
        fetchPaymentHistory();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, authLoading, navigate, dataFetched, fetchUserDataSafely, fetchPaymentHistory]);
  
  // Clean up the request queue on unmount
  useEffect(() => {
    return () => {
      requestQueue.current = [];
      isProcessingQueue.current = false;
    };
  }, []);
  
  // Check for saved plan updates in localStorage
  useEffect(() => {
    try {
      const savedPlanUpdateStr = localStorage.getItem('dashboardPlanUpdate');
      if (savedPlanUpdateStr && currentUser) {
        const savedPlanUpdate = JSON.parse(savedPlanUpdateStr);
        
        // Only use saved updates that are less than 5 minutes old
        const fiveMinutes = 5 * 60 * 1000;
        if (Date.now() - savedPlanUpdate.timestamp < fiveMinutes) {
          console.log('Found saved plan update in localStorage, applying to UI');
          
          // Apply saved plan values to currentUser
          if (savedPlanUpdate.updatedUser) {
            Object.assign(currentUser, {
              plan: savedPlanUpdate.updatedUser.plan,
              currentPlan: savedPlanUpdate.updatedUser.currentPlan,
              remainingChecks: savedPlanUpdate.updatedUser.remainingChecks,
              hasUnlimitedChecks: savedPlanUpdate.updatedUser.hasUnlimitedChecks
            });
            
            // Force UI update
            setPlanUpdated(prev => prev + 1);
          }
        } else {
          // Clear outdated data
          localStorage.removeItem('dashboardPlanUpdate');
        }
      }
    } catch (e) {
      console.error('Error checking for saved plan updates:', e);
    }
  }, [currentUser]);
  
  // Listen for plan changes and update local UI if needed
  useEffect(() => {
    // Check for plan changes from the currentUser object
    if (currentUser && user) {
      // If there's a mismatch between mapped user and currentUser plan, force update
      if ((currentUser.plan && currentUser.plan !== user.plan) || 
          (currentUser.currentPlan && currentUser.currentPlan !== user.plan)) {
        console.log('Plan mismatch detected, forcing UI update');
        // Force a re-render of plan-dependent components
        setPlanUpdated(prev => prev + 1);
      }
    }
  }, [currentUser?.plan, currentUser?.currentPlan, user?.plan]);
  
  // ========== RENDER ==========
  
  // If auth is loading or user is not logged in yet, show loading spinner
  if (authLoading || !currentUser) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="animate-spin h-full w-full text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your dashboard...</h2>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Welcome animation with highest z-index */}
      <WelcomeAnimation 
        isVisible={welcomeAnimation} 
        onComplete={() => {
          // Only complete if data is preloaded
          if (preloaded) {
            setWelcomeAnimation(false);
          }
        }}
        userName={currentUser?.name}
        isGoogleLogin={location.state?.loginMethod === 'google'}
      />
      
      {/* Only render the dashboard when not showing welcome animation or preloaded */}
      {(!welcomeAnimation || preloaded) && (
        <motion.div 
          className="min-h-screen bg-gray-50"
          initial="initial"
          animate="in"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.4 }}
          style={{ 
            opacity: welcomeAnimation ? 0 : 1,
            pointerEvents: welcomeAnimation ? 'none' : 'auto'
          }}
        >
          {/* Error notification */}
          <AnimatePresence>
            {fetchError && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-0 left-0 right-0 bg-red-500 text-white py-3 text-center z-50"
              >
                {fetchError}
                <button 
                  onClick={handleRetryFetch}
                  className="ml-4 underline"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Navbar */}
          <nav className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">ResumeZen</span>
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="flex-1 mx-8 text-right">
                  <h2 className="text-xl text-gray-700">
                    Hey {user && user.name ? getFirstName(user.name) : 'User'} 👋
                  </h2>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    {user.initials}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                <ProfileCard 
                  key={`profile-card-${planUpdated}`}
                  user={user} 
                  onEdit={onEditProfile} 
                />
                <PlanSection 
                  key={`plan-section-${planUpdated}`}
                  plans={dummyData.plans} 
                  onPurchase={onPurchasePlan} 
                  currentPlan={user.plan}
                  planEndDate={user.planEndDate}
                  remainingChecks={user.remainingChecks}
                  hasUnlimitedChecks={user.hasUnlimitedChecks}
                />
                <HelpSection onEmail={onEmail} onLiveChat={onLiveChat} onFAQ={onFAQ} onSchedule={onSchedule} />
              </div>

              {/* Center Column */}
              <div className="lg:col-span-2 space-y-8">
                <UploadBox 
                  key={state.uploadComponent}
                  onFileSelect={onFileSelect} 
                  onConfirm={onUploadConfirm} 
                  selectedFile={state.selectedFile} 
                />
                <ResumeHistory resumes={state.resumes} onViewFeedback={onViewFeedback} />
                <VlogList vlogs={dummyData.vlogs} onSelect={onVlogSelect} />
              </div>
            </div>
          </main>

          {/* Render all modals */}
          <ModalRenderer 
            {...state} 
            user={currentUser}
            clearUploadArea={() => clearUploadArea(state.setSelectedFile, state.setUploadComponent)}
          />
        </motion.div>
      )}
    </>
  );
} 