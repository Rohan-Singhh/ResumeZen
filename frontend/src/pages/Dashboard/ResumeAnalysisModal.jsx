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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto relative flex flex-col items-center justify-center text-zinc-100"
          style={{ minHeight: '60vh' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 text-2xl font-bold focus:outline-none p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full max-w-md">
              {/* Animated Gradient App Icon */}
              <motion.div 
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-500 mb-6 flex items-center justify-center shadow-lg shadow-purple-500/10"
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
                    <svg className="h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
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
              <h3 className="text-xl font-bold text-center text-zinc-100 mb-6 font-display">
                {currentStep === 1 ? 'Getting ATS Score...' : 'Processing your resume'}
              </h3>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-zinc-800 rounded-full mb-8 overflow-hidden">
                <motion.div 
                  className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ boxShadow: currentStep === 1 ? '0 0 16px 4px rgba(168, 85, 247, 0.4)' : undefined }}
                />
              </div>
              {/* Completion Percentage */}
              <div className="text-lg font-bold text-purple-400 mb-8 font-mono">
                {progress}% completed
              </div>
              {/* Processing Steps */}
              <div className="w-full space-y-4">
                {processingSteps.map((step, index) => (
                  <motion.div key={index} className="flex items-center"
                    initial={false}
                    animate={currentStep === index ? { scale: 1.05, x: 6 } : { scale: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className={`w-3.5 h-3.5 rounded-full mr-3 flex-shrink-0 ${
                        currentStep > index
                          ? 'bg-green-500'
                          : currentStep === index
                            ? 'bg-purple-500 animate-pulse'
                            : 'bg-zinc-800'
                      }`}
                      animate={currentStep === index ? { scale: [1, 1.25, 1], boxShadow: '0 0 8px 2px rgba(168, 85, 247, 0.3)' } : {}}
                      transition={{ duration: 0.5, repeat: currentStep === index ? Infinity : 0, repeatType: 'reverse' }}
                    ></motion.div>
                    <span className={`text-sm ${
                      currentStep > index
                        ? 'text-green-400 font-medium'
                        : currentStep === index
                          ? 'text-purple-300 font-semibold'
                          : 'text-zinc-500'
                    }`}>
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-lg text-red-400 font-semibold mb-6">{error}</span>
              <button onClick={onClose} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-purple-500/10 transition-colors">Close</button>
            </div>
          ) : result ? (
            <div className="w-full text-sm">
              <div className="flex items-center gap-2 mb-6 w-full justify-center">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-lg font-display">
                  {typeof result.analysis?.atsScore === 'number' && result.analysis.atsScore > 0 ? `${result.analysis.atsScore}%` : 'NA'}
                </span>
                <span className="text-lg font-semibold text-purple-300">ATS Score</span>
                <div className="ml-2 h-4 w-32 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${typeof result.analysis?.atsScore === 'number' && result.analysis.atsScore > 0 ? result.analysis.atsScore : 0}%` }}
                  />
                </div>
              </div>
              <div className="mb-4 w-full text-zinc-300 space-y-1.5 border-b border-white/5 pb-4">
                <div><span className="font-semibold text-zinc-400">Email:</span> {result.contactInformation?.email || 'NA'}</div>
                <div><span className="font-semibold text-zinc-400">Phone:</span> {result.contactInformation?.phone || 'NA'}</div>
                <div><span className="font-semibold text-zinc-400">Location:</span> {result.contactInformation?.location || 'NA'}</div>
              </div>
              <div className="mb-4 w-full text-zinc-300 space-y-3 border-b border-white/5 pb-4">
                <div>
                  <span className="font-semibold text-purple-400 block mb-1.5">Technical Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.skills?.technical?.length ? result.skills.technical.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">{s}</span>
                    )) : 'NA'}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-green-400 block mb-1.5">Soft Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.skills?.soft?.length ? result.skills.soft.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-300 border border-green-500/20 text-xs font-semibold">{s}</span>
                    )) : 'NA'}
                  </div>
                </div>
              </div>
              <div className="mb-3 w-full text-zinc-300">
                <span className="font-semibold text-purple-400 block mb-1">Strengths:</span>
                <p className="text-zinc-300 text-xs leading-relaxed">{result.analysis?.strengths?.length ? result.analysis.strengths.join(', ') : 'NA'}</p>
              </div>
              <div className="mb-3 w-full text-zinc-300">
                <span className="font-semibold text-amber-400 block mb-1">Areas for Improvement:</span>
                <p className="text-zinc-300 text-xs leading-relaxed">{result.analysis?.areasForImprovement?.length ? result.analysis.areasForImprovement.join(', ') : 'NA'}</p>
              </div>
              <div className="mb-3 w-full text-zinc-300">
                <span className="font-semibold text-pink-400 block mb-1">ATS Keywords:</span>
                <p className="text-zinc-300 text-xs leading-relaxed">{result.analysis?.keywords?.length ? result.analysis.keywords.join(', ') : 'NA'}</p>
              </div>
              <div className="mb-1 w-full text-zinc-300">
                <span className="font-semibold text-zinc-400 block mb-1">Summary:</span>
                <p className="text-zinc-300 text-xs leading-relaxed">{result.summary || 'NA'}</p>
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 