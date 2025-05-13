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
      const sortedPlans = [...userPlans].sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));
      setActivePlan(sortedPlans[0]);
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
      handleFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
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
      const formData = new FormData();
      formData.append('resume', selectedFile);
      const response = await axios.post('/api/upload/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
        onClose={() => setShowAnalysisModal(false)}
      />
    </div>
  );
} 