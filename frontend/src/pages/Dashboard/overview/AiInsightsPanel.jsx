import React from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

function getSeverity(index, total) {
  if (total <= 2) return index === 0 ? 'critical' : 'warning';
  const criticalCount = Math.max(1, Math.floor(total * 0.3));
  const warningCount = Math.max(1, Math.floor(total * 0.4));
  if (index < criticalCount) return 'critical';
  if (index < criticalCount + warningCount) return 'warning';
  return 'info';
}

const severityConfig = {
  critical: {
    icon: ExclamationCircleIcon,
    bg: 'bg-white/[0.02] hover:bg-white/[0.04]',
    border: 'border-white/[0.05]',
    accentBorder: 'border-l-red-500',
    text: 'text-red-400',
    label: 'Critical',
    labelBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bg: 'bg-white/[0.02] hover:bg-white/[0.04]',
    border: 'border-white/[0.05]',
    accentBorder: 'border-l-amber-500',
    text: 'text-amber-400',
    label: 'Warning',
    labelBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  info: {
    icon: InformationCircleIcon,
    bg: 'bg-white/[0.02] hover:bg-white/[0.04]',
    border: 'border-white/[0.05]',
    accentBorder: 'border-l-blue-500',
    text: 'text-blue-400',
    label: 'Suggestion',
    labelBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
};

export default function AiInsightsPanel({ latestAnalysis, onViewReport }) {
  const issues = latestAnalysis?.issues || [];
  const strengths = latestAnalysis?.strengths || [];

  if (!latestAnalysis) {
    return (
      <div className="bg-[#0d0d12]/80 backdrop-blur-md border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <SparklesIcon className="h-5 w-5 text-violet-400" />
          <h3 className="text-base font-bold text-zinc-100 font-display">AI Insights</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-14 w-14 bg-white/[0.03] rounded-full flex items-center justify-center mb-3 border border-white/[0.06]">
            <SparklesIcon className="h-7 w-7 text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Upload a resume to get AI-powered insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d12]/80 backdrop-blur-md border border-white/[0.06] rounded-xl p-6 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/[0.04] blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-violet-500/10 rounded-lg border border-violet-500/20">
            <SparklesIcon className="h-4 w-4 text-violet-400" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 font-display">AI Insights</h3>
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
        </div>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest bg-white/[0.03] px-2 py-1 rounded-md border border-white/[0.05]">
          AI Generated
        </span>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-2.5 mb-5 relative z-10">
          {issues.map((issue, i) => {
            const severity = getSeverity(i, issues.length);
            const config = severityConfig[severity];
            const SevIcon = config.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`group flex items-start gap-4 p-4 rounded-xl border-l-[3px] ${config.accentBorder} ${config.bg} border-t border-r border-b ${config.border} transition-all cursor-pointer shadow-sm`}
                onClick={() => onViewReport?.()}
              >
                <div className={`p-2 rounded-lg bg-[#0d0d12] ${config.text} border border-white/[0.08] shadow-inner`}>
                  <SevIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-zinc-300 font-medium leading-relaxed group-hover:text-zinc-100 transition-colors">{issue}</p>
                </div>
                <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${config.labelBg} uppercase tracking-wider`}>
                    {config.label}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 group-hover:text-violet-400 transition-colors mt-0.5">
                    Fix <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2.5">Strengths Detected</p>
          <div className="flex flex-wrap gap-2">
            {strengths.map((str, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + 0.05 * i }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 rounded-lg"
              >
                <CheckCircleIcon className="h-3.5 w-3.5" />
                {str}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
