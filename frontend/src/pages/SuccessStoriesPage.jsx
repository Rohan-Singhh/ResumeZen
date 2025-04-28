import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import SuccessStories from '../components/SuccessStories';

export default function SuccessStoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <motion.button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            whileHover={{ x: -4 }}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Home
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
    </div>
  );
} 