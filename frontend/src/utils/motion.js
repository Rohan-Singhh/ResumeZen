/**
 * Shared motion presets.
 *
 * One spring vocabulary for the whole dashboard so micro-interactions feel like
 * one system (the transitions.dev signature: spring physics + staggered
 * timing), not per-component guesses. Reduced-motion is handled globally by the
 * <MotionConfig reducedMotion="user"> wrapper in App.jsx.
 */

// Snappy spring for hover/press feedback.
export const spring = { type: 'spring', stiffness: 320, damping: 26 };

// Softer spring for entrances.
export const springSoft = { type: 'spring', stiffness: 220, damping: 30 };

// Subtle hover-lift for interactive cards.
export const hoverLift = { y: -3, transition: spring };
export const tapPress = { scale: 0.97, transition: spring };

// Stagger container + item, for grids/lists that reveal on mount.
export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: springSoft },
};
