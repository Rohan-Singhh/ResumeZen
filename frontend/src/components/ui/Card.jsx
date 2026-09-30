import React from 'react';
import { motion } from 'framer-motion';
import { hoverLift } from '../../utils/motion';

/**
 * Card — the single surface primitive.
 *
 * A flat ink fill, one hairline, a lit top edge. No glow, no blur. Rendered as
 * motion.div so callers can pass entrance variants straight through.
 *
 * Props:
 *   hover    — lifts and brightens its border on hover (clickable cards)
 *   padded   — apply default padding (default true)
 *   tone     — default | raised (one step lighter, for nested or featured cards)
 *   className— extra classes, appended last so callers can override
 *   ...rest  — forwarded to motion.div (including any motion props)
 */
const TONES = {
  default: 'bg-surface',
  raised: 'bg-surface-raised',
};

const Card = React.forwardRef(function Card(
  { hover = false, padded = true, tone = 'default', className = '', children, ...rest },
  ref
) {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? hoverLift : undefined}
      className={[
        'rounded-lg border border-line shadow-e1',
        TONES[tone] || TONES.default,
        padded ? 'p-5 sm:p-6' : '',
        hover ? 'transition-colors duration-base hover:border-line-strong' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

export default Card;
