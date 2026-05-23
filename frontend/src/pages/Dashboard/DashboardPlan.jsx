import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

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
    features: ["1 resume ATS check", "Personalized improvement tips", "Basic AI analysis", "24/7 email support", "Export to PDF"]
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
    features: ["5 resume checks", "Track improvement history", "Advanced AI analysis", "Priority email support", "Export to multiple formats", "LinkedIn profile optimization", "Industry-specific keywords"]
  },
  {
    _id: 'unlimited-pack',
    name: "Unlimited Pack",
    price: 500,
    currency: "INR",
    credits: 999,
    durationInDays: 90,
    isUnlimited: true,
    isSpecial: true,
    period: "3 months",
    features: ["Unlimited resume checks", "Real-time ATS scoring", "Premium AI suggestions", "24/7 priority support", "All export formats", "LinkedIn & GitHub optimization", "Custom branding options", "Interview preparation tips", "Job market insights"]
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

  useEffect(() => {
    fetchPlans();
    if (userPlans?.length > 0) hasActiveSubscription();
  }, [userPlans]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getAvailablePlans();
      if (result.success && result.plans?.length > 0) {
        setPlans(result.plans);
      } else {
        setPlans(FALLBACK_PLANS);
        setError(`Using demo plans. ${result.error || 'No plans found'}`);
      }
    } catch (err) {
      setPlans(FALLBACK_PLANS);
      setError(`Unable to load plans: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = "INR") => currency === "INR" ? `₹${price}` : `$${price}`;

  const formatPeriod = (period, planId) => {
    if (planId === 'boost-pack') return 'five-times';
    switch (period) {
      case 'one-time': return 'one-time';
      case 'monthly': return 'month';
      case 'quarterly': return '3 months';
      case 'yearly': return 'year';
      default: return period;
    }
  };

  const hasActiveSubscription = () => {
    if (!userPlans?.length) return false;
    const now = new Date();
    const subs = userPlans.filter(p =>
      p.expiresAt && new Date(p.expiresAt) > now && p.planId?.isUnlimited && p.planId?.durationInDays >= 30
    );
    if (subs.length > 0) {
      setActivePlanInfo({
        name: subs[0].planId?.name || "Subscription Plan",
        expiresAt: new Date(subs[0].expiresAt).toLocaleDateString(),
        durationInDays: subs[0].planId?.durationInDays || 90
      });
      return true;
    }
    return false;
  };

  const handlePurchase = async (plan) => {
    if (!plan?._id) { setPurchaseStatus({ loading: false, success: false, error: 'Invalid plan' }); return; }
    if (hasActiveSubscription()) { setShowSubscriptionWarning(true); return; }

    try {
      setPurchaseStatus({ loading: true, success: false, error: '' });
      const animationDelay = new Promise(r => setTimeout(r, 1500));
      const result = await purchasePlan(plan._id);
      await animationDelay;

      if (result.success) {
        setPurchaseStatus({ loading: false, success: true, error: '' });
        await fetchUserPlans(true);
        localStorage.setItem('planPurchased', Date.now().toString());
        setTimeout(() => setPurchaseStatus({ loading: false, success: false, error: '' }), 3000);
      } else {
        if (result.error?.includes('active subscription') || result.error?.includes('already subscribed') || result.error?.includes('existing plan')) {
          await fetchUserPlans(true);
          setShowSubscriptionWarning(true);
        } else {
          setPurchaseStatus({ loading: false, success: false, error: result.error || 'Purchase failed' });
        }
      }
    } catch {
      setPurchaseStatus({ loading: false, success: false, error: 'Failed to process purchase' });
    }
  };

  const displayPlans = plans.length < 3 ? FALLBACK_PLANS : plans;

  return (
    <div className="space-y-10 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight">Plans & Billing</h1>
          <p className="text-base text-zinc-400 mt-2 font-light">Select the plan that fits your career goals</p>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={fetchPlans} 
          className="text-sm font-semibold text-zinc-300 hover:text-white px-4 py-2 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all shadow-sm self-start md:self-auto"
        >
          Refresh Data
        </motion.button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="px-5 py-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm font-medium text-amber-400 backdrop-blur-md">{error}</div>
      )}
      {purchaseStatus.success && (
        <div className="px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-medium text-emerald-400 flex items-center gap-2 backdrop-blur-md">
          <CheckCircleIcon className="h-5 w-5" /> Plan activated successfully. You can now analyze resumes.
        </div>
      )}
      {purchaseStatus.error && (
        <div className="px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-medium text-red-400 backdrop-blur-md">{purchaseStatus.error}</div>
      )}

      {/* Current Plans */}
      {userPlans?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-lg font-bold text-zinc-100 font-display mb-4 flex items-center gap-2 relative z-10">
            <SparklesIcon className="h-5 w-5 text-emerald-400" /> Your Active Plans
          </h2>
          <div className="space-y-3 relative z-10">
            {userPlans.map((up, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-xl transition-colors hover:bg-white/10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white font-display tracking-wide">{up.planId?.name || 'Unknown Plan'}</p>
                    <p className="text-sm text-zinc-400">
                      {up.planId?.isUnlimited ? 'Unlimited analysis' : `${up.creditsLeft || 0} credits remaining`}
                      {up.expiresAt && ` · Renews ${new Date(up.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Purchased On</p>
                  <p className="text-sm text-zinc-300 font-medium">{new Date(up.purchasedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Plans grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayPlans.length === 0 ? (
        <div className="bg-[#131318]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-lg font-medium text-zinc-300 mb-4">No pricing plans are currently available.</p>
          <button onClick={fetchPlans} className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-glow-primary">Reload Plans</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayPlans.map((plan, index) => (
            <motion.div 
              key={plan._id} 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative bg-[#131318]/80 backdrop-blur-xl rounded-2xl border p-8 flex flex-col transition-all duration-300 group hover:-translate-y-2 ${
                plan.isPopular ? 'border-violet-500/50 shadow-[0_0_40px_rgba(139,92,246,0.15)]' : 
                plan.isSpecial ? 'border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 
                'border-white/10 hover:border-white/20 hover:shadow-xl'
              }`}
            >
              {/* Background ambient glow inside card */}
              {(plan.isPopular || plan.isSpecial) && (
                <div className={`absolute top-0 left-0 w-full h-full rounded-2xl opacity-10 blur-2xl pointer-events-none transition-opacity group-hover:opacity-20 ${plan.isPopular ? 'bg-violet-600' : 'bg-emerald-600'}`} />
              )}

              {/* Badges */}
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-violet-500/30">
                  Most Popular
                </div>
              )}
              {plan.isSpecial && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-emerald-500/30">
                  Best Value
                </div>
              )}

              <div className="flex-1 relative z-10">
                <h3 className="text-xl font-bold text-zinc-100 font-display mb-2">{plan.name}</h3>
                <div className="mb-8 flex items-baseline">
                  <span className="text-5xl font-extrabold text-white tracking-tight font-display">{formatPrice(plan.price, plan.currency)}</span>
                  <span className="text-sm font-semibold text-zinc-500 ml-2">/{formatPeriod(plan.period, plan._id)}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.isPopular ? 'bg-violet-500/20 text-violet-400' : plan.isSpecial ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'}`}>
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-200">{plan.isUnlimited ? 'Unlimited checks' : `${plan.credits} resume ${plan.credits === 1 ? 'check' : 'checks'}`}</span>
                  </li>
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                        <CheckCircleIcon className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      <span className="text-sm text-zinc-400 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 mt-auto">
                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={purchaseStatus.loading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    purchaseStatus.loading
                      ? 'bg-white/5 text-zinc-500 cursor-wait'
                      : plan.isPopular
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-glow-primary'
                        : plan.isSpecial
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/5'
                  }`}
                >
                  {purchaseStatus.loading ? 'Processing…' : 'Get Started'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Subscription warning modal */}
      {showSubscriptionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSubscriptionWarning(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#131318] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-xl font-bold text-zinc-100 font-display">Active Subscription</h3>
              <button onClick={() => setShowSubscriptionWarning(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-300 mb-3 relative z-10 leading-relaxed">
              You already have an active <span className="font-bold text-white">{activePlanInfo?.name}</span> plan.
            </p>
            <p className="text-sm text-zinc-400 mb-8 relative z-10 leading-relaxed">
              Your subscription expires on <span className="font-semibold text-zinc-300">{activePlanInfo?.expiresAt}</span>. You cannot purchase a new plan until your current subscription ends.
            </p>
            <div className="flex justify-end relative z-10">
              <button onClick={() => setShowSubscriptionWarning(false)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}