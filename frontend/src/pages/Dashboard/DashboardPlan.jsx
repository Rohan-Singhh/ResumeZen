import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Fallback plans to display if API fails
const FALLBACK_PLANS = [
  {
    _id: 'one-time-check',
    name: "One-Time Check",
    price: 19,
    credits: 1,
    durationInDays: null,
    isUnlimited: false,
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
    credits: 5,
    durationInDays: null,
    isUnlimited: false,
    isPopular: true,
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
    credits: 999,
    durationInDays: 90, // 3 months
    isUnlimited: true,
    isSpecial: true,
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

export default function DashboardPlan() {
  const { userPlans, getAvailablePlans, purchasePlan } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState({ loading: false, success: false, error: '' });
  const [error, setError] = useState('');

  // Fetch available plans
  useEffect(() => {
    fetchPlans();
  }, []);

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getAvailablePlans();
      
      if (result.success && result.plans && result.plans.length > 0) {
        setPlans(result.plans);
      } else {
        // Use fallback plans if API fails
        setPlans(FALLBACK_PLANS);
        setError('Using demo plans.');
      }
    } catch (err) {
      console.error('Error loading plans:', err);
      setPlans(FALLBACK_PLANS);
      setError('Unable to load plans from server.');
    } finally {
      setLoading(false);
    }
  };

  // Format price to rupees
  const formatPrice = (price) => {
    return `₹${price}`;
  };

  // Handle plan purchase
  const handlePurchase = async (plan) => {
    try {
      setPurchaseStatus({ loading: true, success: false, error: '' });
      
      const result = await purchasePlan(plan._id);
      
      if (result.success) {
        setPurchaseStatus({ loading: false, success: true, error: '' });
        // Show success message briefly
        setTimeout(() => {
          setPurchaseStatus({ loading: false, success: false, error: '' });
        }, 3000);
      } else {
        setPurchaseStatus({ loading: false, success: false, error: result.error || 'Purchase failed' });
      }
    } catch (err) {
      setPurchaseStatus({ loading: false, success: false, error: 'Failed to process purchase' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600">
          Select the plan that best fits your needs. Upgrade anytime.
        </p>
      </div>
      
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
      
      {/* Current Plan Info (if applicable) */}
      {userPlans && userPlans.length > 0 && (
        <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
            Your Current Plan
          </h2>
          
          <div className="mt-4">
            {userPlans.map((userPlan, index) => (
              <div key={index} className="bg-white rounded-lg p-4 mb-2 border border-green-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{userPlan.planId.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Credits remaining: <span className="font-medium">{userPlan.creditsLeft}</span>
                    </p>
                    {userPlan.expiresAt && (
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(userPlan.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Purchased</p>
                    <p className="text-sm text-gray-600">
                      {new Date(userPlan.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Plans List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan._id}
              className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              {/* Popular badge */}
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              
              {/* Special offer badge */}
              {plan.isSpecial && (
                <div className="absolute top-0 left-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-br-lg">
                  SPECIAL OFFER
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">{formatPrice(plan.price)}</span>
                  {plan.durationInDays ? (
                    <span className="text-gray-500 text-sm ml-1">
                      for {Math.floor(plan.durationInDays / 30)} {Math.floor(plan.durationInDays / 30) === 1 ? 'month' : 'months'}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm ml-1">one-time</span>
                  )}
                </div>
                
                <ul className="mb-6 space-y-2">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">
                      {plan.isUnlimited ? 'Unlimited Resume Checks' : `${plan.credits} Resume ${plan.credits === 1 ? 'Check' : 'Checks'}`}
                    </span>
                  </li>
                  
                  {/* Display plan features */}
                  {plan.features && plan.features.length > 0 && 
                    plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))
                  }
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-2 rounded-lg font-medium bg-primary text-white"
                  onClick={() => handlePurchase(plan)}
                  disabled={purchaseStatus.loading}
                >
                  {purchaseStatus.loading ? 'Processing...' : 'Get Started'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 