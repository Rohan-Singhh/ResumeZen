import React from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

/**
 * DashboardCreditConfirmationPopup
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the popup
 * @param {Function} props.onClose - Function to close the popup
 * @param {Function} props.onConfirm - Function to confirm credit usage
 * @param {Object} props.activePlan - The user's active plan
 */
const DashboardCreditConfirmationPopup = ({ show, onClose, onConfirm, activePlan }) => {
  const isUnlimited = Boolean(activePlan?.planId?.isUnlimited);

  // Unlimited plans have nothing to confirm — proceed straight away
  React.useEffect(() => {
    if (show && isUnlimited) onConfirm?.();
  }, [show, isUnlimited, onConfirm]);

  const remaining = activePlan?.creditsLeft ?? 0;

  return (
    <Modal open={show && !isUnlimited} onClose={onClose} labelledBy="confirm-analysis-title">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <InformationCircleIcon className="h-5 w-5 text-primary" />
          </span>
          <h3 id="confirm-analysis-title" className="font-display text-lg font-semibold text-ink">
            Confirm analysis
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
      <p className="mb-6 text-sm leading-relaxed text-ink-muted">
        This uses <span className="font-semibold text-ink">1 credit</span> from your plan.
        You have {remaining} {remaining === 1 ? 'credit' : 'credits'} left. If the analysis
        fails, the credit is refunded automatically.
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Analyze resume</Button>
      </div>
    </Modal>
  );
};

export default DashboardCreditConfirmationPopup;
