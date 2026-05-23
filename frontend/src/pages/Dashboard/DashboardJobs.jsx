import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  BriefcaseIcon,
  MapPinIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  BuildingOfficeIcon,
  ClockIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getResumeHistory } from '../../services/resumeService';

export default function DashboardJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'ai'
  const [aiJobs, setAiJobs] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch standard jobs
        const response = await axios.get('/api/jobs');
        if (response.data.success) {
          setJobs(response.data.jobs);
        } else {
          setError('Failed to load jobs');
        }

        // Fetch user resume to see if AI matching is possible
        const history = await getResumeHistory();
        if (history && history.length > 0 && history[0].analysis) {
          setHasResume(true);
          setUserProfile(history[0]);
        }
      } catch (err) {
        setError('Error fetching data. Please try again later.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleAIMatch = async () => {
    if (!userProfile) return;
    
    setIsAiLoading(true);
    setViewMode('ai');
    setError(null);
    
    try {
      const response = await axios.post('/api/jobs/match', { userProfile });
      if (response.data.success) {
        setAiJobs(response.data.jobs);
      } else {
        setError('AI matching failed. Showing standard jobs.');
        setViewMode('all');
      }
    } catch (err) {
      console.error('AI Match Error:', err);
      setError('AI failed to match jobs. Please try again later.');
      setViewMode('all');
    } finally {
      setIsAiLoading(false);
    }
  };

  const timeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp * 1000); // Arbeitnow uses seconds
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-8 relative z-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <BriefcaseIcon className="h-6 w-6 text-emerald-400" />
            </div>
            Job Board
          </h1>
          <p className="text-sm text-zinc-400 mt-2 font-light">Recent tech and remote opportunities from around the web.</p>
        </motion.div>

        <div className="flex bg-[#131318] p-1.5 rounded-xl border border-white/5 shadow-inner self-start">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'all' 
                ? 'bg-white/10 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            All Jobs
          </button>
          
          {hasResume && (
            <button
              onClick={() => {
                if (aiJobs.length === 0) {
                  handleAIMatch();
                } else {
                  setViewMode('ai');
                }
              }}
              disabled={isAiLoading}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                viewMode === 'ai' 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                  : 'text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10'
              }`}
            >
              <SparklesIcon className="h-4 w-4" />
              {isAiLoading ? 'Matching...' : 'AI Match'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading State */}
      {(loading || isAiLoading) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#0d0d12]/80 border border-white/[0.06] rounded-2xl p-6 h-64 animate-pulse relative overflow-hidden">
              {isAiLoading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />}
              <div className="h-6 w-3/4 bg-white/5 rounded-md mb-3" />
              <div className="h-4 w-1/2 bg-white/5 rounded-md mb-6" />
              <div className="space-y-2 mb-6">
                <div className="h-3 w-full bg-white/5 rounded-md" />
                <div className="h-3 w-full bg-white/5 rounded-md" />
                <div className="h-3 w-2/3 bg-white/5 rounded-md" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-white/5 rounded-full" />
                <div className="h-6 w-16 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Jobs Grid */
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8"
          >
            {(viewMode === 'all' ? jobs : aiJobs).map((job, index) => {
              const isAiMatch = viewMode === 'ai';
              
              return (
            <motion.div
              key={isAiMatch ? job.title + job.company : job.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative bg-[#0d0d12]/80 backdrop-blur-xl rounded-2xl border flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                isAiMatch ? 'border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]' : 'border-white/[0.08] hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]'
              }`}
            >
              {/* Subtle ambient glow on hover */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] pointer-events-none transition-colors ${
                isAiMatch ? 'bg-violet-500/[0.05] group-hover:bg-violet-500/[0.1]' : 'bg-emerald-500/[0.03] group-hover:bg-emerald-500/[0.08]'
              }`} />

              {isAiMatch && (
                <div className="absolute -top-3 -right-3 h-12 w-12 rounded-full bg-zinc-900 border border-violet-500/30 flex items-center justify-center shadow-lg z-20">
                  <div className="text-center">
                    <span className="block text-xs font-black text-violet-400 leading-none">{job.matchScore}</span>
                    <span className="block text-[8px] font-bold text-zinc-500 uppercase">Score</span>
                  </div>
                </div>
              )}

              <div className="flex-1 relative z-10 p-6 pb-0">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className={`text-lg font-bold font-display leading-tight transition-colors line-clamp-2 pr-6 ${
                    isAiMatch ? 'text-violet-100 group-hover:text-violet-400' : 'text-zinc-100 group-hover:text-emerald-400'
                  }`}>
                    {job.title}
                  </h3>
                  {job.remote && !isAiMatch && (
                    <span className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-widest">
                      Remote
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 mb-5">
                  <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                    <BuildingOfficeIcon className="h-4 w-4 text-zinc-500" />
                    {job.company}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {job.location}
                  </div>
                  {job.salary && job.salary !== 'Not specified' && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                      <TagIcon className="h-3.5 w-3.5" />
                      {job.salary}
                    </div>
                  )}
                  {!isAiMatch && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <ClockIcon className="h-3.5 w-3.5" />
                      Posted {timeAgo(job.createdAt)}
                    </div>
                  )}
                </div>

                {isAiMatch ? (
                  <div className="space-y-4 mb-6">
                    <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-3">
                      <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <CheckCircleIcon className="h-3 w-3" /> Why it matches
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed">{job.reason}</p>
                    </div>
                    
                    {job.missingSkills && job.missingSkills.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <ExclamationTriangleIcon className="h-3 w-3" /> Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {job.missingSkills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-medium text-amber-400">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6 line-clamp-3">
                    {job.snippet}
                  </p>
                )}
              </div>

              <div className="mt-auto relative z-10 p-6 pt-4 border-t border-white/[0.05]">
                {!isAiMatch && job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {job.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05] text-[10px] text-zinc-400 font-medium">
                        <TagIcon className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/[0.02] border border-transparent text-[10px] text-zinc-500 font-medium">
                        +{job.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    isAiMatch 
                      ? 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-violet-200 border-violet-500/20 hover:border-violet-500/40' 
                      : 'bg-white/[0.04] hover:bg-emerald-500/10 text-zinc-300 hover:text-emerald-400 border-white/[0.08] hover:border-emerald-500/30'
                  }`}
                >
                  Apply Now
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
            );
          })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
