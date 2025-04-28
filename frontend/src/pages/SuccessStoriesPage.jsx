import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import SuccessStories from '../components/SuccessStories';

export default function SuccessStoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
          <motion.button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            whileHover={{ x: -4 }}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </motion.button>
        </div>
      </div>

      {/* Success Stories Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SuccessStories />
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div 
        className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-12 sm:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ready to Write Your Success Story?
          </motion.h2>
          <motion.p 
            className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Join thousands of students who have transformed their careers with ResumeZen. Your success story begins with a perfect resume.
          </motion.p>
          <motion.button
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 sm:px-8 py-3 rounded-full hover:bg-secondary transition-all duration-300 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Start Your Success Story
            <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
} 