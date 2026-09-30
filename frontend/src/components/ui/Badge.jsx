import React from 'react';

/**
 * Badge — small status chip. Color only for real state, never decoration.
 *
 * Variants:
 *   neutral | accent (a mark on the resume) | good | warn | bad
 * The old names (emerald / amber / red) still resolve, so report data that
 * maps risk levels to variants keeps working.
 */
const VARIANTS = {
  neutral: 'border-line bg-ink/[0.04] text-ink-muted',
  accent: 'border-primary/25 bg-primary/10 text-primary-light',
  good: 'border-good/25 bg-good/10 text-good',
  warn: 'border-warn/25 bg-warn/10 text-warn',
  bad: 'border-bad/25 bg-bad/10 text-bad',
};
VARIANTS.emerald = VARIANTS.good;
VARIANTS.amber = VARIANTS.warn;
VARIANTS.red = VARIANTS.bad;

export default function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded border px-2 py-[3px] text-[0.75rem] font-medium leading-[1.15]',
        VARIANTS[variant] || VARIANTS.neutral,
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
}
