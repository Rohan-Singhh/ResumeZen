import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import * as pdfUtils from '../../utils/pdfUtils';

export default function ResumeAnalysis() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeFileInfo, setResumeFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [pdfUrlState, setPdfUrlState] = useState(null);
  
  // Get resume details from sessionStorage and URL params as fallback
  useEffect(() => {
    // First try to get from sessionStorage (primary source)
    const storedDetails = sessionStorage.getItem('resumeDetails');
    
    if (storedDetails) {
      try {
        const details = JSON.parse(storedDetails);
        console.log('Using stored resume details:', details);
        
        // Validate details object has required fields
        if (!details.url && !details.cloudinaryUrl && !details.fallbackUrl && !details.publicId) {
          throw new Error('Missing URL in stored details');
        }
        
        // If we have a publicId but no URLs, generate them now
        if (details.publicId && (!details.url && !details.cloudinaryUrl)) {
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'resumezen';
          const pdfUrls = pdfUtils.generatePdfUrls(details.publicId, cloudName);
          details.downloadUrl = pdfUrls.proxyUrl;
          details.viewUrl = pdfUrls.imageViewUrl;
          details.cloudinaryUrl = pdfUrls.imageDownloadUrl;
        }
        
        // Prepare the best URL for viewing
        // Priority: downloadUrl (our backend proxy) > url > cloudinaryUrl > fallbackUrl
        const bestUrl = details.downloadUrl || 
                       pdfUtils.getProxyUrl(details.publicId) || 
                       details.url || 
                       details.cloudinaryUrl || 
                       details.fallbackUrl;
        
        setResumeFileInfo({
          ...details,
          url: bestUrl,
          fileName: details.originalName || 'resume.pdf'
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error parsing stored resume details:', error);
        setError('Invalid stored file details: ' + error.message);
        fallbackToUrlParams();
      }
    } else {
      fallbackToUrlParams();
    }
  }, []);
  
  // Fallback to URL parameters if sessionStorage fails
  const fallbackToUrlParams = () => {
    const params = new URLSearchParams(location.search);
    const fileDetailsParam = params.get('fileDetails');
    
    if (fileDetailsParam) {
      try {
        const details = JSON.parse(decodeURIComponent(fileDetailsParam));
        console.log('Parsed file details from URL:', details);
        
        // Validate details object has required fields
        if (!details.url && !details.publicId) {
          throw new Error('Missing URL or publicId in file details');
        }
        
        // If we have a publicId but no URL, generate a backend URL
        if (details.publicId && !details.url) {
          details.url = pdfUtils.formatProxyUrl(details.publicId);
        }
        
        setResumeFileInfo(details);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing file details from URL:', error);
        setError('Invalid file details provided: ' + error.message);
        setLoading(false);
      }
    } else {
      setError('No resume file information provided');
      setLoading(false);
    }
  };
  
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
  
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </motion.div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Resume View</h1>
          </div>
          {resumeFileInfo && (
            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-medium mr-2">File:</span> 
              {resumeFileInfo.fileName || resumeFileInfo.originalName || 'resume.pdf'}
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading resume</p>
              <p className="mt-1 text-sm">{error}</p>
              <Link to="/dashboard" className="mt-3 inline-block text-sm text-primary hover:underline">
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
      
      {/* PDF Info Section */}
      {resumeFileInfo && pdfUrlState && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Resume PDF</h2>
            <p className="text-gray-500 text-sm mt-1">
              {resumeFileInfo.publicId ? `ID: ${resumeFileInfo.publicId}` : 'Your uploaded resume'}
            </p>
          </div>
          
          {/* URL Display Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-hidden break-all">
                <p className="text-sm font-medium text-gray-700 mb-1">Universal URL (works across all services):</p>
                {resumeFileInfo && resumeFileInfo.publicId ? (
                  <a 
                    href={pdfUtils.getUniversalPdfUrl(resumeFileInfo)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {pdfUtils.getUniversalPdfUrl(resumeFileInfo)}
                  </a>
                ) : (
                  <a 
                    href={pdfUrlState} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {pdfUrlState}
                  </a>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  You can copy this URL to share it with other services.
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <motion.a
                  href={resumeFileInfo && resumeFileInfo.publicId ? 
                    pdfUtils.getUniversalPdfUrl(resumeFileInfo) : 
                    pdfUtils.getDownloadUrl(pdfUrlState)}
                  download
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-1.5" />
                  Download
                </motion.a>
              </div>
            </div>
            
            {/* File Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">File Name</p>
                <p className="text-sm font-medium truncate">{resumeFileInfo.fileName || resumeFileInfo.originalName || 'resume.pdf'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">File Size</p>
                <p className="text-sm font-medium">{resumeFileInfo.fileSize ? `${Math.round(resumeFileInfo.fileSize / 1024)} KB` : 'Unknown'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Upload Date</p>
                <p className="text-sm font-medium">{resumeFileInfo.lastActivity ? new Date(resumeFileInfo.lastActivity).toLocaleString() : 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg"
          >
            Back to Dashboard
          </motion.button>
        </Link>
      </div>
    </div>
  );
} 