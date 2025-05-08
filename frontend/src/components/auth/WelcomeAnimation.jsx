import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './welcomeAnimation.css';

const WelcomeAnimation = ({ 
  isVisible, 
  onComplete, 
  userName, 
  isGoogleLogin = false 
}) => {
  
  // Optimize by memoizing particle positions instead of calculating them on every render
  const particles = useMemo(() => {
    return Array(5).fill(0).map((_, i) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 40 + 5}px`,
      height: `${Math.random() * 40 + 5}px`,
      xOffset: Math.random() * 20 - 10,
      yOffset: -20 - (Math.random() * 20),
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2
    }));
  }, []);
  
  // Auto-complete animation after 3.5 seconds
  useEffect(() => {
    let timer;
    
    if (isVisible) {
      // Ensure we wait the full duration
      timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3500);
      
      // Force body to not scroll during animation
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      if (timer) clearTimeout(timer);
      // Restore scrolling when animation ends
      document.body.style.overflow = '';
    };
  }, [isVisible, onComplete]);
  
  // Extract first name if full name is provided
  const firstName = userName?.split(' ')[0] || 'User';
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[1000] flex items-center justify-center animated-gradient welcome-animation-backdrop gpu-accelerated"
          style={{ willChange: 'opacity, transform' }}
        >
          {/* Flare effect */}
          <div className="flare-effect"></div>
          
          <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
            {/* Background decorative elements */}
            <motion.div 
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1 }}
            >
              {particles.map((particle, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute rounded-full bg-white particle"
                  style={{
                    top: particle.top,
                    left: particle.left,
                    width: particle.width,
                    height: particle.height,
                    willChange: 'transform, opacity, scale'
                  }}
                  initial={{ 
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{ 
                    opacity: [0, 0.2, 0],
                    scale: [0, 1, 0],
                    y: [0, particle.yOffset, particle.yOffset * 2],
                    x: [0, particle.xOffset, particle.xOffset * 2],
                  }}
                  transition={{ 
                    duration: particle.duration,
                    repeat: Infinity,
                    repeatType: 'loop',
                    delay: particle.delay,
                  }}
                />
              ))}
            </motion.div>
            
            {/* Logo */}
            <motion.div
              className="mb-6 float-animation"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="h-24 w-24 rounded-full bg-white shadow-lg flex items-center justify-center glow-effect pulse-animation">
                <span className="text-4xl">🚀</span>
              </div>
            </motion.div>
            
            {/* Welcome message */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <h1 className="text-3xl font-bold text-white shimmer-text mb-2">
                Welcome{firstName ? `, ${firstName}` : ''}!
              </h1>
              <p className="text-indigo-100">
                {isGoogleLogin ? 'Google login successful' : 'Login successful'}
              </p>
            </motion.div>
            
            {/* Animated loading indicator */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Outer ring */}
              <motion.div 
                className="absolute w-20 h-20 rounded-full border-4 border-indigo-300/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ willChange: 'transform' }}
              />
              
              {/* Inner ring */}
              <motion.div 
                className="absolute w-14 h-14 rounded-full border-4 border-t-4 border-t-white border-white/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ willChange: 'transform' }}
              />
              
              {/* Center dot pulse */}
              <motion.div 
                className="w-8 h-8 bg-white rounded-full shadow-lg glow-effect"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ willChange: 'transform' }}
              />
            </motion.div>
            
            {/* Bottom message */}
            <motion.p
              className="mt-12 text-white/80 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Preparing your dashboard...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeAnimation; 