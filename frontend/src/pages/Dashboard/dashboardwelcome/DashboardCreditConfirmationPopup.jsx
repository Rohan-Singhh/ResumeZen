import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * DashboardCreditConfirmationPopup
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the popup
 * @param {Function} props.onClose - Function to close the popup
 * @param {Function} props.onConfirm - Function to confirm credit usage
 * @param {Object} props.activePlan - The user's active plan
 */
const DashboardCreditConfirmationPopup = ({ show, onClose, onConfirm, activePlan }) => {
  // If unlimited plan, auto-confirm and do not show popup
  React.useEffect(() => {
    if (show && activePlan?.planId?.isUnlimited) {
      onConfirm && onConfirm();
    }
    // Only run when show or activePlan changes
  }, [show, activePlan, onConfirm]);

  // Do not render popup for unlimited plan
  if (show && activePlan?.planId?.isUnlimited) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">Confirm Analysis</h3>
              </div>
              <button onClick={onClose}>
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              This will use <span className="font-medium text-primary">1 credit</span> from your current plan 
              ({activePlan?.creditsLeft} credits remaining).
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Proceed
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardCreditConfirmationPopup; 