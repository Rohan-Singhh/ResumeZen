import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * The plan an analysis would be charged to right now, and what is left on it.
 *
 * One definition for the sidebar meter, the overview and the upload flow, so
 * they can never disagree about whether the user can run an analysis.
 *
 * @returns {{
 *   activePlan: Object|null,  // newest plan that is active, unexpired and not used up
 *   hasCredits: boolean,
 *   isUnlimited: boolean,
 *   creditsLeft: number,      // 0 when unlimited or no plan
 *   creditsTotal: number,     // 0 when unlimited or no plan
 *   creditsText: string,      // "3", "∞" or "0"
 *   expiresAt: string|null,
 * }}
 */
export function useCredits() {
  const { userPlans } = useAuth();

  return useMemo(() => {
    const now = new Date();
    const activePlan =
      (userPlans || [])
        .filter(
          (p) =>
            p.isActive &&
            p.planId &&
            (!p.expiresAt || new Date(p.expiresAt) > now) &&
            (p.planId.isUnlimited || p.creditsLeft > 0)
        )
        .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))[0] || null;

    const isUnlimited = Boolean(activePlan?.planId.isUnlimited);
    const creditsLeft = activePlan && !isUnlimited ? activePlan.creditsLeft : 0;

    return {
      activePlan,
      hasCredits: Boolean(activePlan),
      isUnlimited,
      creditsLeft,
      creditsTotal: activePlan && !isUnlimited ? activePlan.planId.credits || creditsLeft : 0,
      creditsText: !activePlan ? '0' : isUnlimited ? '∞' : String(creditsLeft),
      expiresAt: activePlan?.expiresAt || null,
    };
  }, [userPlans]);
}
