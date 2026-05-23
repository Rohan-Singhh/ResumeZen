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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-amber-500/10 p-2 rounded-xl mr-3 border border-amber-500/20">
                <InformationCircleIcon className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Credits Required</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
              <XMarkIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-200" />
            </button>
          </div>
          <p className="text-zinc-300 mb-6 text-sm">
            {!activePlan 
              ? "You don't have an active plan. Please purchase a plan to analyze your resume."
              : activePlan.creditsLeft === 0
                ? "You've used all your available credits. Please upgrade your plan to continue using the resume analysis features."
                : "You need at least 1 credit to analyze your resume. Please purchase a plan to continue."}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onViewPlans}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-purple-500/10 transition-colors"
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