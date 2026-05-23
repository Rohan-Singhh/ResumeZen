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
      className={`bg-zinc-900/30 rounded-xl p-5 border-2 ${
        isDragging ? 'border-purple-500 border-dashed bg-purple-500/5' : 'border-white/10'
      } transition-all relative backdrop-blur-md`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      whileHover={{ boxShadow: '0 8px 30px rgba(168, 85, 247, 0.05)' }}
      transition={{ duration: 0.3 }}
      animate={isDragging ? 
        { borderColor: ['#a855f7', '#ec4899', '#a855f7'], borderWidth: '2px' } : 
        { borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: '2px' }
      }
    >
      {/* Error message display */}
      {errorMessage && (
        <div className="bg-red-950/20 border-l-4 border-red-500 p-3 mb-4 rounded flex items-center">
          <span className="text-red-400 text-sm">{errorMessage}</span>
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
              <svg className="animate-spin h-16 w-16 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-purple-400">
                {uploadProgress}%
              </div>
            </div>
            <p className="mt-2 text-sm text-zinc-400">Uploading your resume...</p>
          </div>
        ) : (
          <motion.div 
            className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
            animate={isDragging ? 
              { backgroundColor: 'rgba(168, 85, 247, 0.2)', y: [0, -8, 0] } : 
              uploadSuccess ?
              { backgroundColor: 'rgba(16, 185, 129, 0.1)', y: 0 } :
              { backgroundColor: 'rgba(168, 85, 247, 0.1)', y: 0 }
            }
            transition={{ 
              y: { repeat: isDragging ? Infinity : 0, duration: 1 },
              backgroundColor: { duration: 0.3 }
            }}
          >
            <DocumentTextIcon 
              className={`h-8 w-8 ${uploadSuccess ? 'text-green-400' : 'text-purple-400'}`} 
            />
          </motion.div>
        )}
        <h4 className="text-lg font-semibold text-zinc-100 mb-2">
          {isUploading ? 'Uploading Your Resume...' :
            uploadSuccess ? 'Resume Uploaded Successfully!' : 'Drag & Drop your resume here'}
        </h4>
        <p className="text-zinc-400 mb-4 text-sm max-w-md text-center">
          {isUploading ? 'Please wait while we process your file.' :
            uploadSuccess ? 
            'Your resume is ready for analysis. Click the button below to continue.' : 
            'Upload your resume in PDF format (max 1MB) to analyze it and get detailed feedback'}
        </p>
        {/* Only show Choose File button when not uploading and no file uploaded yet */}
        {!uploadSuccess && !isUploading && !selectedFile && (
          <motion.label 
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg cursor-pointer hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/10 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2 text-white" />
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
            <div className="flex items-center p-3 border border-white/5 rounded-lg w-full max-w-md mb-4 bg-zinc-950/50">
              <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center mr-3">
                <DocumentTextIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="font-semibold text-zinc-200 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-zinc-400">
                  {Math.round((selectedFile.size) / 1024)} KB • PDF
                </p>
              </div>
            </div>
            <motion.button
              onClick={onUploadButtonClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-500/10"
              disabled={!canUpload}
            >
              Upload to Continue
            </motion.button>
          </div>
        )}
        {/* Show Analyze Resume button only after uploadSuccess, never auto-advance */}
        {uploadSuccess && (
          <motion.div 
            className="flex items-center p-3 border border-green-500/20 rounded-lg w-full max-w-md mb-4 bg-green-950/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center mr-3">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-semibold text-zinc-200 truncate">
                {uploadedFile?.originalName || uploadedFile?.name}
              </p>
              <p className="text-xs text-zinc-400">
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
            className={`px-5 py-2.5 rounded-lg font-semibold mt-4 ${
              isProcessing
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : !hasCreditsRemaining()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/10'
            } transition-colors relative`}
          >
            {isProcessing ? (
              <>
                <span className="opacity-0">Processing...</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
