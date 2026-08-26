import React from 'react';
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
import { motion } from 'framer-motion';
import { skillCount } from '../../../utils/analysisSchema';
import StatTile from '../../../components/ui/StatTile';
import { staggerContainer, staggerItem } from '../../../utils/motion';

// One accent metric (ATS score); the rest stay neutral so color means
// something instead of decorating every tile a different hue.
const kpiConfigs = [
  {
    key: 'atsScore',
    label: 'ATS Score',
    icon: ChartBarIcon,
    accent: true,
    getValue: (d) => (d.latestAnalysis?.atsScore != null ? `${d.latestAnalysis.atsScore}%` : '—'),
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
    getValue: (d) => {
      const n = skillCount(d.latestAnalysis);
      return n > 0 ? String(n) : '—';
    },
  },
  {
    key: 'strengths',
    label: 'Strengths Found',
    icon: ShieldCheckIcon,
    getValue: (d) => {
      const c = d.latestAnalysis?.strengths.length;
      return c ? String(c) : '—';
    },
  },
  {
    key: 'issues',
    label: 'Issues to Fix',
    icon: ExclamationTriangleIcon,
    getValue: (d) => {
      const c = d.latestAnalysis?.issues.length;
      return c ? String(c) : '—';
    },
  },
  {
    // The audit reports keywords the resume is *missing*, not ones it matched.
    key: 'keywords',
    label: 'Keywords Missing',
    icon: TagIcon,
    getValue: (d) => {
      const c = d.latestAnalysis?.missingKeywords.length;
      return c ? String(c) : '—';
    },
  },
  {
    key: 'resumes',
    label: 'Resumes Analyzed',
    icon: DocumentTextIcon,
    getValue: (d) => String(d.historyCount),
  },
  {
    key: 'credits',
    label: 'Credits Left',
    icon: CreditCardIcon,
    getValue: (d) => d.creditsText,
  },
  {
    key: 'strength',
    label: 'Resume Strength',
    icon: BoltIcon,
    getValue: (d) =>
      d.latestAnalysis?.overallScore != null ? `${d.latestAnalysis.overallScore}%` : '—',
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
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {kpiConfigs.map((kpi) => (
        <StatTile
          key={kpi.key}
          variants={staggerItem}
          icon={kpi.icon}
          label={kpi.label}
          value={kpi.getValue(data)}
          trend={kpi.getTrend ? kpi.getTrend(data) : null}
          accent={kpi.accent}
        />
      ))}
    </motion.div>
  );
}
