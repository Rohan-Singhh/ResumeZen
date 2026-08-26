import React from 'react';
import { motion } from 'framer-motion';
import { hoverLift, tapPress } from '../../utils/motion';

/**
 * Card — the single surface primitive for the dashboard.
 *
 * Neutral-enterprise surface: flat near-black fill, one crisp border, no glow,
 * no decorative blur blob. Rendered as motion.div so callers can pass entrance
 * variants (initial/animate/variants) straight through; `hover` adds a spring
 * lift + border-lighten for clickable cards.
 *
 * Props:
 *   hover    — spring hover-lift + border-lighten (for clickable cards)
 *   padded   — apply default padding (default true)
 *   className— extra classes, appended last so callers can override
 *   ...rest  — forwarded to motion.div (including any motion props)
 */
export default function Card({
  hover = false,
  padded = true,
  className = '',
  children,
  ...rest
}) {
  const hoverProps = hover
    ? { whileHover: hoverLift, whileTap: tapPress }
    : {};

  return (
    <motion.div
      {...hoverProps}
      className={[
        'rounded-xl border border-line bg-surface',
        padded ? 'p-5 sm:p-6' : '',
        hover ? 'transition-colors hover:border-line-strong' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
