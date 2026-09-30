import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import Modal, { ModalHeader } from '../../../components/ui/Modal';
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
    ? "You don't have a plan with credits on it. Choose one and this resume can be analyzed right away."
    : "You've used every credit on your current plan. Add more to keep analyzing.";

  return (
    <Modal open={show} onClose={onClose} labelledBy="no-credit-title">
      <ModalHeader id="no-credit-title" icon={CreditCardIcon} tone="warn" onClose={onClose}>
        No credits left
      </ModalHeader>
      <p className="t-body mb-6">{message}</p>
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>Not now</Button>
        <Button onClick={onViewPlans}>See plans</Button>
      </div>
    </Modal>
  );
};

export default DashboardNoCreditPopup;
