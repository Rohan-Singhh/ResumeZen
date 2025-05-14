import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon,
  DocumentChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import * as pdfUtils from '../../utils/pdfUtils';
import { extractResumeText, analyzeResume, processResume, analyzeResumeWithAI } from '../../services/resumeService';

export default function ResumeAnalysis() {
  const { currentUser, userPlans, refundPlanCredit, usePlanCredit, fetchUserPlans } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeFileInfo, setResumeFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [pdfUrlState, setPdfUrlState] = useState(null);
  
  // States for OCR functionality
  const [extractedText, setExtractedText] = useState(null);
  const [extractingText, setExtractingText] = useState(false);
  const [textExtractionError, setTextExtractionError] = useState(null);
  
  // States for AI analysis functionality
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  
  // States for integrated OCR and AI analysis
  const [processing, setProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);
  const [processingError, setProcessingError] = useState(null);
  
  // States for the active view/tab
  const [activeView, setActiveView] = useState('pdf'); // 'pdf', 'ocr', 'analysis'
  
  // State for AI model selection
  const [aiModel, setAiModel] = useState('meta-llama/llama-4-maverick:free');
  
  // State for showing raw JSON data
  const [showRawJson, setShowRawJson] = useState(false);
  
  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  // State for the current motivational quote
  const [currentQuote, setCurrentQuote] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  // State to track the plan ID used for this analysis (for refunding)
  const [usedPlanId, setUsedPlanId] = useState(null);
  
  // State to track if validation failed and credit was refunded
  const [creditRefunded, setCreditRefunded] = useState(false);
  
  // State to track the resumeAnalysisId
  const [resumeAnalysisId, setResumeAnalysisId] = useState(null);
  
  // List of motivational quotes to show during loading
  const motivationalQuotes = [
    "You're one step closer to standing out from the crowd!",
    "Your resume is about to get a professional makeover.",
    "Good things come to those who optimize their resumes.",
    "Success is where preparation and opportunity meet.",
    "Your career journey begins with a great resume.",
    "Our AI is analyzing your skills and experience to help you shine.",
    "The best resumes tell a story. Let's make yours compelling.",
    "Small changes to your resume can make a big difference.",
    "Your resume is your personal marketing document. Let's polish it!",
    "Every second spent improving your resume is an investment in your future.",
    "Attention to detail separates good resumes from great ones.",
    "The average recruiter spends 6-7 seconds scanning your resume. Let's make them count!",
    "We're helping you put your best foot forward.",
    "Your potential is unlimited. Let's make sure your resume shows it.",
    "Success is the sum of small efforts, repeated day in and day out."
  ];
  
  // Rotate through quotes during processing
  useEffect(() => {
    if (processing) {
      const quoteRotationInterval = setInterval(() => {
        setQuoteIndex((prevIndex) => (prevIndex + 1) % motivationalQuotes.length);
      }, 5000); // Change quote every 5 seconds
      
      return () => clearInterval(quoteRotationInterval);
    }
  }, [processing]);
  
  // Update current quote when index changes
  useEffect(() => {
    setCurrentQuote(motivationalQuotes[quoteIndex]);
  }, [quoteIndex]);
  
  // Get resume details from sessionStorage and URL params as fallback
  useEffect(() => {
    // Only use fileDetails from URL, not from previous session
    const params = new URLSearchParams(location.search);
    const fileDetailsParam = params.get('fileDetails');
    if (fileDetailsParam) {
      try {
        const details = JSON.parse(decodeURIComponent(fileDetailsParam));
        if (!details.url && !details.publicId) {
          throw new Error('Missing URL or publicId in file details');
        }
        if (details.publicId && !details.url) {
          details.url = pdfUtils.formatProxyUrl(details.publicId);
        }
        setResumeFileInfo(details);
        setLoading(false);
      } catch (error) {
        setError('Invalid file details provided: ' + error.message);
        setLoading(false);
      }
    } else {
      // No file uploaded in this session, clear everything
      setResumeFileInfo(null);
      setError('No resume file uploaded. Please upload a resume from the dashboard.');
      setLoading(false);
    }
  }, [location.search]);
  
  // Handle PDF loading error
  const handlePdfError = () => {
    console.error('Error loading PDF iframe');
    setPdfError(true);
  };
  
  // Handle direct PDF download
  const handleDownload = () => {
    if (!resumeFileInfo) return;
    
    let downloadUrl;
    
    // Priority: direct Cloudinary URL > backend URL > any other URL
    if (resumeFileInfo.publicId) {
      // Use direct Cloudinary URL for best universal compatibility
      downloadUrl = pdfUtils.getDirectCloudinaryUrl(resumeFileInfo.publicId);
      console.log('Downloading PDF using direct Cloudinary URL:', downloadUrl);
    } else if (resumeFileInfo.cloudinaryUrl) {
      // Use any existing Cloudinary URL as fallback
      downloadUrl = resumeFileInfo.cloudinaryUrl;
      console.log('Downloading PDF using cloudinaryUrl:', downloadUrl);
    } else {
      // Last resort - backend proxy with download parameter
      downloadUrl = pdfUtils.getDownloadUrl(pdfUrlState);
      console.log('Downloading PDF using backend proxy:', downloadUrl);
    }
    
    // Open download URL in a new tab for most reliable cross-browser experience
    window.open(downloadUrl, '_blank');
  };
  
  // Extract text from resume using OCR
  const handleExtractText = async () => {
    if (!resumeFileInfo || !pdfUrlState) return;
    
    try {
      setExtractingText(true);
      setTextExtractionError(null);
      setActiveView('ocr');
      
      // Use the URL that works best for OCR
      const url = resumeFileInfo.url || pdfUrlState;
      console.log('Extracting text from URL:', url);
      
      const result = await extractResumeText(url, {
        language: 'eng',
        scale: true,
        isTable: true,
        engine: 2
      });
      
      if (result && result.success && result.data) {
        setExtractedText(result.data);
      } else {
        throw new Error('Failed to extract text from resume');
      }
    } catch (error) {
      let userMsg = 'Sorry, we could not extract text from your document.';
      let details = error?.response?.data?.message || error.message || 'Unknown error';
      if (details.includes('timeout') || details.includes('exceeded')) {
        userMsg = 'The request took too long. Please try again later.';
      } else if (details.toLowerCase().includes('extract')) {
        userMsg = 'Text extraction failed. Please upload a clearer or different resume.';
      }
      setFriendlyError({ userMsg, details });
      setTextExtractionError(details);
    } finally {
      setExtractingText(false);
    }
  };
  
  // Analyze resume using OCR and AI analysis
  const handleAnalyzeResume = async () => {
    if (!resumeFileInfo || !pdfUrlState) return;
    
    try {
      setAnalyzingResume(true);
      setAnalysisError(null);
      setActiveView('analysis');
      
      // Use the URL that works best for analysis
      const url = resumeFileInfo.url || pdfUrlState;
      console.log('Processing resume from URL:', url);
      
      // Use the combined OCR + AI analysis endpoint
      const result = await processResume(url, {
        language: 'eng',
        scale: true,
        isTable: true,
        model: aiModel
      });
      
      if (result && result.success && result.data) {
        setProcessingResults(result.data);
        if (result.data.extraction) {
          setExtractedText(result.data.extraction);
        }
        if (result.data.analysis) {
          setResumeAnalysis(result.data.analysis);
        }
        if (result.data.resumeAnalysisId) {
          setResumeAnalysisId(result.data.resumeAnalysisId);
        }
        // Subtract 1 credit if not unlimited
        if (userPlans && userPlans.length > 0) {
          // Find the active user plan instance (not the plan template)
          const activeUserPlan = userPlans.find(plan => plan.planId && (plan.planId.isUnlimited || plan.creditsLeft > 0));
          if (activeUserPlan && !activeUserPlan.planId.isUnlimited) {
            try {
              console.log('Attempting to deduct credit for userPlan._id:', activeUserPlan._id, 'creditsLeft before:', activeUserPlan.creditsLeft);
              const result = await usePlanCredit(activeUserPlan._id);
              if (!result.success) {
                setAnalysisError('Analysis succeeded, but failed to deduct credit: ' + (result.error || 'Unknown error'));
                console.error('Credit deduction failed:', result.error);
              } else {
                await fetchUserPlans(true); // Refresh credits after deduction
                console.log('Credit deducted successfully.');
              }
            } catch (err) {
              setAnalysisError('Analysis succeeded, but failed to deduct credit: ' + (err.message || err));
              console.error('Credit deduction exception:', err);
            }
          }
        }
      } else {
        throw new Error('Failed to process resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setAnalysisError(error.message || 'Failed to analyze resume');
    } finally {
      setAnalyzingResume(false);
    }
  };
  
  // Analyze extracted text with AI
  const analyzeExtractedText = async () => {
    if (!extractedText || !extractedText.extractedText) {
      setAnalysisError('No extracted text available. Please extract text first.');
      return;
    }
    
    try {
      setAnalyzingResume(true);
      setAnalysisError(null);
      setActiveView('analysis');
      
      const result = await analyzeResumeWithAI(extractedText.extractedText, {
        model: aiModel
      });
      
      if (result && result.success && result.data) {
        setResumeAnalysis(result.data);
        
        // Also update processing results for rendering
        setProcessingResults({
          extraction: extractedText,
          analysis: result.data
        });
      } else {
        throw new Error('Failed to analyze text with AI');
      }
    } catch (error) {
      console.error('Error analyzing text with AI:', error);
      setAnalysisError(error.message || 'Failed to analyze text with AI');
    } finally {
      setAnalyzingResume(false);
    }
  };
  
  // Function to set the PDF URL safely
  const setPdfUrl = useCallback(() => {
    if (!resumeFileInfo) return;
    
    // First, try to use the universal URL approach (most reliable across services)
    const universalUrl = pdfUtils.getUniversalPdfUrl(resumeFileInfo);
    if (universalUrl) {
      console.log('Setting PDF universal URL:', universalUrl);
      setPdfUrlState(universalUrl);
      return;
    }
    
    // First, try to get the backend proxy URL using publicId
    if (resumeFileInfo.publicId) {
      const backendUrl = pdfUtils.formatProxyUrl(resumeFileInfo.publicId);
      console.log('Setting PDF backend proxy URL:', backendUrl);
      setPdfUrlState(backendUrl);
      return;
    }
    
    // Fallback to direct cloudinary URL if available
    if (resumeFileInfo.cloudinaryUrl) {
      console.log('Using direct Cloudinary URL:', resumeFileInfo.cloudinaryUrl);
      setPdfUrlState(resumeFileInfo.cloudinaryUrl);
      return;
    }
    
    // Fallback to downloadUrl
    if (resumeFileInfo.downloadUrl) {
      console.log('Using download URL:', resumeFileInfo.downloadUrl);
      setPdfUrlState(resumeFileInfo.downloadUrl);
      return;
    }
    
    // Fallback to primaryUrl
    if (resumeFileInfo.primaryUrl) {
      console.log('Using primary URL:', resumeFileInfo.primaryUrl);
      setPdfUrlState(resumeFileInfo.primaryUrl);
      return;
    }
    
    // No URL available
    console.warn('No valid URL found in resumeFileInfo:', resumeFileInfo);
    setPdfError(true);
  }, [resumeFileInfo]);
  
  // Set up the PDF URL when component mounts or resumeFileInfo changes
  useEffect(() => {
    // Only proceed if we have valid resume data
    if (resumeFileInfo) {
      // Generate the PDF URL
      setPdfUrl();
      setLoading(false);
    } else {
      setLoading(false);
      setPdfError(true);
    }
  }, [resumeFileInfo, setPdfUrl]);
  
  // Auto-process resume when component loads and resumeFileInfo is available
  useEffect(() => {
    if (resumeFileInfo?.url && !processing && !processingResults && !processingError) {
      processResumeAutomatically();
    }
  }, [resumeFileInfo]);
  
  // Process the resume automatically using OCR and AI analysis
  const processResumeAutomatically = async () => {
    if (!resumeFileInfo?.url) return;
    
    try {
      setProcessing(true);
      setProcessingError(null);
      
      // Get the planId from session storage if it was stored during upload
      const storedUsedPlanId = sessionStorage.getItem('usedPlanId');
      if (storedUsedPlanId) {
        setUsedPlanId(storedUsedPlanId);
      }
      
      // Set initial quote
      setCurrentQuote(motivationalQuotes[0]);
      
      // Use the URL that works best for analysis
      const url = resumeFileInfo.url;
      console.log('Processing resume from URL:', url);
      
      // Use the combined OCR + AI analysis endpoint
      const result = await processResume(url, {
        language: 'eng',
        scale: true,
        isTable: true,
        model: aiModel
      });
      
      // Check if the document was valid (was actually a resume)
      if (!result.success && result.validationDetails && !result.validationDetails.isResume) {
        // Get a friendly error message
        const reasons = result.validationDetails?.reasons?.join('. ') || '';
        const score = result.validationDetails?.score || 0;
        const errorMsg = `This document doesn't appear to be a resume (score: ${score}/100). 
          Please upload a proper resume file. ${reasons ? `\n\nIssues detected: ${reasons}` : ''}`;
        
        // Refund the credit if we have a plan ID
        if (storedUsedPlanId && !creditRefunded) {
          console.log(`Refunding credit for plan ${storedUsedPlanId} due to non-resume document`);
          await refundPlanCredit(storedUsedPlanId);
          setCreditRefunded(true);
          sessionStorage.removeItem('usedPlanId'); // Remove to prevent multiple refunds
        }
        
        throw new Error(errorMsg);
      }
      
      if (result && result.success && result.data) {
        setProcessingResults(result.data);
        // Show success popup after processing is complete
        setShowSuccessPopup(true);
        // Hide the popup after 5 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 5000);
      } else {
        throw new Error('Failed to process resume');
      }
    } catch (error) {
      let userMsg = 'Sorry, something went wrong on our side.';
      let details = error?.response?.data?.message || error.message || 'Unknown error';
      if (error?.response?.status === 403) {
        userMsg = 'You do not have an active plan or enough credits. Please purchase a plan or check your credits.';
      } else if (error?.response?.status === 422) {
        userMsg = 'The document could not be processed. Please upload a valid resume.';
      } else if (error?.response?.status === 400) {
        userMsg = 'Bad request. Please try again or contact support.';
      } else if (details.includes('timeout') || details.includes('exceeded')) {
        userMsg = 'The request took too long. Please try again later.';
      }
      setFriendlyError({ userMsg, details });
      setProcessingError(details);
    } finally {
      setProcessing(false);
    }
  };
  
  // Try processing again if it failed
  const handleRetry = () => {
    setProcessingError(null);
    setProcessingResults(null);
    processResumeAutomatically();
  };
  
  // Add a helper to pick emoji based on error type
  function getErrorEmoji(userMsg) {
    if (userMsg.includes('plan') || userMsg.includes('credit')) return '💸';
    if (userMsg.toLowerCase().includes('timeout')) return '⏳';
    if (userMsg.toLowerCase().includes('extract')) return '🕵️‍♂️';
    if (userMsg.toLowerCase().includes('upload')) return '📄';
    if (userMsg.toLowerCase().includes('document')) return '📄';
    if (userMsg.toLowerCase().includes('bad request')) return '🤔';
    if (userMsg.toLowerCase().includes('sorry')) return '😬';
    return '😢';
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back navigation and header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-900">
                {resumeFileInfo?.fileName || 'Resume Analysis'}
              </h1>
              
              {resumeFileInfo && (
                <button
                  onClick={handleDownload}
                  className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-700"
                  title="Download PDF"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
        
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <div className="mt-4">
              <Link
                  to="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Return to Dashboard
              </Link>
            </div>
            </motion.div>
          </div>
        ) : resumeFileInfo ? (
          <div className="bg-white rounded-lg shadow">
            {/* Processing state with motivational quotes */}
            {processing ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-white"></div>
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Analyzing Your Resume
                </h3>
                
                <div className="h-16 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentQuote}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="text-gray-600 max-w-md text-center"
                    >
                      {currentQuote}
                    </motion.p>
                  </AnimatePresence>
                </div>
                
                <div className="mt-6 w-full max-w-md">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: "100%",
                        transition: { duration: 15, ease: "linear" } 
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : processingError ? (
              <div className="p-8 text-center">
                <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {processingError.includes("doesn't appear to be a resume") ? 
                    "Invalid Document Type" : 
                    "Processing Failed"}
                </h3>
                <div className="max-w-2xl mx-auto mb-6">
                  <p className="text-gray-600 whitespace-pre-line">
                    {processingError}
                  </p>
                  {creditRefunded && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                      <p>Your credit has been automatically refunded.</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {!processingError.includes("doesn't appear to be a resume") && (
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Try Again
                    </button>
                  )}
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {processingError.includes("doesn't appear to be a resume") ? 
                      "Upload a Resume" : 
                      "Return to Dashboard"}
                  </Link>
                </div>
              </div>
            ) : processingResults ? (
              <div className="p-6">
                {/* Analysis Results Content */}
                {processingResults.analysis?.structured ? (
                  <div className="space-y-6">
                    {/* Contact Information */}
                    {processingResults.analysis.structured.contactInformation && (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Contact Information
                          </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Name</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {processingResults.analysis.structured.contactInformation.name || 'N/A'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Email</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {processingResults.analysis.structured.contactInformation.email || 'N/A'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Phone</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {processingResults.analysis.structured.contactInformation.phone || 'N/A'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Location</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {processingResults.analysis.structured.contactInformation.location || 'N/A'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    )}
                    
                    {/* Skills */}
                    {processingResults.analysis.structured.skills && (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Skills
                          </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Technical Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(processingResults.analysis.structured.skills.technical) && 
                               processingResults.analysis.structured.skills.technical.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Soft Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(processingResults.analysis.structured.skills.soft) && 
                               processingResults.analysis.structured.skills.soft.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Analysis and Recommendations */}
                    {processingResults.analysis.structured.analysis && (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Resume Analysis
                          </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              ATS Score
                            </p>
                            {(() => {
                              const score = processingResults.analysis.structured.analysis.atsScore;
                              return (
                                <div className="flex items-center">
                                  <span className="text-2xl font-bold text-gray-900 mr-2">
                                    {typeof score === 'number' && score > 0 ? `${score}%` : 'NA'}
                                  </span>
                                  <div className="relative w-full max-w-xs h-2 bg-gray-200 rounded">
                                    <div 
                                      className="absolute top-0 left-0 h-2 bg-blue-600 rounded"
                                      style={{ width: `${typeof score === 'number' && score > 0 ? score : 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {Array.isArray(processingResults.analysis.structured.analysis.strengths) && 
                               processingResults.analysis.structured.analysis.strengths.map((item, index) => (
                                <li key={index} className="text-sm text-gray-600">{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {Array.isArray(processingResults.analysis.structured.analysis.areasForImprovement) && 
                               processingResults.analysis.structured.analysis.areasForImprovement.map((item, index) => (
                                <li key={index} className="text-sm text-gray-600">{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">ATS Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(processingResults.analysis.structured.analysis.keywords) && 
                               processingResults.analysis.structured.analysis.keywords.map((keyword, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-700 whitespace-pre-line">
                      {processingResults.analysis?.raw || 'No structured analysis available.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Preparing to analyze your resume...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <div className="mt-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Return to Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Analysis Complete!</h3>
                <p className="mt-1 text-sm text-green-600">
                  Here is your resume analysis. We hope it helps you improve your job prospects!
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowSuccessPopup(false)}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* After analysis, show a link to the saved analysis if available */}
      {resumeAnalysisId && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-700 font-semibold">Analysis saved!</span>
          <span className="ml-2 text-green-600">Analysis ID: {resumeAnalysisId}</span>
        </div>
      )}
      
      {/* Friendly Error Popup */}
      <AnimatePresence>
        {friendlyError && (
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
                {getErrorEmoji(friendlyError.userMsg)}
              </motion.div>
              <h4 className="text-2xl font-bold text-red-600 mb-2">Oops!</h4>
              <p className="text-gray-700 mb-4">{friendlyError.userMsg}</p>
              <details className="text-xs text-gray-400 mb-4 cursor-pointer select-text">
                <summary className="mb-1">Show technical details</summary>
                <pre className="whitespace-pre-wrap break-all">{friendlyError.details}</pre>
              </details>
              <button
                onClick={() => setFriendlyError(null)}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-all duration-200 focus:outline-none"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 