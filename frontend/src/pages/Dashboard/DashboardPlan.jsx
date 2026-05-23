import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon, ExclamationCircleIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

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

export default function DashboardPlan() {
  const { userPlans, getAvailablePlans, purchasePlan, fetchUserPlans } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState({ loading: false, success: false, error: '' });
  const [error, setError] = useState('');
  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
  const [activePlanInfo, setActivePlanInfo] = useState(null);

  // Fetch available plans
  useEffect(() => {
    fetchPlans();
    // Check for active subscriptions when component mounts
    if (userPlans && userPlans.length > 0) {
      hasActiveSubscription();
    }
  }, [userPlans]);

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching available plans...');
      const result = await getAvailablePlans();
      console.log('Fetched plans result:', result);
      
      if (result.success && result.plans && Array.isArray(result.plans) && result.plans.length > 0) {
        console.log(`Successfully loaded ${result.plans.length} plans from API`);
        setPlans(result.plans);
      } else {
        console.warn('API returned no plans or invalid data, using fallback plans');
        // Use fallback plans if API fails
        setPlans(FALLBACK_PLANS);
        setError(`Using demo plans. API returned: ${result.error || 'No plans found'}`);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
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

  // Check if user has active subscription plan
  const hasActiveSubscription = () => {
    if (!userPlans || userPlans.length === 0) return false;
    
    const now = new Date();
    
    // Find subscription plans (ones with expiration dates and unlimited flag)
    // We specifically look for unlimited plans since those are typically subscriptions
    const subscriptionPlans = userPlans.filter(plan => 
      plan.expiresAt && 
      new Date(plan.expiresAt) > now && 
      plan.planId?.isUnlimited && 
      plan.planId?.durationInDays >= 30 // Only consider plans with at least 30 days duration
    );
    
    if (subscriptionPlans.length > 0) {
      // Return the first active subscription plan
      const activePlan = subscriptionPlans[0];
      setActivePlanInfo({
        name: activePlan.planId?.name || "Subscription Plan",
        expiresAt: new Date(activePlan.expiresAt).toLocaleDateString(),
        durationInDays: activePlan.planId?.durationInDays || 90
      });
      return true;
    }
    
    return false;
  };

  // Close subscription warning modal
  const closeSubscriptionWarning = () => {
    setShowSubscriptionWarning(false);
  };

  // Handle plan purchase
  const handlePurchase = async (plan) => {
    // Validate plan object
    if (!plan || !plan._id) {
      setPurchaseStatus({ 
        loading: false, 
        success: false, 
        error: 'Invalid plan selected. Please try again.' 
      });
      return;
    }
    
    // Check if user already has an active subscription
    if (hasActiveSubscription()) {
      setShowSubscriptionWarning(true);
      return;
    }
    
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
        
        // Force refresh user plans to update the UI immediately
        await fetchUserPlans(true);
        
        // Notify other tabs that a plan was purchased (for cross-tab updates)
        localStorage.setItem('planPurchased', Date.now().toString());
        
        // Show success message for 3 seconds
        setTimeout(() => {
          setPurchaseStatus({ loading: false, success: false, error: '' });
        }, 3000);
        
        // Show popup notification
        showSuccessPopup(plan.name);
      } else {
        // Check if the error is related to an existing subscription
        if (result.error && (
          result.error.includes('active subscription') || 
          result.error.includes('already subscribed') ||
          result.error.includes('existing plan')
        )) {
          // Force refresh user plans to make sure we have latest data
          await fetchUserPlans(true);
          // Show subscription warning instead of generic error
          setShowSubscriptionWarning(true);
        } else {
          setPurchaseStatus({ 
            loading: false, 
            success: false, 
            error: result.error || 'Purchase failed. Please try again.' 
          });
        }
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

  // Success popup function
  const showSuccessPopup = (planName) => {
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'fixed top-16 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 transform transition-all duration-500 translate-x-full';
    popup.innerHTML = `
      <div class="flex items-start">
        <div class="py-1"><svg class="h-6 w-6 text-green-500 mr-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div>
        <div>
          <p class="font-bold">Success!</p>
          <p class="text-sm">"${planName}" has been successfully purchased.</p>
        </div>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(popup);
    
    // Animate in
    setTimeout(() => {
      popup.classList.replace('translate-x-full', 'translate-x-0');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
      popup.classList.replace('translate-x-0', 'translate-x-full');
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 500);
    }, 5000);
  };

  // Force reload plans
  const handleReloadPlans = () => {
    fetchPlans();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-zinc-900/30 rounded-xl p-6 border border-white/10 mb-6 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2 font-display">Choose Your Plan</h1>
            <p className="text-zinc-400 text-sm">
              Select the plan that best fits your needs. Upgrade anytime.
            </p>
          </div>
          
          {/* Reload button */}
          <button 
            onClick={handleReloadPlans}
            className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-300 rounded-lg transition-colors font-semibold"
          >
            Reload Plans
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-950/20 border-l-4 border-red-500 p-4 mb-6 rounded-lg border-red-500/25">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {purchaseStatus.success && (
        <div className="bg-green-950/20 border-l-4 border-green-500 p-4 mb-6 rounded-lg border-green-500/25 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-green-400 text-sm">Purchase successful! Your plan has been activated.</p>
        </div>
      )}

      {purchaseStatus.error && (
        <div className="bg-red-950/20 border-l-4 border-red-500 p-4 mb-6 rounded-lg border-red-500/25">
          <p className="text-red-400 text-sm">{purchaseStatus.error}</p>
        </div>
      )}
      
      {/* Current Plan Info (if applicable) */}
      {userPlans && userPlans.length > 0 && (
        <div className="bg-green-950/15 rounded-xl p-6 border border-green-500/20 mb-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-zinc-100 flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-400 mr-2" />
            Your Current Plan
          </h2>
          
          <div className="mt-4">
            {userPlans.map((userPlan, index) => (
              <div key={index} className="bg-green-950/10 rounded-lg p-4 mb-2 border border-green-500/10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h3 className="font-semibold text-zinc-200">
                      {userPlan.planId?.name || "Unknown Plan"}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Credits remaining: <span className="font-semibold text-zinc-200">
                        {userPlan.planId?.isUnlimited ? 'Unlimited' : userPlan.creditsLeft || 0}
                      </span>
                    </p>
                    {userPlan.expiresAt && (
                      <p className="text-sm text-zinc-400">
                        Expires: {new Date(userPlan.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right mt-2 md:mt-0">
                    <p className="text-xs text-zinc-500">Purchased</p>
                    <p className="text-sm text-zinc-400">
                      {new Date(userPlan.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Active Subscription Warning Modal */}
      {showSubscriptionWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-zinc-100">Active Subscription</h3>
              <button 
                onClick={closeSubscriptionWarning} 
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-zinc-400 hover:text-zinc-200" />
              </button>
            </div>
            
            <div className="mb-6 text-sm">
              <div className="flex items-start mb-4">
                <ExclamationCircleIcon className="h-6 w-6 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-zinc-300 mb-2">
                    You already have an active subscription plan <span className="font-semibold text-zinc-100">({activePlanInfo?.name})</span> that expires on <span className="font-semibold text-zinc-100">{activePlanInfo?.expiresAt}</span>.
                  </p>
                  <p className="text-zinc-300">
                    You cannot purchase a new plan until your current subscription ends.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r my-4 border-blue-500/25">
                <p className="text-sm text-blue-300">
                  Your current subscription gives you unlimited access for {activePlanInfo?.durationInDays || 90} days. Enjoy all premium features until your subscription ends.
                </p>
              </div>
              
              <p className="text-sm text-zinc-400">
                If you'd like to upgrade or change your plan, please contact our customer support at <a href="mailto:support@resumezen.com" className="text-purple-400 hover:underline">support@resumezen.com</a>.
              </p>
            </div>
            
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={closeSubscriptionWarning}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-purple-500/10 transition-colors"
              >
                I Understand
              </motion.button>
            </div>
          </div>
        </div>
      )}
      
      {/* Plans List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-zinc-400 text-sm">Loading plans...</p>
        </div>
      ) : (
        <>
          {plans.length === 0 ? (
            <div className="bg-yellow-950/20 border border-yellow-500/20 rounded-xl p-8 text-center">
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">No Plans Available</h3>
              <p className="text-yellow-400 text-sm mb-4">
                We couldn't find any subscription plans at the moment. Please try again later.
              </p>
              <button
                onClick={handleReloadPlans}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
              >
                Retry Loading Plans
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Always force display of fallback plans if API plans are incomplete */}
              {(plans.length < 3 ? FALLBACK_PLANS : plans).map((plan) => (
                <motion.div
                  key={plan._id}
                  className={`relative bg-zinc-900/30 backdrop-blur-md rounded-2xl shadow-lg border-2 overflow-hidden flex flex-col transition-all hover:scale-102 hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] ${
                    plan.isSpecial ? 'border-pink-500/50 bg-pink-500/5' : 
                    plan.isPopular ? 'border-purple-500/50 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.08)]' : 'border-white/10'
                  }`}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Popular badge */}
                  {plan.isPopular && (
                    <div className="absolute -top-0 right-4 bg-purple-600 text-purple-100 px-4 py-1 rounded-b-lg text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                  
                  {/* Special offer badge */}
                  {plan.isSpecial && (
                    <div className="absolute -top-0 right-4 bg-pink-600 text-pink-100 px-4 py-1 rounded-b-lg text-xs font-semibold flex items-center gap-1">
                      <SparklesIcon className="h-4 w-4" />
                      Special Offer
                    </div>
                  )}
                  
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-semibold text-zinc-100 mb-2 font-display">{plan.name}</h3>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{formatPrice(plan.price, plan.currency)}</span>
                      <span className="text-zinc-400 text-sm ml-1.5">
                        /{formatPeriod(plan.period, plan._id)}
                      </span>
                    </div>
                    
                    <ul className="mb-6 space-y-2">
                      <li className="flex items-start">
                        <CheckCircleIcon className={`h-5 w-5 mr-2 flex-shrink-0 ${
                          plan.isSpecial ? 'text-pink-400' : 'text-purple-400'
                        } mt-0.5`} />
                        <span className="text-zinc-300 text-sm">
                          {plan.isUnlimited ? 'Unlimited Resume Checks' : `${plan.credits} Resume ${plan.credits === 1 ? 'Check' : 'Checks'}`}
                        </span>
                      </li>
                      
                      {/* Display plan features */}
                      {plan.features && plan.features.length > 0 && 
                        plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircleIcon className={`h-5 w-5 mr-2 flex-shrink-0 ${
                              plan.isSpecial ? 'text-pink-400' : 'text-purple-400'
                            } mt-0.5`} />
                            <span className="text-zinc-300 text-sm">{feature}</span>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                  
                  <div className="p-6 pt-0">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all shadow ${
                        purchaseStatus.loading 
                          ? 'bg-zinc-800 text-zinc-500 relative overflow-hidden' 
                          : plan.isSpecial 
                            ? 'bg-pink-600 hover:bg-pink-500 text-white' 
                            : plan.isPopular
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/10'
                              : 'bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10'
                      }`}
                      onClick={() => handlePurchase(plan)}
                      disabled={purchaseStatus.loading}
                    >
                      {purchaseStatus.loading ? (
                        <>
                          <span>Processing...</span>
                          <span 
                            className="absolute left-0 top-0 bottom-0 bg-zinc-700 opacity-20 animate-shimmer" 
                            style={{ 
                              width: '100%',
                              background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
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
        </>
      )}
    </div>
  );
}