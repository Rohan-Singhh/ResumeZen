import { useEffect, useId } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { ease } from '../../utils/motion';

/**
 * Ensō — a score drawn as one brush circle.
 *
 * The product's signature shape. The stroke is the score: it sweeps from the
 * top and stops where the number says, leaving the circle open. A light
 * displacement filter roughens the edge so it reads as ink, not a progress bar.
 *
 * Props:
 *   value    — 0–100, or null for "no score yet" (draws the faint ring only)
 *   size     — px (default 120)
 *   tone     — auto (by score) | good | warn | bad | accent | paper
 *   weight   — stroke width in drawing units out of 100 (default 8)
 *   animated — sweep in on mount / on value change (default true)
 *   delay    — seconds before the sweep starts
 *   label    — small caption under the number (e.g. "/ 100"); false hides it
 *   children — replaces the default number readout
 */
const TONE = {
  good: '#74B88F',
  warn: '#DBA748',
  bad: '#EE6A5B',
  accent: '#E0472C',
  paper: '#EFE9DC',
  none: '#8A8478',
};

// Same thresholds everywhere a score is colored
export function scoreTone(score) {
  if (score == null) return 'none';
  if (score >= 70) return 'good';
  if (score >= 40) return 'warn';
  return 'bad';
}

export const TONE_TEXT = {
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
  accent: 'text-primary-light',
  paper: 'text-ink',
  none: 'text-ink-faint',
};

// A full score stops just short of closing: an ensō is always open
const MAX_SWEEP = 0.955;
// Where the brush lands, in degrees clockwise from 12 o'clock
const START_DEG = -62;

/** Counts from its previous value to `value`; renders straight into the DOM. */
export function CountUp({ value, duration = 1.1, delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (reduce) { mv.set(value); return undefined; }
    const controls = animate(mv, value, { duration, delay, ease: ease.out });
    return () => controls.stop();
  }, [value, duration, delay, mv, reduce]);

  return <motion.span className={className}>{text}</motion.span>;
}

export default function Enso({
  value,
  size = 120,
  tone = 'auto',
  weight = 8,
  animated = true,
  delay = 0,
  label = '/ 100',
  className = '',
  children,
}) {
  const uid = useId().replace(/:/g, '');
  const hasValue = value != null;
  const resolved = tone === 'auto' ? scoreTone(value) : tone;
  const color = TONE[resolved] || TONE.paper;

  const r = 50 - weight / 2 - 3;
  const sweep = hasValue ? Math.max(0.012, (Math.min(100, Math.max(0, value)) / 100) * MAX_SWEEP) : 0;

  // Where the stroke begins, for the heavier "landing" dab of the brush
  const startRad = ((START_DEG - 90) * Math.PI) / 180;
  const sx = 50 + r * Math.cos(startRad);
  const sy = 50 + r * Math.sin(startRad);

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <filter id={`${uid}-ink`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
          </filter>
        </defs>

        {/* The unfilled remainder: a hairline, so the full circle is implied */}
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(239,233,220,0.1)" strokeWidth="1" />

        {hasValue && (
          <g filter={`url(#${uid}-ink)`}>
            <motion.circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={weight}
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1 1"
              transform={`rotate(${START_DEG - 90} 50 50)`}
              initial={animated ? { strokeDashoffset: 1 } : false}
              animate={{ strokeDashoffset: 1 - sweep }}
              transition={{ duration: 1.15, delay, ease: ease.out }}
            />
            <motion.circle
              cx={sx}
              cy={sy}
              r={weight * 0.66}
              fill={color}
              initial={animated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25, delay, ease: ease.out }}
              style={{ transformOrigin: `${sx}px ${sy}px` }}
            />
          </g>
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? (
          <>
            <span className="t-num" style={{ fontSize: size * 0.34 }}>
              {hasValue ? (animated ? <CountUp value={value} delay={delay} /> : value) : '–'}
            </span>
            {label && (
              <span className="t-label mt-[0.35em]" style={{ fontSize: Math.max(9, size * 0.085) }}>
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
