import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { staggerContainer, staggerItem } from '../../utils/motion';

// --- Activation status dialog ---
const PurchaseNotifier = ({ status, errorMsg, onClose }) => (
  <Modal
    open={status !== 'idle'}
    onClose={onClose}
    dismissible={status !== 'loading'}
    labelledBy="purchase-status-title"
    maxWidth="max-w-sm"
    className="flex flex-col items-center p-8 text-center"
    padded={false}
  >
    {status === 'loading' && (
      <>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <h3 id="purchase-status-title" className="mt-6 font-display text-lg font-semibold text-ink">Activating your plan</h3>
        <p className="mt-1.5 text-sm text-ink-muted">This only takes a moment…</p>
      </>
    )}

    {status === 'success' && (
      <>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
          <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
        </span>
        <h3 id="purchase-status-title" className="mt-6 font-display text-lg font-semibold text-ink">Plan activated</h3>
        <p className="mt-1.5 text-sm text-ink-muted">Your credits are ready to use.</p>
      </>
    )}

    {status === 'error' && (
      <>
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <ExclamationCircleIcon className="h-8 w-8 text-red-400" />
        </span>
        <h3 id="purchase-status-title" className="mt-6 font-display text-lg font-semibold text-ink">Couldn't activate plan</h3>
        <p className="mt-1.5 text-sm text-red-400/90">{errorMsg}</p>
      </>
    )}
  </Modal>
);

const formatPrice = (price, currency = 'INR') => (currency === 'INR' ? `₹${price}` : `$${price}`);

// Credit packs are one-time; only time-boxed plans get a period suffix
const formatPeriod = (plan) => (plan.durationInDays ? plan.period : 'one-time');

export default function DashboardPlan() {
  const { userPlans, getAvailablePlans, purchasePlan, fetchUserPlans } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // 'idle' | 'loading' | 'success' | 'error'
  const [notifierState, setNotifierState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
  const [activePlanInfo, setActivePlanInfo] = useState(null);

  // The catalogue only needs loading once; it used to refetch on every
  // userPlans change.
  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (userPlans?.length > 0) hasActiveSubscription();
  }, [userPlans]);

  // Show the real catalogue or an honest error. The old hard-coded fallback
  // plans could show prices and features that no longer match the backend.
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const result = await getAvailablePlans();
      if (result.success && result.plans?.length > 0) {
        setPlans(result.plans);
      } else {
        setPlans([]);
        setLoadError("We couldn't load plans right now.");
      }
    } catch {
      setPlans([]);
      setLoadError("We couldn't load plans right now.");
    } finally {
      setLoading(false);
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
        name: subs[0].planId?.name || 'Subscription Plan',
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

      const result = await purchasePlan(plan._id);

      if (result.success) {
        setNotifierState('success');
        await fetchUserPlans(true);
        localStorage.setItem('planPurchased', Date.now().toString());
        setTimeout(() => setNotifierState('idle'), 3000); // Auto dismiss
      } else if (result.error?.includes('active subscription') || result.error?.includes('already subscribed') || result.error?.includes('existing plan')) {
        await fetchUserPlans(true);
        setNotifierState('idle');
        setShowSubscriptionWarning(true);
      } else {
        setErrorMsg(result.error || 'Something went wrong. Please try again.');
        setNotifierState('error');
        setTimeout(() => setNotifierState('idle'), 4000);
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setNotifierState('error');
      setTimeout(() => setNotifierState('idle'), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <PurchaseNotifier status={notifierState} errorMsg={errorMsg} onClose={() => setNotifierState('idle')} />

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Plans</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Choose the plan that fits how often you analyze resumes.</p>
      </div>

      {/* Current plans */}
      {userPlans?.length > 0 && (
        <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white/[0.03]">
              <ShieldCheckIcon className="h-5 w-5 text-primary" />
            </span>
            <h2 className="font-display text-base font-semibold text-ink">Your plans</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {userPlans.map((up) => {
              const usedUp = !up.planId?.isUnlimited && (up.creditsLeft || 0) <= 0;
              return (
                <div key={up._id || up.planId?._id} className="flex flex-col justify-between gap-3 rounded-lg border border-line bg-white/[0.02] p-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-display text-base font-semibold text-ink">{up.planId?.name || 'Unknown plan'}</p>
                    <p className="text-sm text-ink-muted">
                      {up.planId?.isUnlimited ? 'Unlimited analyses' : `${up.creditsLeft || 0} of ${up.planId?.credits ?? '—'} checks left`}
                    </p>
                  </div>
                  {usedUp ? (
                    <Badge>Used up</Badge>
                  ) : up.expiresAt ? (
                    <Badge variant="emerald">Active until {new Date(up.expiresAt).toLocaleDateString()}</Badge>
                  ) : (
                    <Badge variant="accent">No expiry</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pricing grid */}
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-line bg-surface py-16 text-center">
          <ExclamationCircleIcon className="h-8 w-8 text-ink-faint" />
          <div>
            <p className="font-display text-base font-semibold text-ink">{loadError}</p>
            <p className="mt-1 text-sm text-ink-muted">Check your connection and try again.</p>
          </div>
          <Button variant="secondary" onClick={fetchPlans}>Retry</Button>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-5 lg:grid-cols-3"
        >
          {plans.map((plan) => {
            const highlighted = plan.isPopular;
            return (
              <motion.div
                key={plan._id}
                variants={staggerItem}
                className={`relative flex flex-col rounded-xl border bg-surface p-7 transition-colors ${
                  highlighted ? 'border-primary/40' : 'border-line hover:border-line-strong'
                }`}
              >
                {highlighted && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white">
                    Most popular
                  </span>
                )}

                <div className="flex-1">
                  <h3 className="mb-1 font-display text-lg font-semibold text-ink">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="font-display text-4xl font-semibold tracking-tight text-ink">{formatPrice(plan.price, plan.currency)}</span>
                    <span className="ml-1.5 text-sm text-ink-faint">/ {formatPeriod(plan)}</span>
                  </div>

                  <ul className="mb-8 space-y-3 border-t border-line pt-6">
                    <li className="flex items-start gap-3">
                      <SparklesIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-sm font-semibold text-ink">
                        {plan.isUnlimited ? 'Unlimited checks' : `${plan.credits} resume ${plan.credits === 1 ? 'check' : 'checks'}`}
                      </span>
                    </li>
                    {plan.features?.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-faint" />
                        <span className="text-sm leading-relaxed text-ink-muted">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={highlighted ? 'primary' : 'secondary'}
                  onClick={() => handlePurchase(plan)}
                  disabled={notifierState !== 'idle'}
                  className="w-full py-3"
                >
                  Select plan
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Existing unlimited plan */}
      <Modal open={showSubscriptionWarning} onClose={() => setShowSubscriptionWarning(false)} labelledBy="sub-warning-title">
        <div className="mb-4 flex items-start justify-between">
          <h3 id="sub-warning-title" className="font-display text-lg font-semibold text-ink">You already have unlimited access</h3>
          <button
            onClick={() => setShowSubscriptionWarning(false)}
            aria-label="Close"
            className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-white/[0.05] hover:text-ink"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-ink-muted">
          Your <span className="font-semibold text-ink">{activePlanInfo?.name}</span> plan is active until{' '}
          {activePlanInfo?.expiresAt}, so you don't need another plan until then.
        </p>
        <Button variant="secondary" onClick={() => setShowSubscriptionWarning(false)} className="w-full">
          Got it
        </Button>
      </Modal>
    </div>
  );
}
