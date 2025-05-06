import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function HelpSection({ onEmail, onLiveChat, onFAQ, onSchedule }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
      <div className="space-y-4">
        <div className="border rounded-lg p-4 hover:border-primary transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold">Email Support</h3>
          </div>
          <p className="text-gray-600 mb-3">Get help with your resume or account</p>
          <button 
            onClick={onEmail}
            className="text-primary hover:text-secondary flex items-center gap-1 text-sm"
          >
            support@resumezen.com
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="border rounded-lg p-4 hover:border-primary transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="font-semibold">Live Chat</h3>
          </div>
          <p className="text-gray-600 mb-3">Chat with our resume experts</p>
          <button 
            onClick={onLiveChat}
            className="text-primary hover:text-secondary flex items-center gap-1 text-sm"
          >
            Start Chat
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="border rounded-lg p-4 hover:border-primary transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold">FAQ</h3>
          </div>
          <p className="text-gray-600 mb-3">Find answers to common questions</p>
          <button 
            onClick={onFAQ}
            className="text-primary hover:text-secondary flex items-center gap-1 text-sm"
          >
            View FAQ
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="border rounded-lg p-4 hover:border-primary transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold">Schedule a Call</h3>
          </div>
          <p className="text-gray-600 mb-3">Book a 1:1 resume review session</p>
          <button 
            onClick={onSchedule}
            className="text-primary hover:text-secondary flex items-center gap-1 text-sm"
          >
            Book Time
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
} 