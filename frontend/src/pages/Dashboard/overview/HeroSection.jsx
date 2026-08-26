import React from 'react';
import {
  BriefcaseIcon,
  LinkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/ui/Card';

export default function HeroSection({ currentUser, latestAnalysis, previousAnalysis }) {
  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const latestScore = latestAnalysis?.overallScore ?? null;
  const prevScore = previousAnalysis?.overallScore ?? null;
  const scoreDiff = latestScore !== null && prevScore !== null ? latestScore - prevScore : null;
  const issueCount = latestAnalysis?.issues.length || 0;
  const strengthCount = latestAnalysis?.strengths.length || 0;

  const scoreTone =
    latestScore == null ? 'text-ink'
      : latestScore >= 70 ? 'text-emerald-400'
      : latestScore >= 40 ? 'text-amber-400'
      : 'text-red-400';

  const statusLine =
    latestScore !== null
      ? `Your latest resume scored ${latestScore}%.${
          issueCount > 0
            ? ` ${issueCount} area${issueCount > 1 ? 's' : ''} to improve.`
            : ` ${strengthCount} strength${strengthCount !== 1 ? 's' : ''} detected.`
        }`
      : 'Upload a resume to get your AI-powered ATS analysis.';

  return (
    <Card className="flex flex-col sm:flex-row sm:items-center gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="h-20 w-20 rounded-full border border-line overflow-hidden">
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-raised flex items-center justify-center">
              <span className="text-3xl font-display font-semibold text-ink-faint">
                {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-2">
          Welcome back, {firstName}
        </h1>

        {(currentUser?.occupation || currentUser?.graduationYear || currentUser?.linkedin || currentUser?.github || currentUser?.website) && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {(currentUser?.occupation || currentUser?.graduationYear) && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-ink-muted">
                <BriefcaseIcon className="h-3.5 w-3.5" />
                {currentUser.occupation}
                {currentUser.occupation && currentUser.graduationYear && <span className="opacity-40">·</span>}
                {currentUser.graduationYear}
              </span>
            )}
            {(currentUser?.linkedin || currentUser?.github || currentUser?.website) && (
              <span className="inline-flex items-center gap-2 rounded-md border border-line bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-ink-muted">
                <LinkIcon className="h-3.5 w-3.5" />
                {currentUser.linkedin && <a href={currentUser.linkedin} target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">LinkedIn</a>}
                {currentUser.github && <a href={currentUser.github} target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">GitHub</a>}
                {currentUser.website && <a href={currentUser.website} target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">Portfolio</a>}
              </span>
            )}
          </div>
        )}

        <p className="text-sm text-ink-muted leading-relaxed">{statusLine}</p>
      </div>

      {/* Score readout */}
      {latestScore !== null && (
        <div className="flex-shrink-0 sm:text-right sm:border-l border-line sm:pl-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint mb-1">Overall</p>
          <p className={`font-display text-4xl font-semibold tabular-nums leading-none ${scoreTone}`}>
            {latestScore}<span className="text-lg text-ink-faint">%</span>
          </p>
          {scoreDiff !== null && scoreDiff !== 0 && (
            <span className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${scoreDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {scoreDiff > 0 ? <ArrowTrendingUpIcon className="h-3.5 w-3.5" /> : <ArrowTrendingDownIcon className="h-3.5 w-3.5" />}
              {Math.abs(scoreDiff)} pts
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
