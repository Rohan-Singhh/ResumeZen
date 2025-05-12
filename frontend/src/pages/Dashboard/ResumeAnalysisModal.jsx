import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { processResume } from '../../services/resumeService';

export default function ResumeAnalysisModal({ fileDetails, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open && fileDetails) {
      setLoading(true);
      setError(null);
      setResult(null);
      (async () => {
        try {
          const res = await processResume(fileDetails.url, { model: 'meta-llama/llama-4-maverick:free' });
          if (res && res.success && res.data && res.data.analysis && res.data.analysis.structured) {
            setResult(res.data.analysis.structured);
          } else {
            setError(res.error || 'Failed to analyze resume.');
          }
        } catch (err) {
          setError(err.message || 'Failed to analyze resume.');
        } finally {
          setLoading(false);
        }
      })();
    }
    if (!open) {
      setLoading(false);
      setError(null);
      setResult(null);
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
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto relative flex flex-col items-center justify-center"
          style={{ minHeight: '60vh' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-500 mb-4"></div>
              <span className="text-lg text-gray-700">Analyzing your resume...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-lg text-red-600 font-semibold mb-2">{error}</span>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
            </div>
          ) : result ? (
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4 w-full justify-center">
                <span className="text-4xl font-extrabold text-purple-700 drop-shadow-lg">
                  {typeof result.analysis?.atsScore === 'number' && result.analysis.atsScore > 0 ? `${result.analysis.atsScore}%` : 'NA'}
                </span>
                <span className="text-lg font-semibold text-purple-500">ATS Score</span>
                <div className="ml-2 h-4 w-32 bg-purple-200 rounded-full overflow-hidden">
                  <div
                    className="h-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"
                    style={{ width: `${typeof result.analysis?.atsScore === 'number' && result.analysis.atsScore > 0 ? result.analysis.atsScore : 0}%` }}
                  />
                </div>
              </div>
              <div className="mb-2 w-full">
                <span className="font-semibold text-gray-700">Email:</span> {result.contactInformation?.email || 'NA'}<br />
                <span className="font-semibold text-gray-700">Phone:</span> {result.contactInformation?.phone || 'NA'}<br />
                <span className="font-semibold text-gray-700">Location:</span> {result.contactInformation?.location || 'NA'}
              </div>
              <div className="mb-2 w-full">
                <span className="font-semibold text-blue-700">Technical Skills:</span> {result.skills?.technical?.length ? result.skills.technical.join(', ') : 'NA'}<br />
                <span className="font-semibold text-green-700">Soft Skills:</span> {result.skills?.soft?.length ? result.skills.soft.join(', ') : 'NA'}
              </div>
              <div className="mb-2 w-full">
                <span className="font-semibold text-purple-700">Strengths:</span> {result.analysis?.strengths?.length ? result.analysis.strengths.join(', ') : 'NA'}
              </div>
              <div className="mb-2 w-full">
                <span className="font-semibold text-yellow-700">Areas for Improvement:</span> {result.analysis?.areasForImprovement?.length ? result.analysis.areasForImprovement.join(', ') : 'NA'}
              </div>
              <div className="mb-2 w-full">
                <span className="font-semibold text-pink-700">ATS Keywords:</span> {result.analysis?.keywords?.length ? result.analysis.keywords.join(', ') : 'NA'}
              </div>
              <div className="mb-2 w-full">
                <span className="font-semibold text-gray-700">Summary:</span> {result.summary || 'NA'}
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 