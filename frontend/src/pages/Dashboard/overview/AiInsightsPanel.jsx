import React from 'react';
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/ui/Card';
import SectionHeader from '../../../components/ui/SectionHeader';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';

export default function AiInsightsPanel({ latestAnalysis, onViewReport }) {
  const issues = latestAnalysis?.issues || [];
  const strengths = latestAnalysis?.strengths || [];

  if (!latestAnalysis) {
    return (
      <Card>
        <SectionHeader icon={SparklesIcon} title="AI Insights" className="mb-4" />
        <EmptyState icon={SparklesIcon} message="Upload a resume to get AI-powered insights" />
      </Card>
    );
  }

  return (
    <Card>
      <SectionHeader
        icon={SparklesIcon}
        title="AI Insights"
        right={<span className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">AI generated</span>}
        className="mb-5"
      />

      {issues.length > 0 && (
        <div className="space-y-2 mb-5">
          {issues.map((issue) => (
            <button
              key={issue}
              onClick={() => onViewReport?.()}
              className="group flex w-full items-start gap-3 rounded-lg border border-line bg-white/[0.02] p-3 text-left transition-colors hover:bg-white/[0.04]"
            >
              <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <span className="flex-1 min-w-0 text-sm text-ink-muted group-hover:text-ink transition-colors">{issue}</span>
              <ArrowRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-ink-faint group-hover:text-primary transition-colors mt-0.5" />
            </button>
          ))}
        </div>
      )}

      {strengths.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint mb-2.5">Strengths detected</p>
          <div className="flex flex-wrap gap-2">
            {strengths.map((str) => (
              <Badge key={str} variant="emerald">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                {str}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
