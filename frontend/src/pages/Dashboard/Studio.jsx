import React, { useState, useEffect } from 'react';
import { getResumeHistory } from '../../services/resumeService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  SparklesIcon, 
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  LightBulbIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useResumeHistory } from '../../hooks/useResumeHistory';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Studio() {
  const [activeResume, setActiveResume] = useState(null);
  const navigate = useNavigate();
  
  const { data: history = [], isLoading: loading } = useResumeHistory();

  // Automatically select the latest resume if none is active
  useEffect(() => {
    if (history.length > 0 && !activeResume) {
      setActiveResume(history[0]);
    }
  }, [history, activeResume]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh] relative z-10">
        <div className="h-10 w-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 relative z-10">
      
      {/* LEFT SIDEBAR: History */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none" />
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-violet-400" />
            <h2 className="text-base font-bold text-zinc-100 font-display">Studio</h2>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="h-8 w-8 rounded-lg bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-glow-primary"
            title="Upload New Resume"
          >
            <PlusIcon className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative z-10">
          {history.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                <DocumentTextIcon className="h-6 w-6 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-400">No resumes analyzed yet</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-4 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
              >
                Upload your first resume →
              </button>
            </div>
          ) : (
            history.map((item) => {
              const isActive = activeResume?._id === item._id;
              const score = typeof item.analysis?.atsScore === 'number' ? item.analysis.atsScore : null;
              
              return (
                <button
                  key={item._id}
                  onClick={() => setActiveResume(item)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isActive 
                      ? 'bg-white/10 border-white/20 shadow-lg' 
                      : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-bold truncate font-display ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {item.contactInformation?.name || 'Unnamed Resume'}
                    </p>
                    {score !== null && (
                      <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded flex-shrink-0 ${
                        score >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                        score >= 40 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {score}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <ClockIcon className="h-3 w-3" />
                    {timeAgo(item.createdAt)}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN STAGE: Active Resume */}
      <div className="flex-1 bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {!activeResume ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative z-10">
            <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
              <SparklesIcon className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="text-2xl font-bold text-white font-display mb-2">Welcome to the Studio</h3>
            <p className="text-zinc-400 max-w-sm mx-auto mb-8">Select a resume from the sidebar to view its detailed AI analysis, or upload a new one to get started.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-glow-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" /> New Analysis
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-8 space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white font-display mb-1">{activeResume.contactInformation?.name || 'Unnamed Resume'}</h2>
                <p className="text-sm text-zinc-400">Analyzed on {new Date(activeResume.createdAt).toLocaleString()}</p>
              </div>
              {activeResume.resumeUrl && (
                <a 
                  href={activeResume.resumeUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-lg transition-colors border border-white/10 flex items-center gap-2"
                >
                  <DocumentTextIcon className="h-4 w-4" /> View Original PDF
                </a>
              )}
            </div>

            {/* ATS Score Showcase */}
            <div className="text-center py-8 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              <div className="relative z-10">
                <p className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest flex items-center justify-center gap-2">
                  <ChartBarIcon className="h-4 w-4" /> Overall ATS Match
                </p>
                <p className={`text-[80px] leading-none font-extrabold tabular-nums tracking-tighter font-display ${
                  (activeResume.analysis?.atsScore ?? 0) >= 70 ? 'text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-600' : 
                  (activeResume.analysis?.atsScore ?? 0) >= 40 ? 'text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-600' : 
                  'text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-rose-600'
                }`}>
                  {typeof activeResume.analysis?.atsScore === 'number' ? `${activeResume.analysis.atsScore}%` : 'N/A'}
                </p>
                {typeof activeResume.analysis?.atsScore === 'number' && (
                  <div className="mt-8 h-3 w-full max-w-sm bg-black/40 rounded-full mx-auto overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                      key={activeResume._id}
                      initial={{ width: 0 }}
                      animate={{ width: `${activeResume.analysis?.atsScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className={`h-full rounded-full ${
                        activeResume.analysis.atsScore >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                        activeResume.analysis.atsScore >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                        'bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      }`} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeResume.analysis?.strengths?.length > 0 && (
                <div className="bg-[#131318]/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <h4 className="text-sm font-bold text-emerald-400 font-display uppercase tracking-wide flex items-center gap-2 mb-4">
                    <CheckCircleIcon className="h-4 w-4" /> Strengths
                  </h4>
                  <ul className="space-y-3">
                    {activeResume.analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        <span className="leading-relaxed font-medium">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeResume.analysis?.areasForImprovement?.length > 0 && (
                <div className="bg-[#131318]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <h4 className="text-sm font-bold text-amber-400 font-display uppercase tracking-wide flex items-center gap-2 mb-4">
                    <LightBulbIcon className="h-4 w-4" /> Areas to Improve
                  </h4>
                  <ul className="space-y-3">
                    {activeResume.analysis.areasForImprovement.map((s, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                        </div>
                        <span className="leading-relaxed font-medium">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-zinc-200 mb-6 flex items-center gap-2 font-display uppercase tracking-wide">
                <SparklesIcon className="h-4 w-4 text-violet-400" /> Extracted Skills & Keywords
              </h4>
              
              {activeResume.skills?.technical?.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.skills.technical.map((s, i) => <Tag key={i} variant="primary">{s}</Tag>)}
                  </div>
                </div>
              )}
              {activeResume.skills?.soft?.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.skills.soft.map((s, i) => <Tag key={i} variant="secondary">{s}</Tag>)}
                  </div>
                </div>
              )}
              
              {activeResume.analysis?.missingKeywords?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-xs font-semibold text-amber-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <LightBulbIcon className="h-4 w-4" /> Suggested Keywords to Add
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.analysis.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function Tag({ children, variant = 'primary' }) {
  const styles = {
    primary: "bg-violet-500/10 border-violet-500/20 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.1)]",
    secondary: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
  };
  return (
    <span className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}
