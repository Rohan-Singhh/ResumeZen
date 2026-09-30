import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { normalizeAnalysis } from '../../utils/analysisSchema';
import { useResumeHistory } from '../../hooks/useResumeHistory';
import { timeAgo } from '../../utils/timeAgo';
import Button, { buttonClasses } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton';
import ReportView from '../../components/report/ReportView';
import { scoreTone, TONE_TEXT } from '../../components/graphics/Enso';
import { duration, ease, spring } from '../../utils/motion';

function StudioSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]" role="status" aria-label="Loading your reports">
      <Card padded={false} className="hidden p-3 lg:block">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-3 py-3.5">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </Card>
      <Card className="space-y-8">
        <div className="flex items-center gap-8">
          <Skeleton className="h-[9.25rem] w-[9.25rem] flex-shrink-0 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <SkeletonText lines={4} />
        <SkeletonText lines={3} />
      </Card>
    </div>
  );
}

export default function Studio() {
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  const { data: rawHistory = [], isPending } = useResumeHistory();

  // Normalize once so this page reads the same canonical shape as the overview
  const history = useMemo(() => rawHistory.map(normalizeAnalysis), [rawHistory]);

  // Default to the newest resume; derived rather than synced through an effect
  const activeResume = history.find((h) => h.id === activeId) || history[0] || null;

  const newButton = (
    <Button onClick={() => navigate('/dashboard')}>
      <PlusIcon className="h-4 w-4" /> New analysis
    </Button>
  );

  return (
    <div>
      <PageHeader
        title="Studio"
        description="Every resume you have analyzed, with its full report."
        actions={history.length > 0 ? newButton : null}
      />

      {isPending ? (
        <StudioSkeleton />
      ) : history.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            art="stack"
            title="No reports yet"
            message="Analyze a resume from the overview and its full report will be kept here, alongside every version you upload after it."
            action={newButton}
            className="py-20"
          />
        </Card>
      ) : (
        // Stacks on small screens (reports become a swipeable row); from lg up
        // the list is a column that stays put while the report scrolls.
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <nav aria-label="Reports" className="min-w-0 lg:sticky lg:top-0">
            <Card padded={false} className="lg:max-h-[calc(100dvh-13rem)] lg:overflow-y-auto lg:p-2">
              <ul className="no-scrollbar flex snap-x gap-2 overflow-x-auto p-2 lg:block lg:space-y-0.5 lg:overflow-visible lg:p-0">
                {history.map((item) => {
                  const isActive = activeResume.id === item.id;
                  const score = item.overallScore;
                  return (
                    <li key={item.id} className="w-44 flex-shrink-0 snap-start lg:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveId(item.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`relative flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left ${
                          isActive ? '' : 'hover:bg-ink/[0.04]'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="studio-active"
                            className="absolute inset-0 rounded-md border border-line-strong bg-surface-raised"
                            transition={spring}
                          >
                            <span className="absolute -left-px bottom-3 top-3 w-[2px] rounded-full bg-primary" />
                          </motion.span>
                        )}
                        <span className="relative min-w-0">
                          <span className={`block truncate text-sm font-medium ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
                            {item.contactInformation.name || 'Unnamed resume'}
                          </span>
                          <span className="t-meta mt-0.5 block">{timeAgo(item.createdAt)}</span>
                        </span>
                        {score !== null && (
                          <span className={`t-num relative text-[1.25rem] ${TONE_TEXT[scoreTone(score)]}`}>{score}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </nav>

          <Card padded={false} className="min-w-0">
            <div className="flex flex-col gap-3 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="min-w-0">
                <h2 className="t-h3 truncate">{activeResume.contactInformation.name || 'Unnamed resume'}</h2>
                <p className="t-meta mt-1.5">
                  Analyzed {activeResume.createdAt ? new Date(activeResume.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'recently'}
                </p>
              </div>
              {activeResume.resumeUrl && (
                <a
                  href={activeResume.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'flex-shrink-0 self-start sm:self-auto' })}
                >
                  Original PDF <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeResume.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: duration.page, ease: ease.out } }}
                exit={{ opacity: 0, transition: { duration: duration.fast } }}
                className="px-5 py-7 sm:px-8 sm:py-8"
              >
                <ReportView data={activeResume} />
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>
      )}
    </div>
  );
}
