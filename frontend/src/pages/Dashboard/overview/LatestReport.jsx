import React from 'react';
import { ArrowRightIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Enso from '../../../components/graphics/Enso';
import Seal from '../../../components/graphics/Seal';
import Meter from '../../../components/report/Meter';
import Sparkline from '../../../components/report/Sparkline';
import { verdictFor } from '../../../components/report/verdict';
import { timeAgo } from '../../../utils/timeAgo';

/**
 * LatestReport — the overview's focal point: the newest resume's score, its
 * verdict, what the score is made of, and how it has moved across uploads.
 *
 * Props:
 *   analyses — canonical analyses, newest first (at least one)
 *   onOpen   — open the full report for the newest one
 */
export default function LatestReport({ analyses, onOpen }) {
  const latest = analyses[0];
  const previous = analyses[1] || null;
  const verdict = verdictFor(latest);

  const diff =
    latest.overallScore != null && previous?.overallScore != null
      ? latest.overallScore - previous.overallScore
      : null;

  // Oldest → newest, scored uploads only, capped so the line stays readable
  const trend = analyses
    .slice(0, 8)
    .map((a) => a.overallScore)
    .filter((s) => s != null)
    .reverse();

  return (
    <Card padded={false} className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-7 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-7">
        <Enso value={latest.overallScore} size={136} className="mx-auto sm:mx-0" />

        <div className="min-w-0 flex-1">
          <p className="t-label">Latest report · {timeAgo(latest.createdAt)}</p>
          <h2 className="t-h2 mt-3 truncate">{latest.contactInformation.name || 'Unnamed resume'}</h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {verdict && <Seal tone={verdict.tone} size="sm" tilt={-3} animated delay={0.7}>{verdict.short}</Seal>}
            {diff !== null && diff !== 0 && (
              <span className={`inline-flex items-center gap-1 text-[0.8125rem] font-medium ${diff > 0 ? 'text-good' : 'text-bad'}`}>
                {diff > 0 ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
                {diff > 0 ? '+' : '−'}{Math.abs(diff)} since your last upload
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-3">
            <Meter label="ATS match" value={latest.atsScore} delay={0.2} />
            <Meter label="Technical depth" value={latest.technicalDepth?.score ?? null} delay={0.28} />
            <Meter label="Impact" value={latest.impactAndOwnership?.score ?? null} delay={0.36} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 border-t border-line px-6 py-4 sm:px-7">
        {trend.length >= 2 ? (
          <div className="min-w-0 flex-1">
            <Sparkline values={trend} height={36} />
            <p className="t-meta mt-2 truncate">Last {trend.length} uploads</p>
          </div>
        ) : (
          <p className="flex-1 text-[0.8125rem] leading-snug text-ink-faint">
            Upload a revised version and your score trend will appear here.
          </p>
        )}
        <Button variant="secondary" size="sm" onClick={onOpen} className="group flex-shrink-0">
          Open report
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-base ease-out group-hover:translate-x-0.5" />
        </Button>
      </div>
    </Card>
  );
}
