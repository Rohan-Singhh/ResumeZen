import { motion } from 'framer-motion';
import { PhoneIcon } from '@heroicons/react/24/outline';

export default function LoginOptions({ onPhoneLogin }) {
  const handleGoogleLogin = () => {
    // TODO: Implement Google Authentication
    console.log('Google login clicked');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPhoneLogin}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 transition-colors"
      >
        <PhoneIcon className="w-5 h-5" />
        Start with Phone Number
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGoogleLogin}
        className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-800 font-medium flex items-center justify-center space-x-3"
      >
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google" 
          className="w-5 h-5"
        />
        <span>Continue with Google</span>
      </motion.button>
    </motion.div>
  );
} 