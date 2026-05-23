import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getResumeHistory } from '../../services/resumeService';
import { DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import ResumeDetailModal from './ResumeDetailModal';

export default function RecentUploads() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getResumeHistory();
        setHistory(data);
        
        // Check if we navigated here from the dashboard with a specific item to open
        if (location.state?.openModalId) {
          const itemToOpen = data.find(item => item._id === location.state.openModalId);
          if (itemToOpen) {
            setModalItem(itemToOpen);
          }
        }
      } catch {
        setError('Failed to fetch resume history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getScoreColorInfo = (score) => {
    if (score === null || score === undefined) return { bg: 'bg-zinc-800', border: 'border-zinc-700', text: 'text-zinc-500', bar: 'bg-zinc-700' };
    if (score >= 70) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', bar: 'bg-gradient-to-r from-emerald-500 to-teal-400' };
    if (score >= 40) return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', bar: 'bg-gradient-to-r from-amber-500 to-orange-400' };
    return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', bar: 'bg-gradient-to-r from-red-500 to-rose-400' };
  };

  if (loading) {
    return (
      <div className="space-y-8 relative z-10">
        <div><h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight">Upload History</h1></div>
        <div className="flex items-center justify-center h-64 bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl">
          <div className="h-10 w-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 relative z-10">
        <div><h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight">Upload History</h1></div>
        <div className="px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-medium text-red-400 backdrop-blur-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative z-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight">Upload History</h1>
        <p className="text-base text-zinc-400 mt-2 font-light">Review your past {history.length} {history.length === 1 ? 'analysis' : 'analyses'} and track your improvement</p>
      </motion.div>

      {/* Empty state */}
      {history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
              <DocumentTextIcon className="h-10 w-10 text-zinc-600" />
            </div>
            <p className="text-xl font-bold text-zinc-200 mb-2 font-display">No resumes analyzed yet</p>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">Upload a resume from the dashboard to get deep ATS insights and missing keyword analysis.</p>
          </div>
        </motion.div>
      ) : (
        /* Data table */
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_80px] gap-4 px-6 py-4 bg-black/20 border-b border-white/5 relative z-10">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Document Name</span>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Date Analyzed</span>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">ATS Score</span>
            <span></span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5 relative z-10">
            {history.map((item, index) => {
              const score = typeof item.analysis?.atsScore === 'number' ? item.analysis.atsScore : null;
              const colorInfo = getScoreColorInfo(score);
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (index * 0.05) }}
                  className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_80px] gap-3 sm:gap-4 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => setModalItem(item)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-violet-500/20 group-hover:border-violet-500/30 transition-colors flex-shrink-0">
                      <DocumentTextIcon className="h-5 w-5 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-200 truncate font-display tracking-wide">{item.contactInformation?.name || 'Unnamed Resume'}</p>
                      <p className="text-xs text-zinc-500 truncate sm:hidden flex items-center gap-1 mt-1">
                        <CalendarIcon className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex items-center text-sm text-zinc-400">
                    <CalendarIcon className="h-4 w-4 mr-2 opacity-50" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="self-center">
                    {score !== null ? (
                      <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 rounded-md text-xs font-bold tabular-nums border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}>
                          {score}%
                        </div>
                        <div className="hidden md:block flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[100px]">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${score}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${colorInfo.bar}`} 
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-zinc-600 font-medium bg-white/5 px-3 py-1 rounded-md border border-white/5">Pending</span>
                    )}
                  </div>
                  
                  <div className="hidden sm:flex items-center justify-end">
                    <button className="text-xs font-semibold text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-500/30 px-3 py-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                      Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Detail modal */}
      <ResumeDetailModal modalItem={modalItem} onClose={() => setModalItem(null)} />
    </div>
  );
}