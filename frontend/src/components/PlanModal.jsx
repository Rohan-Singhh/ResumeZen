import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

// Fallback plans to display if API fails
const FALLBACK_PLANS = [
  {
    _id: 'one-time-check',
    name: "One-Time Check",
    price: 19,
    currency: "INR",
    credits: 1,
    durationInDays: null,
    isUnlimited: false,
    period: "one-time",
    features: [
      "1 resume ATS check",
      "Personalized improvement tips",
      "Basic AI analysis",
      "24/7 email support",
      "Export to PDF"
    ]
  },
  {
    _id: 'boost-pack',
    name: "Boost Pack",
    price: 70, 
    currency: "INR",
    credits: 5,
    durationInDays: null,
    isUnlimited: false,
    isPopular: true,
    period: "one-time",
    features: [
      "5 resume checks",
      "Track improvement history",
      "Advanced AI analysis",
      "Priority email support",
      "Export to multiple formats",
      "LinkedIn profile optimization",
      "Industry-specific keywords"
    ]
  },
  {
    _id: 'unlimited-pack',
    name: "Unlimited Pack",
    price: 500,
    currency: "INR",
    credits: 999,
    durationInDays: 90, // 3 months
    isUnlimited: true,
    isSpecial: true,
    period: "3 months",
    features: [
      "Unlimited resume checks",
      "Real-time ATS scoring",
      "Premium AI suggestions",
      "24/7 priority support",
      "All export formats",
      "LinkedIn & GitHub optimization",
      "Custom branding options",
      "Interview preparation tips",
      "Job market insights"
    ]
  }
];

export default function PlanModal({ isOpen, onClose }) {
  const { getAvailablePlans, purchasePlan } = useAuth();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState({ loading: false, success: false, error: '' });
  const [error, setError] = useState('');

  // Fetch available plans when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getAvailablePlans();
      
      if (result.success && result.plans && Array.isArray(result.plans) && result.plans.length > 0) {
        setPlans(result.plans);
      } else {
        // Use fallback plans if API fails
        setPlans(FALLBACK_PLANS);
        setError(`Using demo plans. ${result.error || 'No plans found'}`);
      }
    } catch (err) {
      setPlans(FALLBACK_PLANS);
      setError(`Unable to load plans from server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format price to rupees
  const formatPrice = (price, currency = "INR") => {
    return currency === "INR" ? `₹${price}` : `$${price}`;
  };

  // Format period text for display
  const formatPeriod = (period, planId) => {
    // Special case for Boost Pack
    if (planId === 'boost-pack') {
      return 'five-times';
    }
    
    switch(period) {
      case 'one-time': return 'one-time';
      case 'monthly': return 'month';
      case 'quarterly': return '3 months';
      case 'yearly': return 'year';
      default: return period;
    }
  };

  // Handle plan purchase
  const handlePurchase = async (plan) => {
    try {
      // Set purchase status to loading
      setPurchaseStatus({ loading: true, success: false, error: '' });
      
      // Create a promise that resolves after 1.5 seconds for animation
      const animationDelay = new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the API to purchase the plan
      const result = await purchasePlan(plan._id);
      
      // Wait for animation delay to complete (minimum 1.5 seconds)
      await animationDelay;
      
      if (result.success) {
        // Show success message
        setPurchaseStatus({ loading: false, success: true, error: '' });
        
        // Notify other tabs that a plan was purchased (for cross-tab updates)
        localStorage.setItem('planPurchased', Date.now().toString());
        
        // Close modal after successful purchase after delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setPurchaseStatus({ 
          loading: false, 
          success: false, 
          error: result.error || 'Purchase failed. Please try again.' 
        });
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setPurchaseStatus({ 
        loading: false, 
        success: false, 
        error: 'Failed to process purchase. Please try again later.' 
      });
    }
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {purchaseStatus.success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
                <p className="text-green-700">Purchase successful! Your plan has been activated.</p>
              </div>
            )}

            {purchaseStatus.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <p className="text-red-700">{purchaseStatus.error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="mt-4 text-gray-600">Loading plans...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Display all three plans */}
                {(plans.length < 3 ? FALLBACK_PLANS : plans).map((plan) => (
                  <motion.div
                    key={plan._id}
                    className={`relative bg-white rounded-xl shadow-lg border-2 overflow-hidden flex flex-col ${
                      plan.isSpecial ? 'border-secondary bg-secondary/5' : 
                      plan.isPopular ? 'border-primary' : 'border-gray-200'
                    }`}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Popular badge */}
                    {plan.isPopular && (
                      <div className="absolute -top-0 right-4 bg-primary text-white px-4 py-1 rounded-b-lg text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    
                    {/* Special offer badge */}
                    {plan.isSpecial && (
                      <div className="absolute -top-0 right-4 bg-secondary text-white px-4 py-1 rounded-b-lg text-sm font-semibold flex items-center gap-1">
                        <SparklesIcon className="h-4 w-4" />
                        Special Offer
                      </div>
                    )}
                    
                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                      
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-primary">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">
                          /{formatPeriod(plan.period, plan._id)}
                        </span>
                      </div>
                      
                      <ul className="mb-6 space-y-2">
                        <li className="flex items-start">
                          <CheckCircleIcon className={`h-5 w-5 mr-2 flex-shrink-0 ${
                            plan.isSpecial ? 'text-secondary' : 'text-primary'
                          } mt-0.5`} />
                          <span className="text-gray-600">
                            {plan.isUnlimited ? 'Unlimited Resume Checks' : `${plan.credits} Resume ${plan.credits === 1 ? 'Check' : 'Checks'}`}
                          </span>
                        </li>
                        
                        {/* Display plan features */}
                        {plan.features && plan.features.length > 0 && 
                          plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircleIcon className={`h-5 w-5 mr-2 flex-shrink-0 ${
                                plan.isSpecial ? 'text-secondary' : 'text-primary'
                              } mt-0.5`} />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                    
                    <div className="p-6 pt-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full py-2 rounded-lg font-medium ${
                          purchaseStatus.loading 
                            ? 'bg-gray-200 text-gray-500 relative overflow-hidden' 
                            : plan.isSpecial 
                              ? 'bg-secondary hover:bg-secondary/90 text-white' 
                              : plan.isPopular
                                ? 'bg-primary hover:bg-primary/90 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                        onClick={() => handlePurchase(plan)}
                        disabled={purchaseStatus.loading}
                      >
                        {purchaseStatus.loading ? (
                          <>
                            <span>Processing...</span>
                            <span 
                              className="absolute left-0 top-0 bottom-0 bg-gray-300 opacity-20 animate-shimmer" 
                              style={{ 
                                width: '100%',
                                background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                                backgroundSize: '200% 100%'
                              }} 
                            ></span>
                          </>
                        ) : 'Get Started'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 