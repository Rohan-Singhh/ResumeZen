import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const MAX_RATE_LIMIT_RETRIES = 3;

/**
 * Retry once per 429, up to MAX_RATE_LIMIT_RETRIES, with exponential backoff.
 *
 * The previous version had no attempt counter: a server that kept returning
 * 429 produced an unbounded retry loop that never surfaced an error.
 */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;

    if (error.response?.status === 429 && config) {
      config.__rateLimitRetries = (config.__rateLimitRetries || 0) + 1;

      if (config.__rateLimitRetries > MAX_RATE_LIMIT_RETRIES) {
        console.warn(`Rate limit: giving up on ${config.url} after ${MAX_RATE_LIMIT_RETRIES} retries`);
        return Promise.reject(error);
      }

      const retryAfter = parseInt(error.response.headers['retry-after'], 10);
      const backoffMs = Number.isFinite(retryAfter)
        ? retryAfter * 1000
        : 1000 * 2 ** config.__rateLimitRetries;

      console.warn(`Rate limited on ${config.url}, retry ${config.__rateLimitRetries} in ${backoffMs}ms`);

      return new Promise((resolve, reject) => {
        setTimeout(() => axios(config).then(resolve, reject), backoffMs);
      });
    }

    return Promise.reject(error);
  }
);

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [authStatusChecked, setAuthStatusChecked] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [restoringSession, setRestoringSession] = useState(!!localStorage.getItem('token'));

  // Keep the auth header in sync with localStorage, including across tabs
  useEffect(() => {
    setAuthHeader(localStorage.getItem('token'));

    const handleStorage = (e) => {
      if (e.key === 'token') setAuthHeader(e.newValue);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ─── Server state, owned by React Query ──────────────────
  // Replaces the hand-rolled apiCache/pendingRequests layer: React Query
  // already does caching, deduplication of in-flight requests, and staleness.

  const { data: userPlans = [] } = useQuery({
    queryKey: ['userPlans', currentUser?._id],
    queryFn: async () => {
      const response = await axios.get('/api/plans/user');
      return response.data.userPlans || [];
    },
    enabled: !!currentUser
  });

  const { data: availablePlans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await axios.get('/api/plans', { timeout: 10000 });
      if (!response.data?.plans) throw new Error('Invalid API response format');
      // Map backend plans to frontend format using code as _id
      return response.data.plans.map(plan => ({ ...plan, _id: plan.code }));
    },
    staleTime: 30 * 60 * 1000 // Plan catalogue rarely changes
  });

  const fetchUserPlans = useCallback(async () => {
    const result = await queryClient.refetchQueries({ queryKey: ['userPlans'] });
    return result;
  }, [queryClient]);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get('/api/profile');
      setCurrentUser(response.data.user);
      return response.data.user;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError('Failed to fetch user data: ' + err.message);
      }
      return null;
    }
  }, []);

  // ─── Firebase / session bootstrap ────────────────────────

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      // Signed in with Firebase but no backend session yet — exchange the
      // Firebase ID token for our own JWT.
      if (user && !localStorage.getItem('token')) {
        try {
          const idToken = await user.getIdToken(true);
          const response = await axios.post('/api/auth/google', { idToken });

          if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            setAuthHeader(response.data.token);
            setCurrentUser(response.data.user);
          }
        } catch (err) {
          console.error('Error authenticating with backend:', err);
        } finally {
          // Resolved either way — without this the guard would wait forever for
          // an auth check that never completes on the Firebase-session path.
          setAuthStatusChecked(true);
        }
      }

      setFirebaseInitialized(true);
    });

    return () => unsubscribe();
    // Intentionally empty deps: this subscription should be created once.
    // The previous version re-subscribed on every currentUser change.
  }, []);

  // Restore an existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setAuthHeader(token);

    (async () => {
      try {
        const response = await axios.get('/api/profile');
        setCurrentUser(response.data.user);
      } catch (err) {
        console.error('Error restoring auth state:', err);
        localStorage.removeItem('token');
        setAuthHeader(null);
      } finally {
        setRestoringSession(false);
        setAuthStatusChecked(true);
      }
    })();
  }, []);

  // With no stored token, we can only declare "checked" once Firebase reports in
  useEffect(() => {
    if (firebaseInitialized && !localStorage.getItem('token') && !firebaseUser) {
      setAuthStatusChecked(true);
    }
  }, [firebaseInitialized, firebaseUser]);

  const loading = restoringSession || (!authStatusChecked && !currentUser);

  // ─── Actions ─────────────────────────────────────────────

  const login = useCallback(async (userData, token) => {
    localStorage.setItem('token', token);
    setAuthHeader(token);
    setCurrentUser(userData);
    setAuthStatusChecked(true);
    setRestoringSession(false);
    setError(null);
    return true;
  }, []);

  const logout = useCallback(async () => {
    sessionStorage.setItem('logoutInProgress', 'true');

    if (auth.currentUser) {
      try {
        await auth.signOut();
      } catch (err) {
        console.error('Error signing out from Firebase:', err);
      }
    }

    localStorage.removeItem('token');
    setAuthHeader(null);
    setCurrentUser(null);

    // Drop every cached server response so the next user starts clean
    queryClient.clear();

    setTimeout(() => sessionStorage.removeItem('logoutInProgress'), 2000);
  }, [queryClient]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await axios.put('/api/profile', profileData);
      setCurrentUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const purchasePlan = useCallback(async (planId) => {
    try {
      const response = await axios.post(`/api/plans/${planId}/purchase`);
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      return {
        success: true,
        message: 'Plan purchased successfully',
        userPlan: response.data.userPlan
      };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message;
      setError('Failed to purchase plan: ' + message);
      return { success: false, error: message };
    }
  }, [queryClient]);

  const usePlanCredit = useCallback(async (planId) => {
    try {
      const response = await axios.post('/api/plans/use-credit', { planId });
      queryClient.invalidateQueries({ queryKey: ['userPlans'] });
      return {
        success: true,
        message: 'Credit used successfully',
        userPlan: response.data.userPlan
      };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to use credit';
      console.error('Error using plan credit:', message);
      return { success: false, error: message };
    }
  }, [queryClient]);

  const getAvailablePlans = useCallback(async () => {
    try {
      const plans = await queryClient.fetchQuery({
        queryKey: ['plans'],
        queryFn: async () => {
          const response = await axios.get('/api/plans', { timeout: 10000 });
          if (!response.data?.plans) throw new Error('Invalid API response format');
          return response.data.plans.map(plan => ({ ...plan, _id: plan.code }));
        }
      });

      if (!plans?.length) {
        return { success: false, error: 'No plans available', plans: [] };
      }
      return { success: true, plans };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unknown error';
      console.error('Failed to fetch plans:', message);
      return { success: false, error: `Failed to fetch plans: ${message}`, plans: [] };
    }
  }, [queryClient]);

  const value = {
    currentUser,
    setCurrentUser,
    userPlans,
    availablePlans,
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
