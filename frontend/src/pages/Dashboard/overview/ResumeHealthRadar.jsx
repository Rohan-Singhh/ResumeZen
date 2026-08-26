import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { skillCount } from '../../../utils/analysisSchema';
import Card from '../../../components/ui/Card';
import SectionHeader from '../../../components/ui/SectionHeader';
import EmptyState from '../../../components/ui/EmptyState';

function deriveCategories(analysis) {
  if (!analysis) return [];

  const { contactInformation: contact, workExperience: work, education: edu } = analysis;

  const contactFields = [contact.email, contact.phone, contact.location, contact.linkedin].filter(Boolean);
  const contactScore = Math.min(100, Math.round((contactFields.length / 4) * 100));
  const skillsScore = Math.min(100, Math.round((skillCount(analysis) / 15) * 100));
  const hasAchievements = work.some((w) => w.achievements?.length > 0);
  const expScore = Math.min(100, Math.min(100, work.length * 25) + (hasAchievements ? 20 : 0));
  const eduScore = Math.min(100, edu.length * 50);

  return [
    { label: 'ATS Compatibility', score: analysis.atsScore ?? 0 },
    { label: 'Contact Completeness', score: contactScore },
    { label: 'Skills Depth', score: skillsScore },
    { label: 'Experience Quality', score: expScore },
    { label: 'Education', score: eduScore },
    { label: 'Technical Depth', score: analysis.technicalDepth?.score ?? 0 },
    { label: 'Impact & Ownership', score: analysis.impactAndOwnership?.score ?? 0 },
  ];
}

// Static classes only — Tailwind cannot see `text-${x}-400` at build time.
function toneClasses(score) {
  if (score >= 70) return { text: 'text-emerald-400', bar: 'bg-emerald-500' };
  if (score >= 40) return { text: 'text-amber-400', bar: 'bg-amber-500' };
  return { text: 'text-red-400', bar: 'bg-red-500' };
}

export default function ResumeHealthRadar({ latestAnalysis }) {
  const categories = deriveCategories(latestAnalysis);
  const overall = categories.length
    ? Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length)
    : 0;

  if (!latestAnalysis) {
    return (
      <Card>
        <SectionHeader icon={HeartIcon} title="Resume Health" className="mb-4" />
        <EmptyState icon={HeartIcon} message="Analyze a resume to see health metrics" />
      </Card>
    );
  }

  const overallTone = toneClasses(overall);

  return (
    <Card>
      <SectionHeader
        icon={HeartIcon}
        title="Resume Health"
        right={
          <span className={`font-display text-xl font-semibold tabular-nums ${overallTone.text}`}>
            {overall}%
          </span>
        }
        className="mb-6"
      />

      <div className="space-y-4">
        {categories.map((cat, i) => {
          const tone = toneClasses(cat.score);
          return (
            <div key={cat.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-ink-muted">{cat.label}</span>
                <span className={`text-xs font-semibold tabular-nums ${tone.text}`}>{cat.score}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.score}%` }}
                  transition={{ duration: 0.6, delay: 0.05 * i, ease: 'easeOut' }}
                  className={`h-full rounded-full ${tone.bar}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
