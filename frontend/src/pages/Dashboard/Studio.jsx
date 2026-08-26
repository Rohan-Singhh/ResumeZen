import React, { useState, useEffect, useMemo } from 'react';
import { normalizeAnalysis } from '../../utils/analysisSchema';
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
import { timeAgo } from '../../utils/timeAgo';

export default function Studio() {
  const [activeResume, setActiveResume] = useState(null);
  const navigate = useNavigate();
  
  const { data: rawHistory = [], isLoading: loading } = useResumeHistory();

  // Normalize once so this page reads the same canonical shape as the overview
  const history = useMemo(() => rawHistory.map(normalizeAnalysis), [rawHistory]);

  // Automatically select the latest resume if none is active
  useEffect(() => {
    if (history.length > 0 && !activeResume) {
      setActiveResume(history[0]);
    }
  }, [history, activeResume]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 relative z-10">
      
      {/* LEFT SIDEBAR: History */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-surface border border-line rounded-xl overflow-hidden">

        {/* Sidebar Header */}
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-ink font-display">Studio</h2>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="h-8 w-8 rounded-lg bg-primary hover:bg-primary-dark flex items-center justify-center transition-colors"
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
                className="mt-4 text-xs font-semibold text-primary hover:text-primary-light transition-colors"
              >
                Upload your first resume →
              </button>
            </div>
          ) : (
            history.map((item) => {
              const isActive = activeResume?.id === item.id;
              const score = item.overallScore;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveResume(item)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isActive 
                      ? 'bg-white/10 border-white/20 shadow-lg' 
                      : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-bold truncate font-display ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {item.contactInformation.name || 'Unnamed Resume'}
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
      <div className="flex-1 bg-surface border border-line rounded-xl overflow-hidden flex flex-col">
        
        {!activeResume ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative z-10">
            <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg">
              <SparklesIcon className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="text-2xl font-bold text-white font-display mb-2">Welcome to the Studio</h3>
            <p className="text-zinc-400 max-w-sm mx-auto mb-8">Select a resume from the sidebar to view its detailed AI analysis, or upload a new one to get started.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
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
                  (activeResume.atsScore ?? 0) >= 70 ? 'text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-600' :
                  (activeResume.atsScore ?? 0) >= 40 ? 'text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-600' :
                  'text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-rose-600'
                }`}>
                  {activeResume.atsScore != null ? `${activeResume.atsScore}%` : 'N/A'}
                </p>
                {activeResume.atsScore != null && (
                  <div className="mt-8 h-3 w-full max-w-sm bg-black/40 rounded-full mx-auto overflow-hidden border border-white/5 shadow-inner">
                    <motion.div
                      key={activeResume.id}
                      initial={{ width: 0 }}
                      animate={{ width: `${activeResume.atsScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className={`h-full rounded-full ${
                        activeResume.atsScore >= 70 ? 'bg-emerald-500' :
                        activeResume.atsScore >= 40 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeResume.strengths.length > 0 && (
                <div className="bg-surface border border-emerald-500/20 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <h4 className="text-sm font-bold text-emerald-400 font-display uppercase tracking-wide flex items-center gap-2 mb-4">
                    <CheckCircleIcon className="h-4 w-4" /> Strengths
                  </h4>
                  <ul className="space-y-3">
                    {activeResume.strengths.map((s) => (
                      <li key={s} className="text-sm text-zinc-300 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        <span className="leading-relaxed font-medium">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeResume.issues.length > 0 && (
                <div className="bg-surface border border-amber-500/20 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <h4 className="text-sm font-bold text-amber-400 font-display uppercase tracking-wide flex items-center gap-2 mb-4">
                    <LightBulbIcon className="h-4 w-4" /> Areas to Improve
                  </h4>
                  <ul className="space-y-3">
                    {activeResume.issues.map((s) => (
                      <li key={s} className="text-sm text-zinc-300 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
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
                <SparklesIcon className="h-4 w-4 text-primary" /> Extracted Skills & Keywords
              </h4>
              
              {activeResume.skills.technical.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.skills.technical.map((s) => <Tag key={s} variant="primary">{s}</Tag>)}
                  </div>
                </div>
              )}
              {activeResume.skills.soft.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.skills.soft.map((s) => <Tag key={s} variant="secondary">{s}</Tag>)}
                  </div>
                </div>
              )}
              
              {activeResume.missingKeywords.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-xs font-semibold text-amber-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <LightBulbIcon className="h-4 w-4" /> Suggested Keywords to Add
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.missingKeywords.map((kw) => (
                      <span key={kw} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg">
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
    primary: "bg-primary/10 border-primary/20 text-primary-light",
    secondary: "bg-white/[0.05] border-line text-ink-muted"
  };
  return (
    <span className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}
