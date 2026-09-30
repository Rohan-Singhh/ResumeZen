import { useId } from 'react';
import { motion } from 'framer-motion';
import { ease } from '../../utils/motion';

/**
 * Sparkline — a score across uploads, oldest to newest.
 *
 * The vertical scale hugs the data (with headroom, and never tighter than a
 * 30-point window) so a real improvement reads as a rise without a two-point
 * wobble looking like a cliff. Needs at least two points.
 *
 * The line stretches to its container; the points are HTML so they stay round
 * at any width.
 *
 * Props:
 *   values — number[] (0–100), oldest first
 *   height — px
 */
const W = 100;
const H = 40;
const PAD_Y = 5;

export default function Sparkline({ values, height = 44, className = '' }) {
  const uid = useId().replace(/:/g, '');
  if (!values || values.length < 2) return null;

  const last = values.length - 1;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const spread = Math.max(30, hi - lo + 12);
  const floor = Math.max(0, Math.min(100 - spread, (lo + hi) / 2 - spread / 2));

  const x = (i) => (i / last) * W;
  const y = (v) => PAD_Y + (1 - (v - floor) / spread) * (H - PAD_Y * 2);

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join('');
  const area = `${line}L${W} ${H}L0 ${H}Z`;

  return (
    <div
      className={`relative mx-1.5 ${className}`}
      style={{ height }}
      role="img"
      aria-label={`Overall score across your last ${values.length} uploads, oldest first: ${values.join(', ')}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EFE9DC" stopOpacity="0.14" />
            <stop offset="1" stopColor="#EFE9DC" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill={`url(#${uid})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="#EFE9DC"
          strokeOpacity="0.75"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: ease.out }}
        />
      </svg>

      {/* Earlier uploads as hollow points, the latest solid */}
      {values.map((v, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
            i === last ? 'h-2 w-2 bg-ink' : 'h-[5px] w-[5px] border border-ink/70 bg-surface'
          }`}
          style={{ left: `${(x(i) / W) * 100}%`, top: `${(y(v) / H) * 100}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
        />
      ))}
    </div>
  );
}
