import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function PlanSection({ plans, onPurchase, currentPlan, planEndDate, remainingChecks, hasUnlimitedChecks }) {
  const { purchasePlan } = useAuth();

  // Function to format date
  const formatDate = (date) => {
    if (!date) return 'Not applicable';
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
    const planId = getPlanIdentifier(plan);
    return currentPlan && (
      planId === currentPlan.toLowerCase() || 
      (plan.type && plan.type.toLowerCase() === currentPlan.toLowerCase())
    );
  };

  // Handle plan purchase
  const handlePurchase = async (plan) => {
    try {
      // Call the onPurchase callback (for immediate UI updates)
      onPurchase(plan);
      
      // Generate a safe plan name
      const planName = plan.title || `${plan.checks} ${plan.checks === 1 ? 'Check' : 'Checks'}`;
      
      // Process the purchase through the auth context
      await purchasePlan({
        planId: plan.planId || `plan-${planName.toLowerCase().replace(/\s+/g, '-')}`,
        planName: planName,
        amount: parseFloat(plan.price.toString().replace(/[^0-9.]/g, '')),
        paymentMethod: 'credit_card',
        paymentDetails: {
          plan: planName,
          checks: plan.checksAllowed || plan.checks || 'unlimited'
        }
      });
      
      // Force reload the page to update UI
      window.location.reload();
    } catch (error) {
      console.error('Error purchasing plan:', error);
    }
  };

  // Format the current plan name for display
  const formatPlanName = (planName) => {
    if (!planName || planName.toLowerCase() === 'free') return 'No Plan';
    
    // Capitalize first letter of each word
    return planName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div id="pricing-section" className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Your Subscription</h2>
      
      {/* Current plan details */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800 capitalize">{formatPlanName(currentPlan)} Plan</h3>
            {planEndDate && (
              <p className="text-sm text-gray-600 mt-1">
                Valid until: {formatDate(planEndDate)}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {hasUnlimitedChecks ? 'Unlimited Checks' : `${remainingChecks} checks remaining`}
            </span>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Upgrade Your Plan</h2>
      <div className="space-y-4">
        {plans.map((plan, index) => {
          const isCurrentPlan = isPlanCurrent(plan);
          
          return (
            <motion.div 
              key={index} 
              className={`border rounded-lg p-4 hover:border-primary transition-colors ${
                isCurrentPlan ? 'bg-primary/5 border-primary' : ''
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{plan.title || `${plan.checks || plan.checksAllowed} ${(plan.checks === 1 || plan.checksAllowed === 1) ? 'Check' : 'Checks'}`}</p>
                  {plan.description && <p className="text-sm text-gray-600 mt-1">{plan.description}</p>}
                  <div className="flex items-baseline mt-1">
                    <p className="text-2xl font-bold text-primary">{plan.currency === 'INR' ? '₹' : '$'}{plan.price}</p>
                    <span className="text-gray-600 ml-1">{plan.period ? `/${plan.period}` : ''}</span>
                  </div>
                </div>
                <motion.button 
                  onClick={() => handlePurchase(plan)} 
                  className={`${
                    isCurrentPlan 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary/90'
                  } text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200`}
                  whileTap={{ scale: 0.95 }}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 