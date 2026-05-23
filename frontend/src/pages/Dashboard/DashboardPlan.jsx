import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircleIcon, 
  XMarkIcon, 
  SparklesIcon, 
  BoltIcon, 
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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
    features: ["1 resume ATS check", "Personalized improvement tips", "Basic AI analysis", "Email support", "Export to PDF"]
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
    features: ["5 resume checks", "Track improvement history", "Advanced AI analysis", "Priority support", "Multiple export formats"]
  },
  {
    _id: 'unlimited-pack',
    name: "Unlimited Pro",
    price: 500,
    currency: "INR",
    credits: 999,
    durationInDays: 90,
    isUnlimited: true,
    isSpecial: true,
    period: "3 months",
    features: ["Unlimited resume checks", "Real-time ATS scoring", "Premium AI suggestions", "24/7 priority support", "Custom branding options"]
  }
];

// --- Purchase Notifier Overlay ---
const PurchaseNotifier = ({ status, errorMsg }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <div className="relative flex flex-col items-center justify-center w-full max-w-md p-8">
        {status === 'loading' && (
          <>
            <motion.div 
              className="absolute w-40 h-40 rounded-full border border-violet-500/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute w-32 h-32 rounded-full border border-violet-400/40"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative w-24 h-24 rounded-full bg-violet-950 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.3)]">
              <BoltIcon className="h-10 w-10 text-violet-400 animate-pulse" />
            </div>
            <motion.h3 
              className="mt-8 text-xl font-bold text-white font-display tracking-tight"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Activating your AI capabilities...
            </motion.h3>
            <p className="mt-2 text-sm text-zinc-400 font-medium">Please wait while we secure your transaction.</p>
          </>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="flex flex-col items-center text-center"
          >
            <div className="relative">
              <motion.div 
                className="absolute inset-0 rounded-full bg-emerald-500/20"
                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0, 0] }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <div className="w-24 h-24 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                <CheckCircleIcon className="h-12 w-12 text-emerald-400" />
              </div>
            </div>
            <h3 className="mt-8 text-2xl font-extrabold text-white font-display tracking-tight">Purchase Successful!</h3>
            <p className="mt-3 text-sm text-zinc-300">Your AI engine is now fully powered and ready to optimize.</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="flex flex-col items-center text-center bg-[#131318] p-8 rounded-2xl border border-red-500/20 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-red-950 flex items-center justify-center mb-5">
              <ExclamationCircleIcon className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2">Transaction Failed</h3>
            <p className="text-sm text-red-300/80">{errorMsg}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default function DashboardPlan() {
  const { userPlans, getAvailablePlans, purchasePlan, fetchUserPlans } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 'idle' | 'loading' | 'success' | 'error'
  const [notifierState, setNotifierState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
  const [activePlanInfo, setActivePlanInfo] = useState(null);

  useEffect(() => {
    fetchPlans();
    if (userPlans?.length > 0) hasActiveSubscription();
  }, [userPlans]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const result = await getAvailablePlans();
      if (result.success && result.plans?.length > 0) {
        setPlans(result.plans);
      } else {
        setPlans(FALLBACK_PLANS);
      }
    } catch (err) {
      setPlans(FALLBACK_PLANS);
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
    if (!plan?._id) return;
    if (hasActiveSubscription()) { setShowSubscriptionWarning(true); return; }

    try {
      setNotifierState('loading');
      
      // Artificial delay for immersive UX if the API is too fast
      const animationDelay = new Promise(r => setTimeout(r, 1800));
      const result = await purchasePlan(plan._id);
      await animationDelay;

      if (result.success) {
        setNotifierState('success');
        await fetchUserPlans(true);
        localStorage.setItem('planPurchased', Date.now().toString());
        setTimeout(() => setNotifierState('idle'), 3000); // Auto dismiss
      } else {
        if (result.error?.includes('active subscription') || result.error?.includes('already subscribed') || result.error?.includes('existing plan')) {
          await fetchUserPlans(true);
          setNotifierState('idle');
          setShowSubscriptionWarning(true);
        } else {
          setErrorMsg(result.error || 'Purchase failed');
          setNotifierState('error');
          setTimeout(() => setNotifierState('idle'), 4000);
        }
      }
    } catch {
      setErrorMsg('Failed to process purchase securely.');
      setNotifierState('error');
      setTimeout(() => setNotifierState('idle'), 4000);
    }
  };

  const displayPlans = plans.length < 3 ? FALLBACK_PLANS : plans;

  return (
    <div className="space-y-10 relative z-10 pb-20">
      
      <AnimatePresence>
        {notifierState !== 'idle' && (
          <PurchaseNotifier status={notifierState} errorMsg={errorMsg} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-zinc-100 font-display tracking-tight">Upgrade Your Engine</h1>
          <p className="text-sm text-zinc-400 mt-1.5 font-light">Select an intelligence tier that fits your career trajectory.</p>
        </motion.div>
      </div>

      {/* Current Plans Portal */}
      {userPlans?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#0d0d12]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <div className="w-full h-full bg-[#0d0d12] rounded-[10px] flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 font-display">Active Subscriptions</h2>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Command Center</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {userPlans.map((up, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/[0.02] border border-white/[0.05] rounded-xl transition-all hover:bg-white/[0.04] hover:border-white/[0.1]">
                <div>
                  <p className="text-lg font-bold text-white font-display tracking-tight mb-0.5">{up.planId?.name || 'Unknown Plan'}</p>
                  <p className="text-sm text-zinc-400 font-medium">
                    {up.planId?.isUnlimited ? 'Unlimited Analysis' : `${up.creditsLeft || 0} checks remaining`}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="inline-flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</span>
                    {up.expiresAt ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active until {new Date(up.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        Lifetime Access
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pricing Grid */}
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {displayPlans.map((plan, index) => {
            const isPop = plan.isPopular;
            const isSpec = plan.isSpecial;
            
            return (
              <motion.div 
                key={plan._id} 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`relative bg-[#0d0d12]/80 backdrop-blur-xl rounded-2xl p-8 flex flex-col transition-all duration-300 group hover:-translate-y-1.5 ${
                  isPop ? 'border border-violet-500/30 shadow-[0_0_40px_rgba(139,92,246,0.1)]' : 
                  isSpec ? 'border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.08)]' : 
                  'border border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                {/* Glow Effects */}
                {isPop && <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/[0.06] rounded-full blur-[60px] pointer-events-none group-hover:bg-violet-500/[0.1] transition-colors" />}
                {isSpec && <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.05] rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/[0.08] transition-colors" />}

                {/* Badges */}
                {isPop && (
                  <div className="absolute -top-3 left-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-violet-500/25">
                    Most Popular
                  </div>
                )}
                {isSpec && (
                  <div className="absolute -top-3 left-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-emerald-500/25">
                    Pro Choice
                  </div>
                )}

                <div className="relative z-10 flex-1">
                  <h3 className="text-xl font-bold text-zinc-100 font-display mb-1">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-white tracking-tight font-display">{formatPrice(plan.price, plan.currency)}</span>
                    <span className="text-sm font-semibold text-zinc-500 ml-1.5">/{formatPeriod(plan.period, plan._id)}</span>
                  </div>

                  <div className="h-[1px] w-full bg-gradient-to-r from-white/[0.08] to-transparent mb-6" />

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1 rounded-md ${isPop ? 'bg-violet-500/20 text-violet-400' : isSpec ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-zinc-300'}`}>
                        <SparklesIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-bold text-zinc-200">{plan.isUnlimited ? 'Unlimited checks' : `${plan.credits} resume ${plan.credits === 1 ? 'check' : 'checks'}`}</span>
                    </li>
                    {plan.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 p-1 rounded-md bg-white/[0.03] text-zinc-500 border border-white/[0.05]">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm text-zinc-400 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 mt-auto pt-4">
                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={notifierState !== 'idle'}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      isPop
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                        : isSpec
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Subscription Warning Modal */}
      <AnimatePresence>
        {showSubscriptionWarning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" 
            onClick={() => setShowSubscriptionWarning(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-bold text-zinc-100 font-display">Active Subscription Detected</h3>
                <button onClick={() => setShowSubscriptionWarning(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 relative z-10">
                <p className="text-sm text-amber-300/90 leading-relaxed font-medium mb-1">
                  You already have an active <span className="font-bold text-amber-400">{activePlanInfo?.name}</span>.
                </p>
                <p className="text-xs text-amber-400/60">
                  Expires: {activePlanInfo?.expiresAt}
                </p>
              </div>
              <p className="text-sm text-zinc-400 mb-8 relative z-10 leading-relaxed font-medium">
                To prevent accidental double-billing, you cannot purchase a new plan until your current subscription period ends.
              </p>
              <div className="flex justify-end relative z-10">
                <button onClick={() => setShowSubscriptionWarning(false)} className="w-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white font-bold py-3 rounded-xl transition-all">
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}