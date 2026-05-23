import React, { useState, useEffect } from 'react';
import { processResume } from '../../services/resumeService';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ResumeAnalysisModal({ fileDetails, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const processingSteps = [
    "Reading document...",
    "Extracting text...",
    "Analyzing skills & experience...",
    "Calculating ATS score...",
    "Generating report..."
  ];

  useEffect(() => {
    if (open && fileDetails) {
      setLoading(true);
      setError(null);
      setResult(null);
      setProgress(0);
      setCurrentStep(0);
      
      // Fake progress for UI feedback while waiting for API
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95; // Wait at 95% until API returns
          return prev + (Math.random() * 5);
        });
      }, 300);
      
      // Advance steps roughly based on time
      const stepIntervals = [
        setTimeout(() => setCurrentStep(1), 1000),
        setTimeout(() => setCurrentStep(2), 2500),
        setTimeout(() => setCurrentStep(3), 4000),
        setTimeout(() => setCurrentStep(4), 5500)
      ];
      
      (async () => {
        try {
          const res = await processResume(fileDetails.url, { model: 'meta-llama/llama-3.3-70b-instruct:free' });
          if (res?.success && res?.data?.analysis?.structured) {
            setProgress(100);
            setCurrentStep(4);
            // Slight delay before showing success
            setTimeout(() => {
              setResult(res.data.analysis.structured);
              setLoading(false);
            }, 500);
          } else {
            setError(res?.error || 'Failed to analyze resume.');
            setLoading(false);
          }
        } catch (err) {
          setError(err?.response?.status === 403 
            ? 'Not enough credits. Please upgrade your plan.' 
            : err.message || 'Failed to analyze resume.');
          setLoading(false);
        } finally {
          clearInterval(progressInterval);
          stepIntervals.forEach(clearTimeout);
        }
      })();
    }
    
    if (!open) {
      setLoading(false);
      setError(null);
      setResult(null);
      setProgress(0);
      setCurrentStep(0);
    }
  }, [open, fileDetails]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={!loading ? onClose : undefined}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-sm w-full mx-auto" onClick={e => e.stopPropagation()}>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="mb-6 relative">
              <div className="h-16 w-16 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-zinc-400">{Math.round(progress)}%</span>
              </div>
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mb-2">Analyzing Resume</h3>
            <p className="text-sm text-zinc-500 h-5">{processingSteps[currentStep]}</p>
          </div>
        ) : error ? (
          <div className="text-center py-2">
            <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mb-2">Analysis Failed</h3>
            <p className="text-sm text-zinc-400 mb-6">{error}</p>
            <button 
              onClick={onClose}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        ) : result ? (
          <div className="text-center py-2">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mb-2">Analysis Complete</h3>
            <p className="text-sm text-zinc-400 mb-6">Your resume report is ready.</p>
            <button 
              onClick={onClose}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              View Report
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}