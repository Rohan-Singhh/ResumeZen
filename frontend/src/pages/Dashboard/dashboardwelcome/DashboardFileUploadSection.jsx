import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * DashboardFileUploadSection
 * @param {Object} props
 * @param {boolean} props.isDragging
 * @param {boolean} props.isUploading
 * @param {boolean} props.uploadSuccess
 * @param {number} props.uploadProgress
 * @param {Object} props.selectedFile
 * @param {Object} props.uploadedFile
 * @param {boolean} props.isProcessing
 * @param {Function} props.handleDragEnter
 * @param {Function} props.handleDragLeave
 * @param {Function} props.handleDragOver
 * @param {Function} props.handleDrop
 * @param {Function} props.handleFileChange
 * @param {Function} props.confirmCreditUsage
 * @param {Function} props.handleProceed
 * @param {Function} props.hasCreditsRemaining
 * @param {Function} props.onUploadButtonClick
 * @param {Object} props.activePlan
 * @param {string} props.errorMessage
 * @param {Function} props.setErrorMessage
 */
const DashboardFileUploadSection = ({
  isDragging,
  isUploading,
  uploadSuccess,
  uploadProgress,
  selectedFile,
  uploadedFile,
  isProcessing,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileChange,
  confirmCreditUsage,
  handleProceed,
  hasCreditsRemaining,
  onUploadButtonClick,
  activePlan,
  errorMessage,
  setErrorMessage
}) => {
  const fileInputRef = useRef(null);
  const uploadBoxRef = useRef(null);

  // Helper: is user eligible to upload?
  const canUpload = !!activePlan && (activePlan.planId.isUnlimited || activePlan.creditsLeft > 0);

  return (
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
      {/* Error message display */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded flex items-center">
          <span className="text-red-700 text-sm">{errorMessage}</span>
        </div>
      )}
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
        {/* Show Upload to Continue button only after file selection, before upload */}
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
              onClick={onUploadButtonClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-blue-600 transition-colors"
              disabled={!canUpload}
            >
              Upload to Continue
            </motion.button>
          </div>
        )}
        {/* Show Analyze Resume button only after uploadSuccess, never auto-advance */}
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
  );
};

export default DashboardFileUploadSection;
