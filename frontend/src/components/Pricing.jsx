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

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/', {
        state: { selectedPlan: plan }
      });
    }
  };

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
    <section id="pricing" className="py-24 sm:py-32 bg-dark-bg relative overflow-hidden border-t border-white/5">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 relative z-10">
        <div className="text-left md:text-center mb-16 lg:mb-20">
          <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-accent mb-6 bg-accent/10 border border-accent/20 px-6 py-2 rounded-full">
            Pricing
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white font-display tracking-tight">
            Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Pricing</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl md:mx-auto font-light">
            Choose the perfect plan for your career journey. No hidden fees, no surprises.
          </p>
          {error && (
            <p className="mt-4 text-red-500 font-medium bg-red-500/10 py-2 px-4 rounded-lg inline-block">{error}</p>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.planId || index}
                className={`relative bg-dark-card p-8 xl:p-12 rounded-3xl backdrop-blur-xl ${
                  plan.isSpecial ? 'border-2 border-accent bg-accent/5 shadow-glow-accent/20' : 
                  plan.isPopular ? 'border-2 border-primary shadow-glow-primary/20' : 'border border-white/10'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ translateY: -10 }}
                transition={{ duration: 0.4 }}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 right-8 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}
                {plan.isSpecial && (
                  <div className="absolute -top-4 right-8 bg-gradient-to-r from-accent to-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <SparklesIcon className="h-4 w-4" />
                    Special Offer
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-4 text-white font-display">{plan.title}</h3>
                
                <div className="flex items-baseline mb-8 pb-8 border-b border-white/10">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {plan.currency === 'INR' ? '₹' : '$'}{plan.price}
                  </span>
                  <span className="text-gray-500 ml-2 font-medium">/{formatPeriod(plan.period)}</span>
                </div>
                
                <ul className="space-y-4 mb-10 min-h-[250px]">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircleIcon className={`h-6 w-6 mr-3 flex-shrink-0 ${
                        plan.isSpecial ? 'text-accent' : 'text-primary'
                      }`} />
                      <span className="text-gray-300 font-light">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button 
                  onClick={() => handleSelectPlan(plan)}
                  disabled={paymentLoading}
                  className={`w-full font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 ${
                    paymentLoading 
                      ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                      : plan.isSpecial 
                        ? 'bg-accent hover:bg-pink-500 text-white hover:shadow-glow-accent' 
                        : plan.isPopular
                          ? 'bg-primary hover:bg-primary-dark text-white hover:shadow-glow-primary'
                          : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
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