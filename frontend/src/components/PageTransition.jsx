import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function PageTransition({ children }) {
  // Track if animation is running to clear CSS transforms after it finishes
  // This is CRITICAL for mobile: if a parent div has `transform`, any `fixed` child
  // (like modals/popups) will be positioned relative to the parent, not the viewport!
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.22, 1, 0.36, 1] // Custom smooth SaaS easing curve
      }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
      className="w-full h-full min-h-screen"
      style={{
        // Force remove transform once animation completes so fixed modals work globally
        transform: isAnimating ? undefined : 'none'
      }}
    >
      {children}
    </motion.div>
  );
}
