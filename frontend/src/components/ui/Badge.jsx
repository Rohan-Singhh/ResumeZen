import React from 'react';

/**
 * Badge — small status pill. Use color only for real state, never decoration.
 *
 * Variants:
 *   neutral | accent | emerald | amber | red
 */
const VARIANTS = {
  neutral: 'bg-white/[0.05] text-ink-muted border-line',
  accent: 'bg-primary/10 text-primary border-primary/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold',
        VARIANTS[variant] || VARIANTS.neutral,
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
}
