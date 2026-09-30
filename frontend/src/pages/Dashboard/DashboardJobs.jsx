import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  MapPinIcon,
  BanknotesIcon,
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useResumeHistory } from '../../hooks/useResumeHistory';
import { normalizeAnalysis, skillCount } from '../../utils/analysisSchema';
import { timeAgo } from '../../utils/timeAgo';
import Badge from '../../components/ui/Badge';
import Button, { buttonClasses } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Segmented from '../../components/ui/Segmented';
import Skeleton from '../../components/ui/Skeleton';
import { controlClasses } from '../../components/ui/Field';
import Enso from '../../components/graphics/Enso';
import { duration, ease } from '../../utils/motion';

function JobSkeleton() {
  return (
    <div className="flex h-[17rem] flex-col rounded-lg border border-line bg-surface p-5 sm:p-6">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="mt-3 h-3.5 w-2/5" />
      <Skeleton className="mt-2 h-3 w-1/3" />
      <div className="mt-6 space-y-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="mt-auto h-10 w-full rounded-md" />
    </div>
  );
}

function JobCard({ job, isAiMatch, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // Capped: an uncapped index * delay made the 60th card wait seconds
      transition={{ delay: Math.min(index, 8) * 0.035, duration: 0.45, ease: ease.out }}
      className="group flex flex-col rounded-lg border border-line bg-surface shadow-e1 transition-colors duration-base hover:border-line-strong"
    >
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="line-clamp-2 text-[1.0625rem] font-medium leading-snug tracking-[-0.01em] text-ink">{job.title}</h3>
          {isAiMatch ? (
            <Enso value={job.matchScore} size={46} weight={9} label={false} animated={false} className="-mr-1 -mt-1" />
          ) : (
            job.remote && <Badge className="mt-0.5 flex-shrink-0">Remote</Badge>
          )}
        </div>

        <ul className="mt-3 space-y-1.5 text-[0.8125rem] text-ink-muted">
          <li className="flex items-center gap-2">
            <BuildingOffice2Icon className="h-4 w-4 flex-shrink-0 text-ink-faint" aria-hidden="true" />
            <span className="truncate font-medium text-ink">{job.company}</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 flex-shrink-0 text-ink-faint" aria-hidden="true" />
            <span className="truncate">{job.location}</span>
          </li>
          {job.salary && job.salary !== 'Not specified' && (
            <li className="flex items-center gap-2">
              <BanknotesIcon className="h-4 w-4 flex-shrink-0 text-ink-faint" aria-hidden="true" />
              <span className="truncate">{job.salary}</span>
            </li>
          )}
        </ul>

        {isAiMatch ? (
          <div className="mt-5 space-y-4 border-t border-line pt-4">
            <div>
              <p className="t-label mb-2">Why it fits</p>
              <p className="text-[0.8125rem] leading-relaxed text-ink-muted">{job.reason}</p>
            </div>
            {job.missingSkills?.length > 0 && (
              <div>
                <p className="t-label mb-2">To build</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.missingSkills.map((skill) => <Badge key={skill} variant="warn">{skill}</Badge>)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="mt-4 line-clamp-3 text-[0.8125rem] leading-relaxed text-ink-muted">{job.snippet}</p>
            {job.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {job.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
                {job.tags.length > 3 && <span className="t-meta pl-1">+{job.tags.length - 3}</span>}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3.5 sm:px-6">
        <span className="t-meta truncate">{isAiMatch ? 'Matched to your resume' : `Posted ${timeAgo(job.createdAt)}`}</span>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'flex-shrink-0' })}
        >
          Apply <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.article>
  );
}

export default function DashboardJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'ai'
  const [aiJobs, setAiJobs] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [query, setQuery] = useState('');

  // Shared, cached history (same query the overview uses). The latest record is
  // normalized so both current-schema and legacy records can drive AI matching.
  const { data: history = [] } = useResumeHistory();
  const userProfile = useMemo(() => normalizeAnalysis(history[0]), [history]);
  const hasResume = Boolean(
    userProfile &&
    (skillCount(userProfile) > 0 || userProfile.summary || userProfile.workExperience.length > 0)
  );

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await axios.get('/api/jobs');
      if (response.data.success) {
        setJobs(response.data.jobs);
      } else {
        setLoadError(true);
      }
    } catch (err) {
      setLoadError(true);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleAIMatch = async () => {
    if (!userProfile) return;

    setIsAiLoading(true);
    setViewMode('ai');
    setMatchError('');

    try {
      const response = await axios.post('/api/jobs/match', { userProfile });
      if (response.data.success) {
        setAiJobs(response.data.jobs);
      } else {
        setMatchError("Matching didn't work this time. Showing all jobs instead.");
        setViewMode('all');
      }
    } catch (err) {
      console.error('AI Match Error:', err);
      setMatchError("Matching didn't work this time. Showing all jobs instead.");
      setViewMode('all');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    if (mode === 'ai' && aiJobs.length === 0) {
      handleAIMatch();
    } else {
      setViewMode(mode);
    }
  };

  const isAiMatch = viewMode === 'ai';
  const source = isAiMatch ? aiJobs : jobs;

  // Client-side filter over what is already loaded
  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!q) return source;
    return source.filter((job) =>
      [job.title, job.company, job.location, ...(job.tags || [])]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [source, q]);

  const busy = loading || isAiLoading;

  const modes = [
    { value: 'all', label: 'All jobs', icon: ListBulletIcon },
    ...(hasResume ? [{ value: 'ai', label: isAiLoading ? 'Matching…' : 'Matched to you', icon: SparklesIcon, disabled: isAiLoading }] : []),
  ];

  return (
    <div>
      <PageHeader
        title="Jobs"
        description={
          hasResume
            ? 'Open tech roles from Remotive, Arbeitnow and The Muse. Switch to matches to rank them against your latest resume.'
            : 'Open tech roles from Remotive, Arbeitnow and The Muse. Analyze a resume to have them matched to you.'
        }
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented label="Job view" options={modes} value={viewMode} onChange={handleModeChange} className="self-start" />

        <div className="flex items-center gap-3">
          {!busy && !loadError && (
            <span className="t-meta hidden md:block" aria-live="polite">
              {visible.length} {visible.length === 1 ? 'role' : 'roles'}
            </span>
          )}
          <div className="relative flex-1 sm:w-72 sm:flex-none">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title, company, skill"
              aria-label="Filter jobs"
              className={`${controlClasses} h-10 pl-10 pr-9 [&::-webkit-search-cancel-button]:hidden`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear filter"
                className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-ink-faint hover:bg-ink/[0.06] hover:text-ink"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {matchError && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-5 flex items-center justify-between gap-3 rounded-md border border-bad/25 bg-bad/10 px-4 py-3">
              <p className="flex items-center gap-2.5 text-sm text-bad">
                <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
                {matchError}
              </p>
              <Button variant="ghost" size="sm" onClick={handleAIMatch} className="flex-shrink-0 !text-bad">Try again</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {busy ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label={isAiLoading ? 'Matching jobs to your resume' : 'Loading jobs'}>
          {[0, 1, 2, 3, 4, 5].map((i) => <JobSkeleton key={i} />)}
        </div>
      ) : loadError ? (
        <Card padded={false}>
          <EmptyState
            icon={ExclamationCircleIcon}
            title="The job listings didn't load"
            message="This is usually a connection hiccup or one of the job boards being slow. Nothing is wrong with your account."
            action={<Button variant="secondary" onClick={fetchJobs}>Try again</Button>}
            className="py-20"
          />
        </Card>
      ) : visible.length === 0 ? (
        <Card padded={false}>
          {q ? (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title={`Nothing matches “${query.trim()}”`}
              message="Try a broader term: a language, a city, or part of a job title."
              action={<Button variant="secondary" onClick={() => setQuery('')}>Clear filter</Button>}
              className="py-20"
            />
          ) : isAiMatch ? (
            <EmptyState
              icon={SparklesIcon}
              title="No strong matches right now"
              message="None of today's listings line up closely with your latest resume. The list changes daily."
              action={<Button variant="secondary" onClick={() => setViewMode('all')}>See all jobs</Button>}
              className="py-20"
            />
          ) : (
            <EmptyState
              art="stack"
              title="No listings at the moment"
              message="The job boards returned nothing just now. Check back in a little while."
              action={<Button variant="secondary" onClick={fetchJobs}>Refresh</Button>}
              className="py-20"
            />
          )}
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: duration.base } }}
            exit={{ opacity: 0, transition: { duration: duration.fast } }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {visible.map((job, index) => (
              <JobCard
                key={isAiMatch ? job.title + job.company : job.id}
                job={job}
                isAiMatch={isAiMatch}
                index={index}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Nudge toward matching when there's no resume to match against */}
      {!busy && !loadError && !hasResume && jobs.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-ink">Want these ranked for you?</span> Analyze a resume and each role gets a match score and the skills you&apos;d still need.
          </p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')} className="flex-shrink-0 self-start sm:self-auto">
            Analyze a resume
          </Button>
        </div>
      )}
    </div>
  );
}
