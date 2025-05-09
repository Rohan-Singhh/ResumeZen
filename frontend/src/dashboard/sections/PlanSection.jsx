import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function PlanSection({ plans, onPurchase, currentPlan, remainingChecks, hasUnlimitedChecks, planEndDate }) {
  const { fetchUserData, currentUser } = useAuth();
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState({ loading: false, error: null, success: false, message: '' });
  const [localUserData, setLocalUserData] = useState({
    currentPlan: currentPlan || 'free',
    remainingChecks: remainingChecks || 0,
    hasUnlimitedChecks: hasUnlimitedChecks || false,
    planEndDate: planEndDate || null
  });
  
  // Update local state when props change
  useEffect(() => {
    setLocalUserData({
      currentPlan: currentPlan || 'free',
      remainingChecks: remainingChecks || 0,
      hasUnlimitedChecks: hasUnlimitedChecks || false,
      planEndDate: planEndDate || null
    });
  }, [currentPlan, remainingChecks, hasUnlimitedChecks, planEndDate]);
  
  // Update local state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setLocalUserData({
        currentPlan: currentUser.currentPlan || currentUser.plan || 'no_plan',
        remainingChecks: currentUser.remainingChecks || 0,
        hasUnlimitedChecks: currentUser.hasUnlimitedChecks || false,
        planEndDate: currentUser.planEndDate ? new Date(currentUser.planEndDate) : null
      });
    }
  }, [currentUser]);
  
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
    if (!localUserData.currentPlan || localUserData.currentPlan === 'no_plan') return false;
    
    // Normalize both the current plan and plan.title for comparison
    const normalizeText = (text) => {
      if (!text) return '';
      return text.toLowerCase().trim().replace(/\s+/g, ' ');
    };
    
    const planTitle = normalizeText(plan.title);
    const planId = normalizeText(plan.planId);
    const planType = normalizeText(plan.type);
    const currentPlanNormalized = normalizeText(localUserData.currentPlan);
    
    // Compare normalized values
    return (
      planTitle === currentPlanNormalized || 
      planId === currentPlanNormalized || 
      planType === currentPlanNormalized ||
      // Also check for partial matches like "Basic" vs "Basic Check"
      currentPlanNormalized.includes(planTitle) || 
      planTitle.includes(currentPlanNormalized) ||
      // Special case for unlimited
      (plan.title === "Unlimited Pack" && localUserData.hasUnlimitedChecks)
    );
  };

  // Handle plan purchase
  const handlePurchase = async (plan) => {
    try {
      // Reset status
      setPurchaseStatus({ loading: true, error: null, success: false, message: 'Processing purchase...' });
      
      console.log('PlanSection: Preparing to purchase plan:', plan);
      
      // Validate plan ID
      if (!plan || (!plan._id && !plan.id && !plan.planId)) {
        console.error('Plan is missing ID properties:', plan);
        setPurchaseStatus({ 
          loading: false, 
          error: true, 
          success: false, 
          message: 'Invalid plan data: missing ID. Please try again with a different plan.' 
        });
        return;
      }
      
      // Ensure plan has all required properties
      const enhancedPlan = {
        ...plan,
        _id: plan._id || plan.id || plan.planId, // Ensure we have an _id property
        id: plan._id || plan.id || plan.planId, // Ensure we have an id property too
        planId: plan._id || plan.id || plan.planId, // And a planId property for good measure
        type: plan.type || (plan.title?.includes("Unlimited") ? 'duration' : 'count'),
        value: plan.value || plan.checks || (plan.title?.includes("Unlimited") ? 90 : 1),
        name: plan.name || plan.title
      };
      
      console.log('PlanSection: Enhanced plan for purchase:', enhancedPlan);
      
      // Call the onPurchase callback from Dashboard
      const result = await onPurchase(enhancedPlan);
      
      if (result && result.success) {
        // Update success status
        setPurchaseStatus({ 
          loading: false, 
          error: null, 
          success: true, 
          message: `Successfully purchased ${plan.title || plan.name}!` 
        });
        
        // Refresh user data to ensure up-to-date information
        try {
          const updatedUserData = await fetchUserData(true); // Force refresh
          if (updatedUserData) {
            console.log('User data refreshed in PlanSection after purchase:', updatedUserData);
            setLocalUserData({
              currentPlan: updatedUserData.currentPlan || updatedUserData.plan || 'free',
              remainingChecks: updatedUserData.remainingChecks || 0,
              hasUnlimitedChecks: updatedUserData.hasUnlimitedChecks || false,
              planEndDate: updatedUserData.planEndDate || updatedUserData.planExpiresAt ? 
                new Date(updatedUserData.planEndDate || updatedUserData.planExpiresAt) : null
            });
          }
        } catch (refreshError) {
          console.error('Failed to refresh user data after purchase:', refreshError);
        }
      } else {
        // Set error status with specific message
        setPurchaseStatus({ 
          loading: false, 
          error: true, 
          success: false, 
          message: result?.error || 'Failed to purchase plan. Please try again later.' 
        });
      }
    } catch (error) {
      console.error('Error purchasing plan:', error);
      
      // Set error status with specific message
      setPurchaseStatus({ 
        loading: false, 
        error: true, 
        success: false, 
        message: error.response?.data?.error || error.message || 'Failed to purchase plan. Please try again later.' 
      });
    }
  };

  // Get plan features based on plan title
  const getPlanFeatures = (plan) => {
    if (plan.title === "One-Time Check" || plan.title === "Basic Check") {
      return "1 check";
    } else if (plan.title === "Boost Pack" || plan.title === "Standard Pack") {
      return "5 checks";
    } else if (plan.title === "Unlimited Pack") {
      return "Unlimited checks";
    }
    return plan.checksAllowed ? `${plan.checksAllowed} checks` : "";
  };

  // Toggle plan details
  const togglePlanDetails = (planId) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
    } else {
      setExpandedPlan(planId);
    }
  };
  
  // Format remaining time for display
  const formatRemainingTime = (endDate) => {
    if (!endDate) return '';
    
    const now = new Date();
    const end = new Date(endDate);
    
    if (now > end) return 'Expired';
    
    const diffTime = Math.abs(end - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 1 ? `${diffDays} days left` : 'Expires today';
  };

  return (
    <div id="pricing-section" className="bg-white rounded-xl shadow-md p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-2">Your Current Plan</h2>
      
      {/* Current plan status */}
      <div className="mb-4 sm:mb-6 bg-indigo-50 p-3 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h3 className="font-medium text-indigo-800">
              {localUserData.hasUnlimitedChecks ? 'Unlimited Pack' : 
               localUserData.currentPlan === 'no_plan' ? 'No Plan' : 
               localUserData.currentPlan}
            </h3>
            <p className="text-sm text-indigo-600">
              {localUserData.hasUnlimitedChecks ? 'Unlimited resume checks' : 
               localUserData.currentPlan === 'no_plan' ? 'Purchase a plan to analyze resumes' :
               `${localUserData.remainingChecks} ${localUserData.remainingChecks === 1 ? 'check' : 'checks'} remaining`}
            </p>
          </div>
          {localUserData.planEndDate && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full mt-2 sm:mt-0 inline-block w-max">
              {formatRemainingTime(localUserData.planEndDate)}
            </span>
          )}
        </div>
      </div>
      
      <h3 className="text-md sm:text-lg font-medium mb-3 sm:mb-4">Available Plans</h3>
      
      {/* Purchase status message */}
      <AnimatePresence>
        {purchaseStatus.message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`mb-3 sm:mb-4 p-3 rounded-lg text-center flex items-center justify-center ${
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
      
      <div className="space-y-3 sm:space-y-4">
        {plans.map((plan, index) => {
          const isCurrentPlan = isPlanCurrent(plan);
          const planId = getPlanIdentifier(plan);
          const isExpanded = expandedPlan === planId;
          const planFeatures = getPlanFeatures(plan);
          
          return (
            <div key={index}>
              <motion.div 
                className={`border rounded-lg p-3 sm:p-4 transition-colors ${
                  isCurrentPlan ? 'border-indigo-500 bg-indigo-50' : 'hover:border-indigo-500'
                }`}
                whileHover={{ scale: 1.002 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start sm:items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="text-sm sm:text-base font-medium text-gray-800 mr-2">{plan.title}</h3>
                    <button 
                      onClick={() => togglePlanDetails(planId)}
                      className="text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6">
                    <div className="flex items-baseline">
                      <span className="text-md sm:text-lg font-medium text-indigo-500 mr-1">₹</span>
                      <span className="text-xl sm:text-2xl font-bold text-indigo-500">{plan.price.replace('₹', '')}</span>
                    </div>
                    
                    <motion.button 
                      onClick={() => handlePurchase(plan)} 
                      className={`${
                        isCurrentPlan 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : purchaseStatus.loading 
                            ? 'bg-indigo-400 cursor-wait' 
                            : 'bg-indigo-500 hover:bg-indigo-600'
                      } text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap`}
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
                      <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t text-xs sm:text-sm text-gray-600">
                        <p><span className="font-medium">Includes:</span> {planFeatures}</p>
                        {plan.period && (
                          <p className="mt-1"><span className="font-medium">Duration:</span> {plan.period === 'one-time' ? 'One-time purchase' : 
                           plan.period === 'monthly' ? '1 month' :
                           plan.period === 'quarterly' ? '3 months' :
                           plan.period === 'yearly' ? '1 year' : plan.period}</p>
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