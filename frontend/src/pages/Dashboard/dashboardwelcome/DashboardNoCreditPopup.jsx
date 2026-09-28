import React from 'react';
import { CreditCardIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

/**
 * DashboardNoCreditPopup
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the popup
 * @param {Function} props.onClose - Function to close the popup
 * @param {Function} props.onViewPlans - Function to view plans
 * @param {Object} props.activePlan - The user's active plan
 */
const DashboardNoCreditPopup = ({ show, onClose, onViewPlans, activePlan }) => {
  const message = !activePlan
    ? "You don't have an active plan yet. Choose a plan to analyze your resume."
    : "You've used all the credits on your current plan. Choose a plan to keep analyzing.";

  return (
    <Modal open={show} onClose={onClose} labelledBy="no-credit-title">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
            <CreditCardIcon className="h-5 w-5 text-amber-400" />
          </span>
          <h3 id="no-credit-title" className="font-display text-lg font-semibold text-ink">
            A plan is needed
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-white/[0.05] hover:text-ink"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <p className="mb-6 text-sm leading-relaxed text-ink-muted">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Not now</Button>
        <Button onClick={onViewPlans}>View plans</Button>
      </div>
    </Modal>
  );
};

export default DashboardNoCreditPopup;
