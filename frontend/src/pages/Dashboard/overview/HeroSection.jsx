import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  BriefcaseIcon,
  LinkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export default function HeroSection({ currentUser, latestAnalysis, previousAnalysis }) {
  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const latestScore = latestAnalysis?.overallScore ?? null;
  const prevScore = previousAnalysis?.overallScore ?? null;
  const scoreDiff = latestScore !== null && prevScore !== null ? latestScore - prevScore : null;
  const issueCount = latestAnalysis?.issues.length || 0;
  const strengthCount = latestAnalysis?.strengths.length || 0;

  // Animated count-up for the score ring
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (latestScore === null) return;
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = latestScore / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= latestScore) { setDisplayScore(latestScore); clearInterval(timer); }
      else setDisplayScore(Math.round(start));
    }, step);
    return () => clearInterval(timer);
  }, [latestScore]);

  const scoreColor = latestScore >= 70 ? 'emerald' : latestScore >= 40 ? 'amber' : 'red';
  const scoreGradient = latestScore >= 70
    ? 'from-emerald-400 to-teal-500'
    : latestScore >= 40
      ? 'from-amber-400 to-orange-500'
      : 'from-red-400 to-rose-500';

  // AI status message
  const aiStatus = latestScore !== null
    ? `Your latest resume scored ${latestScore}%.${issueCount > 0 ? ` AI identified ${issueCount} area${issueCount > 1 ? 's' : ''} to improve.` : ` ${strengthCount} strengths detected.`}`
    : "Upload a resume to get your AI-powered ATS analysis.";

  const circumference = 2 * Math.PI * 66;
  const strokeOffset = latestScore !== null ? circumference - (displayScore / 100) * circumference : circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl bg-[#0d0d12]/80 backdrop-blur-xl border border-white/[0.08] p-8 sm:p-10 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-cyan-600/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
        {/* Profile Avatar */}
        <div className="flex-shrink-0 relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white/[0.08] overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.15)] group"
          >
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <span className="text-5xl font-display font-bold text-zinc-700">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            
            {/* Subtle inner ring glow */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] pointer-events-none" />
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {/* AI Active pill */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">AI Active</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display mb-3 text-white leading-[1.1]">
            Welcome back,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 animate-shimmer bg-[length:200%_auto]">
              {firstName}
            </span>
          </h1>

          {/* Profile Ribbon */}
          {(currentUser?.occupation || currentUser?.graduationYear || currentUser?.linkedin || currentUser?.github || currentUser?.website) && (
            <div className="flex flex-wrap items-center gap-2.5 mb-4 mt-1">
              {(currentUser?.occupation || currentUser?.graduationYear) && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
                  <BriefcaseIcon className="h-3.5 w-3.5" />
                  <span>
                    {currentUser.occupation}
                    {currentUser.occupation && currentUser.graduationYear && <span className="mx-1.5 opacity-40">•</span>}
                    {currentUser.graduationYear}
                  </span>
                </div>
              )}
              {(currentUser?.linkedin || currentUser?.github || currentUser?.website) && (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-zinc-400">
                  <LinkIcon className="h-3.5 w-3.5" />
                  {currentUser.linkedin && <a href={currentUser.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>}
                  {currentUser.github && <a href={currentUser.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>}
                  {currentUser.website && <a href={currentUser.website} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Portfolio</a>}
                </div>
              )}
            </div>
          )}

          {/* AI Status */}
          <p className="text-sm sm:text-base text-zinc-400 font-light max-w-xl leading-relaxed">
            <SparklesIcon className="inline h-4 w-4 text-violet-400 mr-1.5 -mt-0.5" />
            {aiStatus}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
