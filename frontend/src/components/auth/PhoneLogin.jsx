import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import styles from './PhoneLogin.module.css';

export default function PhoneLogin({ onBack, onError }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validatePhoneNumber = (number) => {
    // The library handles validation internally
    return number.length >= 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(phoneNumber)) {
      onError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/phone', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phoneNumber })
      // });
      
      // if (!response.ok) throw new Error('Failed to send OTP');
      
      // Navigate to OTP verification page
      // navigate('/verify-otp');
    } catch (error) {
      onError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <motion.button
        onClick={onBack}
        className={`${styles.backButton} ${styles.backButtonHover}`}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        <ChevronLeftIcon className={styles.backIcon} />
        <span className={styles.backText}>Back to login options</span>
      </motion.button>

      <form onSubmit={handleSubmit} className={styles.formWrapper}>
        <motion.div 
          className={`${styles.inputSection}`}
          animate={{ y: isFocused ? -4 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.label 
            htmlFor="phone" 
            className={styles.inputLabel}
            animate={{ color: isFocused ? '#1D4ED8' : '#1F2937' }}
          >
            Enter your phone number
          </motion.label>
          <div className={`${styles.phoneInputContainer} ${styles.phoneInputWrapper}`}>
            <PhoneInput
              country={'us'}
              value={phoneNumber}
              onChange={setPhoneNumber}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              inputProps={{
                id: 'phone',
                disabled: isLoading,
                className: 'w-full !text-gray-900 !bg-transparent',
                style: {
                  height: '3.5rem',
                  fontSize: '1rem',
                  lineHeight: '1.5rem',
                  backgroundColor: 'transparent',
                  color: '#111827',
                  paddingLeft: '72px'
                }
              }}
              containerClass="!w-full"
              buttonClass="!h-14 !bg-transparent !border-0 !w-[60px] !pl-4"
              dropdownClass="!shadow-lg !mt-1"
              searchClass="!border-0 !mx-2 !mt-2"
              enableSearch
              disableSearchIcon
              searchPlaceholder="Search countries..."
              searchNotFound="No matches found"
              countryCodeEditable={false}
              preferredCountries={['us', 'gb', 'ca', 'au']}
              enableAreaCodes={true}
              enableAreaCodeStretch
              autoFormat
            />
            <div 
              className={`${styles.inputRing} ${isFocused ? styles.inputRingFocused : ''}`}
            />
          </div>
          <AnimatePresence>
            {!isLoading && (
              <motion.p 
                className={styles.helperText}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                We'll send you a one-time code to verify your number. Standard message rates may apply.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          type="submit"
          disabled={isLoading || !phoneNumber}
          className={`${styles.submitButton}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span 
            className={`${styles.submitButtonText}`}
            animate={{ opacity: isLoading ? 0 : 1 }}
          >
            Send Code
          </motion.span>
          <motion.span 
            className={`${styles.loadingSpinner}`}
            animate={{ opacity: isLoading ? 1 : 0 }}
          >
            <svg className={styles.spinnerIcon} viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </motion.span>
        </motion.button>
      </form>
    </motion.div>
  );
} 