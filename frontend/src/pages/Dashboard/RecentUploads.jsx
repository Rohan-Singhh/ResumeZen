import React, { useEffect, useState } from 'react';
import { getResumeHistory } from '../../services/resumeService';
import { motion, AnimatePresence } from 'framer-motion';

const motivationalQuotes = [
  "You're one step closer to standing out!",
  "Your resume is about to get a professional boost!",
  "Success is where preparation and opportunity meet.",
  "Every second spent improving your resume is an investment in your future.",
  "The best resumes tell a story. Let's make yours compelling!"
];

export default function RecentUploads() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [quote, setQuote] = useState(motivationalQuotes[0]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getResumeHistory();
        setHistory(data);
      } catch (err) {
        setError('Failed to fetch resume history.');
      } finally {
        setLoading(false);
    }
    };
    fetchHistory();
  }, []);

  // Rotate motivational quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(q => {
        const idx = motivationalQuotes.indexOf(q);
        return motivationalQuotes[(idx + 1) % motivationalQuotes.length];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-lg font-semibold">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500 font-semibold">{error}</div>;
  }
  if (!history.length) {
    return <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span className="text-lg">No resume analysis history found.</span>
    </div>;
    }

  return (
    <div className="p-6 relative">
      <motion.div
        className="mb-8 flex flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <span className="text-2xl font-bold text-blue-600 animate-pulse mb-2">🚀 Recent Resume Analyses</span>
        <span className="text-lg text-gray-700 italic animate-fade-in-slow">{quote}</span>
      </motion.div>
      <div className={modalItem ? "filter blur-sm pointer-events-none select-none" : ""}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => {
            const atsScore = typeof item.analysis?.atsScore === 'number'
              ? item.analysis.atsScore
              : null;
            return (
              <motion.div
                key={item._id}
                layout
                initial={{ borderRadius: 20 }}
                className={`relative bg-gradient-to-br from-blue-50 to-purple-100 shadow-xl rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 border-transparent hover:scale-102`}
                onClick={() => setModalItem(item)}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-blue-700">{item.contactInformation?.name || 'NA'}</span>
                  <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl font-extrabold text-purple-700 drop-shadow-lg">
                    {atsScore !== null ? `${atsScore}%` : 'NA'}
                  </span>
                  <span className="text-sm font-semibold text-purple-500">ATS Score</span>
                  <motion.div
                    className="ml-2 h-3 w-24 bg-purple-200 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: '6rem' }}
                    transition={{ duration: 0.7 }}
              >
                    <motion.div
                      className="h-3 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"
                      style={{ width: `${atsScore || 0}%` }}
                    />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 right-4 text-xs text-blue-400 font-semibold animate-bounce"
                >
                  Click for details
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {modalItem && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            onClick={e => {
              if (e.target === e.currentTarget) setModalItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto relative flex flex-col items-center justify-center"
              style={{ minHeight: '60vh' }}
              onClick={e => e.stopPropagation()}
            >
            <button 
                onClick={() => setModalItem(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                aria-label="Close"
            >
                &times;
            </button>
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-bold text-lg text-blue-700">{modalItem.contactInformation?.name || 'NA'}</span>
                  <span className="text-xs text-gray-500">{new Date(modalItem.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mb-4 w-full justify-center">
                  <span className="text-4xl font-extrabold text-purple-700 drop-shadow-lg">
                    {typeof modalItem.analysis?.atsScore === 'number' ? `${modalItem.analysis.atsScore}%` : 'NA'}
                  </span>
                  <span className="text-lg font-semibold text-purple-500">ATS Score</span>
                  <div className="ml-2 h-4 w-32 bg-purple-200 rounded-full overflow-hidden">
                    <div
                      className="h-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"
                      style={{ width: `${typeof modalItem.analysis?.atsScore === 'number' ? modalItem.analysis.atsScore : 0}%` }}
                    />
                  </div>
                </div>
                <div className="mb-2 w-full">
                  <span className="font-semibold text-gray-700">Email:</span> {modalItem.contactInformation?.email || 'NA'}<br />
                  <span className="font-semibold text-gray-700">Phone:</span> {modalItem.contactInformation?.phone || 'NA'}<br />
                  <span className="font-semibold text-gray-700">Location:</span> {modalItem.contactInformation?.location || 'NA'}
                </div>
                <div className="mb-2 w-full">
                  <span className="font-semibold text-blue-700">Technical Skills:</span> {modalItem.skills?.technical?.length ? modalItem.skills.technical.join(', ') : 'NA'}<br />
                  <span className="font-semibold text-green-700">Soft Skills:</span> {modalItem.skills?.soft?.length ? modalItem.skills.soft.join(', ') : 'NA'}
                </div>
                <div className="mb-2 w-full">
                  <span className="font-semibold text-purple-700">Strengths:</span> {modalItem.analysis?.strengths?.length ? modalItem.analysis.strengths.join(', ') : 'NA'}
                </div>
                <div className="mb-2 w-full">
                  <span className="font-semibold text-yellow-700">Areas for Improvement:</span> {modalItem.analysis?.areasForImprovement?.length ? modalItem.analysis.areasForImprovement.join(', ') : 'NA'}
                  </div>
                <div className="mb-2 w-full">
                  <span className="font-semibold text-pink-700">ATS Keywords:</span> {modalItem.analysis?.keywords?.length ? modalItem.analysis.keywords.join(', ') : 'NA'}
              </div>
                <div className="mb-2 w-full">
                  <span className="font-semibold text-gray-700">Summary:</span> {modalItem.summary || 'NA'}
            </div>
                <div className="flex gap-2 mt-2 w-full justify-center">
                  <a
                    href={modalItem.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-semibold shadow"
            >
                    View/Download Resume
                  </a>
          </div>
        </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
} 