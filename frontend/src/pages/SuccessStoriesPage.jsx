import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import SuccessStories from '../components/SuccessStories';

export default function SuccessStoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-primary/30 relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Header with back button */}
      <div className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-16 py-4">
          <motion.button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            whileHover={{ x: -4 }}
          >
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </div>
            <span className="text-sm sm:text-base font-medium">Back to Home</span>
          </motion.button>
        </div>
      </div>

      {/* Success Stories Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <SuccessStories />
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div 
        className="relative py-24 sm:py-32 border-t border-white/5 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 z-0"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            className="text-4xl sm:text-5xl font-bold text-white mb-6 font-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ready to Write <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Your Success Story?</span>
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Join thousands of professionals who have hacked the ATS and landed their dream tech roles with ResumeZen.
          </motion.p>
          <motion.button
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center gap-2 bg-white text-dark-bg px-10 py-4 rounded-xl hover:shadow-glow-primary transition-all duration-300 text-lg font-bold group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Start Your Success Story
            <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}