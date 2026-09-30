import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, PlusIcon, EnvelopeIcon, LifebuoyIcon } from '@heroicons/react/24/outline';
import Modal, { ModalHeader } from './ui/Modal';
import { controlClasses } from './ui/Field';
import { buttonClasses } from './ui/Button';
import { ease, spring } from '../utils/motion';

const faqItems = [
  {
    id: 1,
    question: 'How do I analyze my first resume?',
    answer: 'On the overview, drop a PDF (up to 5 MB) onto the upload area or choose a file. Confirm, and the report is ready in about a minute.',
  },
  {
    id: 2,
    question: 'How do credits and plans work?',
    answer: 'Each analysis uses one credit from your plan. If an analysis fails, the credit is refunded automatically. Your balance is always shown in the sidebar.',
  },
  {
    id: 3,
    question: 'Where are my previous reports?',
    answer: 'Every resume you have analyzed is in Studio, newest first. The overview also lists your most recent activity.',
  },
  {
    id: 4,
    question: 'Why did my PDF fail to read?',
    answer: 'Scanned or image-only PDFs have no text to read. Export your resume from your editor as a text-based PDF and try again.',
  },
];

/**
 * HelpPanel — quick answers and a way to reach support, opened from the
 * dashboard navigation. Replaces the floating chat-style button, which sat on
 * top of page content on small screens.
 */
export default function HelpPanel({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);

  const q = query.trim().toLowerCase();
  const results = faqItems.filter(
    (item) => !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
  );

  return (
    <Modal open={open} onClose={onClose} labelledBy="help-title" maxWidth="max-w-lg">
      <ModalHeader id="help-title" icon={LifebuoyIcon} onClose={onClose}>Help</ModalHeader>

      <div className="relative mt-4">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search answers"
          aria-label="Search answers"
          className={`${controlClasses} h-11 pl-10`}
        />
      </div>

      <div className="mt-4 max-h-[46vh] overflow-y-auto border-t border-line">
        {results.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-muted">
            Nothing matches “{query}”. Try fewer words, or write to us below.
          </p>
        ) : (
          results.map((faq) => {
            const isOpen = expanded === faq.id;
            return (
              <div key={faq.id} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : faq.id)}
                  className="group flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className={`text-sm font-medium ${isOpen ? 'text-ink' : 'text-ink-muted group-hover:text-ink'}`}>{faq.question}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={spring} className="flex-shrink-0 text-ink-faint">
                    <PlusIcon className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: ease.out }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 pr-8 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      <a href="mailto:support@resumezen.com" className={buttonClasses({ variant: 'secondary', className: 'mt-5 w-full' })}>
        <EnvelopeIcon className="h-4 w-4" />
        Email support
      </a>
    </Modal>
  );
}
