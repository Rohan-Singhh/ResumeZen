import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ActivityTimeline({ history, onSelectResume }) {
  const items = (history || []).slice(0, 6);

  return (
    <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 flex flex-col h-full relative overflow-hidden hover:border-white/[0.15] transition-all duration-300">
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/[0.03] blur-[50px] rounded-full pointer-events-none group-hover:bg-cyan-500/[0.05] transition-colors" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <ClockIcon className="h-4 w-4 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 font-display">Activity</h3>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar relative z-10">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-center">
            <div className="h-12 w-12 bg-white/[0.03] rounded-full flex items-center justify-center mb-3 border border-white/[0.06]">
              <ClockIcon className="h-6 w-6 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-500">No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[9px] top-3 bottom-3 w-[1.5px] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

            <div className="space-y-1">
              {items.map((item, i) => {
                const score = item.overallScore;
                const isLatest = i === 0;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    onClick={() => onSelectResume?.(item)}
                    className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-all relative"
                  >
                    {/* Dot */}
                    <div className="relative flex-shrink-0 mt-1">
                      {isLatest ? (
                        <span className="relative flex h-[18px] w-[18px]">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
                          <span className="relative inline-flex h-[18px] w-[18px] rounded-full bg-[#0d0d12] border-2 border-emerald-500 items-center justify-center">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex h-[18px] w-[18px] rounded-full bg-[#0d0d12] border-2 border-white/10 items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-zinc-200 truncate">
                          {item.contactInformation.name || 'Resume analyzed'}
                        </p>
                        {score !== null && (
                          <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
                            score >= 70 ? 'bg-emerald-500/15 text-emerald-400' :
                            score >= 40 ? 'bg-amber-500/15 text-amber-400' :
                            'bg-red-500/15 text-red-400'
                          }`}>
                            {score}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-zinc-600">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>

                    <ArrowRightIcon className="h-3.5 w-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-1.5" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
