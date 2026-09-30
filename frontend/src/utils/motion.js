/**
 * Motion tokens.
 *
 * One vocabulary for the whole product so every transition feels like the same
 * hand: quick, slightly weighted, never bouncy. Reduced motion is handled
 * globally by <MotionConfig reducedMotion="user"> in App.jsx.
 *
 * Durations (seconds) mirror the CSS tokens in tailwind.config.js:
 *   fast 0.12 — hover, press, toggles
 *   base 0.2  — most state changes
 *   slow 0.4  — entrances, large surfaces
 *   page 0.3  — route changes
 */
export const duration = { fast: 0.12, base: 0.2, slow: 0.4, page: 0.3 };

export const ease = {
  out: [0.16, 1, 0.3, 1],   // entrances: fast start, long settle
  standard: [0.2, 0, 0, 1], // state changes
  in: [0.4, 0, 1, 1],       // exits
};

// Snappy spring for hover/press feedback.
export const spring = { type: 'spring', stiffness: 420, damping: 34 };

// Softer spring for entrances and layout shifts.
export const springSoft = { type: 'spring', stiffness: 240, damping: 30 };

// Slow, heavy settle for large hero elements.
export const springGentle = { type: 'spring', stiffness: 110, damping: 22 };

// Subtle hover-lift for interactive cards.
export const hoverLift = { y: -2, transition: spring };
export const tapPress = { scale: 0.97, transition: spring };

// Stagger container + item, for grids/lists that reveal on mount.
export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } },
};

// Scroll reveal: spread onto a motion element. Fires once, slightly before the
// element is fully on screen so nothing appears late.
export const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -12% 0px' },
  transition: { duration: 0.7, delay, ease: ease.out },
});

// The seal coming down on paper: drops from above scale, lands, settles.
export const stamp = {
  initial: { opacity: 0, scale: 1.7, rotate: -14 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: -7,
    transition: { opacity: { duration: 0.08 }, scale: { duration: 0.22, ease: ease.in }, rotate: { duration: 0.22, ease: ease.in } },
  },
};
