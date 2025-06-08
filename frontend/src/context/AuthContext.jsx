import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Create a simple in-memory cache
const apiCache = {
  userData: null,
  userPlans: null,
  plans: null,
  lastFetch: {
    userData: 0,
    userPlans: 0,
    plans: 0
  },
  cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
  requestInProgress: {
    userData: false,
    userPlans: false,
    plans: false
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
  
  // Create cache entry if it doesn't exist
  if (apiCache.lastFetch[key] === undefined) {
    apiCache.lastFetch[key] = 0;
    apiCache.requestInProgress[key] = false;
  }
  
  // If another request for this data is already in progress, wait for it
  if (pendingRequests[key]) {
    console.log(`Request for ${key} already in progress, waiting for result...`);
    return pendingRequests[key];
  }
  
  // Use cache if valid and not forcing refresh
  if (!forceRefresh && 
      apiCache[key] && 
      (now - apiCache.lastFetch[key]) < apiCache.cacheDuration) {
    console.log(`Using cached ${key} data from ${Math.round((now - apiCache.lastFetch[key])/1000)}s ago`);
    return apiCache[key];
  }
  
  try {
    // Mark this type of request as in progress
    apiCache.requestInProgress[key] = true;
    
    // Create a promise for this request that will be shared with other callers
    pendingRequests[key] = apiCall();
    
    // Wait for the request to complete
    const data = await pendingRequests[key];
    
    // Update cache with fresh data
    apiCache[key] = data;
    apiCache.lastFetch[key] = now;
    
    console.log(`Updated cache for ${key} at ${new Date(now).toLocaleTimeString()}`);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    throw error;
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
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Set up default headers for all axios requests
  useEffect(() => {
    // Add cache control header to all requests
    axios.defaults.headers.common['Cache-Control'] = 'max-age=300';
  }, []);

  // Always set axios auth token from localStorage on mount and when token changes
  useEffect(() => {
    const setAxiosAuthToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
      } else {
        delete axios.defaults.headers.common['x-auth-token'];
      }
    };

    setAxiosAuthToken();

    // Listen for storage events (cross-tab, iOS, etc.)
    const handleStorage = (e) => {
      if (e.key === 'token') {
        setAxiosAuthToken();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user && !currentUser) {
        console.log("Firebase auth state changed: User is signed in, checking backend session");
        // User is signed in with Firebase but may not have a backend session
        const token = localStorage.getItem('token');
        
        if (!token) {
          try {
            // Get ID token from Firebase
            const idToken = await user.getIdToken(true);
            
            // Try to authenticate with backend using the Firebase token
            const response = await axios.post('/api/auth/google', { idToken });
            
            if (response.data.success) {
              console.log("Successfully authenticated with backend using Firebase token");
              // Save token and update user state
              localStorage.setItem('token', response.data.token);
              axios.defaults.headers.common['x-auth-token'] = response.data.token;
              setCurrentUser(response.data.user);
              
              // Fetch user plans
              fetchUserPlans();
            }
          } catch (err) {
            console.error("Error authenticating with backend:", err);
            // Don't set error state here to avoid showing error message on initial load
          }
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentUser]);

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
      
      // Reset loading state explicitly
      setLoading(false);
      
      // Fetch user plans in the background but don't wait for it
      fetchUserPlans().catch(err => console.error('Error fetching plans:', err));
      
      // Update cache
      apiCache.userData = userData;
      apiCache.lastFetch.userData = Date.now();
      
      setError(null);
      
      console.log('Login successful, user data set and loading reset');
      return true;
    } catch (err) {
      setLoading(false); // Ensure loading is reset on error
      setError('Login failed: ' + err.message);
      return false;
    }
  };

  // Function to handle logout
  const logout = async () => {
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
    
    // Sign out from Firebase if signed in
    if (auth.currentUser) {
      try {
        await auth.signOut();
        console.log("Signed out from Firebase");
      } catch (err) {
        console.error("Error signing out from Firebase:", err);
      }
    }
    
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

  // Function to use a credit from an active plan
  const usePlanCredit = async (planId) => {
    try {
      const response = await axios.post('/api/plans/use-credit', { planId });
      
      // Refresh user plans after using credit
      fetchUserPlans(true);
      
      return { 
        success: true, 
        message: 'Credit used successfully',
        userPlan: response.data.userPlan 
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to use credit';
      console.error('Error using plan credit:', errorMessage);
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  // Function to get all available plans
  const getAvailablePlans = async () => {
    try {
      // Add a cache key for plans
      if (!apiCache.plans) {
        apiCache.plans = null;
        apiCache.lastFetch.plans = 0;
      }
      
      console.log('Fetching available plans from API');
      const plans = await cachedApiRequest('plans', async () => {
        const response = await axios.get('/api/plans', {
          headers: {
            'Cache-Control': 'no-cache', // Force fresh data
          },
          timeout: 10000, // 10 second timeout
        });
        
        console.log('Plans API response:', response.data);
        
        if (!response.data || !response.data.plans) {
          throw new Error('Invalid API response format');
        }
        
        // Map backend plans to frontend format using code as _id
        const mappedPlans = response.data.plans.map(plan => ({
          ...plan,
          _id: plan.code // Use code as _id for frontend lookups
        }));
        
        return mappedPlans;
      }, true); // Force refresh plans
      
      if (!plans || !Array.isArray(plans) || plans.length === 0) {
        console.warn('API returned empty plans array');
        return { 
          success: false, 
          error: 'No plans available', 
          plans: [] 
        };
      }
      
      return { success: true, plans };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      console.error('Failed to fetch plans:', errorMessage, err);
      
      return { 
        success: false, 
        error: `Failed to fetch plans: ${errorMessage}`, 
        plans: [],
        details: {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        }
      };
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
    usePlanCredit,
    getAvailablePlans,
    authStatusChecked,
    firebaseUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 