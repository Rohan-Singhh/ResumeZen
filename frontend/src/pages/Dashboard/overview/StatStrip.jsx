import React from 'react';
import { motion } from 'framer-motion';
import { skillCount } from '../../../utils/analysisSchema';
import { staggerContainer, staggerItem } from '../../../utils/motion';
import { riskTone } from '../../../components/report/verdict';
import { TONE_TEXT } from '../../../components/graphics/Enso';

/**
 * StatStrip — the counts behind the latest report, as one ruled row.
 *
 * It used to be eight separate cards with eight icons. The numbers are
 * supporting detail, so they share one surface and only the hiring-risk value
 * carries color (it is the only one that is a judgment, not a count).
 */
export default function StatStrip({ latestAnalysis, historyCount }) {
  const risk = latestAnalysis.hiringRiskLevel;
  const hasRisk = risk && risk !== 'Unknown';

  const stats = [
    { label: 'Skills found', value: skillCount(latestAnalysis) },
    { label: 'Strengths', value: latestAnalysis.strengths.length },
    { label: 'To fix', value: latestAnalysis.issues.length },
    // The audit reports keywords the resume is *missing*, not ones it matched.
    { label: 'Missing keywords', value: latestAnalysis.missingKeywords.length },
    { label: 'Hiring risk', value: hasRisk ? risk : '–', tone: hasRisk ? TONE_TEXT[riskTone(latestAnalysis)] : '' },
    { label: 'Resumes analyzed', value: historyCount },
  ];

  return (
    // 1px gaps over a line-colored ground draw the rules at every column count
    <motion.dl
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-e1 sm:grid-cols-3 lg:grid-cols-6"
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={staggerItem} className="bg-surface px-5 py-4">
          <dt className="t-label truncate">{stat.label}</dt>
          <dd className={`t-num mt-3 text-[1.75rem] ${stat.tone || ''}`}>{stat.value}</dd>
        </motion.div>
      ))}
    </motion.dl>
  );
}
