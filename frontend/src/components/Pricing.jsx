import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SectionHeading from './ui/SectionHeading';
import Button from './ui/Button';
import PlanCard, { PlanCardSkeleton } from './PlanCard';
import { reveal } from '../utils/motion';

// Shown when the catalogue can't be reached (and always in development, where
// there is usually no backend running).
const FALLBACK_PLANS = [
  {
    planId: 'one-time-check',
    title: 'One-Time Check',
    price: 19,
    currency: 'INR',
    period: 'one-time',
    features: [
      '1 resume ATS check',
      'Personalized improvement tips',
      'Basic AI analysis',
      '24/7 email support',
      'Export to PDF',
    ],
  },
  {
    planId: 'boost-pack',
    title: 'Boost Pack',
    price: 70,
    currency: 'INR',
    period: 'one-time',
    isPopular: true,
    features: [
      '5 resume checks',
      'Track improvement history',
      'Advanced AI analysis',
      'Priority email support',
      'Export to multiple formats',
      'LinkedIn profile optimization',
      'Industry-specific keywords',
    ],
  },
  {
    planId: 'unlimited-pack',
    title: 'Unlimited Pack',
    price: 500,
    currency: 'INR',
    period: '3 months',
    isSpecial: true,
    features: [
      'Unlimited resume checks',
      'Real-time ATS scoring',
      'Premium AI suggestions',
      '24/7 priority support',
      'All export formats',
      'LinkedIn & GitHub optimization',
      'Custom branding options',
      'Interview preparation tips',
      'Job market insights',
    ],
  },
];

const formatPeriod = (period) => {
  switch (period) {
    case 'one-time': return 'one-time';
    case 'monthly': return 'per month';
    case 'quarterly': return 'for 3 months';
    case 'yearly': return 'per year';
    default: return period;
  }
};

export default function Pricing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (import.meta.env.PROD) {
        try {
          const response = await axios.get('/api/plans');
          if (!cancelled && response.data?.plans?.length > 0) {
            setPlans(response.data.plans);
            setLoading(false);
            return;
          }
        } catch {
          // fall through to the built-in list
        }
      }
      if (!cancelled) {
        setPlans(FALLBACK_PLANS);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Buying happens in the dashboard, where the purchase flow lives
  const handleSelectPlan = () => navigate(currentUser ? '/dashboard/plans' : '/login');

  return (
    <section id="pricing" className="section border-t border-line">
      <div className="shell">
        <SectionHeading
          index="03"
          eyebrow="Pricing"
          title={<>Pay for the reads <em className="t-em">you need.</em></>}
          lead="No subscription to forget about. Buy one check, a small pack, or three months of unlimited reads while you are applying."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-stretch">
          {loading
            ? [0, 1, 2].map((i) => <PlanCardSkeleton key={i} />)
            : plans.map((plan, index) => {
                const featured = Boolean(plan.isPopular);
                return (
                  <PlanCard
                    key={plan.planId || plan.code || index}
                    {...reveal(index * 0.08)}
                    name={plan.title || plan.name}
                    price={plan.price}
                    currency={plan.currency}
                    period={formatPeriod(plan.period)}
                    features={plan.features}
                    featured={featured}
                    tag={featured ? 'Popular' : plan.isSpecial || plan.isUnlimited ? 'Unlimited' : null}
                    action={
                      <Button variant={featured ? 'ink' : 'secondary'} size="lg" onClick={handleSelectPlan} className="w-full">
                        {currentUser ? 'Choose this plan' : 'Sign in to buy'}
                      </Button>
                    }
                  />
                );
              })}
        </div>

        <motion.p {...reveal(0.1)} className="t-small mt-8 text-center text-ink-faint">
          Prices in Indian rupees. If an analysis fails, its credit is refunded automatically.
        </motion.p>
      </div>
    </section>
  );
}
