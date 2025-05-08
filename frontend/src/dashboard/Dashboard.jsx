import React, { useEffect, useState } from 'react';
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
import axios from 'axios';

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
  const navigate = useNavigate();
  const location = useLocation();
  const state = useDashboardState();
  const { currentUser, loading: authLoading, logout, fetchUserData } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if user just logged in
  useEffect(() => {
    if (location.state?.justLoggedIn) {
      setShowWelcome(true);
      // Clear the location state to prevent showing welcome again on refresh
      window.history.replaceState({}, document.title);
      
      // Hide welcome message after 3 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Fetch user data on mount
  useEffect(() => {
    if (!currentUser && !authLoading) {
      // If not logged in and not loading, redirect to login
      navigate('/');
    } else if (currentUser) {
      // If logged in, fetch fresh user data to ensure latest subscription info
      fetchUserData();
      // Fetch user's payment history
      fetchPaymentHistory();
    }
  }, [currentUser, authLoading, navigate]);

  // Fetch payment history
  const fetchPaymentHistory = async () => {
    try {
      setLoadingPayments(true);
      const response = await axios.get('/api/users/me/payments');
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If auth is loading or user is not logged in yet, show loading
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser.name) return '?';
    
    const nameParts = currentUser.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  // User data for profile card
  const user = {
    name: currentUser.name || 'User',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    plan: currentUser.currentPlan === 'free' ? 'no plan' : (currentUser.currentPlan || 'no plan'),
    initials: getUserInitials(),
    remainingChecks: currentUser.remainingChecks || 0,
    hasUnlimitedChecks: currentUser.hasUnlimitedChecks || false,
    planEndDate: currentUser.planEndDate ? new Date(currentUser.planEndDate) : null
  };

  // Section handlers
  const onEditProfile = () => state.setIsEditProfileOpen(true);
  const onPurchasePlan = plan => handlePurchasePlan(
    plan,
    state.isPlanUnlimited,
    state.setShowUnlimitedAlert,
    state.setIsPlanUnlimited,
    state.setPurchaseMessage,
    state.setShowPurchaseSuccess,
    state.remainingChecks,
    state.setRemainingChecks
  );
  const onFileSelect = file => handleFileSelect(
    file,
    state.remainingChecks,
    state.isPlanUnlimited,
    state.setShowPlanAlert,
    state.setSelectedFile
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

  // Help section handlers
  const onEmail = () => window.location = 'mailto:support@resumezen.com';
  const onLiveChat = () => state.setShowLiveChat(true);
  const onFAQ = () => state.setShowFAQ(true);
  const onSchedule = () => state.setShowSchedule(true);

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4 }}
    >
      {/* Welcome notification */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 bg-green-500 text-white py-3 text-center z-50"
          >
            Login successful! Welcome to your dashboard.
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
                Hey {getFirstName(user.name)} 👋
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {user.initials}
              </div>
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <ProfileCard user={user} onEdit={onEditProfile} />
            <PlanSection 
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
  );
} 