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
  const { 
    currentUser, 
    loading: authLoading, 
    logout, 
    fetchResumeHistory, 
    fetchPurchaseHistory, 
    purchasePlan, 
    fetchUserData,
    uploadResume,
    updateResumeScore,
    fetchAllUserData
  } = useAuth();
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
  
  // Add this state for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Add a handler to close mobile menu when clicked outside
  const mobileMenuRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuRef]);
  
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

    // Build plan information from activePurchase data
    let hasUnlimitedChecks = false;
    let remainingChecks = 0;
    let planName = 'No Plan';
    let planType = null;
    let planEndDate = null;

    if (userData.activePurchase) {
      if (userData.activePurchase.type === 'duration') {
        hasUnlimitedChecks = true;
        planName = userData.activePurchase.planName || 'Unlimited';
        planType = 'duration';
        planEndDate = userData.activePurchase.expiresAt;
      } else if (userData.activePurchase.type === 'count') {
        remainingChecks = userData.activePurchase.checksRemaining || 0;
        planName = userData.activePurchase.planName || `${remainingChecks} Checks`;
        planType = 'count';
      }
    }
    
    return {
      ...userData,
      plan: planName,
      planType: planType,
      remainingChecks: remainingChecks,
      hasUnlimitedChecks: hasUnlimitedChecks,
      planEndDate: planEndDate ? new Date(planEndDate) : null,
      planExpiresAt: userData.planExpiresAt ? new Date(userData.planExpiresAt) : null,
      initials: initials,
      isSubscriptionActive: userData.isSubscriptionActive || false
    };
  };
  
  // Create a mapped version of the currentUser with consistent property names
  const user = mapUserData(currentUser) || {
    name: 'Guest User',
    email: 'Not logged in',
    phone: '',
    plan: 'no_plan',
    planType: null,
    initials: 'GU',
    remainingChecks: 0,
    hasUnlimitedChecks: false,
    planEndDate: null,
    isSubscriptionActive: false
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
      // Increase minimum delay between requests to avoid rate limiting
      if (timeSinceLastRequest < 2000) {
        // Wait longer before processing the next request
        await new Promise(resolve => setTimeout(resolve, 2000 - timeSinceLastRequest));
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
        
        // Implement stronger exponential backoff for retries
        const baseDelay = 5000; // Start with 5 seconds
        const maxDelay = 60000; // Cap at 60 seconds
        const delayMs = Math.min(baseDelay * Math.pow(2, retryCount.current - 1), maxDelay);
        
        console.log(`Backing off for ${delayMs/1000} seconds before retry`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        // Move this request to the end of the queue if we've retried too many times
        if (retryCount.current > 3) {
          const failedRequest = requestQueue.current.shift();
          requestQueue.current.push(failedRequest);
          retryCount.current = 0;
          console.log('Moving request to end of queue after multiple retries');
        }
      } else {
        // For other errors, remove the request from the queue
        requestQueue.current.shift();
        retryCount.current = 0;
      }
    } finally {
      isProcessingQueue.current = false;
      
      // Continue processing queue if items remain but add a delay
      if (requestQueue.current.length > 0) {
        // Add a small delay between processing items
        setTimeout(() => {
          processQueue();
        }, 500);
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
          // Use the batch fetching function instead of individual API calls
          const result = await fetchAllUserData(false);
          
          // Update state with the returned data
          if (result.purchaseHistory) {
            setPayments(result.purchaseHistory || []);
          }
          
          if (result.resumeHistory) {
            state.setResumes(result.resumeHistory || []);
          }
          
          // Mark as fetched to prevent duplicate requests
          setDataFetched(true);
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
        console.log('Rate limited, will retry with exponential backoff');
      } else {
        setFetchError('Failed to fetch user data. Please try refreshing the page.');
      }
    }
  }, [currentUser, fetchAllUserData, dataFetched, queueRequest, state.setResumes]);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async () => {
    if (loadingPayments || !currentUser || dataFetched) return;
    
    try {
      setLoadingPayments(true);
      
      queueRequest(async () => {
        const purchases = await fetchPurchaseHistory();
        setPayments(purchases || []);
        setDataFetched(true);
        setLoadingPayments(false);
      });
    } catch (error) {
      console.error('Error queueing payment history fetch:', error);
      setLoadingPayments(false);
    }
  }, [currentUser, loadingPayments, dataFetched, queueRequest, fetchPurchaseHistory]);
  
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
  const onUploadConfirm = async () => {
    try {
      // Check if a file is selected
      if (!state.uploadFile) {
        state.setUploadError('Please select a file first');
        return;
      }

      // Show loading state
      state.setUploadInProgress(true);
      state.setUploadError(null);

      // Simulate file upload to storage
      // In a real app, you would upload to Firebase Storage, S3, etc.
      const fileURL = `https://storage.example.com/uploads/${Date.now()}_${state.uploadFile.name}`;

      // Create resume entry with file URL
      const uploadResult = await uploadResume({
        fileURL,
        fileName: state.uploadFile.name,
        fileSize: state.uploadFile.size,
        jobTitle: state.jobTitle || 'Not specified',
        industry: state.industry || 'Not specified'
      });

      if (uploadResult.success) {
        console.log('Resume uploaded successfully!', uploadResult);
        
        // Update UI with success message
        state.setUploadSuccess(true);
        state.setUploadMessage('Resume uploaded successfully! ATS processing started...');
        
        // Simulate ATS scoring (this would be done by backend in real app)
        setTimeout(async () => {
          const score = Math.floor(Math.random() * 100) + 1; // Random score for demo
          
          // Update the resume with the ATS score
          await updateResumeScore(uploadResult.resume._id, score);
          
          // Update UI to show score
          state.setAtsScore(score);
          state.setProcessingComplete(true);
          
          // Update remaining checks in UI if needed
          if (typeof uploadResult.remainingChecks === 'number') {
            state.setRemainingChecks(uploadResult.remainingChecks);
          }
          
          // Refresh user data
          await fetchUserData();
        }, 3000);
        
        // Clear the upload form
        clearUploadArea(state);
      } else {
        console.error('Resume upload failed:', uploadResult.error);
        state.setUploadError(uploadResult.error || 'Upload failed. Please try again.');
        
        // Check if we need to prompt for purchase
        if (uploadResult.needsPurchase) {
          state.setPurchaseRequired(true);
        }
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      state.setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      state.setUploadInProgress(false);
    }
  };
  const onViewFeedback = resume => handleViewFeedback(resume, state.setSelectedResume, state.setShowFeedback);
  const onVlogSelect = vlog => state.setSelectedVlog(vlog);
  const onEmail = () => window.location = 'mailto:support@resumezen.com';
  const onLiveChat = () => state.setShowLiveChat(true);
  const onFAQ = () => state.setShowFAQ(true);
  const onSchedule = () => state.setShowSchedule(true);
  
  // Plan purchase handler
  const onPurchasePlan = async (plan) => {
    try {
      console.log('Purchasing plan:', plan);
      
      // Validate plan data before sending
      if (!plan) {
        console.error('Invalid plan data: Plan object is null or undefined');
        return { 
          success: false, 
          error: 'Invalid plan data. Please try again or select a different plan.' 
        };
      }
      
      // Extract the plan ID, ensuring we get a valid MongoDB ObjectId string
      let planId = null;
      
      // Check various possible properties where the ID might be stored
      if (plan._id) {
        planId = typeof plan._id === 'string' ? plan._id : plan._id.toString();
      } else if (plan.id) {
        planId = typeof plan.id === 'string' ? plan.id : plan.id.toString();
      } else if (plan.planId) {
        planId = typeof plan.planId === 'string' ? plan.planId : plan.planId.toString();
      }
      
      if (!planId) {
        console.error('Cannot extract a valid plan ID:', plan);
        return { 
          success: false, 
          error: 'Missing plan ID. Please select a valid plan.' 
        };
      }
      
      // Map the plan data to match what backend expects
      const planForPurchase = {
        planId: planId,
        name: plan.name || plan.title,
        type: plan.type || (plan.title === "Unlimited Pack" ? 'duration' : 'count'),
        value: plan.value || plan.checks || (plan.title === "Unlimited Pack" ? 90 : 1), // 90 days for unlimited plan
        price: typeof plan.price === 'string' ? plan.price.replace(/[^\d.]/g, "") : plan.price, // Remove currency symbol and other non-numeric characters
        paymentMethod: 'credit_card',
        paymentDetails: {
          cardholderName: 'Test User',
          paymentIntent: 'Success'
        }
      };

      console.log('Sending purchase request with data:', planForPurchase);

      // Purchase the plan using AuthContext function
      const result = await purchasePlan(planForPurchase);

      if (result && result.success) {
        console.log('Plan purchased successfully!', result);
        
        // Update the derived plan information based on plan type and response data
        if (result.user) {
          // Use values from the response if available
          if (result.user.hasUnlimitedChecks) {
            state.setIsPlanUnlimited(true);
          } else if (typeof result.user.remainingChecks === 'number') {
            state.setRemainingChecks(result.user.remainingChecks);
          } else {
            // Fallback to plan data if response doesn't have the derived fields
            if (plan.type === 'duration' || plan.title === 'Unlimited Pack') {
              state.setIsPlanUnlimited(true);
            } else if (plan.type === 'count' || plan.checks) {
              const checkCount = plan.value || plan.checks || 1;
              state.setRemainingChecks(checkCount);
            }
          }
        }
        
        // Force refresh user data to get the latest plan info
        try {
          await fetchUserData(true); // Force refresh to ensure we have the latest data
          console.log('User data refreshed after successful purchase');
        } catch (refreshError) {
          console.error('Error refreshing user data after purchase:', refreshError);
          // Continue anyway since the purchase was successful
        }
        
        // Return success to the calling component
        return { success: true, user: result.user };
      } else {
        console.error('Plan purchase failed:', result.error);
        // Return error to the calling component
        return { success: false, error: result.error || 'Failed to purchase plan. Please try again.' };
      }
    } catch (error) {
      console.error('Error purchasing plan:', error);
      // Return error to the calling component
      return { 
        success: false, 
        error: error.message || error.response?.data?.error || 'Failed to purchase plan. Please try again.' 
      };
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
        const paymentResponse = await axios.get('/api/users/me/purchases', {
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

  // Fetch resumes and payment history after user data
  useEffect(() => {
    if (currentUser && !dataFetched) {
      // Fetch all user data in a single batch operation
      fetchUserDataSafely();
      
      // No need for separate fetch operations since fetchAllUserData handles everything
      return () => {
        // Cleanup for any pending operations
      };
    }
  }, [currentUser, dataFetched, fetchUserDataSafely]);
  
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
  
  // Initialize resumes data
  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        // Fetch resume history
        const resumes = await fetchResumeHistory();
        if (resumes && resumes.length > 0) {
          state.setResumes(resumes);
        }
      } catch (error) {
        console.error('Failed to fetch resume data:', error);
      }
    };
    
    if (currentUser) {
      fetchResumeData();
    }
  }, [currentUser, fetchResumeHistory, state.setResumes]);
  
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
                <div className="hidden md:block flex-1 mx-8 text-right">
                  <h2 className="text-xl text-gray-700">
                    Hey {user && user.name ? getFirstName(user.name) : 'User'} 👋
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={logout}
                    className="hidden md:flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition-colors px-3 py-1 rounded-md hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                  
                  {/* Mobile user greeting */}
                  <span className="md:hidden text-sm text-gray-600 mr-1">
                    Hi, {user && user.name ? getFirstName(user.name) : 'User'}
                  </span>
                  
                  <div className="relative" ref={mobileMenuRef}>
                    <div 
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                      {user.initials}
                    </div>
                    
                    {/* Mobile menu dropdown */}
                    {mobileMenuOpen && (
                      <div className="md:hidden absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                          {user.name || 'User Profile'}
                        </div>
                        <div className="px-4 py-2 text-xs text-gray-500">
                          {user.email}
                        </div>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Made responsive with proper stacking on mobile */}
              <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
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

              {/* Center Column - Made responsive to take full width on mobile */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8 order-1 lg:order-2">
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