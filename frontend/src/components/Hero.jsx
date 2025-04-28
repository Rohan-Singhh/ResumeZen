import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Hero({ onShowSuccessStories }) {
  return (
    <div id="home" className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left side content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Launch Your Career
              <span className="text-primary block">With a Standout Resume</span>
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg leading-8 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              From campus to career, we help students like you create professional resumes that catch recruiters' attention. Our AI-powered platform makes it easy to showcase your potential.
            </motion.p>
            <motion.div 
              className="mt-10 flex items-center justify-center lg:justify-start gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.button 
                className="rounded-full bg-primary px-8 py-3 text-white hover:bg-secondary transition-all duration-300 flex items-center gap-2 group transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Journey
                <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                className="rounded-full border-2 border-gray-200 px-8 py-3 text-gray-600 hover:border-primary hover:text-primary transition-all duration-300 transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShowSuccessStories}
              >
                See Success Stories
              </motion.button>
            </motion.div>
            <motion.div 
              className="mt-8 flex items-center justify-center lg:justify-start gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    src={`https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${i}.jpg`}
                    alt=""
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">10,000+</span> students landed interviews
              </p>
            </motion.div>
          </motion.div>

          {/* Right side image */}
          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative rounded-2xl bg-gray-900/5 p-8">
              {/* Main image */}
              <div className="relative rounded-xl shadow-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                  alt="Student with laptop and resume in library"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}