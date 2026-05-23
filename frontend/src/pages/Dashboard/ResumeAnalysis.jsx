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
  const [friendlyError, setFriendlyError] = useState(null);
  
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Back navigation and header */}
      <div className="bg-zinc-900/40 border-b border-white/5 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-white/5 px-3 py-1.5 rounded-lg flex items-center transition-colors text-sm font-semibold"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-zinc-100 font-display">
                {resumeFileInfo?.fileName || 'Resume Analysis'}
              </h1>
              
              {resumeFileInfo && (
                <button
                  onClick={handleDownload}
                  className="ml-2 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                  title="Download PDF"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
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
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-2xl text-center max-w-xl mx-auto backdrop-blur-md">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <h2 className="text-lg font-bold text-red-400 mb-2 font-display">Error</h2>
              <p className="text-red-300 text-sm mb-6">{error}</p>
              <div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-purple-500/10 transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        ) : resumeFileInfo ? (
          <div className="bg-zinc-900/30 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden">
            {/* Processing state with motivational quotes */}
            {processing ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/10 border-t-purple-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-zinc-950"></div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-zinc-100 mb-2 font-display">
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
                      className="text-zinc-400 text-sm max-w-md text-center italic"
                    >
                      "{currentQuote}"
                    </motion.p>
                  </AnimatePresence>
                </div>
                
                <div className="mt-6 w-full max-w-md">
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
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
                <h3 className="text-lg font-bold text-zinc-100 mb-2 font-display">
                  {processingError.includes("doesn't appear to be a resume") ? 
                    "Invalid Document Type" : 
                    "Processing Failed"}
                </h3>
                <div className="max-w-2xl mx-auto mb-6">
                  <p className="text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
                    {processingError}
                  </p>
                  {creditRefunded && (
                    <div className="mt-4 p-4 bg-green-950/20 border border-green-500/20 text-green-400 rounded-xl text-sm font-semibold max-w-md mx-auto">
                      <p>Your credit has been automatically refunded.</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {!processingError.includes("doesn't appear to be a resume") && (
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-purple-500/10 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-5 py-2.5 bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 rounded-lg text-sm font-semibold transition-colors"
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
                      <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                        <div className="px-5 py-4 bg-zinc-950/40 border-b border-white/5">
                          <h3 className="text-base font-bold text-zinc-100 font-display">
                            Contact Information
                          </h3>
                        </div>
                        <div className="p-6">
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            <div>
                              <dt className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Name</dt>
                              <dd className="mt-1 text-sm font-bold text-zinc-200">
                                {processingResults.analysis.structured.contactInformation.name || 'N/A'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Email</dt>
                              <dd className="mt-1 text-sm font-bold text-zinc-200">
                                {processingResults.analysis.structured.contactInformation.email || 'N/A'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Phone</dt>
                              <dd className="mt-1 text-sm font-bold text-zinc-200">
                                {processingResults.analysis.structured.contactInformation.phone || 'N/A'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Location</dt>
                              <dd className="mt-1 text-sm font-bold text-zinc-200">
                                {processingResults.analysis.structured.contactInformation.location || 'N/A'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    )}
                    
                    {/* Skills */}
                    {processingResults.analysis.structured.skills && (
                      <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                        <div className="px-5 py-4 bg-zinc-950/40 border-b border-white/5">
                          <h3 className="text-base font-bold text-zinc-100 font-display">
                            Extracted Skills
                          </h3>
                        </div>
                        <div className="p-6 space-y-5">
                          <div>
                            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Technical Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(processingResults.analysis.structured.skills.technical) && 
                               processingResults.analysis.structured.skills.technical.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-500/15 border border-purple-500/20 text-purple-300"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Soft Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(processingResults.analysis.structured.skills.soft) && 
                               processingResults.analysis.structured.skills.soft.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-green-500/15 border border-green-500/20 text-green-300"
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
                      <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                        <div className="px-5 py-4 bg-zinc-950/40 border-b border-white/5">
                          <h3 className="text-base font-bold text-zinc-100 font-display">
                            ATS Audit Report
                          </h3>
                        </div>
                        <div className="p-6 space-y-6">
                          <div>
                            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">
                              ATS Score
                            </p>
                            {(() => {
                              const score = processingResults.analysis.structured.analysis.atsScore;
                              return (
                                <div className="flex items-center">
                                  <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mr-4 font-display">
                                    {typeof score === 'number' && score > 0 ? `${score}%` : 'NA'}
                                  </span>
                                  <div className="relative w-full max-w-sm h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                      style={{ width: `${typeof score === 'number' && score > 0 ? score : 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          
                          <div className="border-t border-white/5 pt-4">
                            <h4 className="text-sm font-semibold text-purple-300 mb-3">Key Strengths</h4>
                            <ul className="space-y-2">
                              {Array.isArray(processingResults.analysis.structured.analysis.strengths) && 
                               processingResults.analysis.structured.analysis.strengths.map((item, index) => (
                                <li key={index} className="text-sm text-zinc-300 flex items-start gap-2">
                                  <span className="text-purple-400 mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="border-t border-white/5 pt-4">
                            <h4 className="text-sm font-semibold text-amber-400 mb-3">Areas for Improvement</h4>
                            <ul className="space-y-2">
                              {Array.isArray(processingResults.analysis.structured.analysis.areasForImprovement) && 
                               processingResults.analysis.structured.analysis.areasForImprovement.map((item, index) => (
                                <li key={index} className="text-sm text-zinc-300 flex items-start gap-2">
                                  <span className="text-amber-400 mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="border-t border-white/5 pt-4">
                            <h4 className="text-sm font-semibold text-pink-400 mb-3">Suggested ATS Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(processingResults.analysis.structured.analysis.keywords) && 
                               processingResults.analysis.structured.analysis.keywords.map((keyword, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-pink-500/15 border border-pink-500/20 text-pink-300"
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
                  <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                    <p className="text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
                      {processingResults.analysis?.raw || 'No structured analysis available.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-zinc-400 text-sm">Preparing to analyze your resume...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-2xl text-center max-w-xl mx-auto backdrop-blur-md">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <h2 className="text-lg font-bold text-red-400 mb-2 font-display">Error</h2>
              <p className="text-red-300 text-sm mb-6">{error}</p>
              <div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-purple-500/10 transition-colors"
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
            className="fixed bottom-4 right-4 bg-green-950/80 border border-green-500/20 backdrop-blur-md rounded-xl shadow-lg p-4 max-w-md text-green-400 z-50"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-green-300">Analysis Complete!</h3>
                <p className="mt-1 text-sm text-green-400">
                  Here is your resume analysis. We hope it helps you improve your job prospects!
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowSuccessPopup(false)}
                    className="inline-flex rounded-lg p-1.5 text-green-400 hover:bg-white/5 focus:outline-none transition-colors"
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
        <div className="mt-4 p-4 bg-green-950/20 border border-green-500/20 backdrop-blur-md rounded-xl max-w-xl mx-auto flex items-center justify-between text-sm">
          <span className="text-green-400 font-semibold">Analysis saved successfully!</span>
          <span className="text-green-500 text-xs font-mono">ID: {resumeAnalysisId}</span>
        </div>
      )}
      
      {/* Friendly Error Popup */}
      <AnimatePresence>
        {friendlyError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative text-zinc-200"
            >
              <motion.div
                initial={{ rotate: -10, scale: 1.2 }}
                animate={{ rotate: [0, 10, -10, 0], scale: [1.2, 1.1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="text-5xl mb-3"
              >
                {getErrorEmoji(friendlyError.userMsg)}
              </motion.div>
              <h4 className="text-xl font-bold text-red-500 mb-2">Oops!</h4>
              <p className="text-zinc-300 text-sm mb-4 leading-relaxed">{friendlyError.userMsg}</p>
              <details className="text-xs text-zinc-500 mb-6 cursor-pointer select-text bg-zinc-950/50 p-2.5 rounded-xl border border-white/5">
                <summary className="mb-1 text-zinc-400 font-semibold">Show technical details</summary>
                <pre className="whitespace-pre-wrap break-all text-left mt-2 leading-relaxed text-zinc-500 font-mono text-[10px]">{friendlyError.details}</pre>
              </details>
              <button
                onClick={() => setFriendlyError(null)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-purple-500/10 transition-colors"
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