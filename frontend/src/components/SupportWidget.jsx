import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const faqItems = [
  {
    id: 1,
    question: 'How do I analyze my first resume?',
    answer: 'Upload your resume in PDF format (max 1MB) on the Dashboard, and our AI will immediately extract the text and start processing it.'
  },
  {
    id: 2,
    question: 'How do credits and plans work?',
    answer: 'Each resume analysis consumes 1 credit. You can check your current plan and remaining credits directly on the Dashboard.'
  },
  {
    id: 3,
    question: 'How do I view my previous analyses?',
    answer: 'You can view your entire analysis history in the "Upload History" section.'
  }
];

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const filteredFaqs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary-dark shadow-glow-primary flex items-center justify-center transition-colors border border-white/10"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6 text-white" />
          ) : (
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
          )}
        </motion.button>
      </div>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-[#0d0d12]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="bg-primary/20 border-b border-white/10 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-2xl -mr-10 -mt-10" />
              <h3 className="text-lg font-bold text-white relative z-10">Hi there 👋</h3>
              <p className="text-sm text-gray-300 relative z-10">How can we help you today?</p>
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="Search for answers..."
                />
              </div>

              {/* Quick Links / FAQs */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Answers</h4>
                {filteredFaqs.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-4">No answers found.</p>
                ) : (
                  filteredFaqs.map((faq) => (
                    <div key={faq.id} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-zinc-200">{faq.question}</span>
                        <ChevronDownIcon className={`h-4 w-4 text-zinc-500 transition-transform flex-shrink-0 ml-2 ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-3 pb-3">
                          <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-primary/50 pl-3">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer / Contact */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <a 
                href="mailto:support@resumezen.com" 
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors border border-white/10"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                Contact Support Team
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
