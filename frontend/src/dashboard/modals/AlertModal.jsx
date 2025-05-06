import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, XMarkIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function AlertModal({ type, ...props }) {
  if (type === 'plan') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 text-yellow-600 mb-4">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <h3 className="text-xl font-semibold">No Checks Remaining</h3>
          </div>
          <p className="text-gray-600 mb-6">You've used all your resume checks. Purchase more checks to continue using our ATS optimization service.</p>
          <div className="flex justify-end gap-3">
            <button onClick={props.onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={props.onViewPlans} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">View Plans</button>
          </div>
        </div>
      </motion.div>
    );
  }
  if (type === 'unlimited') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <InformationCircleIcon className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Already on Unlimited Plan</h3>
          </div>
          <p className="text-gray-600 mb-6">You already have an active unlimited plan. You can continue using unlimited resume checks until your plan expires.</p>
          <div className="flex justify-end">
            <button onClick={props.onClose} className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg">Got it</button>
          </div>
        </div>
      </motion.div>
    );
  }
  if (type === 'loading') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="flex justify-center mb-6">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 text-primary">
              <ClockIcon className="w-16 h-16" />
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Analyzing Your Resume</h3>
          <p className="text-gray-600">Our AI is reviewing your resume for ATS optimization and generating detailed feedback...</p>
        </div>
      </motion.div>
    );
  }
  if (type === 'analysis') {
    const { analysisResult, onClose, clearUploadArea } = props;
    
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-semibold">Resume Analysis Complete</h3>
              <p className="text-gray-600">Here's how your resume performs against ATS systems</p>
            </div>
            <button onClick={() => {
              onClose();
              clearUploadArea && clearUploadArea();
            }} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-primary/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Overall ATS Score</h4>
                <span className="text-2xl font-bold text-primary">{analysisResult?.ats_score}</span>
              </div>
              <div className="space-y-4">
                {Object.entries(analysisResult?.improvement_areas || {}).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{key}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4">Suggestions for Improvement</h4>
              <ul className="space-y-3">
                {analysisResult?.suggestions?.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChartBarIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                onClose();
                clearUploadArea && clearUploadArea();
              }}
              className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (type === 'feedback') {
    const { selectedResume, onClose } = props;
    
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-semibold">Resume Feedback</h3>
              <p className="text-gray-600">{selectedResume?.file_name}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* ATS Score */}
            <div className="bg-primary/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">ATS Score</h4>
                <span className="text-2xl font-bold text-primary">{selectedResume?.ats_score}</span>
              </div>
              <div className="space-y-4">
                {Object.entries(selectedResume?.improvement_areas || {}).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{key}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4 text-green-700">Strengths</h4>
              <ul className="space-y-3">
                {selectedResume?.detailed_feedback?.strengths?.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-green-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4 text-red-700">Areas for Improvement</h4>
              <ul className="space-y-3">
                {selectedResume?.detailed_feedback?.weaknesses?.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-red-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Tips */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4 text-blue-700">Actionable Tips</h4>
              <ul className="space-y-3">
                {selectedResume?.detailed_feedback?.improvement_tips?.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChartBarIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={onClose} className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (type === 'success') {
    const { message } = props;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 bg-green-50 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
      >
        <CheckCircleIcon className="w-5 h-5" />
        <span>{message}</span>
      </motion.div>
    );
  }
  
  return null;
} 