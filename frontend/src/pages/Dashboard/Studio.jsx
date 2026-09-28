import React, { useState, useMemo } from 'react';
import { normalizeAnalysis } from '../../utils/analysisSchema';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentTextIcon,
  SparklesIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useResumeHistory } from '../../hooks/useResumeHistory';
import { timeAgo } from '../../utils/timeAgo';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

// Same thresholds as the rest of the dashboard
function tone(score) {
  if (score >= 70) return { text: 'text-emerald-400', bar: 'bg-emerald-500', chip: 'bg-emerald-500/15 text-emerald-400' };
  if (score >= 40) return { text: 'text-amber-400', bar: 'bg-amber-500', chip: 'bg-amber-500/15 text-amber-400' };
  return { text: 'text-red-400', bar: 'bg-red-500', chip: 'bg-red-500/15 text-red-400' };
}

function Panel({ icon: Icon, title, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-line bg-white/[0.02] p-5 ${className}`}>
      <h4 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-ink">
        {Icon && <Icon className="h-4 w-4 text-ink-muted" />}
        {title}
      </h4>
      {children}
    </section>
  );
}

export default function Studio() {
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  const { data: rawHistory = [], isLoading: loading } = useResumeHistory();

  // Normalize once so this page reads the same canonical shape as the overview
  const history = useMemo(() => rawHistory.map(normalizeAnalysis), [rawHistory]);

  // Default to the newest resume; derived rather than synced through an effect
  const activeResume = history.find(h => h.id === activeId) || history[0] || null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface">
        <EmptyState
          icon={DocumentTextIcon}
          message="No resumes analyzed yet. Upload one from the overview to see its full report here."
          className="py-20"
          action={
            <Button onClick={() => navigate('/dashboard')}>
              <PlusIcon className="h-4 w-4" /> New analysis
            </Button>
          }
        />
      </div>
    );
  }

  const overall = activeResume.overallScore;
  const ats = activeResume.atsScore;

  return (
    // Stacks on small screens; side-by-side with independent scrolling from lg up.
    // The old fixed 320px sidebar + fixed height broke the page on phones.
    <div className="flex flex-col gap-5 lg:h-[calc(100vh-140px)] lg:flex-row">

      {/* History */}
      <aside className="flex max-h-72 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-line bg-surface lg:max-h-none lg:w-80">
        <div className="flex items-center justify-between border-b border-line p-4">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-semibold text-ink">Studio</h2>
          </div>
          <Button size="sm" onClick={() => navigate('/dashboard')} aria-label="Upload new resume">
            <PlusIcon className="h-4 w-4" /> New
          </Button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-2">
          {history.map((item) => {
            const isActive = activeResume.id === item.id;
            const score = item.overallScore;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`w-full rounded-lg border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  isActive ? 'border-line-strong bg-white/[0.06]' : 'border-transparent hover:bg-white/[0.03]'
                }`}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className={`truncate font-display text-sm font-medium ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
                    {item.contactInformation.name || 'Unnamed resume'}
                  </p>
                  {score !== null && (
                    <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${tone(score).chip}`}>
                      {score}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <ClockIcon className="h-3 w-3" />
                  {timeAgo(item.createdAt)}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Active resume */}
      <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto rounded-xl border border-line bg-surface p-5 sm:p-8">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-semibold text-ink">
              {activeResume.contactInformation.name || 'Unnamed resume'}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Analyzed {activeResume.createdAt ? new Date(activeResume.createdAt).toLocaleString() : 'recently'}
            </p>
          </div>
          {activeResume.resumeUrl && (
            <a
              href={activeResume.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-shrink-0 items-center gap-2 self-start rounded-lg border border-line bg-white/[0.06] px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white/[0.1]"
            >
              View original PDF <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Scores — overall is the headline, matching the list and the overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-white/[0.02] p-6">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
              <ChartBarIcon className="h-4 w-4" /> Overall score
            </p>
            <p className={`font-display text-5xl font-semibold tabular-nums tracking-tight ${overall != null ? tone(overall).text : 'text-ink-faint'}`}>
              {overall != null ? overall : '—'}<span className="text-xl text-ink-faint">/100</span>
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white/[0.02] p-6">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">ATS match</p>
            <p className="font-display text-3xl font-semibold tabular-nums text-ink">
              {ats != null ? `${ats}%` : '—'}
            </p>
            {ats != null && (
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  key={activeResume.id}
                  initial={{ width: 0 }}
                  animate={{ width: `${ats}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${tone(ats).bar}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Strengths & improvements */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {activeResume.strengths.length > 0 && (
            <Panel icon={CheckCircleIcon} title="Strengths">
              <ul className="space-y-2.5">
                {activeResume.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {activeResume.issues.length > 0 && (
            <Panel icon={LightBulbIcon} title="Areas to improve">
              <ul className="space-y-2.5">
                {activeResume.issues.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        {/* Skills & keywords */}
        <Panel icon={SparklesIcon} title="Skills & keywords">
          {activeResume.skills.technical.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Technical</p>
              <div className="flex flex-wrap gap-2">
                {activeResume.skills.technical.map((s) => <Badge key={s} variant="accent">{s}</Badge>)}
              </div>
            </div>
          )}
          {activeResume.skills.soft.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Soft</p>
              <div className="flex flex-wrap gap-2">
                {activeResume.skills.soft.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </div>
          )}
          {activeResume.missingKeywords.length > 0 && (
            <div className="border-t border-line pt-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Suggested keywords to add</p>
              <div className="flex flex-wrap gap-2">
                {activeResume.missingKeywords.map((kw) => <Badge key={kw} variant="amber">+ {kw}</Badge>)}
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
