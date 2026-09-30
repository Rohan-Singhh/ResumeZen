import { useId } from 'react';
import { motion } from 'framer-motion';
import { stamp } from '../../utils/motion';

/**
 * Seal — a stamped verdict.
 *
 * The brand mark is a seal; this is the same object put to work. Use it for
 * the one-line conclusion of a report ("Likely to pass"), never for ordinary
 * status chips — that is what Badge is for. One seal per view.
 *
 * Props:
 *   tone     — accent | good | warn | bad
 *   size     — sm | md | lg
 *   tilt     — resting rotation in degrees (default -7)
 *   animated — drop onto the page like a stamp when it mounts
 *   delay    — seconds before it lands
 */
const TONES = {
  accent: 'text-primary border-primary',
  good: 'text-good border-good',
  warn: 'text-warn border-warn',
  bad: 'text-bad border-bad',
};

const SIZES = {
  sm: 'px-2 py-1 text-[0.625rem] border-[1.5px]',
  md: 'px-3 py-1.5 text-[0.6875rem] border-2',
  lg: 'px-4 py-2 text-[0.8125rem] border-[2.5px]',
};

export default function Seal({
  tone = 'accent',
  size = 'md',
  tilt = -7,
  animated = false,
  delay = 0,
  className = '',
  children,
}) {
  const uid = useId().replace(/:/g, '');

  const motionProps = animated
    ? {
        initial: stamp.initial,
        animate: {
          ...stamp.animate,
          rotate: tilt,
          transition: { ...stamp.animate.transition, delay },
        },
      }
    : { style: { rotate: tilt } };

  return (
    <motion.span
      {...motionProps}
      className={[
        'relative inline-flex select-none items-center justify-center rounded font-mono font-semibold uppercase leading-none tracking-[0.16em]',
        TONES[tone] || TONES.accent,
        SIZES[size] || SIZES.md,
        className,
      ].join(' ')}
      // Uneven ink: the edge is nibbled by a displacement filter
      style={{ ...(motionProps.style || {}), filter: `url(#${uid})`, transformOrigin: 'center' }}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={uid} x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
      </svg>
      {/* Inner rule, like the double border cut into a real stamp */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-[2px] rounded-[3px] border border-current opacity-40" />
      <span className="relative">{children}</span>
    </motion.span>
  );
}
