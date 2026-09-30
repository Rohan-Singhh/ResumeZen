import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import SectionHeader from '../../../components/ui/SectionHeader';
import { scoreTone, TONE_TEXT } from '../../../components/graphics/Enso';
import { TONE_BAR } from '../../../components/report/Meter';
import { timeAgo } from '../../../utils/timeAgo';

/**
 * Recent uploads, newest first, drawn as a timeline: a rail with one point per
 * upload, colored by how that resume scored.
 */
export default function ActivityTimeline({ history, onSelectResume }) {
  const items = (history || []).slice(0, 6);

  return (
    <Card className="flex h-full flex-col">
      <SectionHeader
        title="Recent uploads"
        right={
          history.length > items.length ? (
            <Link to="/dashboard/studio" className="text-[0.8125rem] font-medium text-ink-muted hover:text-ink">
              All {history.length}
            </Link>
          ) : null
        }
        className="mb-3"
      />

      <ol className="relative -mx-2">
        {/* The rail */}
        <span aria-hidden="true" className="absolute bottom-5 left-[1.0625rem] top-5 w-px bg-line" />

        {items.map((item) => {
          const score = item.overallScore;
          const tone = scoreTone(score);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelectResume?.(item)}
                className="group relative flex w-full items-center gap-3.5 rounded-md px-2 py-2.5 text-left hover:bg-ink/[0.04]"
              >
                <span className="relative z-10 flex h-[1.125rem] w-[1.125rem] flex-shrink-0 items-center justify-center rounded-full bg-surface">
                  <span className={`h-2 w-2 rounded-full ${TONE_BAR[tone]}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {item.contactInformation.name || 'Resume analyzed'}
                  </span>
                  <span className="t-meta block">{timeAgo(item.createdAt)}</span>
                </span>
                {score !== null && (
                  <span className={`t-num text-[1.25rem] ${TONE_TEXT[tone]}`}>{score}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
