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
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <ShoppingBagIcon className="h-5 w-5 text-primary mr-2" />
        Your Current Plan
      </h2>
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <div className="flex items-center">
              <h3 className="font-semibold text-primary text-lg">{plan.name}</h3>
              {plan.isPopular && (
                <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">Popular</span>
              )}
              {plan.isSpecial && (
                <span className="ml-2 text-xs bg-secondary text-white px-2 py-0.5 rounded-full">Special</span>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600 flex items-center">
                <DocumentCheckIcon className="h-4 w-4 text-primary mr-1" />
                {plan.isUnlimited
                  ? <span className="font-medium">Unlimited</span>
                  : <span><span className="font-medium">{activePlan.creditsLeft}</span> of <span className="font-medium">{plan.credits}</span> checks remaining</span>
                }
              </p>
              {activePlan.expiresAt && (
                <p className="text-sm text-gray-600 flex items-center">
                  <CalendarIcon className="h-4 w-4 text-primary mr-1" />
                  Expires: <span className="font-medium ml-1">{formatDate(activePlan.expiresAt)}</span>
                  {daysRemaining !== null && (
                    <span className="ml-1 text-xs">({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 md:mt-0 text-right">
            <p className="text-xs text-gray-500">Purchased</p>
            <p className="text-sm text-gray-700">{new Date(activePlan.purchasedAt).toLocaleDateString()}</p>
            <button
              onClick={openPlanModal}
              className="mt-3 text-xs px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
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