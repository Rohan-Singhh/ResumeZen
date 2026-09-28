import Glow, { GLOW } from './Glow';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const TARGET_SCORE = 98;

// The scan area is h-40 (160px); the laser travels just past both edges
const SCAN_FROM = -8;
const SCAN_TO = 168;

export default function Hero({ onShowSuccessStories }) {
  const navigate = useNavigate();

  // Ref for the mockup container to trigger animations when in view
  const mockupRef = useRef(null);
  const isInView = useInView(mockupRef, { once: true, margin: "-100px" });

  // The score counts up through a motion value rendered straight into the DOM.
  // The old setInterval called setScore every 20ms — ~100 re-renders of the
  // whole hero in two seconds, right while the entrance animations ran — and
  // its interval was never cleared on unmount.
  const scoreValue = useMotionValue(0);
  const scoreText = useTransform(scoreValue, (v) => `${Math.round(v)}%`);
  const [scoreDone, setScoreDone] = useState(false);

  useEffect(() => {
    if (!isInView) return undefined;
    // Delay so the laser scans first
    const controls = animate(scoreValue, TARGET_SCORE, {
      delay: 0.8,
      duration: 2,
      ease: 'easeOut',
      onComplete: () => setScoreDone(true),
    });
    return () => controls.stop();
  }, [isInView, scoreValue]);

  return (
    <div id="home" className="relative min-h-screen overflow-hidden bg-dark-bg text-white pt-28 sm:pt-36">
      {/* Massive Background Glows for SaaS look */}
      <Glow className="top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px]" strength={0.16} />
      <Glow className="top-40 -left-20 w-[500px] h-[500px]" color={GLOW.secondary} strength={0.14} />
      <Glow className="top-40 -right-20 w-[500px] h-[500px]" color={GLOW.accent} strength={0.14} />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        
        {/* Top: Centered Massive Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <SparklesIcon className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium tracking-wide text-gray-300">ResumeZen 2.0 is live</span>
          </motion.div>

          <motion.h1 
            className="text-5xl sm:text-7xl lg:text-[90px] font-extrabold tracking-tighter font-display mb-8 leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            ENGINEER YOUR <br className="hidden sm:block"/>
            {/* Static gradient: the infinite background-position shimmer
                repainted this 90px headline on every frame */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
              NEXT CAREER MOVE
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl sm:text-2xl leading-relaxed text-zinc-400 max-w-3xl font-light mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            The world's most advanced AI resume engine. Bypass the ATS, highlight true impact, and get hired by elite tech companies.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="relative group w-full sm:w-auto">
              {/* Glowing gradient border effect */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-accent to-secondary rounded-lg blur-sm opacity-70 group-hover:opacity-100 transition duration-500"></div>
              <motion.button 
                onClick={() => navigate('/login')}
                className="relative w-full sm:w-auto rounded-lg bg-white text-zinc-950 px-10 py-4 font-bold text-lg hover:bg-zinc-100 transition-colors duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Auditing Now
                <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
            
            <motion.button 
              className="w-full sm:w-auto rounded-lg border border-white/10 bg-white/5 px-10 py-4 font-bold text-lg text-white hover:bg-white/10 hover:border-white/20 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onShowSuccessStories}
            >
              View Analysis Examples
            </motion.button>
          </motion.div>

          <motion.div
            className="mt-16 border-t border-white/5 pt-8 w-full max-w-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <p className="text-sm text-zinc-500 font-medium mb-6 uppercase tracking-widest text-center">Trusted by engineers landing offers at</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 grayscale">
              <span className="text-2xl font-bold tracking-tighter">Google</span>
              <span className="text-2xl font-bold tracking-tight lowercase">stripe</span>
              <span className="text-2xl font-semibold tracking-wide">META</span>
              <span className="text-2xl font-bold tracking-wider text-red-500">NETFLIX</span>
              <span className="text-2xl font-black italic tracking-tighter">AMAZON</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom: Massive Edge-to-Edge Dashboard Mockup */}
        <motion.div 
          className="w-full max-w-[1400px] mt-24 relative"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, type: "spring", stiffness: 50, damping: 20 }}
        >
          {/* Dashboard Container */}
          <div className="relative rounded-t-3xl border border-white/20 border-b-0 bg-[#0f0f13] shadow-[0_-20px_80px_-20px_rgba(139,92,246,0.3)] overflow-hidden">
            
            {/* Mac Window Header */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="mx-auto flex items-center justify-center bg-white/5 rounded-md px-4 py-1.5 w-64 border border-white/5">
                <span className="text-xs text-gray-400 font-mono">app.resumezen.com</span>
              </div>
            </div>
            
            {/* Main image / Mockup content */}
            <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] bg-gradient-to-b from-[#18181b] to-dark-bg p-8 flex items-center justify-center overflow-hidden">
              {/* grayscale (a static filter, rasterized once) instead of
                  mix-blend-luminosity, which re-blends against everything
                  behind it whenever the layer changes; 1600px is plenty for
                  a half-opacity backdrop */}
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=75"
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover rounded-xl opacity-50 border border-white/10 grayscale"
              />
              
              {/* Overlay Mockup UI Elements to make it look like an app */}
              <div className="absolute inset-0 flex items-center justify-center p-8" ref={mockupRef}>
                <div className="w-full max-w-4xl h-full max-h-[500px] bg-dark-bg/90 rounded-2xl border border-white/20 shadow-2xl flex overflow-hidden relative">
                  {/* Sidebar mockup */}
                  <div className="w-64 border-r border-white/10 p-6 hidden md:block">
                    <div className="w-32 h-6 bg-white/10 rounded-md mb-10"></div>
                    <div className="space-y-4">
                      <div className="w-full h-8 bg-primary/20 border border-primary/30 rounded-md"></div>
                      <div className="w-3/4 h-8 bg-white/5 rounded-md"></div>
                      <div className="w-5/6 h-8 bg-white/5 rounded-md"></div>
                    </div>
                  </div>
                  {/* Main content mockup */}
                  <div className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-48 h-8 bg-white/10 rounded-md"></div>
                      <div className="w-24 h-8 bg-green-500/20 rounded-md"></div>
                    </div>
                    {/* Resume lines */}
                    <div className="space-y-6">
                      <div className="w-full h-40 bg-white/5 rounded-lg border border-white/10 p-6 relative overflow-hidden">
                        {/* Scanning laser. Moves with transform (compositor
                            only) instead of animating `top`, which forced
                            layout every frame, and makes three passes instead
                            of looping forever. */}
                        <motion.div
                          initial={{ y: SCAN_FROM }}
                          animate={isInView ? { y: SCAN_TO } : { y: SCAN_FROM }}
                          transition={{ duration: 2, ease: "easeInOut", repeat: 2, repeatType: "reverse" }}
                          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(139,92,246,0.8)] z-10"
                        />
                        {/* Soft band trailing the laser — a gradient, not blur-xl */}
                        <motion.div
                          initial={{ y: SCAN_FROM, opacity: 0 }}
                          animate={isInView ? { y: SCAN_TO, opacity: [0, 1, 0] } : { y: SCAN_FROM, opacity: 0 }}
                          transition={{ duration: 2, ease: "easeInOut", repeat: 2, repeatType: "reverse" }}
                          className="absolute top-0 left-0 right-0 h-20 -mt-10 bg-gradient-to-b from-transparent via-primary/20 to-transparent z-0"
                        />
                        
                        <div className="w-1/3 h-5 bg-white/20 rounded-md mb-6"></div>
                        <div className="space-y-3">
                          <div className="w-full h-3 bg-white/10 rounded-full"></div>
                          <div className="w-full h-3 bg-white/10 rounded-full"></div>
                          <div className="w-5/6 h-3 bg-white/10 rounded-full"></div>
                          <div className="w-4/6 h-3 bg-white/10 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <motion.div 
                          className="flex-1 h-32 bg-primary/10 rounded-xl border border-primary/30 p-4 flex flex-col justify-center items-center relative overflow-hidden"
                          animate={isInView ? { 
                            boxShadow: ["0px 0px 0px rgba(139,92,246,0)", "0px 0px 30px rgba(139,92,246,0.4)", "0px 0px 10px rgba(139,92,246,0.2)"],
                            borderColor: ["rgba(139,92,246,0.3)", "rgba(139,92,246,0.8)", "rgba(139,92,246,0.5)"]
                          } : {}}
                          transition={{ delay: 1, duration: 1.5 }}
                        >
                           <div className="text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">
                             <motion.span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tabular-nums">
                               {scoreText}
                             </motion.span>
                           </div>
                           <div className="text-sm font-bold tracking-wider text-primary-light uppercase">ATS Match</div>

                           {/* Success mark once the count finishes */}
                           {scoreDone && (
                             <motion.div
                               initial={{ opacity: 0, scale: 0.5 }}
                               animate={{ opacity: 1, scale: 1 }}
                               className="absolute top-2 right-3"
                             >
                               <SparklesIcon className="w-5 h-5 text-accent" />
                             </motion.div>
                           )}
                        </motion.div>
                        
                        <div className="flex-1 h-32 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col justify-center relative overflow-hidden">
                          <div className="text-xs text-gray-400 font-bold uppercase mb-3">AI Suggestions</div>
                          <div className="space-y-2">
                            <div className="w-full h-6 bg-green-500/10 border border-green-500/20 rounded flex items-center px-2">
                               <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                               <div className="h-2 w-16 bg-white/20 rounded"></div>
                            </div>
                            <div className="w-5/6 h-6 bg-amber-500/10 border border-amber-500/20 rounded flex items-center px-2">
                               <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                               <div className="h-2 w-12 bg-white/20 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Gradient fade out at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-dark-bg to-transparent pointer-events-none"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}