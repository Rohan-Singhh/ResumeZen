import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Create a simple in-memory cache
const apiCache = {
  userData: null,
  purchaseHistory: null,
  resumeHistory: null,
  lastFetch: {
    userData: 0,
    purchaseHistory: 0,
    resumeHistory: 0
  },
  cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
  requestInProgress: {
    userData: false,
    purchaseHistory: false,
    resumeHistory: false
  }
};

// Track pending request promises to avoid duplicate requests
const pendingRequests = {};

// Configure axios interceptors for all requests
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      console.warn('Rate limit detected, using exponential backoff...');
      
      // Extract the retry-after header if available or use exponential backoff
      const retryAfter = error.response.headers['retry-after'] || 5;
      const delayMs = parseInt(retryAfter, 10) * 1000 || 5000;
      
      const requestId = error.config.url + (error.config.params ? JSON.stringify(error.config.params) : '');
      console.log(`Will retry ${requestId} after ${delayMs/1000} seconds`);
      
      // For rate limiting errors, we can retry after a delay with exponential backoff
      return new Promise(resolve => {
        setTimeout(() => {
          console.log(`Retrying request to ${error.config.url}`);
          resolve(axios(error.config));
        }, delayMs);
      });
    }
    
    return Promise.reject(error);
  }
);

