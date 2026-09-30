import { motion } from 'framer-motion';
import { ease } from '../../utils/motion';

/**
 * Red-pen marks: the strokes an editor leaves on a page. Each draws itself
 * once (`play`), in the order its `delay` says.
 *
 * They stretch to whatever they annotate (preserveAspectRatio="none"), which
 * also makes the stroke slightly thick-and-thin like a real pen.
 */
const PEN = '#D8412A';

const draw = (play, delay, duration = 0.55) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: play ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
  transition: { pathLength: { duration, delay, ease: ease.standard }, opacity: { duration: 0.01, delay } },
});

/** Wraps a phrase and underlines it with a loose hand-drawn stroke. */
export function Underlined({ children, play = true, delay = 0, color = PEN, weight = 2.2, className = '' }) {
  return (
    <span className={`relative whitespace-nowrap ${className}`}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.28em] left-0 h-[0.5em] w-full overflow-visible"
      >
        <motion.path
          d="M1 6.5C18 3.5 33 8 52 5.5S86 3 99 6"
          fill="none"
          stroke={color}
          strokeWidth={weight}
          strokeLinecap="round"
          {...draw(play, delay)}
        />
      </svg>
    </span>
  );
}

/** Wraps a phrase and rings it, the way you circle a word to question it. */
export function Circled({ children, play = true, delay = 0, color = PEN, className = '' }) {
  return (
    <span className={`relative whitespace-nowrap ${className}`}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -inset-x-[0.45em] -inset-y-[0.3em] h-[calc(100%+0.6em)] w-[calc(100%+0.9em)] overflow-visible"
      >
        <motion.path
          d="M14 9C34 1 78 1 93 11C104 20 92 35 62 37C34 39 4 35 3 21C2 10 22 4 47 4"
          fill="none"
          stroke={color}
          strokeWidth="1.7"
          strokeLinecap="round"
          {...draw(play, delay, 0.7)}
        />
      </svg>
    </span>
  );
}

/** A quick tick. */
export function Tick({ play = true, delay = 0, color = PEN, className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`overflow-visible ${className}`}>
      <motion.path
        d="M3 13.5C6 15.5 8 18 9.5 21C12.5 13 16.5 7 22 2.5"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(play, delay, 0.4)}
      />
    </svg>
  );
}

/** Handwritten note. Fades up just after the mark it explains. */
export function Note({ children, play = true, delay = 0, tilt = -3, className = '' }) {
  return (
    <motion.span
      className={`inline-block font-hand font-semibold leading-[1.05] text-[#D8412A] ${className}`}
      initial={{ opacity: 0, y: 4, rotate: tilt }}
      animate={play ? { opacity: 1, y: 0, rotate: tilt } : { opacity: 0, y: 4, rotate: tilt }}
      transition={{ duration: 0.4, delay, ease: ease.out }}
    >
      {children}
    </motion.span>
  );
}
