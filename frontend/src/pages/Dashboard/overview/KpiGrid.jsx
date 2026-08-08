import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  TagIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { skillCount } from '../../../utils/analysisSchema';

const kpiConfigs = [
  {
    key: 'atsScore',
    label: 'ATS Score',
    icon: ChartBarIcon,
    accent: 'violet',
    gradient: 'from-violet-500 to-fuchsia-500',
    getValue: (d) => d.latestAnalysis?.atsScore != null ? `${d.latestAnalysis.atsScore}%` : '—',
    getTrend: (d) => {
      const curr = d.latestAnalysis?.atsScore;
      const prev = d.previousAnalysis?.atsScore;
      if (curr == null || prev == null) return null;
      return curr - prev;
    },
  },
  {
    key: 'skills',
    label: 'Skills Detected',
    icon: CpuChipIcon,
    accent: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    getValue: (d) => {
      const n = skillCount(d.latestAnalysis);
      return n > 0 ? String(n) : '—';
    },
    getTrend: () => null,
  },
  {
    key: 'strengths',
    label: 'Strengths Found',
    icon: ShieldCheckIcon,
    accent: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    getValue: (d) => {
      const c = d.latestAnalysis?.strengths.length;
      return c ? String(c) : '—';
    },
    getTrend: () => null,
  },
  {
    key: 'issues',
    label: 'Issues to Fix',
    icon: ExclamationTriangleIcon,
    accent: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    getValue: (d) => {
      const c = d.latestAnalysis?.issues.length;
      return c ? String(c) : '—';
    },
    getTrend: () => null,
  },
  {
    // The audit reports keywords the resume is *missing*, not ones it matched.
    key: 'keywords',
    label: 'Keywords Missing',
    icon: TagIcon,
    accent: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    getValue: (d) => {
      const c = d.latestAnalysis?.missingKeywords.length;
      return c ? String(c) : '—';
    },
    getTrend: () => null,
  },
  {
    key: 'resumes',
    label: 'Resumes Analyzed',
    icon: DocumentTextIcon,
    accent: 'violet',
    gradient: 'from-violet-500 to-indigo-500',
    getValue: (d) => String(d.historyCount),
    getTrend: () => null,
  },
  {
    key: 'credits',
    label: 'Credits Left',
    icon: CreditCardIcon,
    accent: 'teal',
    gradient: 'from-teal-500 to-emerald-500',
    getValue: (d) => d.creditsText,
    getTrend: () => null,
  },
  {
    key: 'strength',
    label: 'Resume Strength',
    icon: BoltIcon,
    accent: 'fuchsia',
    gradient: 'from-fuchsia-500 to-violet-500',
    getValue: (d) => {
      if (!d.latestAnalysis) return '—';
      return d.latestAnalysis.overallScore != null ? `${d.latestAnalysis.overallScore}%` : '—';
    },
    getTrend: (d) => {
      const curr = d.latestAnalysis?.overallScore;
      const prev = d.previousAnalysis?.overallScore;
      if (curr == null || prev == null) return null;
      return curr - prev;
    },
  },
];

export default function KpiGrid({ latestAnalysis, previousAnalysis, historyCount, creditsText }) {
  const data = { latestAnalysis, previousAnalysis, historyCount, creditsText };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpiConfigs.map((kpi, i) => {
        const value = kpi.getValue(data);
        const trend = kpi.getTrend(data);

        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            className="group relative bg-[#0d0d12]/80 backdrop-blur-md border border-white/[0.06] rounded-xl p-4 overflow-hidden hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Accent line */}
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${kpi.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Background glow on hover */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-[0.06] blur-2xl rounded-full transition-opacity duration-500`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${kpi.gradient} p-[1px]`}>
                  <div className="w-full h-full bg-[#0d0d12] rounded-[7px] flex items-center justify-center">
                    <kpi.icon className="h-4 w-4 text-white/70" />
                  </div>
                </div>

                {trend !== null && trend !== 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    trend > 0
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                  </span>
                )}
              </div>

              <p className="text-2xl font-extrabold text-white font-display tabular-nums tracking-tight leading-none mb-1">
                {value}
              </p>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {kpi.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
