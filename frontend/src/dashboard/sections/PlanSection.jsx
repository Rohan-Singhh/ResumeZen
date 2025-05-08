import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function PlanSection({ plans, onPurchase, currentPlan }) {
  const { fetchUserData } = useAuth();
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState({ loading: false, error: null, success: false, message: '' });
  
  // Reset purchase status if notification closed
  useEffect(() => {
    if (purchaseStatus.message) {
      const timer = setTimeout(() => {
        setPurchaseStatus({ loading: false, error: null, success: false, message: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [purchaseStatus.message]);

  // Get a plan identifier that works for all plan types
  const getPlanIdentifier = (plan) => {
    if (plan.planId) {
      return plan.planId;
    }
    if (plan.title) {
      return plan.title.toLowerCase().replace(/\s+/g, '-');
    }
    return `${plan.checks}-checks`;
  };

  // Check if current plan matches the plan in the list
  const isPlanCurrent = (plan) => {
    if (!currentPlan) return false;
    
    // Normalize both the current plan and plan.title for comparison
    const normalizeText = (text) => {
      if (!text) return '';
      return text.toLowerCase().trim().replace(/\s+/g, ' ');
    };
    
    const planTitle = normalizeText(plan.title);
    const planId = normalizeText(plan.planId);
    const planType = normalizeText(plan.type);
    const currentPlanNormalized = normalizeText(currentPlan);
    
    // Compare normalized values
    return (
      planTitle === currentPlanNormalized || 
      planId === currentPlanNormalized || 
      planType === currentPlanNormalized ||
      // Also check for partial matches like "Basic" vs "Basic Check"
      currentPlanNormalized.includes(planTitle) || 
      planTitle.includes(currentPlanNormalized)
    );
  };

  // Handle plan purchase
  const handlePurchase = async (plan) => {
    try {
      // Reset status
      setPurchaseStatus({ loading: true, error: null, success: false, message: 'Processing purchase...' });
      
      // Call the onPurchase callback from Dashboard
      await onPurchase(plan);
      
      // Update success status
      setPurchaseStatus({ 
        loading: false, 
        error: null, 
        success: true, 
        message: `Successfully purchased ${plan.title}!` 
      });
      
      // No need to fetch user data here as it's already done in the Dashboard component
      
    } catch (error) {
      console.error('Error purchasing plan:', error);
      
      // Set error status with specific message
      setPurchaseStatus({ 
        loading: false, 
        error: true, 
        success: false, 
        message: error.response?.data?.error || 'Failed to purchase plan. Please try again later.' 
      });
    }
  };

  // Get plan features based on plan title
  const getPlanFeatures = (plan) => {
    if (plan.title === "Basic Check") {
      return "1 check";
    } else if (plan.title === "Standard Pack") {
      return "5 checks";
    } else if (plan.title === "Unlimited Pack") {
      return "Unlimited checks";
    }
    return "";
  };

  // Toggle plan details
  const togglePlanDetails = (planId) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
    } else {
      setExpandedPlan(planId);
    }
  };

  return (
    <div id="pricing-section" className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Available Plans</h2>
      
      {/* Purchase status message */}
      <AnimatePresence>
        {purchaseStatus.message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`mb-4 p-3 rounded-lg text-center flex items-center justify-center ${
              purchaseStatus.loading ? 'bg-blue-100 text-blue-700' :
              purchaseStatus.error ? 'bg-red-100 text-red-700' :
              purchaseStatus.success ? 'bg-green-100 text-green-700' : ''
            }`}
          >
            {purchaseStatus.success && <CheckCircleIcon className="w-5 h-5 mr-2" />}
            {purchaseStatus.message}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-4">
        {plans.map((plan, index) => {
          const isCurrentPlan = isPlanCurrent(plan);
          const planId = getPlanIdentifier(plan);
          const isExpanded = expandedPlan === planId;
          const planFeatures = getPlanFeatures(plan);
          
          return (
            <div key={index}>
              <motion.div 
                className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
                whileHover={{ scale: 1.002 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-800 mr-2">{plan.title}</h3>
                    <button 
                      onClick={() => togglePlanDetails(planId)}
                      className="text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      <InformationCircleIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-baseline">
                      <span className="text-lg font-medium text-indigo-500 mr-1">₹</span>
                      <span className="text-2xl font-bold text-indigo-500">{plan.price}</span>
                    </div>
                    
                    <motion.button 
                      onClick={() => handlePurchase(plan)} 
                      className={`${
                        isCurrentPlan 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : purchaseStatus.loading 
                            ? 'bg-indigo-400 cursor-wait' 
                            : 'bg-indigo-500 hover:bg-indigo-600'
                      } text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200`}
                      whileTap={{ scale: 0.98 }}
                      disabled={isCurrentPlan || purchaseStatus.loading}
                    >
                      {isCurrentPlan ? 'Current Plan' : 
                       purchaseStatus.loading ? 'Processing...' : 'Purchase'}
                    </motion.button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t text-sm text-gray-600">
                        <p><span className="font-medium">Includes:</span> {planFeatures}</p>
                        {plan.period && (
                          <p className="mt-1"><span className="font-medium">Duration:</span> {plan.period} {plan.period === 1 ? 'month' : 'months'}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 