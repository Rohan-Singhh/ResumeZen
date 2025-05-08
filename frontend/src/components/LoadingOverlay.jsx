import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import '../components/auth/welcomeAnimation.css';

const LoadingOverlay = ({ message = "Loading your dashboard..." }) => {
  // Check for logout in progress and prevent rendering if needed
  useEffect(() => {
    // This is a safety check to ensure the overlay doesn't show during logout
    if (sessionStorage.getItem('logoutInProgress') === 'true') {
      // Immediately apply display:none style to the overlay
      const overlayElement = document.getElementById('loading-overlay');
      if (overlayElement) {
        overlayElement.style.display = 'none';
      }
    }
  }, []);

  // Don't render at all if logout is in progress
  if (sessionStorage.getItem('logoutInProgress') === 'true') {
    return null;
  }

  return (
    <motion.div 
      id="loading-overlay"
      className="fixed inset-0 animated-gradient welcome-animation-backdrop flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.4,
        ease: "easeInOut"
      }}
    >
      <motion.div 
        className="text-center px-8 py-12 bg-white/10 backdrop-blur-md rounded-2xl max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.5,
          delay: 0.1,
          ease: "easeOut"
        }}
      >
        <div className="relative w-24 h-24 mx-auto mb-6 float-animation">
          {/* Logo */}
          <div className="absolute inset-0 flex items-center justify-center glow-effect">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <span className="text-primary text-2xl font-bold">RZ</span>
            </div>
          </div>
          
          {/* Spinner */}
          <svg className="animate-spin absolute inset-0 h-full w-full text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold text-white shimmer-text mb-3">{message}</h2>
        <p className="text-blue-100 text-sm">
          Retrieving your profile information...
        </p>
        
        {/* Decorative elements with smoother animations */}
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={`bubble-${i}`}
            className="absolute particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 5}px`,
              height: `${Math.random() * 30 + 5}px`,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
            }}
            animate={{ 
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * -40],
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
              repeatType: "loop"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default LoadingOverlay; 