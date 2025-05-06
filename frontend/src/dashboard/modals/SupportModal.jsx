import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function SupportModal({ type, ...props }) {
  if (type === 'livechat') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={props.onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-semibold">Live Chat Coming Soon!</h3>
            </div>
            <button
              onClick={props.onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            We're working hard to bring you real-time chat support with our resume experts. This feature will be available soon!
          </p>
          <p className="text-gray-600 mb-6">
            In the meantime, you can reach us at support@resumezen.com for assistance.
          </p>
          <div className="flex justify-end">
            <button
              onClick={props.onClose}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }
  
  if (type === 'schedule') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={props.onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold">Schedule a Call</h3>
            </div>
            <button
              onClick={props.onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            Our 1:1 resume review scheduling system is coming soon! You'll be able to book personalized sessions with our expert resume reviewers.
          </p>
          <p className="text-gray-600 mb-6">
            Features will include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
            <li>30-minute dedicated sessions</li>
            <li>Expert resume feedback</li>
            <li>Career path guidance</li>
            <li>Industry-specific tips</li>
          </ul>
          <div className="flex justify-end">
            <button
              onClick={props.onClose}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Looking forward to it!
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }
  
  if (type === 'faq') {
    const faqs = [
      {
        q: "What is ATS optimization?",
        a: "ATS (Applicant Tracking System) optimization ensures your resume is readable by automated screening systems used by employers. Our system analyzes and optimizes your resume to increase its chances of passing through these systems."
      },
      {
        q: "How does the resume check system work?",
        a: "Our AI-powered system analyzes your resume across multiple parameters including keywords, formatting, content relevance, and overall structure. It then provides detailed feedback and suggestions for improvement."
      },
      {
        q: "What's included in the unlimited plan?",
        a: "The unlimited plan gives you unlimited resume checks for 3 months, detailed ATS feedback, improvement suggestions, and priority support. You can test different versions of your resume as many times as you need."
      },
      {
        q: "How accurate is the ATS score?",
        a: "Our ATS scoring system is based on extensive research and real-world data from successful job applications. While no system is perfect, our scores provide a reliable indicator of your resume's effectiveness."
      },
      {
        q: "Can I use multiple resume formats?",
        a: "Yes! You can upload and test different resume formats. We recommend using our system to optimize each version for different job applications."
      },
      {
        q: "How often should I update my resume?",
        a: "We recommend updating your resume every 3-6 months or whenever you have new achievements or skills to add. Regular updates help keep your resume current and competitive."
      }
    ];
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={props.onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
            </div>
            <button
              onClick={props.onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h4 className="font-semibold text-lg mb-2 text-gray-900">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={props.onClose}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }
  
  return null;
} 