import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function Hero({ onShowSuccessStories }) {
  const navigate = useNavigate();

  return (
    <div id="home" className="relative min-h-screen overflow-hidden bg-dark-bg text-white pt-28 sm:pt-36">
      {/* Massive Background Glows for SaaS look */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-primary/20 rounded-[100%] blur-[120px] opacity-60 mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-secondary/20 rounded-[100%] blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-accent/20 rounded-[100%] blur-[120px] mix-blend-screen pointer-events-none"></div>

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <SparklesIcon className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium tracking-wide text-gray-300">ResumeZen 2.0 is live</span>
          </motion.div>

          <motion.h1 
            className="text-6xl sm:text-7xl lg:text-[100px] font-extrabold tracking-tight font-display mb-8 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            HACK YOUR <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-shimmer bg-[length:200%_auto]">
              DREAM CAREER
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl sm:text-2xl leading-relaxed text-gray-400 max-w-3xl font-light mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            The world's most advanced AI resume builder. Beat the ATS, highlight your impact, and get hired faster at top tech companies.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <motion.button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto rounded-lg bg-white text-dark-bg px-10 py-4 font-bold text-lg hover:shadow-glow-primary transition-all duration-300 flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Build Resume for Free
              <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              className="w-full sm:w-auto rounded-lg border border-white/20 bg-white/5 backdrop-blur-md px-10 py-4 font-bold text-lg text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onShowSuccessStories}
            >
              View Examples
            </motion.button>
          </motion.div>

          <motion.p
            className="mt-6 text-sm text-gray-500 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            No credit card required • Join 10,000+ professionals
          </motion.p>
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
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                alt="ResumeZen Dashboard"
                className="w-full h-full object-cover rounded-xl opacity-50 border border-white/10 mix-blend-luminosity"
              />
              
              {/* Overlay Mockup UI Elements to make it look like an app */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="w-full max-w-4xl h-full max-h-[500px] bg-dark-bg/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl flex overflow-hidden">
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
                      <div className="w-full h-32 bg-white/5 rounded-lg border border-white/10 p-4">
                        <div className="w-1/3 h-4 bg-white/20 rounded mb-4"></div>
                        <div className="w-full h-3 bg-white/10 rounded mb-2"></div>
                        <div className="w-5/6 h-3 bg-white/10 rounded mb-2"></div>
                        <div className="w-4/6 h-3 bg-white/10 rounded"></div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 h-32 bg-primary/10 rounded-lg border border-primary/20 p-4 flex flex-col justify-center items-center">
                           <div className="text-4xl font-bold text-primary mb-2">98%</div>
                           <div className="text-sm text-primary-light">ATS Match</div>
                        </div>
                        <div className="flex-1 h-32 bg-white/5 rounded-lg border border-white/10"></div>
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