import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated, user, purchasePlan } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        // Try to fetch plans from API if in production
        if (import.meta.env.PROD) {
          try {
            const response = await axios.get('/api/plans');
            if (response.data && response.data.plans && response.data.plans.length > 0) {
              setPlans(response.data.plans);
              setError(null);
              return;
            }
          } catch (apiErr) {
            console.log('Using fallback plans due to API error:', apiErr);
          }
        }
        
        // Use hardcoded plans as fallback
        setPlans([
          {
            planId: 'one-time-check',
            title: "One-Time Check",
            price: 19,
            currency: "INR",
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
            planId: 'boost-pack',
            title: "Boost Pack",
            price: 70,
            currency: "INR",
            period: "one-time",
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
            planId: 'unlimited-pack',
            title: "Unlimited Pack",
            price: 500,
            currency: "INR",
            period: "3 months",
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
        ]);
        setError(null);
      } catch (err) {
        console.error('Error setting up pricing plans:', err);
        setError('Failed to load pricing plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  // Handle plan selection and payment
  const handlePlanSelection = async (planId) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    try {
      setPaymentLoading(true);
      
      // Get the selected plan details
      const selectedPlan = plans.find(p => p.planId === planId);
      if (!selectedPlan) {
        throw new Error('Plan not found');
      }
      
      // Prepare plan details for API
      const planDetails = {
        planId: selectedPlan.planId,
        planName: selectedPlan.title,
        amount: selectedPlan.price,
        currency: selectedPlan.currency || 'INR',
        paymentMethod: 'credit_card',
        paymentDetails: {
          source: 'direct_payment',
          plan: selectedPlan.title,
          checks: selectedPlan.title === "Unlimited Pack" ? 'unlimited' : 
                 selectedPlan.title === "Boost Pack" ? 5 : 1
        }
      };
      
      // Use the AuthContext purchasePlan function
      const { user: updatedUser } = await purchasePlan(planDetails);
      
      if (updatedUser) {
        // Show success message
        alert('Payment successful! Your plan has been updated.');
        
        // Navigate to dashboard
        navigate('/dashboard', {
          state: { 
            planUpdated: true,
            planName: selectedPlan.title
          }
        });
      } else {
        throw new Error('Failed to update plan');
      }
    } catch (err) {
      console.error('Payment failed:', err);
      alert(`Payment failed: ${err.message || 'Please try again later.'}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Format period text for display
  const formatPeriod = (period) => {
    switch(period) {
      case 'one-time': return 'one-time';
      case 'monthly': return 'month';
      case 'quarterly': return '3 months';
      case 'yearly': return 'year';
      default: return period;
    }
  };

  return (
    <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing 💸
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your career journey. No hidden fees, no surprises.
          </p>
          {error && (
            <p className="mt-4 text-red-500">{error}</p>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.planId || index}
                className={`relative bg-white p-8 rounded-xl shadow-lg border-2 ${
                  plan.isSpecial ? 'border-secondary bg-secondary/5' : 
                  plan.isPopular ? 'border-primary' : 'border-gray-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ translateY: -5 }}
                transition={{ duration: 0.3 }}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 right-4 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                {plan.isSpecial && (
                  <div className="absolute -top-4 right-4 bg-secondary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <SparklesIcon className="h-4 w-4" />
                    Special Offer
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-primary">
                    {plan.currency === 'INR' ? '₹' : '$'}{plan.price}
                  </span>
                  <span className="text-gray-500 ml-2">/{formatPeriod(plan.period)}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircleIcon className={`h-5 w-5 mr-2 flex-shrink-0 ${
                        plan.isSpecial ? 'text-secondary' : 'text-primary'
                      } mt-0.5`} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button 
                  onClick={() => handlePlanSelection(plan.planId)}
                  disabled={paymentLoading}
                  className={`w-full font-semibold py-3 px-8 rounded-lg transition-all duration-300 ${
                    paymentLoading 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : plan.isSpecial 
                        ? 'bg-secondary hover:bg-secondary/90 text-white' 
                        : plan.isPopular
                          ? 'bg-primary hover:bg-primary/90 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                  whileHover={{ scale: paymentLoading ? 1 : 1.02 }}
                  whileTap={{ scale: paymentLoading ? 1 : 0.98 }}
                >
                  {paymentLoading ? 'Processing...' : isAuthenticated ? 'Select Plan' : 'Sign In to Purchase'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}