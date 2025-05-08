import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        } catch (err) {
          console.error('Error restoring auth state:', err);
          // Clear invalid token
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
        }
      }
      
      setLoading(false);
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
      setError(null);
      
      return true;
    } catch (err) {
      setError('Login failed: ' + err.message);
      return false;
    }
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setCurrentUser(null);
  };

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/me');
      setCurrentUser(response.data.user);
      setLoading(false);
      return response.data.user;
    } catch (err) {
      setError('Failed to fetch user data: ' + err.message);
      setLoading(false);
      return null;
    }
  };

  // Function to update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/users/me', profileData);
      setCurrentUser({...currentUser, ...response.data.user});
      setLoading(false);
      return true;
    } catch (err) {
      setError('Profile update failed: ' + err.message);
      setLoading(false);
      return false;
    }
  };

  // Function to fetch payment history
  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get('/api/users/me/payments');
      return response.data.payments;
    } catch (err) {
      setError('Failed to fetch payment history: ' + err.message);
      return [];
    }
  };

  // Function to purchase a plan
  const purchasePlan = async (planDetails) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/payments', planDetails);
      
      // Update user data with new subscription details from the response
      if (response.data.user) {
        // Update the entire user object to ensure all fields are updated
        await fetchUserData();
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Plan purchase failed: ' + err.message);
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