// Utility function to handle API requests with caching and deduplication
const cachedApiRequest = async (key, apiCall, forceRefresh = false) => {
  const now = Date.now();
  
  // If another request for this data is already in progress, wait for it
  if (pendingRequests[key]) {
    console.log(`Request for ${key} already in progress, waiting for result...`);
    return pendingRequests[key];
  }
  
  // Use cache if valid and not forcing refresh
  if (!forceRefresh && 
      apiCache[key] && 
      (now - apiCache.lastFetch[key]) < apiCache.cacheDuration) {
    console.log(`Using cached ${key} data`);
    return apiCache[key];
  }
  
  try {
    // Mark this type of request as in progress
    apiCache.requestInProgress[key] = true;
    
    // Create a promise for this request that will be shared with other callers
    pendingRequests[key] = apiCall();
    
    // Wait for the request to complete
    const data = await pendingRequests[key];
    
    // Update cache
    apiCache[key] = data;
    apiCache.lastFetch[key] = now;
    
    return data;
  } finally {
    // Clean up request tracking
    apiCache.requestInProgress[key] = false;
    delete pendingRequests[key];
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStatusChecked, setAuthStatusChecked] = useState(false);

  // Set up default headers for all axios requests
  useEffect(() => {
    // Add cache control header to all requests
    axios.defaults.headers.common['Cache-Control'] = 'max-age=300';
  }, []);

  // Check if the user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Configure axios to use the token
          axios.defaults.headers.common['x-auth-token'] = token;
          
          // Fetch user data
          const response = await axios.get('/api/users/me');
          setCurrentUser(response.data.user);
          
          // Update cache
          apiCache.userData = response.data.user;
          apiCache.lastFetch.userData = Date.now();
        } catch (err) {
          console.error('Error restoring auth state:', err);
          // Clear invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
        }
      }
      
      setLoading(false);
      setAuthStatusChecked(true);
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Use an internal function to check for plan updates
    const checkPlanUpdates = () => {
      try {
        const lastPlanUpdateString = localStorage.getItem('lastPlanUpdate');
        if (lastPlanUpdateString) {
          const lastPlanUpdate = JSON.parse(lastPlanUpdateString);
          // Only use cached updates that are less than 5 minutes old
          const fiveMinutes = 5 * 60 * 1000;
          if (Date.now() - lastPlanUpdate.timestamp < fiveMinutes) {
            console.log('Found recent plan update in cache, applying...');
            // The currentUser might not be loaded yet, so we'll set it in the authStatusChecked effect below
          } else {
            // Clear old cache data
            localStorage.removeItem('lastPlanUpdate');
          }
        }
      } catch (e) {
        console.error('Error checking for cached plan updates:', e);
      }
    };
    
    // Call the function directly
    checkPlanUpdates();
  }, []);
  
  // Apply cached plan update once auth status is checked and user is loaded
  useEffect(() => {
    if (authStatusChecked && currentUser) {
      try {
        const lastPlanUpdateString = localStorage.getItem('lastPlanUpdate');
        if (lastPlanUpdateString) {
          const lastPlanUpdate = JSON.parse(lastPlanUpdateString);
          const fiveMinutes = 5 * 60 * 1000;
          if (Date.now() - lastPlanUpdate.timestamp < fiveMinutes && lastPlanUpdate.updatedUser) {
            console.log('Applying cached plan update to current user');
            setCurrentUser({
              ...currentUser,
              currentPlan: lastPlanUpdate.updatedUser.currentPlan,
              planExpiresAt: lastPlanUpdate.updatedUser.planExpiresAt
            });
          }
        }
      } catch (e) {
        console.error('Error applying cached plan update:', e);
      }
    }
  }, [authStatusChecked, currentUser]);

  // Function to handle login
  const login = async (userData, token) => {
    try {
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Configure axios to use the token for all future requests
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Set the user data
      setCurrentUser(userData);
      
      // Update cache
      apiCache.userData = userData;
      apiCache.lastFetch.userData = Date.now();
      
      setError(null);
      
      return true;
    } catch (err) {
      setError('Login failed: ' + err.message);
      return false;
    }
  };

  // Function to handle logout
  const logout = () => {
    // Set a flag in sessionStorage to detect logout in progress
    sessionStorage.setItem('logoutInProgress', 'true');
    
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('lastPlanUpdate');
    localStorage.removeItem('dashboardPlanUpdate');
    
    // Clear any file-related data
    try {
      // Clear any file input elements
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        if (input) input.value = '';
      });
      
      // Clear any file previews
      const previewElements = document.querySelectorAll('.file-preview, [data-file-preview]');
      previewElements.forEach(el => {
        if (el && el.parentNode) {
          el.style.display = 'none';
        }
      });
      
      // Force hide any loading/overlay elements
      const loadingElements = document.querySelectorAll('.loading-element, .overlay, #loading-overlay');
      loadingElements.forEach(el => {
        if (el) el.style.display = 'none';
      });
    } catch (e) {
      console.error('Error cleaning up UI elements during logout:', e);
    }
    
    // Clear auth headers
    delete axios.defaults.headers.common['x-auth-token'];
    
    // Reset state
    setCurrentUser(null);
    
    // Clear cache
    apiCache.userData = null;
    apiCache.purchaseHistory = null;
    apiCache.resumeHistory = null;
    apiCache.lastFetch.userData = 0;
    apiCache.lastFetch.purchaseHistory = 0;
    apiCache.lastFetch.resumeHistory = 0;
    
    // Clear the logout flag after a longer delay to ensure cleanup is complete
    setTimeout(() => {
      sessionStorage.removeItem('logoutInProgress');
    }, 2000);
  };

  // Function to fetch user data with caching
  const fetchUserData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      const userData = await cachedApiRequest('userData', async () => {
        // No valid cache, fetch from server
        const response = await axios.get('/api/users/me', {
          headers: {
            'Cache-Control': 'max-age=300'
          }
        });
        
        return response.data.user;
      }, forceRefresh);
      
      setCurrentUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      // Don't set error for rate limiting
      if (err.response && err.response.status !== 429) {
        setError('Failed to fetch user data: ' + err.message);
      }
      setLoading(false);
      return apiCache.userData || null; // Return cached data if available
    }
  };

  // Function to update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/users/me', profileData);
      
      // Update local state and cache with new user data
      const updatedUser = { ...currentUser, ...response.data.user };
      setCurrentUser(updatedUser);
      apiCache.userData = updatedUser;
      apiCache.lastFetch.userData = Date.now();
      
      return { success: true, user: updatedUser };
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  // Function to fetch purchase history
  const fetchPurchaseHistory = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      const purchases = await cachedApiRequest('purchaseHistory', async () => {
        // No valid cache, fetch from server
        const response = await axios.get('/api/users/me/purchases');
        return response.data.purchases;
      }, forceRefresh);
      
      setLoading(false);
      return purchases;
    } catch (err) {
      setError('Failed to fetch purchase history: ' + err.message);
      setLoading(false);
      return apiCache.purchaseHistory || []; // Return cached data if available
    }
  };

  // Function to fetch resume history
  const fetchResumeHistory = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      const resumes = await cachedApiRequest('resumeHistory', async () => {
        // No valid cache, fetch from server
        const response = await axios.get('/api/users/me/resumes');
        return response.data.resumes;
      }, forceRefresh);
      
      setLoading(false);
      return resumes;
    } catch (err) {
      setError('Failed to fetch resume history: ' + err.message);
      setLoading(false);
      return apiCache.resumeHistory || []; // Return cached data if available
    }
  };

  // Function to purchase a plan
  const purchasePlan = async (planDetails) => {
    try {
      console.log('AuthContext: Processing plan purchase with details:', planDetails);
      
      // Validate planId - it must be present for the API request
      if (!planDetails || !planDetails.planId) {
        console.error('Missing planId in purchase request:', planDetails);
        return { 
          success: false, 
          error: 'Missing plan ID. Please select a valid plan.' 
        };
      }
      
      // Ensure planId is a string
      const planId = typeof planDetails.planId === 'string' 
        ? planDetails.planId 
        : String(planDetails.planId);
      
      // We'll skip MongoDB ObjectId validation now since we're using custom IDs
      // Just ensure the planId is not empty
      if (!planId.trim()) {
        console.error('Empty planId in purchase request:', planId);
        return {
          success: false,
          error: 'Invalid plan ID. Please select a valid plan.'
        };
      }
      
      // Prepare the purchase request
      const purchaseData = {
        planId: planId,
        paymentMethod: planDetails.paymentMethod || 'credit_card',
        paymentDetails: planDetails.paymentDetails || {
          cardholderName: 'Test User',
          paymentIntent: 'Success'
        }
      };
      
      console.log('Sending purchase request with data:', purchaseData);
      
      // Create a purchase
      const response = await axios.post('/api/purchases', purchaseData);
      
      // Check for success flag in response
      if (!response.data || !response.data.success) {
        console.error('Purchase API returned non-success response:', response.data);
        return {
          success: false,
          error: response.data?.error || 'Purchase failed with unknown error'
        };
      }
      
      // Update user data with new plan information
      if (response.data.user) {
        // Use a clone to avoid mutation issues
        const updatedUser = { ...response.data.user };
        setCurrentUser(updatedUser);
        
        // Update cache
        apiCache.userData = updatedUser;
        apiCache.lastFetch.userData = Date.now();
        
        // Store the plan update in localStorage for future references
        const planUpdate = {
          timestamp: Date.now(),
          updatedUser: updatedUser
        };
        localStorage.setItem('lastPlanUpdate', JSON.stringify(planUpdate));
        
        console.log('User data updated after purchase:', updatedUser);
      }
      
      return {
        success: true, 
        user: response.data.user,
        purchase: response.data.purchase
      };
    } catch (err) {
      console.error('Plan purchase failed:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to purchase plan';
      
      if (err.response) {
        // Server returned an error response
        if (err.response.status === 400) {
          errorMessage = err.response.data.error || 'Invalid purchase data';
          if (err.response.data.details) {
            // Add the details to the error message if available
            errorMessage += ': ' + (typeof err.response.data.details === 'string' 
              ? err.response.data.details 
              : JSON.stringify(err.response.data.details));
          }
        } else if (err.response.status === 404) {
          errorMessage = 'Plan not found. Please select a different plan.';
        } else if (err.response.status === 500) {
          errorMessage = err.response.data.error || 'Server error during purchase';
        } else {
          errorMessage = err.response.data.error || `Error (${err.response.status})`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError('Failed to purchase plan: ' + errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  // Function to upload a resume
  const uploadResume = async (fileData) => {
    try {
      // Create a resume entry with the file URL
      const response = await axios.post('/api/resumes', fileData);
      
      return {
        success: true,
        resume: response.data.resume,
        remainingChecks: response.data.purchaseRemaining
      };
    } catch (err) {
      console.error('Resume upload failed:', err);
      setError('Failed to upload resume: ' + err.message);
      return {
        success: false,
        error: err.response?.data?.error || err.message,
        needsPurchase: err.response?.data?.needsPurchase || false
      };
    }
  };

  // Function to update ATS score for a resume
  const updateResumeScore = async (resumeId, atsScore) => {
    try {
      const response = await axios.patch(`/api/resumes/${resumeId}/score`, { atsScore });
      
      return {
        success: true,
        resume: response.data.resume
      };
    } catch (err) {
      console.error('ATS score update failed:', err);
      setError('Failed to update ATS score: ' + err.message);
      return {
        success: false,
        error: err.response?.data?.error || err.message
      };
    }
  };

  // Function to fetch all user data in a single batch operation
  const fetchAllUserData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Check if we need to fetch at all
      const now = Date.now();
      if (!forceRefresh) {
        const isUserDataValid = apiCache.userData && (now - apiCache.lastFetch.userData < apiCache.cacheDuration);
        const isPurchaseDataValid = apiCache.purchaseHistory && (now - apiCache.lastFetch.purchaseHistory < apiCache.cacheDuration);
        const isResumeDataValid = apiCache.resumeHistory && (now - apiCache.lastFetch.resumeHistory < apiCache.cacheDuration);
        
        if (isUserDataValid && isPurchaseDataValid && isResumeDataValid) {
          console.log('Using cached data for all user information');
          setCurrentUser(apiCache.userData);
          setLoading(false);
          return {
            userData: apiCache.userData,
            purchaseHistory: apiCache.purchaseHistory,
            resumeHistory: apiCache.resumeHistory
          };
        }
      }
      
      // Fetch only what we need using Promise.all to batch requests
      const requests = [];
      const requestTypes = [];
      
      if (forceRefresh || !apiCache.userData || (now - apiCache.lastFetch.userData > apiCache.cacheDuration)) {
        requests.push(axios.get('/api/users/me'));
        requestTypes.push('userData');
      }
      
      if (forceRefresh || !apiCache.purchaseHistory || (now - apiCache.lastFetch.purchaseHistory > apiCache.cacheDuration)) {
        requests.push(axios.get('/api/users/me/purchases'));
        requestTypes.push('purchaseHistory');
      }
      
      if (forceRefresh || !apiCache.resumeHistory || (now - apiCache.lastFetch.resumeHistory > apiCache.cacheDuration)) {
        requests.push(axios.get('/api/users/me/resumes'));
        requestTypes.push('resumeHistory');
      }
      
      if (requests.length === 0) {
        // Nothing to fetch
        setLoading(false);
        return {
          userData: apiCache.userData,
          purchaseHistory: apiCache.purchaseHistory,
          resumeHistory: apiCache.resumeHistory
        };
      }
      
      // Fetch data in parallel
      const responses = await Promise.all(requests);
      
      // Process responses
      const result = {
        userData: apiCache.userData,
        purchaseHistory: apiCache.purchaseHistory,
        resumeHistory: apiCache.resumeHistory
      };
      
      // Update cache and result with new data
      responses.forEach((response, index) => {
        const type = requestTypes[index];
        if (type === 'userData') {
          result.userData = response.data.user;
          apiCache.userData = response.data.user;
          apiCache.lastFetch.userData = now;
          setCurrentUser(response.data.user);
        } else if (type === 'purchaseHistory') {
          result.purchaseHistory = response.data.purchases;
          apiCache.purchaseHistory = response.data.purchases;
          apiCache.lastFetch.purchaseHistory = now;
        } else if (type === 'resumeHistory') {
          result.resumeHistory = response.data.resumes;
          apiCache.resumeHistory = response.data.resumes;
          apiCache.lastFetch.resumeHistory = now;
        }
      });
      
      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error fetching user data batch:', err);
      
      // Don't set error for rate limiting
      if (err.response && err.response.status !== 429) {
        setError('Failed to fetch user data: ' + err.message);
      }
      
      setLoading(false);
      
      // Return what we have in cache
      return {
        userData: apiCache.userData,
        purchaseHistory: apiCache.purchaseHistory,
        resumeHistory: apiCache.resumeHistory
      };
    }
  };

  // Value object for the context provider
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    fetchUserData,
    updateProfile,
    fetchPurchaseHistory,
    fetchResumeHistory,
    purchasePlan,
    uploadResume,
    updateResumeScore,
    fetchAllUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 