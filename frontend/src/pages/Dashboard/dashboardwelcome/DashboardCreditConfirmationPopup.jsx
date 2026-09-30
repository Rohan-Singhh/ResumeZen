import React from 'react';
import Modal, { ModalHeader } from '../../../components/ui/Modal';
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
  const after = Math.max(0, remaining - 1);

  return (
    <Modal open={show && !isUnlimited} onClose={onClose} labelledBy="confirm-analysis-title">
      <ModalHeader id="confirm-analysis-title" onClose={onClose}>Use one credit?</ModalHeader>

      <p className="t-body">
        Analyzing this resume uses one credit. If the analysis fails, the credit is refunded automatically.
      </p>

      {/* The balance, before and after, so there is nothing to work out */}
      <dl className="my-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
        <div className="bg-surface-sunken px-4 py-3.5">
          <dt className="t-label">Now</dt>
          <dd className="t-num mt-2.5 text-[1.75rem]">{remaining}</dd>
        </div>
        <div className="bg-surface-sunken px-4 py-3.5">
          <dt className="t-label">After</dt>
          <dd className="t-num mt-2.5 text-[1.75rem] text-ink-muted">{after}</dd>
        </div>
      </dl>

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} data-autofocus>Analyze resume</Button>
      </div>
    </Modal>
  );
};

export default DashboardCreditConfirmationPopup;
