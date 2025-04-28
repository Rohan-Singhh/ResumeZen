import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginOptions from '../components/auth/LoginOptions';
import PhoneLogin from '../components/auth/PhoneLogin';

export default function Login() {
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneLoginToggle = () => {
    setShowPhoneLogin(true);
    setError('');
  };

  const handleBack = () => {
    setShowPhoneLogin(false);
    setError('');
  };

  const handleError = (message) => {
    setError(message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
         style={{ 
           backgroundImage: `url('https://img.freepik.com/free-vector/workspace-background-design_1300-388.jpg?w=1380&t=st=1709728669~exp=1709729269~hmac=c0f5c8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8')`,
           backgroundColor: 'rgba(255, 255, 255, 0.9)',
           backgroundBlendMode: 'overlay'
         }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue to ResumeZen</p>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showPhoneLogin ? (
            <PhoneLogin key="phone" onBack={handleBack} onError={handleError} />
          ) : (
            <LoginOptions key="options" onPhoneLogin={handlePhoneLoginToggle} onError={handleError} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 