import React, { useState, useEffect, useMemo } from 'react';
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
import { useResumeHistory } from '../../hooks/useResumeHistory';
import { normalizeAnalysis, skillCount } from '../../utils/analysisSchema';
import { timeAgo } from '../../utils/timeAgo';
import Badge from '../../components/ui/Badge';

export default function DashboardJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'ai'
  const [aiJobs, setAiJobs] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Shared, cached history (same query the overview uses). The latest record is
  // normalized so both current-schema and legacy records can drive AI matching;
  // the old `history[0].analysis` check only matched pre-migration records.
  const { data: history = [] } = useResumeHistory();
  const userProfile = useMemo(() => normalizeAnalysis(history[0]), [history]);
  const hasResume = Boolean(
    userProfile &&
    (skillCount(userProfile) > 0 || userProfile.summary || userProfile.workExperience.length > 0)
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/jobs');
        if (response.data.success) {
          setJobs(response.data.jobs);
        } else {
          setError('Failed to load jobs');
        }
      } catch (err) {
        setError('Error fetching data. Please try again later.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
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

  return (
    <div className="space-y-8 relative z-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="flex items-center gap-3 font-display text-3xl font-semibold tracking-tight text-ink">
            <span className="rounded-lg border border-line bg-white/[0.03] p-2">
              <BriefcaseIcon className="h-6 w-6 text-primary" />
            </span>
            Jobs
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {jobs.length} tech jobs from Remotive, Arbeitnow and The Muse.
            {!hasResume && ' Analyze a resume to unlock AI matching.'}
          </p>
        </motion.div>

        <div className="flex self-start rounded-xl border border-line bg-surface p-1" role="tablist" aria-label="Job view">
          <button
            role="tab"
            aria-selected={viewMode === 'all'}
            onClick={() => setViewMode('all')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === 'all'
                ? 'bg-white/[0.08] text-ink'
                : 'text-ink-faint hover:bg-white/[0.04] hover:text-ink-muted'
            }`}
          >
            All jobs
          </button>

          {hasResume && (
            <button
              role="tab"
              aria-selected={viewMode === 'ai'}
              onClick={() => {
                if (aiJobs.length === 0) {
                  handleAIMatch();
                } else {
                  setViewMode('ai');
                }
              }}
              disabled={isAiLoading}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                viewMode === 'ai'
                  ? 'bg-primary text-white'
                  : 'text-ink-faint hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <SparklesIcon className="h-4 w-4" />
              {isAiLoading ? 'Matching…' : 'AI match'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {(loading || isAiLoading) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {['s1', 's2', 's3', 's4', 's5', 's6'].map(id => (
            <div key={id} className="bg-surface border border-line rounded-xl p-6 h-64 animate-pulse relative overflow-hidden">
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              // Capped: an uncapped index * 0.05 made the 60th card wait 3s
              transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.25 }}
              className={`group relative flex flex-col rounded-xl border bg-surface transition-colors ${
                isAiMatch ? 'border-primary/30 hover:border-primary/50' : 'border-line hover:border-line-strong'
              }`}
            >

              {isAiMatch && (
                <div className="absolute -right-3 -top-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-surface-raised">
                  <div className="text-center">
                    <span className="block text-xs font-semibold leading-none text-primary">{job.matchScore}</span>
                    <span className="block text-[8px] font-semibold uppercase text-ink-faint">Match</span>
                  </div>
                </div>
              )}

              <div className="relative z-10 flex-1 p-6 pb-0">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h3 className="line-clamp-2 pr-6 font-display text-lg font-semibold leading-tight text-ink">
                    {job.title}
                  </h3>
                  {job.remote && !isAiMatch && <Badge variant="accent" className="flex-shrink-0">Remote</Badge>}
                </div>

                <div className="mb-5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-ink-muted">
                    <BuildingOfficeIcon className="h-4 w-4 text-ink-faint" />
                    {job.company}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-faint">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {job.location}
                  </div>
                  {job.salary && job.salary !== 'Not specified' && (
                    <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                      <TagIcon className="h-3.5 w-3.5" />
                      {job.salary}
                    </div>
                  )}
                  {!isAiMatch && (
                    <div className="flex items-center gap-2 text-xs text-ink-faint">
                      <ClockIcon className="h-3.5 w-3.5" />
                      Posted {timeAgo(job.createdAt)}
                    </div>
                  )}
                </div>

                {isAiMatch ? (
                  <div className="mb-6 space-y-4">
                    <div className="rounded-lg border border-primary/15 bg-primary/[0.05] p-3">
                      <h4 className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-primary">
                        <CheckCircleIcon className="h-3.5 w-3.5" /> Why it matches
                      </h4>
                      <p className="text-xs leading-relaxed text-ink-muted">{job.reason}</p>
                    </div>

                    {job.missingSkills && job.missingSkills.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5" /> Skills to build
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {job.missingSkills.map((skill) => <Badge key={skill} variant="amber">{skill}</Badge>)}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mb-6 line-clamp-3 text-xs leading-relaxed text-ink-muted">
                    {job.snippet}
                  </p>
                )}
              </div>

              <div className="relative z-10 mt-auto border-t border-line p-6 pt-4">
                {!isAiMatch && job.tags && job.tags.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {job.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
                    {job.tags.length > 3 && (
                      <span className="inline-flex items-center px-1 text-[11px] font-medium text-ink-faint">
                        +{job.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                    isAiMatch
                      ? 'border-primary/20 bg-primary/10 text-primary-light hover:bg-primary/20'
                      : 'border-line bg-white/[0.04] text-ink hover:bg-white/[0.08]'
                  }`}
                >
                  Apply
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
