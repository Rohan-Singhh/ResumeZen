import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { processResume } from '../../services/resumeService';

export default function ResumeAnalysisModal({ fileDetails, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [finalStepAnimated, setFinalStepAnimated] = useState(false);
  
  const processingSteps = [
    "Reading your resume",
    "Getting ATS Score",
    "Filling in your contact details",
    "Adding your experience and education",
    "Finishing up"
  ];

  useEffect(() => {
    if (open && fileDetails) {
      setLoading(true);
      setError(null);
      setResult(null);
      setProgress(0);
      setCurrentStep(0);
      setFinalStepAnimated(false);
      
      // Simulate progress steps
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 3;
        });
      }, 120);
      
      // Simulate steps progression
      const stepIntervals = [
        setTimeout(() => setCurrentStep(1), 1200), // Getting ATS Score
        setTimeout(() => setCurrentStep(2), 2200),
        setTimeout(() => setCurrentStep(3), 3200),
        setTimeout(() => setCurrentStep(4), 4200)
      ];
      
      // Actual API call
      (async () => {
        try {
          const res = await processResume(fileDetails.url, { model: 'meta-llama/llama-4-maverick:free' });
          if (res && res.success && res.data && res.data.analysis && res.data.analysis.structured) {
            setProgress(100);
            setCurrentStep(4);
            // Animate the final step (pulse/check)
            setTimeout(() => {
              setFinalStepAnimated(true);
              setTimeout(() => {
                setResult(res.data.analysis.structured);
                setLoading(false);
              }, 800);
            }, 600);
          } else {
            setError(res.error || 'Failed to analyze resume.');
            setLoading(false);
          }
        } catch (err) {
          if (err.response && err.response.status === 403) {
            setError('You do not have an active plan or enough credits. Please purchase a plan or check your credits.');
          } else {
            setError(err.message || 'Failed to analyze resume.');
          }
          setLoading(false);
        } finally {
          clearInterval(progressInterval);
          stepIntervals.forEach(interval => clearTimeout(interval));
        }
      })();
    }
    
    if (!open) {
      setLoading(false);
      setError(null);
      setResult(null);
      setProgress(0);
      setCurrentStep(0);
      setFinalStepAnimated(false);
    }
  }, [open, fileDetails]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-bg"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto relative flex flex-col items-center justify-center dark:bg-gray-900"
          style={{ minHeight: '60vh' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none dark:hover:text-gray-300"
            aria-label="Close"
          >
            &times;
          </button>
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full max-w-md">
              {/* Animated Gradient App Icon */}
              <motion.div 
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-300 to-orange-400 mb-6 flex items-center justify-center"
                initial={{ scale: 0.9 }}
                animate={{ scale: [0.9, 1.05, 0.95, 1], rotate: [0, 2, -2, 0] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
              >
                <motion.div
                  className="flex flex-col items-end"
                  animate={currentStep === 1 ? { y: [0, -8, 0], scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.8, repeat: currentStep === 1 ? Infinity : 0, repeatType: 'reverse' }}
                >
                  <div className="w-2 h-2 bg-white rounded-full mb-1.5"></div>
                  <div className="w-8 h-2 bg-white rounded-full mb-1.5"></div>
                  <div className="w-2 h-2 bg-white rounded-full mb-1.5"></div>
                  <div className="w-8 h-2 bg-white rounded-full mb-1.5"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-8 h-2 bg-white rounded-full mt-1.5"></div>
                </motion.div>
                {/* Checkmark pulse for final step */}
                {finalStepAnimated && (
                  <motion.div
                    className="absolute flex items-center justify-center w-24 h-24"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: [0.7, 1.2, 1], opacity: [0, 1, 1] }}
                    transition={{ duration: 0.7 }}
                  >
                    <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
              {/* Processing Text */}
              <h3 className="text-xl font-medium text-center text-gray-700 mb-6 dark:text-gray-200">
                {currentStep === 1 ? 'Getting ATS Score...' : 'Processing your resume'}
              </h3>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full mb-8 dark:bg-gray-700 overflow-hidden">
                <motion.div 
                  className="h-2 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ boxShadow: currentStep === 1 ? '0 0 16px 4px #a78bfa' : undefined }}
                />
              </div>
              {/* Completion Percentage */}
              <div className="text-lg font-bold text-purple-600 mb-8 dark:text-purple-400">
                {progress}% completed
              </div>
              {/* Processing Steps */}
              <div className="w-full space-y-4">
                {processingSteps.map((step, index) => (
                  <motion.div key={index} className="flex items-center"
                    initial={false}
                    animate={currentStep === index ? { scale: 1.08, x: 8 } : { scale: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                        currentStep > index
                          ? 'bg-green-500 dark:bg-green-400'
                          : currentStep === index
                            ? 'bg-purple-600 dark:bg-purple-500 animate-pulse'
                            : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      animate={currentStep === index ? { scale: [1, 1.3, 1], boxShadow: '0 0 8px 2px #a78bfa' } : {}}
                      transition={{ duration: 0.5, repeat: currentStep === index ? Infinity : 0, repeatType: 'reverse' }}
                    ></motion.div>
                    <span className={`${
                      currentStep > index
                        ? 'text-green-700 dark:text-green-400'
                        : currentStep === index
                          ? 'text-purple-700 dark:text-purple-300 font-semibold'
                          : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-lg text-red-600 font-semibold mb-2 dark:text-red-400">{error}</span>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">Close</button>
            </div>
          ) : result ? (
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4 w-full justify-center">
                <span className="text-4xl font-extrabold text-purple-700 drop-shadow-lg dark:text-purple-400">
                  {typeof result.analysis?.atsScore === 'number' && result.analysis.atsScore > 0 ? `${result.analysis.atsScore}%` : 'NA'}
                </span>
                <span className="text-lg font-semibold text-purple-500 dark:text-purple-300">ATS Score</span>
                <div className="ml-2 h-4 w-32 bg-purple-200 rounded-full overflow-hidden dark:bg-purple-900">
                  <div
                    className="h-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"
                    style={{ width: `${typeof result.analysis?.atsScore === 'number' && result.analysis.atsScore > 0 ? result.analysis.atsScore : 0}%` }}
                  />
                </div>
              </div>
              <div className="mb-2 w-full dark:text-gray-200">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> {result.contactInformation?.email || 'NA'}<br />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Phone:</span> {result.contactInformation?.phone || 'NA'}<br />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Location:</span> {result.contactInformation?.location || 'NA'}
              </div>
              <div className="mb-2 w-full dark:text-gray-200">
                <span className="font-semibold text-blue-700 dark:text-blue-400">Technical Skills:</span> {result.skills?.technical?.length ? result.skills.technical.join(', ') : 'NA'}<br />
                <span className="font-semibold text-green-700 dark:text-green-400">Soft Skills:</span> {result.skills?.soft?.length ? result.skills.soft.join(', ') : 'NA'}
              </div>
              <div className="mb-2 w-full dark:text-gray-200">
                <span className="font-semibold text-purple-700 dark:text-purple-400">Strengths:</span> {result.analysis?.strengths?.length ? result.analysis.strengths.join(', ') : 'NA'}
              </div>
              <div className="mb-2 w-full dark:text-gray-200">
                <span className="font-semibold text-yellow-700 dark:text-yellow-400">Areas for Improvement:</span> {result.analysis?.areasForImprovement?.length ? result.analysis.areasForImprovement.join(', ') : 'NA'}
              </div>
              <div className="mb-2 w-full dark:text-gray-200">
                <span className="font-semibold text-pink-700 dark:text-pink-400">ATS Keywords:</span> {result.analysis?.keywords?.length ? result.analysis.keywords.join(', ') : 'NA'}
              </div>
              <div className="mb-2 w-full dark:text-gray-200">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Summary:</span> {result.summary || 'NA'}
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 