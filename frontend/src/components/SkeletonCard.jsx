import React from 'react';

export default function SkeletonCard({ className = '', height = 'h-64', lines = 3 }) {
  return (
    <div className={`bg-[#0d0d12]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-3/4 bg-white/5 rounded-md" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={`skeleton-line-${i}`} className="h-4 bg-white/5 rounded-md" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonKpiCard() {
  return (
    <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-8 rounded-lg bg-white/10" />
        <div className="h-8 w-16 bg-white/10 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonJobCard() {
  return (
    <div className="bg-[#0d0d12]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 h-64">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-3/4 bg-white/5 rounded-md" />
        <div className="h-4 w-1/2 bg-white/5 rounded-md" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/5 rounded-md" />
          <div className="h-3 w-5/6 bg-white/5 rounded-md" />
          <div className="h-3 w-4/5 bg-white/5 rounded-md" />
        </div>
      </div>
    </div>
  );
}
