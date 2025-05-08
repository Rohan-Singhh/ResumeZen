import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Create a simple in-memory cache
const apiCache = {
  userData: null,
  paymentHistory: null,
  lastFetch: {
    userData: 0,
    paymentHistory: 0
  },
  cacheDuration: 5 * 60 * 1000 // 5 minutes in milliseconds
};

// Configure axios interceptors for all requests
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      console.warn('Rate limit detected, retrying in 5 seconds...');
      
      // For rate limiting errors, we can retry after a delay
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(axios(error.config));
        }, 5000);
      });
    }
    
    return Promise.reject(error);
  }
);

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
              plan: lastPlanUpdate.updatedUser.plan,
              currentPlan: lastPlanUpdate.updatedUser.currentPlan,
              remainingChecks: lastPlanUpdate.updatedUser.remainingChecks,
              hasUnlimitedChecks: lastPlanUpdate.updatedUser.hasUnlimitedChecks
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
    
    // Clear auth headers
    delete axios.defaults.headers.common['x-auth-token'];
    
    // Reset state
    setCurrentUser(null);
    
    // Clear cache
    apiCache.userData = null;
    apiCache.paymentHistory = null;
    apiCache.lastFetch.userData = 0;
    apiCache.lastFetch.paymentHistory = 0;
    
    // Clear the logout flag after a short delay
    setTimeout(() => {
      sessionStorage.removeItem('logoutInProgress');
    }, 1000);
  };

  // Function to fetch user data with caching
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Check if we have a valid cached version
      const now = Date.now();
      if (apiCache.userData && (now - apiCache.lastFetch.userData) < apiCache.cacheDuration) {
        console.log('Using cached user data');
        setCurrentUser(apiCache.userData);
        setLoading(false);
        return apiCache.userData;
      }
      
      // No valid cache, fetch from server
      const response = await axios.get('/api/users/me', {
        headers: {
          'Cache-Control': 'max-age=300'
        }
      });
      
      setCurrentUser(response.data.user);
      
      // Update cache
      apiCache.userData = response.data.user;
      apiCache.lastFetch.userData = now;
      
      setLoading(false);
      return response.data.user;
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
      setLoading(true);
      const response = await axios.put('/api/users/me', profileData);
      
      // Update current user and cache
      const updatedUser = {...currentUser, ...response.data.user};
      setCurrentUser(updatedUser);
      apiCache.userData = updatedUser;
      apiCache.lastFetch.userData = Date.now();
      
      setLoading(false);
      return true;
    } catch (err) {
      // Don't set error for rate limiting
      if (err.response && err.response.status !== 429) {
        setError('Profile update failed: ' + err.message);
      }
      setLoading(false);
      return false;
    }
  };

  // Function to fetch payment history with caching
  const fetchPaymentHistory = async () => {
    try {
      // Check if we have a valid cached version
      const now = Date.now();
      if (apiCache.paymentHistory && (now - apiCache.lastFetch.paymentHistory) < apiCache.cacheDuration) {
        console.log('Using cached payment history');
        return apiCache.paymentHistory;
      }
      
      const response = await axios.get('/api/users/me/payments', {
        headers: {
          'Cache-Control': 'max-age=300'
        }
      });
      
      // Update cache
      apiCache.paymentHistory = response.data.payments || [];
      apiCache.lastFetch.paymentHistory = now;
      
      return response.data.payments || [];
    } catch (err) {
      // Don't set error for rate limiting
      if (err.response && err.response.status !== 429) {
        setError('Failed to fetch payment history: ' + err.message);
      }
      return apiCache.paymentHistory || [];
    }
  };

  // Function to purchase a plan
  const purchasePlan = async (planDetails) => {
    try {
      setLoading(true);
      
      // Log the request for debugging
      console.log('Sending plan purchase request:', planDetails);
      
      // Check if the API endpoint is configured
      if (!axios.defaults.baseURL && !window.location.hostname.includes('localhost')) {
        console.log('Setting base URL for API requests');
        axios.defaults.baseURL = '/api';
      }
      
      // Make sure auth token is set
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
      }
      
      // Ensure the API endpoint is correctly configured (handle both /api/payments and /payments)
      let response;
      try {
        // First try with /api/payments
        response = await axios.post('/api/payments', planDetails);
      } catch (error) {
        // If that fails with 404, try with /payments
        if (error.response && error.response.status === 404) {
          console.log('Retrying with different API path');
          response = await axios.post('/payments', planDetails);
        } else {
          // For other errors, rethrow
          throw error;
        }
      }
      
      console.log('Plan purchase response:', response.data);
      
      // Clear all caches to ensure fresh data
      apiCache.userData = null;
      apiCache.paymentHistory = null;
      apiCache.lastFetch.userData = 0;
      apiCache.lastFetch.paymentHistory = 0;
      
      // Create a backup of the current user for persistent updates
      const updatedUserData = response.data.user || currentUser;
      
      // Apply immediate plan update for direct UI feedback
      const immediateUpdate = {
        ...updatedUserData,
        plan: planDetails.planName,
        currentPlan: planDetails.planName,
        remainingChecks: planDetails.paymentDetails.checks === 'unlimited' ? 
          999 : 
          (currentUser?.remainingChecks || 0) + (parseInt(planDetails.paymentDetails.checks) || 0),
        hasUnlimitedChecks: planDetails.paymentDetails.checks === 'unlimited'
      };
      
      // Save this updated user data to localStorage as a backup
      try {
        localStorage.setItem('lastPlanUpdate', JSON.stringify({
          timestamp: Date.now(),
          planDetails: planDetails,
          updatedUser: immediateUpdate
        }));
      } catch (e) {
        console.error('Could not save plan update to localStorage:', e);
      }
      
      // Update user data with new subscription details from the response
      if (response.data.user) {
        // Update currentUser immediately with the new data from the response
        setCurrentUser(immediateUpdate);
        
        // Also fetch fresh data to ensure everything is up to date
        try {
          const updatedUser = await fetchUserData();
          console.log('Updated user after purchase:', updatedUser);
        } catch (fetchError) {
          console.error('Error fetching updated user data:', fetchError);
          // Continue with the response data we already have
        }
      } else {
        // If response doesn't contain user data, use our constructed update
        setCurrentUser(immediateUpdate);
        
        // Also try to refresh data from backend
        try {
          await fetchUserData();
        } catch (fetchError) {
          console.error('Error fetching user data after purchase:', fetchError);
          // Continue anyway with our constructed update
        }
      }
      
      setLoading(false);
      return { ...response.data, user: immediateUpdate };
    } catch (err) {
      console.error('Plan purchase error:', err);
      // Log detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      }
      
      // Don't set error for rate limiting
      if (err.response && err.response.status !== 429) {
        setError(`Plan purchase failed: ${err.message || 'Unknown error'}`);
      }
      setLoading(false);
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    fetchUserData,
    updateProfile,
    fetchPaymentHistory,
    purchasePlan
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 