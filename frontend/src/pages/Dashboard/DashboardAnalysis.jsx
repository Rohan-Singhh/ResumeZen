import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeftIcon, DocumentTextIcon, ClipboardIcon, CheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useLocation, Link } from 'react-router-dom';

export default function DashboardAnalysis() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [resumeDetails, setResumeDetails] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'preview'
  
  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fileDetailsParam = params.get('fileDetails');
    const legacyFileUrl = params.get('fileUrl'); // Support for old URL format
    
    if (fileDetailsParam) {
      try {
        const details = JSON.parse(decodeURIComponent(fileDetailsParam));
        setResumeDetails(details);
        setResumeUrl(details.url);
      } catch (error) {
        console.error('Error parsing file details:', error);
      }
    } else if (legacyFileUrl) {
      // Handle legacy URL format
      setResumeUrl(legacyFileUrl);
    }
  }, [location.search]);

  // Copy URL to clipboard
  const copyToClipboard = (text = resumeUrl) => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // Handle direct PDF download
  const handleDownload = () => {
    if (resumeUrl) {
      // Create a hidden anchor element
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = resumeUrl;
      
      // Set the filename from stored details or a default
      const filename = resumeDetails?.fileName || 'resume.pdf';
      a.download = filename;
      
      // Add to DOM, trigger click, then remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Your Resume URL</h1>
          </div>
          {resumeDetails && (
            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-medium mr-2">File:</span> 
              {resumeDetails.fileName}
            </div>
          )}
        </div>
        
        {!resumeUrl && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
            No resume provided. Please upload a resume from the dashboard.
          </div>
        )}
      </div>
      
      {resumeUrl && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'url' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('url')}
            >
              URL Information
            </button>
            <button 
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'preview' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('preview')}
            >
              PDF Preview
            </button>
          </div>
          
          {activeTab === 'url' ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Cloudinary Resume URL</h2>
              <p className="text-gray-600 mb-6">
                You can use this URL to access your resume PDF or integrate it with other services.
              </p>
              
              {/* URL Display with copy button */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Full URL (for embedding or direct access)</h3>
                  <div className="relative">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-50 rounded-l-lg p-3 border border-gray-300 border-r-0 overflow-x-auto whitespace-nowrap text-gray-600 font-mono text-sm">
                        {resumeUrl}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(resumeUrl)}
                        className="bg-primary text-white px-4 py-3 rounded-r-lg flex items-center"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </motion.button>
                    </div>
                    {copied && (
                      <div className="absolute -bottom-8 left-0 text-green-600 text-sm font-medium">
                        Copied to clipboard!
                      </div>
                    )}
                  </div>
                </div>
                
                {resumeDetails && resumeDetails.publicId && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Cloudinary Public ID</h3>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-50 rounded-l-lg p-3 border border-gray-300 border-r-0 overflow-x-auto text-gray-600 font-mono text-sm">
                        {resumeDetails.publicId}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(resumeDetails.publicId)}
                        className="bg-primary text-white px-4 py-3 rounded-r-lg flex items-center"
                        title="Copy Public ID"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tips for using the URL */}
              <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-medium text-blue-700 mb-2">Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use this URL to embed your resume in websites or applications</li>
                  <li>• Share this URL directly with recruiters or employers</li>
                  <li>• Add this URL to your LinkedIn profile or personal website</li>
                  <li>• The URL is valid permanently unless you delete the file</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview Your Resume</h2>
              <div className="aspect-[3/4] border border-gray-300 rounded-lg overflow-hidden">
                {resumeUrl ? (
                  <div className="w-full h-full">
                    <iframe 
                      src={resumeUrl} 
                      title="Resume PDF" 
                      className="w-full h-full"
                      onError={(e) => {
                        // If iframe fails to load, show error message
                        const container = e.target.parentNode;
                        container.innerHTML = `
                          <div class="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-red-600 font-medium mb-2">Preview unavailable</p>
                            <p class="text-gray-600 text-sm mb-4">The PDF preview could not be loaded. This may be due to Cloudinary account restrictions.</p>
                            <a href="${resumeUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-primary text-white rounded-lg inline-flex items-center text-sm font-medium">
                              Download PDF Instead
                            </a>
                          </div>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <p className="text-gray-500">No PDF to preview</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <motion.a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary text-white rounded-lg inline-flex items-center"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Open in New Tab
            </motion.a>
            
            <motion.button
              onClick={handleDownload}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg inline-flex items-center"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Download PDF
            </motion.button>
            
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg inline-flex items-center"
            >
              Upload Another Resume
            </motion.a>
          </div>
        </div>
      )}
    </div>
  );
} 