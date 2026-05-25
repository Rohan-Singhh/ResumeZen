import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-[#0a0a0c] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-2xl font-bold text-white font-display">Choose Your Plan</h2>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 mb-6 rounded-lg">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {purchaseStatus.success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 mb-6 rounded-lg">
                <p className="text-emerald-400 text-sm font-medium">Purchase successful! Your plan has been activated.</p>
              </div>
            )}

            {purchaseStatus.error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 mb-6 rounded-lg">
                <p className="text-red-400 text-sm font-medium">{purchaseStatus.error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-zinc-400 font-medium">Loading plans...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Display all three plans */}
                {(plans.length < 3 ? FALLBACK_PLANS : plans).map((plan) => (
                  <motion.div
                    key={plan._id}
                    className={`relative bg-[#0f0f12] rounded-2xl border p-1 overflow-hidden flex flex-col transition-all duration-300 ${
                      plan.isSpecial ? 'border-secondary shadow-[0_0_30px_rgba(139,92,246,0.15)]' : 
                      plan.isPopular ? 'border-primary shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'border-white/10 hover:border-white/20'
                    }`}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

                    {/* Popular badge */}
                    {plan.isPopular && (
                      <div className="absolute -top-0 right-4 bg-primary text-white px-4 py-1 rounded-b-lg text-xs font-bold uppercase tracking-wider z-10">
                        Most Popular
                      </div>
                    )}
                    
                    {/* Special offer badge */}
                    {plan.isSpecial && (
                      <div className="absolute -top-0 right-4 bg-secondary text-white px-4 py-1 rounded-b-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 z-10">
                        <SparklesIcon className="h-3 w-3" />
                        Special Offer
                      </div>
                    )}
                    
                    <div className="p-6 flex-grow relative z-10 bg-dark-bg rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-2 font-display">{plan.name}</h3>
                      
                      <div className="mb-6">
                        <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className="text-zinc-500 text-sm font-medium ml-1">
                          /{formatPeriod(plan.period, plan._id)}
                        </span>
                      </div>
                      
                      <ul className="mb-8 space-y-3">
                        <li className="flex items-start">
                          <CheckCircleIcon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                            plan.isSpecial ? 'text-secondary' : 'text-primary'
                          } mt-0.5`} />
                          <span className="text-zinc-300 text-sm font-medium">
                            {plan.isUnlimited ? 'Unlimited Resume Checks' : `${plan.credits} Resume ${plan.credits === 1 ? 'Check' : 'Checks'}`}
                          </span>
                        </li>
                        
                        {/* Display plan features */}
                        {plan.features && plan.features.length > 0 && 
                          plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircleIcon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                                plan.isSpecial ? 'text-secondary' : 'text-primary'
                              } mt-0.5`} />
                              <span className="text-zinc-400 text-sm">{feature}</span>
                            </li>
                          ))
                        }
                      </ul>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                          purchaseStatus.loading 
                            ? 'bg-white/5 text-zinc-500 relative overflow-hidden cursor-not-allowed' 
                            : plan.isSpecial || plan.isPopular
                              ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/5'
                        }`}
                        onClick={() => handlePurchase(plan)}
                        disabled={purchaseStatus.loading}
                      >
                        {purchaseStatus.loading ? (
                          <>
                            <span>Processing...</span>
                            <span 
                              className="absolute left-0 top-0 bottom-0 bg-white/10 animate-shimmer" 
                              style={{ 
                                width: '100%',
                                background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
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
    </AnimatePresence>,
    document.body
  );
}