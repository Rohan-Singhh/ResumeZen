import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Create a simple in-memory cache
const apiCache = {
  userData: null,
  lastFetch: {
    userData: 0
  },
  cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
  requestInProgress: {
    userData: false
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
  const [userPlans, setUserPlans] = useState([]);
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
          const response = await axios.get('/api/profile');
          setCurrentUser(response.data.user);
          
          // Fetch user plans
          fetchUserPlans();
          
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

  // Function to handle login
  const login = async (userData, token) => {
    try {
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Configure axios to use the token for all future requests
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Set the user data
      setCurrentUser(userData);
      
      // Fetch user plans
      fetchUserPlans();
      
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
    
    // Force hide any loading/overlay elements
    const loadingElements = document.querySelectorAll('.loading-element, .overlay, #loading-overlay');
    loadingElements.forEach(el => {
      if (el) el.style.display = 'none';
    });
    
    // Clear auth headers
    delete axios.defaults.headers.common['x-auth-token'];
    
    // Reset state
    setCurrentUser(null);
    setUserPlans([]);
    
    // Clear cache
    apiCache.userData = null;
    apiCache.lastFetch.userData = 0;
    
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
        const response = await axios.get('/api/profile', {
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

  // Function to fetch user plans
  const fetchUserPlans = async (forceRefresh = false) => {
    try {
      const plans = await cachedApiRequest('userPlans', async () => {
        const response = await axios.get('/api/plans/user');
        return response.data.userPlans;
      }, forceRefresh);
      
      setUserPlans(plans);
      return plans;
    } catch (err) {
      console.error('Failed to fetch user plans:', err);
      return [];
    }
  };

  // Function to update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/profile', profileData);
      
      // Update local state and cache with new user data
      const updatedUser = response.data.user;
      setCurrentUser(updatedUser);
      apiCache.userData = updatedUser;
      apiCache.lastFetch.userData = Date.now();
      
      return { success: true, user: updatedUser };
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  // Function to purchase a plan
  const purchasePlan = async (planId) => {
    try {
      const response = await axios.post(`/api/plans/${planId}/purchase`);
      
      // Refresh user plans after purchase
      fetchUserPlans(true);
      
      return { 
        success: true, 
        message: 'Plan purchased successfully',
        userPlan: response.data.userPlan 
      };
    } catch (err) {
      setError('Failed to purchase plan: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  // Function to get all available plans
  const getAvailablePlans = async () => {
    try {
      const plans = await cachedApiRequest('plans', async () => {
        const response = await axios.get('/api/plans');
        return response.data.plans;
      });
      
      return { success: true, plans };
    } catch (err) {
      setError('Failed to fetch plans: ' + err.message);
      return { success: false, error: err.message, plans: [] };
    }
  };

  // Value object for the context provider
  const value = {
    currentUser,
    userPlans,
    loading,
    error,
    login,
    logout,
    fetchUserData,
    fetchUserPlans,
    updateProfile,
    purchasePlan,
    getAvailablePlans,
    authStatusChecked
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 