import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  PaperClipIcon, 
  DocumentTextIcon, 
  ArrowUpTrayIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  CalendarIcon,
  ShoppingBagIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import PlanModal from '../../components/PlanModal';
import * as pdfUtils from '../../utils/pdfUtils';

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

  // Fetch user plans on component mount
  useEffect(() => {
    fetchUserPlans(true);
    
    // Set last active time from user data
    if (currentUser && currentUser.lastLoginAt) {
      setLastActive(new Date(currentUser.lastLoginAt));
    }
  }, [currentUser]);

  // Set up a listener to refresh plans when storage changes (for cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'planPurchased') {
        console.log('Plan purchase detected, refreshing plans');
        fetchUserPlans(true);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserPlans]);

  // Set active plan whenever userPlans changes
  useEffect(() => {
    if (userPlans && userPlans.length > 0) {
      // Find the most recently purchased active plan
      const sortedPlans = [...userPlans].sort((a, b) => 
        new Date(b.purchasedAt) - new Date(a.purchasedAt)
      );
      setActivePlan(sortedPlans[0]);
    } else {
      setActivePlan(null);
    }
  }, [userPlans]);

  // Add a pulse animation to the upload box when dragging
  useEffect(() => {
    if (isDragging && uploadBoxRef.current) {
      uploadBoxRef.current.classList.add('animate-pulse');
    } else if (uploadBoxRef.current) {
      uploadBoxRef.current.classList.remove('animate-pulse');
    }
  }, [isDragging]);

  // Get initials for profile avatar
  const getInitials = () => {
    if (!currentUser || !currentUser.name) return 'U';
    return currentUser.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date to local string
  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString();
  };

  // Format the last active time in a user-friendly way
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

  // Calculate days remaining until expiration
  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    
    const today = new Date();
    const expDate = new Date(expiresAt);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Check if user has credits remaining
  const hasCreditsRemaining = () => {
    if (!activePlan) return false;
    return activePlan.planId.isUnlimited || activePlan.creditsLeft > 0;
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // First check if user has any credits
      if (!hasCreditsRemaining()) {
        setShowNoCreditPopup(true);
        return;
      }
      
      // If unlimited plan, proceed directly
      if (activePlan && activePlan.planId.isUnlimited) {
        handleFileUpload(file);
      } else {
        // If limited plan, show confirmation
        setShowCreditConfirmation(true);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    try {
      // Clear any previous errors
      setErrorMessage('');
      
      // Validate file selected
      if (!selectedFile) {
        setErrorMessage('Please select a file');
        return;
      }
      
      // Validate file size (max 1MB)
      if (selectedFile.size > 1024 * 1024) {
        setErrorMessage('File size exceeds 1MB limit');
        return;
      }
      
      // Validate file type (PDF only)
      if (selectedFile.type !== 'application/pdf') {
        setErrorMessage('Only PDF files are allowed');
        return;
      }
      
      // Set uploading state
      setIsUploading(true);
      
      // Create form data for the file
      const formData = new FormData();
      formData.append('resume', selectedFile);
      
      // Log upload attempt
      console.log('Attempting to upload:', selectedFile);
      
      // Upload file to backend
      const response = await axios.post('/api/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Log response for debugging
      console.log('Upload response:', response.data);
      
      // Check if upload was successful
      if (response.data && response.data.success) {
        const fileData = response.data.data;
        
        // Store upload details in state for immediate UI access
        setUploadedFile({
          name: selectedFile.name,
          originalName: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          url: fileData.url,
          cloudinaryUrl: fileData.cloudinaryUrl,
          viewUrl: fileData.viewUrl,
          downloadUrl: fileData.downloadUrl,
          publicId: fileData.publicId,
          assetId: fileData.assetId,
          format: fileData.format || 'pdf',
          resourceType: fileData.resourceType || 'image',
          createdAt: new Date().toISOString()
        });
        
        // Use our utility to store resumeDetails in sessionStorage with consistent formatting
        const resumeDetails = pdfUtils.storePdfDetails(fileData, selectedFile);
        
        // Log the stored details
        console.log('Saved resume details:', resumeDetails);
        
        // Update the UI to show success
        setUploadSuccess(true);
        
        // Hide success message after 3 seconds and clear form
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
        
        // Set uploading complete
        setIsUploading(false);
        
        // Show analysis option
        setShowAnalysisOption(true);
      } else {
        // Handle error from backend
        setErrorMessage(response.data.message || 'Error uploading file');
        setIsUploading(false);
      }
    } catch (error) {
      console.error('File upload error:', error);
      setErrorMessage('Upload failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      setIsUploading(false);
    }
  };

  // Confirm credit usage and proceed with upload
  const confirmCreditUsage = () => {
    setShowCreditConfirmation(false);
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  // Handle proceed button click
  const handleProceed = async () => {
    try {
      // If no file is uploaded yet, trigger file input click
      if (!uploadSuccess && fileInputRef.current) {
        fileInputRef.current.click();
        return;
      }
      
      // Check if we have an active plan
      if (!activePlan) {
        setShowNoCreditPopup(true);
        return;
      }
      
      // Check if credits are available
      if (!hasCreditsRemaining()) {
        setShowNoCreditPopup(true);
        return;
      }
      
      // Make sure we have a proper uploadedFile with at least one URL
      if (!uploadedFile || !(
        uploadedFile.primaryUrl ||
        uploadedFile.downloadUrl ||
        uploadedFile.cloudinaryUrl || 
        uploadedFile.viewUrl || 
        uploadedFile.fallbackUrl
      )) {
        setErrorMessage('Unable to process file. Missing URL information.');
        console.error('Missing URLs in uploadedFile:', uploadedFile);
        return;
      }
      
      // Set processing state
      setIsProcessing(true);
      
      // Use a credit from the active plan
      const result = await usePlanCredit(activePlan._id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to use credit');
      }
      
      // Ensure we have the correct public ID format (including 'resumes/' folder)
      let publicId = uploadedFile.publicId || '';
      if (publicId && !publicId.includes('/')) {
        // Add the resumes/ prefix if it's missing
        publicId = `resumes/${publicId}`;
        console.log('Adding resumes/ prefix to publicId for download URL:', publicId);
      }
      
      // Create our backend proxy URL for consistent PDF viewing (if not already created)
      let downloadUrl;
      if (uploadedFile.downloadUrl) {
        // If we already have a download URL, make sure it has the proper format
        if (uploadedFile.downloadUrl.includes('/api/upload/download/')) {
          // Extract the path part after /api/upload/download/
          const pathStart = '/api/upload/download/';
          let path = uploadedFile.downloadUrl.substring(pathStart.length);
          
          // Remove query params if any
          if (path.includes('?')) {
            path = path.substring(0, path.indexOf('?'));
          }
          
          // Check if it has the resumes/ prefix
          if (!path.startsWith('resumes/') && !path.includes('/')) {
            // Need to reconstruct with resumes/ prefix
            let newPath = `resumes/${path}`;
            downloadUrl = `${pathStart}${newPath}`;
            
            // Add back any query params
            if (uploadedFile.downloadUrl.includes('?')) {
              downloadUrl += uploadedFile.downloadUrl.substring(uploadedFile.downloadUrl.indexOf('?'));
            }
            console.log(`Fixed download URL format: ${uploadedFile.downloadUrl} -> ${downloadUrl}`);
          } else {
            // URL already has proper format
            downloadUrl = uploadedFile.downloadUrl;
          }
        } else {
          // Not our API URL format, use as is
          downloadUrl = uploadedFile.downloadUrl;
        }
      } else if (publicId) {
        // Create a new download URL using our backend proxy
        const filename = encodeURIComponent(uploadedFile.originalName || uploadedFile.name || 'resume.pdf');
        downloadUrl = `/api/upload/download/${publicId}.pdf?name=${filename}`;
        console.log('Created new download URL:', downloadUrl);
      }
      
      // Ensure we have the best URL - prioritize in this order:
      // 1. downloadUrl (backend proxy - most reliable) 
      // 2. primaryUrl (if one was set)
      // 3. cloudinaryUrl (direct Cloudinary URL)
      // 4. viewUrl (viewing-specific URL)
      // 5. fallbackUrl (backup)
      const bestUrl = downloadUrl || 
                      uploadedFile.primaryUrl ||
                      uploadedFile.cloudinaryUrl || 
                      uploadedFile.viewUrl ||
                      uploadedFile.fallbackUrl;
      
      if (!bestUrl) {
        throw new Error('Could not determine a valid URL for the PDF');
      }
      
      // Store URL and additional details for the analysis page
      const resumeDetails = {
        url: bestUrl, // Main URL to use
        primaryUrl: uploadedFile.primaryUrl,
        cloudinaryUrl: uploadedFile.cloudinaryUrl,
        viewUrl: uploadedFile.viewUrl,
        fallbackUrl: uploadedFile.fallbackUrl,
        downloadUrl: downloadUrl,
        publicId: publicId, // Updated publicId with folder prefix
        originalName: uploadedFile.originalName || uploadedFile.name,
        fileName: uploadedFile.originalName || uploadedFile.name,
        fileFormat: uploadedFile.format || 'pdf',
        fileSize: uploadedFile.size,
        lastActivity: Date.now()
      };
      
      console.log('Saving resume details to sessionStorage:', resumeDetails);
      
      // Save resume details in sessionStorage
      sessionStorage.setItem('resumeDetails', JSON.stringify(resumeDetails));
      
      // Redirect to analysis page after slight delay for UX
      setTimeout(() => {
        // Use direct window.location.href to ensure full page refresh and clean state
        window.location.href = '/dashboard/resume-analysis';
      }, 800);
    } catch (error) {
      setIsProcessing(false);
      setErrorMessage('Failed to process resume: ' + (error.message || 'Please try again.'));
      console.error('Error proceeding with analysis:', error);
    }
  };

  // Open subscription modal
  const openPlanModal = () => {
    setIsPlanModalOpen(true);
    setShowNoCreditPopup(false);
  };

  // Current plan section component
  const CurrentPlanSection = () => {
    if (!activePlan) return null;
    
    const plan = activePlan.planId;
    const daysRemaining = getDaysRemaining(activePlan.expiresAt);
    
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <ShoppingBagIcon className="h-5 w-5 text-primary mr-2" />
          Your Current Plan
        </h2>
        
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex items-center">
                <h3 className="font-semibold text-primary text-lg">{plan.name}</h3>
                {plan.isPopular && (
                  <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                {plan.isSpecial && (
                  <span className="ml-2 text-xs bg-secondary text-white px-2 py-0.5 rounded-full">
                    Special
                  </span>
                )}
              </div>
              
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600 flex items-center">
                  <DocumentCheckIcon className="h-4 w-4 text-primary mr-1" />
                  {plan.isUnlimited 
                    ? <span className="font-medium">Unlimited</span> 
                    : <span>
                        <span className="font-medium">{activePlan.creditsLeft}</span> of <span className="font-medium">{plan.credits}</span> checks remaining
                      </span>
                  }
                </p>
                
                {activePlan.expiresAt && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <CalendarIcon className="h-4 w-4 text-primary mr-1" />
                    Expires: <span className="font-medium ml-1">{formatDate(activePlan.expiresAt)}</span>
                    {daysRemaining !== null && (
                      <span className="ml-1 text-xs">
                        ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-3 md:mt-0 text-right">
              <p className="text-xs text-gray-500">Purchased</p>
              <p className="text-sm text-gray-700">
                {new Date(activePlan.purchasedAt).toLocaleDateString()}
              </p>
              
              <button
                onClick={openPlanModal}
                className="mt-3 text-xs px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Credit Usage Confirmation Popup
  const CreditConfirmationPopup = () => (
    <AnimatePresence>
      {showCreditConfirmation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreditConfirmation(false)}
        >
          <motion.div
            className="bg-white rounded-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">Confirm Analysis</h3>
              </div>
              <button onClick={() => setShowCreditConfirmation(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              This will use <span className="font-medium text-primary">1 credit</span> from your current plan 
              ({activePlan?.creditsLeft} credits remaining).
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreditConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreditUsage}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Proceed
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // No Credit Popup Component
  const NoCreditPopup = () => (
    <AnimatePresence>
      {showNoCreditPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNoCreditPopup(false)}
        >
          <motion.div
            className="bg-white rounded-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-amber-100 p-2 rounded-full mr-3">
                  <InformationCircleIcon className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold">Credits Required</h3>
              </div>
              <button onClick={() => setShowNoCreditPopup(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              {!activePlan 
                ? "You don't have an active plan. Please purchase a plan to analyze your resume."
                : activePlan.creditsLeft === 0
                  ? "You've used all your available credits. Please upgrade your plan to continue using the resume analysis features."
                  : "You need at least 1 credit to analyze your resume. Please purchase a plan to continue."}
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNoCreditPopup(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={openPlanModal}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Plans
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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
      
      {/* Greeting Section */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}
            </h1>
            
            <div className="flex items-center mt-2">
              <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
              <p className="text-sm text-gray-500">
                Last active: {formatLastActive(lastActive)}
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {getInitials()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Current Plan Section */}
      {activePlan && <CurrentPlanSection />}
      
      {/* File Upload Section */}
      <motion.div
        ref={uploadBoxRef}
        className={`bg-white rounded-xl shadow-sm p-5 border-2 ${
          isDragging ? 'border-primary border-dashed bg-primary/5' : 'border-gray-200'
        } transition-all relative`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
        transition={{ duration: 0.3 }}
        animate={isDragging ? 
          { borderColor: ['#3b82f6', '#60a5fa', '#3b82f6'], borderWidth: '2px' } : 
          { borderColor: '#e5e7eb', borderWidth: '2px' }
        }
      >
        <motion.div 
          className="flex flex-col items-center justify-center py-4"
          initial={false}
          animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Circular spinner when uploading */}
          {isUploading ? (
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="relative h-16 w-16">
                <svg className="animate-spin h-16 w-16 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-primary">
                  {uploadProgress}%
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">Uploading your resume...</p>
            </div>
          ) : (
            <motion.div 
              className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4"
              animate={isDragging ? 
                { backgroundColor: 'rgba(59, 130, 246, 0.2)', y: [0, -8, 0] } : 
                uploadSuccess ?
                { backgroundColor: 'rgba(209, 250, 229, 1)', y: 0 } :
                { backgroundColor: 'rgba(239, 246, 255, 1)', y: 0 }
              }
              transition={{ 
                y: { repeat: isDragging ? Infinity : 0, duration: 1 },
                backgroundColor: { duration: 0.3 }
              }}
            >
              <DocumentTextIcon 
                className={`h-8 w-8 ${uploadSuccess ? 'text-green-500' : 'text-primary'}`} 
              />
            </motion.div>
          )}
          
          <h4 className="text-lg font-medium text-gray-800 mb-2">
            {isUploading ? 'Uploading Your Resume...' :
              uploadSuccess ? 'Resume Uploaded Successfully!' : 'Drag & Drop your resume here'}
          </h4>
          
          <p className="text-gray-600 mb-4 text-sm max-w-md text-center">
            {isUploading ? 'Please wait while we process your file.' :
              uploadSuccess ? 
              'Your resume is ready for analysis. Click the button below to continue.' : 
              'Upload your resume in PDF format (max 1MB) to analyze it and get detailed feedback'}
          </p>
          
          {/* Only show Choose File button when not uploading and no file uploaded yet */}
          {!uploadSuccess && !isUploading && !selectedFile && (
            <motion.label 
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Choose File
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf" 
                onChange={handleFileChange}
              />
            </motion.label>
          )}
          
          {selectedFile && !isUploading && !uploadSuccess && (
            <div className="flex flex-col items-center">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg w-full max-w-md mb-4 bg-gray-50">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <DocumentTextIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="font-medium text-gray-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((selectedFile.size) / 1024)} KB • PDF
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={confirmCreditUsage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-blue-600 transition-colors"
              >
                Upload to Continue
              </motion.button>
            </div>
          )}
          
          {uploadSuccess && (
            <motion.div 
              className="flex items-center p-3 border border-green-200 rounded-lg w-full max-w-md mb-4 bg-green-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="font-medium text-gray-800 truncate">
                  {uploadedFile?.originalName || uploadedFile?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((uploadedFile?.size || 0) / 1024)} KB • PDF
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Action Button inside upload box - Only show for uploaded files */}
          {uploadSuccess && (
            <motion.button
              onClick={handleProceed}
              disabled={isProcessing || !hasCreditsRemaining()}
              whileHover={(!isProcessing && hasCreditsRemaining()) ? { scale: 1.05 } : {}}
              whileTap={(!isProcessing && hasCreditsRemaining()) ? { scale: 0.95 } : {}}
              className={`px-5 py-2.5 rounded-lg font-medium mt-4 ${
                isProcessing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : !hasCreditsRemaining()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-blue-600'
              } transition-colors relative`}
            >
              {isProcessing ? (
                <>
                  <span className="opacity-0">Processing...</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </>
              ) : !hasCreditsRemaining()
                ? 'No Credits Available' 
                : 'Analyze Resume'}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
      
      {/* Add some CSS for animations */}
      <style jsx>{`
        .upload-success-pulse {
          animation: success-pulse 1s ease-in-out;
        }
        
        @keyframes success-pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
      
      {/* Plan Modal */}
      <PlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
      
      {/* Credit Confirmation Popup */}
      <CreditConfirmationPopup />
      
      {/* No Credit Popup */}
      <NoCreditPopup />
    </div>
  );
} 