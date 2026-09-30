import React from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/ui/Card';
import SectionHeader from '../../../components/ui/SectionHeader';
import EmptyState from '../../../components/ui/EmptyState';

const MAX_ISSUES = 5;

/**
 * "To fix" — the marks on the latest resume, most important first. Each row
 * opens the full report.
 */
export default function AiInsightsPanel({ latestAnalysis, onViewReport }) {
  const issues = latestAnalysis.issues;
  const strengths = latestAnalysis.strengths;
  const shown = issues.slice(0, MAX_ISSUES);
  const hidden = issues.length - shown.length;

  return (
    <Card className="h-full">
      <SectionHeader
        title="To fix"
        hint="What a recruiter would mark on your latest resume"
        right={<span className="t-meta">{issues.length}</span>}
        className="mb-4"
      />

      {issues.length === 0 ? (
        <EmptyState
          compact
          icon={CheckIcon}
          title="Nothing flagged"
          message="This resume came back without recruiter notes. Check the full report for the score breakdown."
        />
      ) : (
        <ul className="-mx-2">
          {shown.map((issue) => (
            <li key={issue}>
              <button
                type="button"
                onClick={() => onViewReport?.()}
                className="group flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left hover:bg-ink/[0.04]"
              >
                <span aria-hidden="true" className="mt-[0.68em] h-[2px] w-3 flex-shrink-0 rounded-full bg-primary" />
                <span className="min-w-0 flex-1 text-sm leading-relaxed text-ink-muted group-hover:text-ink">{issue}</span>
                <ArrowRightIcon className="mt-1 h-3.5 w-3.5 flex-shrink-0 -translate-x-1 text-ink-faint opacity-0 transition-[opacity,transform] duration-base ease-out group-hover:translate-x-0 group-hover:opacity-100" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {hidden > 0 && (
        <button type="button" onClick={() => onViewReport?.()} className="mt-2 text-[0.8125rem] font-medium text-ink-muted hover:text-ink">
          + {hidden} more in the full report
        </button>
      )}

      {strengths.length > 0 && (
        <div className="mt-5 border-t border-line pt-5">
          <p className="t-label mb-3">Keep these</p>
          <ul className="space-y-2">
            {strengths.slice(0, 3).map((str) => (
              <li key={str} className="flex items-start gap-2.5 text-sm leading-snug text-ink-muted">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-good" aria-hidden="true" />
                {str}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
