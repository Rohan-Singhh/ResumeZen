import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import PlanModal from '../../components/PlanModal';
import * as pdfUtils from '../../utils/pdfUtils';
import DashboardGreetingSection from './dashboardwelcome/DashboardGreetingSection';
import DashboardCurrentPlanSection from './dashboardwelcome/DashboardCurrentPlanSection';
import DashboardFileUploadSection from './dashboardwelcome/DashboardFileUploadSection';
import DashboardCreditConfirmationPopup from './dashboardwelcome/DashboardCreditConfirmationPopup';
import DashboardNoCreditPopup from './dashboardwelcome/DashboardNoCreditPopup';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import DashboardFeedbackQuotes from './dashboardwelcome/DashboardFeedbackQuotes';
import DashboardCustomerReviews from './dashboardwelcome/DashboardCustomerReviews';
import { useNavigate } from 'react-router-dom';
import ResumeAnalysisModal from './ResumeAnalysisModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function DashboardWelcome() {
  const { currentUser, userPlans, fetchUserPlans, usePlanCredit } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [lastActive, setLastActive] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNoCreditPopup, setShowNoCreditPopup] = useState(false);
  const [showCreditConfirmation, setShowCreditConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const uploadBoxRef = useRef(null);
  const navigate = useNavigate();
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisFileDetails, setAnalysisFileDetails] = useState(null);
  const [fileSizeError, setFileSizeError] = useState(false);

  useEffect(() => {
    fetchUserPlans(true);
    if (currentUser && currentUser.lastLoginAt) {
      setLastActive(new Date(currentUser.lastLoginAt));
    }
  }, [currentUser]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'planPurchased') {
        fetchUserPlans(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserPlans]);

  useEffect(() => {
    if (userPlans && userPlans.length > 0) {
      // Only consider active, non-expired plans
      const now = new Date();
      const validPlans = userPlans.filter(plan => {
        if (!plan.isActive) return false;
        if (plan.expiresAt && new Date(plan.expiresAt) < now) return false;
        if (!plan.planId) return false;
        // Must have credits left or be unlimited
        return plan.planId.isUnlimited || plan.creditsLeft > 0;
      });
      if (validPlans.length > 0) {
        // Sort by purchase date, most recent first
        const sortedPlans = [...validPlans].sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));
        setActivePlan(sortedPlans[0]);
      } else {
        setActivePlan(null);
      }
    } else {
      setActivePlan(null);
    }
  }, [userPlans]);

  useEffect(() => {
    if (isDragging && uploadBoxRef.current) {
      uploadBoxRef.current.classList.add('animate-pulse');
    } else if (uploadBoxRef.current) {
      uploadBoxRef.current.classList.remove('animate-pulse');
    }
  }, [isDragging]);

  const getInitials = () => {
    if (!currentUser || !currentUser.name) return 'U';
    return currentUser.name.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastActive = (date) => {
    if (!date) return 'First time here';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const today = new Date();
    const expDate = new Date(expiresAt);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const hasCreditsRemaining = () => {
    if (!activePlan) return false;
    return activePlan.planId.isUnlimited || activePlan.creditsLeft > 0;
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.size > 1024 * 1024) {
        setFileSizeError(true);
        setSelectedFile(null);
        setUploadSuccess(false);
        setErrorMessage('');
        return;
      }
      setSelectedFile(file);
      setUploadSuccess(false);
      setErrorMessage('');
      if (!activePlan) {
        setShowNoCreditPopup(true);
        return;
      }
      if (!activePlan.planId.isUnlimited && activePlan.creditsLeft <= 0) {
        setShowNoCreditPopup(true);
        return;
      }
      setShowCreditConfirmation(true);
      e.dataTransfer.clearData();
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        setFileSizeError(true);
        setSelectedFile(null);
        setUploadSuccess(false);
        setErrorMessage('');
        return;
      }
      setSelectedFile(file);
      setUploadSuccess(false);
      setErrorMessage('');
      if (!activePlan) {
        setShowNoCreditPopup(true);
        return;
      }
      if (!activePlan.planId.isUnlimited && activePlan.creditsLeft <= 0) {
        setShowNoCreditPopup(true);
        return;
      }
      setShowCreditConfirmation(true);
    }
  };
  const handleFileUpload = async () => {
    try {
      setErrorMessage('');
      if (!selectedFile) { setErrorMessage('Please select a file'); return; }
      if (selectedFile.size > 1024 * 1024) { setErrorMessage('File size exceeds 1MB limit'); return; }
      if (selectedFile.type !== 'application/pdf') { setErrorMessage('Only PDF files are allowed'); return; }
      setIsUploading(true);
      setUploadProgress(0);
      // Animate progress from 0 to 80% while uploading
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5; // random step for realism
        if (progress >= 80) progress = 80;
        setUploadProgress(progress);
      }, 120);
      const formData = new FormData();
      formData.append('resume', selectedFile);
      const response = await axios.post('/api/upload/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (response.data && response.data.success) {
        const fileData = response.data.data;
        setUploadedFile({ name: selectedFile.name, originalName: selectedFile.name, size: selectedFile.size, type: selectedFile.type, url: fileData.url, cloudinaryUrl: fileData.cloudinaryUrl, viewUrl: fileData.viewUrl, downloadUrl: fileData.downloadUrl, publicId: fileData.publicId, assetId: fileData.assetId, format: fileData.format || 'pdf', resourceType: fileData.resourceType || 'image', createdAt: new Date().toISOString() });
        pdfUtils.storePdfDetails(fileData, selectedFile);
        setUploadSuccess(true);
        setIsUploading(false);
      } else {
        setErrorMessage(response.data.message || 'Error uploading file');
        setIsUploading(false);
      }
    } catch (error) {
      setUploadProgress(0);
      setErrorMessage('Upload failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      setIsUploading(false);
    }
  };
  const confirmCreditUsage = () => {
    setShowCreditConfirmation(false);
    // Do not upload here; wait for explicit user action in DashboardFileUploadSection
  };
  const handleProceed = async () => {
    if (!uploadedFile) {
      if (fileInputRef.current) fileInputRef.current.click();
        return;
      }
    setAnalysisFileDetails(uploadedFile);
    setShowAnalysisModal(true);
    // Clear upload state and file input after opening modal
    setSelectedFile(null);
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const openPlanModal = () => { setIsPlanModalOpen(true); setShowNoCreditPopup(false); };

  // Called by DashboardFileUploadSection when user clicks 'Upload to Continue'
  const handleUploadButtonClick = () => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setErrorMessage('Only PDF files are allowed.');
        return;
      }
    if (selectedFile.size > 1024 * 1024) {
      setErrorMessage('File size exceeds 1MB limit.');
        return;
    }
    setErrorMessage('');
    handleFileUpload(selectedFile);
  };

  const handleAnalysisModalClose = () => {
    setShowAnalysisModal(false);
    setAnalysisFileDetails(null);
    // Reset upload state so the upload box is cleared after analysis/close
    setSelectedFile(null);
    setUploadedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Refresh user plans/credits after analysis
    fetchUserPlans(true);
  };

  return (
    <div className="relative">
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}
      <AnimatePresence>
        {fileSizeError && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative"
            >
              <motion.div
                initial={{ rotate: -10, scale: 1.2 }}
                animate={{ rotate: [0, 10, -10, 0], scale: [1.2, 1.1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="text-5xl mb-2"
              >
                📦
              </motion.div>
              <h4 className="text-2xl font-bold text-red-600 mb-2">File Too Large!</h4>
              <p className="text-gray-700 mb-4">Your PDF exceeds 1MB. Please upload a smaller file.</p>
              <button
                onClick={() => {
                  setFileSizeError(false);
                  setSelectedFile(null);
                  setUploadSuccess(false);
                  setErrorMessage('');
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-all duration-200 focus:outline-none"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <DashboardGreetingSection
        currentUser={currentUser}
        lastActive={lastActive}
        getInitials={getInitials}
        formatLastActive={formatLastActive}
      />
      <DashboardCurrentPlanSection
        activePlan={activePlan}
        getDaysRemaining={getDaysRemaining}
        formatDate={formatDate}
        openPlanModal={openPlanModal}
      />
      <DashboardFileUploadSection
        isDragging={isDragging}
        isUploading={isUploading}
        uploadSuccess={uploadSuccess}
        uploadProgress={uploadProgress}
        selectedFile={selectedFile}
        uploadedFile={uploadedFile}
        isProcessing={isProcessing}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleFileChange={handleFileChange}
        confirmCreditUsage={confirmCreditUsage}
        handleProceed={handleProceed}
        hasCreditsRemaining={hasCreditsRemaining}
        onUploadButtonClick={handleUploadButtonClick}
        activePlan={activePlan}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <DashboardFeedbackQuotes />
      <DashboardCustomerReviews />
      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
      <DashboardCreditConfirmationPopup
        show={showCreditConfirmation}
        onClose={() => setShowCreditConfirmation(false)}
        onConfirm={confirmCreditUsage}
        activePlan={activePlan}
      />
      <DashboardNoCreditPopup
        show={showNoCreditPopup}
        onClose={() => setShowNoCreditPopup(false)}
        onViewPlans={openPlanModal}
        activePlan={activePlan}
      />
      <ResumeAnalysisModal
        fileDetails={analysisFileDetails}
        open={showAnalysisModal}
        onClose={handleAnalysisModalClose}
      />
    </div>
  );
} 