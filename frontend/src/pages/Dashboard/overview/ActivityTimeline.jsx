import React from 'react';
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/ui/Card';
import SectionHeader from '../../../components/ui/SectionHeader';
import EmptyState from '../../../components/ui/EmptyState';
import { timeAgo } from '../../../utils/timeAgo';

function scoreTone(score) {
  if (score >= 70) return 'bg-emerald-500/15 text-emerald-400';
  if (score >= 40) return 'bg-amber-500/15 text-amber-400';
  return 'bg-red-500/15 text-red-400';
}

export default function ActivityTimeline({ history, onSelectResume }) {
  const items = (history || []).slice(0, 6);

  return (
    <Card className="flex flex-col h-full">
      <SectionHeader icon={ClockIcon} title="Activity" className="mb-5" />

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {items.length === 0 ? (
          <EmptyState icon={ClockIcon} message="No activity yet" className="h-full min-h-[180px]" />
        ) : (
          <div className="space-y-1">
            {items.map((item) => {
              const score = item.overallScore;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectResume?.(item)}
                  className="group flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-ink truncate">
                        {item.contactInformation.name || 'Resume analyzed'}
                      </p>
                      {score !== null && (
                        <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${scoreTone(score)}`}>
                          {score}%
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-ink-faint">{timeAgo(item.createdAt)}</p>
                  </div>
                  <ArrowRightIcon className="mt-1.5 h-3.5 w-3.5 flex-shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
