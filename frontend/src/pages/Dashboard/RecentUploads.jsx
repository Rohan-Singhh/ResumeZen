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
        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-display mb-2">🚀 Recent Resume Analyses</span>
        <span className="text-sm text-zinc-400 italic text-center max-w-xl">"{quote}"</span>
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
                className={`relative bg-zinc-900/30 border border-white/10 rounded-2xl p-6 cursor-pointer backdrop-blur-md transition-all duration-300 hover:border-purple-500/30`}
                onClick={() => setModalItem(item)}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-zinc-200">{item.contactInformation?.name || 'NA'}</span>
                  <span className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl font-extrabold text-purple-300 drop-shadow-lg">
                    {atsScore !== null ? `${atsScore}%` : 'NA'}
                  </span>
                  <span className="text-sm font-semibold text-purple-400">ATS Score</span>
                  <motion.div
                    className="ml-2 h-3 w-24 bg-zinc-800 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: '6rem' }}
                    transition={{ duration: 0.7 }}
                  >
                    <motion.div
                      className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${atsScore || 0}%` }}
                    />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 right-4 text-xs text-purple-400 font-semibold"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={e => {
              if (e.target === e.currentTarget) setModalItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto relative flex flex-col items-center justify-center text-zinc-200"
              style={{ minHeight: '60vh' }}
              onClick={e => e.stopPropagation()}
            >
            <button 
                onClick={() => setModalItem(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 text-2xl font-bold focus:outline-none p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close"
            >
                &times;
            </button>
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center justify-between w-full mb-4 border-b border-white/5 pb-2">
                  <span className="font-bold text-lg text-purple-300">{modalItem.contactInformation?.name || 'NA'}</span>
                  <span className="text-xs text-zinc-400">{new Date(modalItem.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mb-6 w-full justify-center">
                  <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-lg">
                    {typeof modalItem.analysis?.atsScore === 'number' ? `${modalItem.analysis.atsScore}%` : 'NA'}
                  </span>
                  <span className="text-lg font-semibold text-purple-300">ATS Score</span>
                  <div className="ml-2 h-4 w-32 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${typeof modalItem.analysis?.atsScore === 'number' ? modalItem.analysis.atsScore : 0}%` }}
                    />
                  </div>
                </div>
                <div className="mb-4 w-full text-sm space-y-1">
                  <div><span className="font-semibold text-zinc-400">Email:</span> <span className="text-zinc-200">{modalItem.contactInformation?.email || 'NA'}</span></div>
                  <div><span className="font-semibold text-zinc-400">Phone:</span> <span className="text-zinc-200">{modalItem.contactInformation?.phone || 'NA'}</span></div>
                  <div><span className="font-semibold text-zinc-400">Location:</span> <span className="text-zinc-200">{modalItem.contactInformation?.location || 'NA'}</span></div>
                </div>
                <div className="mb-4 w-full text-sm space-y-2">
                  <div><span className="font-semibold text-purple-400">Technical Skills:</span> <span className="text-zinc-200">{modalItem.skills?.technical?.length ? modalItem.skills.technical.join(', ') : 'NA'}</span></div>
                  <div><span className="font-semibold text-green-400">Soft Skills:</span> <span className="text-zinc-200">{modalItem.skills?.soft?.length ? modalItem.skills.soft.join(', ') : 'NA'}</span></div>
                </div>
                <div className="mb-2 w-full text-sm">
                  <span className="font-semibold text-purple-400">Strengths:</span>
                  <p className="text-zinc-300 mt-0.5">{modalItem.analysis?.strengths?.length ? modalItem.analysis.strengths.join(', ') : 'NA'}</p>
                </div>
                <div className="mb-2 w-full text-sm">
                  <span className="font-semibold text-amber-400">Areas for Improvement:</span>
                  <p className="text-zinc-300 mt-0.5">{modalItem.analysis?.areasForImprovement?.length ? modalItem.analysis.areasForImprovement.join(', ') : 'NA'}</p>
                  </div>
                <div className="mb-2 w-full text-sm">
                  <span className="font-semibold text-pink-400">ATS Keywords:</span>
                  <p className="text-zinc-300 mt-0.5">{modalItem.analysis?.keywords?.length ? modalItem.analysis.keywords.join(', ') : 'NA'}</p>
              </div>
                <div className="mb-6 w-full text-sm">
                  <span className="font-semibold text-zinc-400">Summary:</span>
                  <p className="text-zinc-300 mt-0.5">{modalItem.summary || 'NA'}</p>
            </div>
                <div className="flex gap-2 mt-2 w-full justify-center">
                  <a
                    href={modalItem.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-colors text-sm font-semibold shadow-md shadow-purple-500/10"
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