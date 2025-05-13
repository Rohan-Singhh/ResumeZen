import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * DashboardNoCreditPopup
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the popup
 * @param {Function} props.onClose - Function to close the popup
 * @param {Function} props.onViewPlans - Function to view plans
 * @param {Object} props.activePlan - The user's active plan
 */
const DashboardNoCreditPopup = ({ show, onClose, onViewPlans, activePlan }) => (
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
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <InformationCircleIcon className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold">Credits Required</h3>
            </div>
            <button onClick={onClose}>
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            {!activePlan 
              ? "You don't have an active plan. Please purchase a plan to analyze your resume."
              : activePlan.creditsLeft === 0
                ? "You've used all your available credits. Please upgrade your plan to continue using the resume analysis features."
                : "You need at least 1 credit to analyze your resume. Please purchase a plan to continue."}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onViewPlans}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              View Plans
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default DashboardNoCreditPopup; 