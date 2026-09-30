import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import Modal, { ModalHeader } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import PlanCard, { PlanCardSkeleton } from '../../components/PlanCard';
import { useToast } from '../../components/ui/Toast';
import { ease, staggerContainer, staggerItem } from '../../utils/motion';

// Credit packs are one-time; only time-boxed plans get a period suffix
const formatPeriod = (plan) => (plan.durationInDays ? plan.period : 'one-time');

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export default function DashboardPlan() {
  const { userPlans, getAvailablePlans, purchasePlan, fetchUserPlans } = useAuth();
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // The plan being activated (its button shows progress), and the last failure
  const [pendingId, setPendingId] = useState(null);
  const [purchaseError, setPurchaseError] = useState('');

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

  // Show the real catalogue or an honest error. A hard-coded fallback could
  // show prices and features that no longer match the backend.
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const result = await getAvailablePlans();
      if (result.success && result.plans?.length > 0) {
        setPlans(result.plans);
      } else {
        setPlans([]);
        setLoadError("The plans didn't load");
      }
    } catch {
      setPlans([]);
      setLoadError("The plans didn't load");
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
        expiresAt: formatDate(subs[0].expiresAt),
        durationInDays: subs[0].planId?.durationInDays || 90
      });
      return true;
    }
    return false;
  };

  const handlePurchase = async (plan) => {
    if (!plan?._id) return;
    if (hasActiveSubscription()) { setShowSubscriptionWarning(true); return; }

    setPendingId(plan._id);
    setPurchaseError('');

    try {
      const result = await purchasePlan(plan._id);

      if (result.success) {
        await fetchUserPlans(true);
        localStorage.setItem('planPurchased', Date.now().toString());
        toast(`${plan.name} is active. Your credits are ready.`);
      } else if (result.error?.includes('active subscription') || result.error?.includes('already subscribed') || result.error?.includes('existing plan')) {
        await fetchUserPlans(true);
        setShowSubscriptionWarning(true);
      } else {
        setPurchaseError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setPurchaseError('Something went wrong. Please try again.');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Plans"
        description="Each analysis uses one credit. Buy what matches how often you are sending resumes out."
      />

      {/* What you have */}
      {userPlans?.length > 0 && (
        <Card className="mb-8">
          <SectionHeader title="Your plans" className="mb-4" />
          <ul className="divide-y divide-line border-t border-line">
            {userPlans.map((up) => {
              const unlimited = Boolean(up.planId?.isUnlimited);
              const left = up.creditsLeft || 0;
              const total = up.planId?.credits ?? 0;
              const usedUp = !unlimited && left <= 0;
              return (
                <li key={up._id || up.planId?._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${usedUp ? 'text-ink-muted' : 'text-ink'}`}>{up.planId?.name || 'Unknown plan'}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-faint">
                      {unlimited ? 'Unlimited analyses' : `${left} of ${total || '—'} checks left`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {!unlimited && total > 0 && (
                      <div className="h-1 w-28 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                        <div className="h-full rounded-full bg-ink/70" style={{ width: `${Math.min(100, (left / total) * 100)}%` }} />
                      </div>
                    )}
                    {usedUp ? (
                      <Badge>Used up</Badge>
                    ) : up.expiresAt ? (
                      <Badge variant="good">Active until {formatDate(up.expiresAt)}</Badge>
                    ) : (
                      <Badge variant="good">Active</Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <AnimatePresence>
        {purchaseError && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: ease.out }}
            className="overflow-hidden"
          >
            <div className="mb-5 flex items-start gap-2.5 rounded-md border border-bad/25 bg-bad/10 px-4 py-3">
              <ExclamationCircleIcon className="mt-px h-5 w-5 flex-shrink-0 text-bad" />
              <div className="text-sm leading-relaxed">
                <p className="font-medium text-bad">The plan wasn&apos;t activated</p>
                <p className="text-bad/85">{purchaseError}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What you can buy */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3" role="status" aria-label="Loading plans">
          {[0, 1, 2].map((i) => <PlanCardSkeleton key={i} />)}
        </div>
      ) : loadError ? (
        <Card padded={false}>
          <EmptyState
            icon={ExclamationCircleIcon}
            title={loadError}
            message="This is usually a connection hiccup. Your existing credits are not affected."
            action={<Button variant="secondary" onClick={fetchPlans}>Try again</Button>}
            className="py-20"
          />
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-stretch"
        >
          {plans.map((plan) => {
            const featured = Boolean(plan.isPopular);
            return (
              <PlanCard
                key={plan._id}
                variants={staggerItem}
                name={plan.name}
                price={plan.price}
                currency={plan.currency}
                period={formatPeriod(plan)}
                headline={plan.isUnlimited ? 'Unlimited checks' : `${plan.credits} resume ${plan.credits === 1 ? 'check' : 'checks'}`}
                features={plan.features}
                featured={featured}
                tag={featured ? 'Popular' : plan.isUnlimited ? 'Unlimited' : null}
                action={
                  <Button
                    variant={featured ? 'ink' : 'secondary'}
                    size="lg"
                    onClick={() => handlePurchase(plan)}
                    loading={pendingId === plan._id}
                    disabled={pendingId !== null && pendingId !== plan._id}
                    className="w-full"
                  >
                    Choose {plan.name}
                  </Button>
                }
              />
            );
          })}
        </motion.div>
      )}

      {/* Existing unlimited plan */}
      <Modal open={showSubscriptionWarning} onClose={() => setShowSubscriptionWarning(false)} labelledBy="sub-warning-title">
        <ModalHeader id="sub-warning-title" icon={ShieldCheckIcon} tone="good" onClose={() => setShowSubscriptionWarning(false)}>
          You already have unlimited
        </ModalHeader>
        <p className="t-body mb-6">
          Your <span className="font-medium text-ink">{activePlanInfo?.name}</span> plan is active until{' '}
          {activePlanInfo?.expiresAt}, so there is nothing to buy until then.
        </p>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setShowSubscriptionWarning(false)} className="w-full sm:w-auto">Got it</Button>
        </div>
      </Modal>
    </div>
  );
}
