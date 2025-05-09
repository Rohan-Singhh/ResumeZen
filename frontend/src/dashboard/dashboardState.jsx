import { useState } from 'react';
import dummyData from './dashboardData';

export function useDashboardState() {
  // Example state structure, to be filled in with actual state from original Dashboard.jsx
  const [selectedVlog, setSelectedVlog] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPlanAlert, setShowPlanAlert] = useState(false);
  const [remainingChecks, setRemainingChecks] = useState(dummyData.user.remaining_checks);
  const [isPlanUnlimited, setIsPlanUnlimited] = useState(dummyData.user.plan_type === "unlimited");
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [showUnlimitedAlert, setShowUnlimitedAlert] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [resumes, setResumes] = useState(dummyData.resumes);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [uploadComponent, setUploadComponent] = useState(0);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  
  // Purchase related state
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [purchaseRequired, setPurchaseRequired] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");

  return {
    selectedVlog, setSelectedVlog,
    isEditProfileOpen, setIsEditProfileOpen,
    selectedFile, setSelectedFile,
    showPlanAlert, setShowPlanAlert,
    remainingChecks, setRemainingChecks,
    isPlanUnlimited, setIsPlanUnlimited,
    showPurchaseSuccess, setShowPurchaseSuccess,
    purchaseMessage, setPurchaseMessage,
    showUnlimitedAlert, setShowUnlimitedAlert,
    isProcessing, setIsProcessing,
    showAnalysis, setShowAnalysis,
    analysisResult, setAnalysisResult,
    resumes, setResumes,
    showFeedback, setShowFeedback,
    selectedResume, setSelectedResume,
    uploadComponent, setUploadComponent,
    showLiveChat, setShowLiveChat,
    showSchedule, setShowSchedule,
    showFAQ, setShowFAQ,
    // Purchase related state
    purchaseInProgress, setPurchaseInProgress,
    purchaseError, setPurchaseError,
    purchaseDialogOpen, setPurchaseDialogOpen,
    uploadFile, setUploadFile,
    uploadSuccess, setUploadSuccess,
    uploadError, setUploadError,
    uploadMessage, setUploadMessage,
    uploadInProgress, setUploadInProgress,
    atsScore, setAtsScore,
    processingComplete, setProcessingComplete,
    purchaseRequired, setPurchaseRequired,
    jobTitle, setJobTitle,
    industry, setIndustry,
  };
} 