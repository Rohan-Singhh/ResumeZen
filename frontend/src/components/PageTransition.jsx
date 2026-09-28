import { motion } from 'framer-motion';

/**
 * Route-level fade.
 *
 * Opacity only, on purpose. Any transform on this wrapper (the old 10px slide)
 * turns it into the containing block for every `position: fixed` descendant,
 * so while it animated the landing navbar, modals and popups scrolled with
 * the page instead of staying pinned — and it needed a state-driven
 * `transform: none` hack afterwards. A pure fade has neither problem and
 * costs nothing but compositing.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // Exit shorter than enter: with AnimatePresence mode="wait" the next page
      // waits for this, so a long exit reads as lag after every click.
      exit={{ opacity: 0, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}
