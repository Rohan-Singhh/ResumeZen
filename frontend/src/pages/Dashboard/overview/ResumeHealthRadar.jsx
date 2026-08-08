import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { skillCount } from '../../../utils/analysisSchema';

function deriveCategories(analysis) {
  if (!analysis) return [];

  const { contactInformation: contact, workExperience: work, education: edu } = analysis;

  // Contact Completeness — normalizeAnalysis already blanks 'NA' placeholders
  const contactFields = [contact.email, contact.phone, contact.location, contact.linkedin]
    .filter(Boolean);
  const contactScore = Math.min(100, Math.round((contactFields.length / 4) * 100));

  // Skills Depth
  const skillsScore = Math.min(100, Math.round((skillCount(analysis) / 15) * 100));

  // Experience Quality
  const hasAchievements = work.some(w => w.achievements?.length > 0);
  const expBase = Math.min(100, work.length * 25);
  const expScore = Math.min(100, expBase + (hasAchievements ? 20 : 0));

  // Education
  const eduScore = Math.min(100, edu.length * 50);

  return [
    { label: 'ATS Compatibility', score: analysis.atsScore ?? 0, color: 'violet' },
    { label: 'Contact Completeness', score: contactScore, color: 'cyan' },
    { label: 'Skills Depth', score: skillsScore, color: 'fuchsia' },
    { label: 'Experience Quality', score: expScore, color: 'amber' },
    { label: 'Education', score: eduScore, color: 'teal' },
    { label: 'Technical Depth', score: analysis.technicalDepth?.score ?? 0, color: 'emerald' },
    { label: 'Impact & Ownership', score: analysis.impactAndOwnership?.score ?? 0, color: 'rose' },
  ];
}

const colorMap = {
  violet: { bar: 'from-violet-500 to-fuchsia-500', bg: 'bg-violet-500/10', text: 'text-violet-400' },
  cyan: { bar: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  fuchsia: { bar: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400' },
  amber: { bar: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  teal: { bar: 'from-teal-500 to-emerald-500', bg: 'bg-teal-500/10', text: 'text-teal-400' },
  emerald: { bar: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  rose: { bar: 'from-rose-500 to-pink-500', bg: 'bg-rose-500/10', text: 'text-rose-400' },
};

export default function ResumeHealthRadar({ latestAnalysis }) {
  const categories = deriveCategories(latestAnalysis);
  const overallScore = categories.length > 0
    ? Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length)
    : 0;

  if (!latestAnalysis) {
    return (
      <div className="bg-[#0d0d12]/80 backdrop-blur-md border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <HeartIcon className="h-5 w-5 text-emerald-400" />
          <h3 className="text-base font-bold text-zinc-100 font-display">Resume Health</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-14 w-14 bg-white/[0.03] rounded-full flex items-center justify-center mb-3 border border-white/[0.06]">
            <HeartIcon className="h-7 w-7 text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Analyze a resume to see health metrics</p>
        </div>
      </div>
    );
  }

  const overallColor = overallScore >= 70 ? 'emerald' : overallScore >= 40 ? 'amber' : 'red';

  const scoreColorClass = overallColor === 'emerald' ? 'text-emerald-400' : overallColor === 'amber' ? 'text-amber-400' : 'text-red-400';
  const scoreBgClass = overallColor === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' : overallColor === 'amber' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 relative overflow-hidden hover:border-white/[0.15] transition-all duration-300">
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/[0.03] blur-[60px rounded-full pointer-events-none group-hover:bg-emerald-500/[0.05] transition-colors" />

      {/* Header with overall score */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <HeartIcon className="h-4 w-4 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 font-display">Resume Health</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-${overallColor}-500/10 border border-${overallColor}-500/20 shadow-sm`}>
          <span className={`text-2xl font-extrabold text-${overallColor}-400 font-display tabular-nums`}>{overallScore}%</span>
          <span className={`text-[9px] font-bold text-${overallColor}-400/70 uppercase tracking-wider`}>Overall</span>
        </div>
      </div>

      {/* Category bars */}
      <div className="space-y-4 relative z-10">
        {categories.map((cat, i) => {
          const colors = colorMap[cat.color];
          return (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-zinc-400">{cat.label}</span>
                <span className={`text-xs font-bold tabular-nums ${colors.text}`}>{cat.score}%</span>
              </div>
              <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.score}%` }}
                  transition={{ duration: 0.8, delay: 0.1 * i, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
