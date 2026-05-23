import React from 'react';
import { ShoppingBagIcon, DocumentCheckIcon, CalendarIcon } from '@heroicons/react/24/outline';

/**
 * DashboardCurrentPlanSection
 * @param {Object} props
 * @param {Object} props.activePlan - The user's active plan
 * @param {Function} props.getDaysRemaining - Function to get days remaining
 * @param {Function} props.formatDate - Function to format date
 * @param {Function} props.openPlanModal - Function to open the plan modal
 */
const DashboardCurrentPlanSection = ({ activePlan, getDaysRemaining, formatDate, openPlanModal }) => {
  if (!activePlan) return null;
  const plan = activePlan.planId;
  const daysRemaining = getDaysRemaining(activePlan.expiresAt);
  return (
    <div className="bg-zinc-900/30 rounded-xl p-5 border border-white/10 mb-6 backdrop-blur-md">
      <h2 className="text-lg font-semibold text-zinc-100 mb-3 flex items-center">
        <ShoppingBagIcon className="h-5 w-5 text-purple-400 mr-2" />
        Your Current Plan
      </h2>
      <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center">
              <h3 className="font-semibold text-purple-300 text-lg">{plan.name}</h3>
              {plan.isPopular && (
                <span className="ml-2 text-xs bg-purple-600/30 border border-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full">Popular</span>
              )}
              {plan.isSpecial && (
                <span className="ml-2 text-xs bg-pink-600/30 border border-pink-500/30 text-pink-200 px-2 py-0.5 rounded-full">Special</span>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-zinc-300 flex items-center">
                <DocumentCheckIcon className="h-4 w-4 text-purple-400 mr-1" />
                {plan.isUnlimited
                  ? <span className="font-medium">Unlimited Checks</span>
                  : <span><span className="font-semibold text-zinc-100">{activePlan.creditsLeft}</span> of <span className="font-medium">{plan.credits}</span> checks remaining</span>
                }
              </p>
              {activePlan.expiresAt && (
                <p className="text-sm text-zinc-300 flex items-center">
                  <CalendarIcon className="h-4 w-4 text-purple-400 mr-1" />
                  Expires: <span className="font-medium ml-1 text-zinc-100">{formatDate(activePlan.expiresAt)}</span>
                  {daysRemaining !== null && (
                    <span className="ml-1.5 text-xs text-zinc-400">({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right">
            <p className="text-xs text-zinc-400">Purchased</p>
            <p className="text-sm text-zinc-300 font-medium">{new Date(activePlan.purchasedAt).toLocaleDateString()}</p>
            <button
              onClick={openPlanModal}
              className="mt-3 text-xs px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg transition-all font-semibold"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCurrentPlanSection; 