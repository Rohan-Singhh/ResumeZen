import { motion } from 'framer-motion';
import { scoreTone, TONE_TEXT } from '../graphics/Enso';
import { ease } from '../../utils/motion';

export const TONE_BAR = {
  good: 'bg-good',
  warn: 'bg-warn',
  bad: 'bg-bad',
  none: 'bg-ink/25',
  plain: 'bg-ink/70',
};

/**
 * Meter — a labelled 0–100 bar. The sub-scores under a headline score.
 *
 * Grows with scaleX (compositor-only), once, when it mounts.
 *
 * Props:
 *   label  — string
 *   value  — 0–100, or null for "not scored"
 *   toned  — color the bar and number by score (default true); false = neutral
 *   delay  — seconds before the bar grows
 */
export default function Meter({ label, value, toned = true, delay = 0, className = '' }) {
  const tone = value == null ? 'none' : toned ? scoreTone(value) : 'plain';

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="truncate text-[0.8125rem] text-ink-muted">{label}</span>
        <span className={`t-meta ${toned ? TONE_TEXT[tone] : 'text-ink'}`}>{value ?? '–'}</span>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-ink/10"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value ?? undefined}
      >
        <motion.div
          className={`h-full w-full origin-left rounded-full ${TONE_BAR[tone]}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (value ?? 0) / 100 }}
          transition={{ duration: 0.9, delay, ease: ease.out }}
        />
      </div>
    </div>
  );
}
