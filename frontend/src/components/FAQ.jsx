import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ease, reveal, spring } from '../utils/motion';

const faqs = [
  {
    id: 1,
    question: 'How many resumes can I upload?',
    answer: 'It depends on your plan. One-Time Check allows 1 resume, while Boost Pack allows 5 resumes. Our Enterprise plan offers unlimited resume uploads and analysis. Each resume can be revised multiple times with our AI feedback system to ensure the best possible outcome for your job applications.',
  },
  {
    id: 2,
    question: 'What payment options do you accept?',
    answer: 'We accept a wide range of payment methods to make it convenient for you. This includes all major UPI apps (Google Pay, PhonePe, Paytm), credit/debit cards (Visa, MasterCard, American Express), net banking, and international payment options like PayPal. All transactions are secure and encrypted.',
  },
  {
    id: 3,
    question: 'How fast is the report generation?',
    answer: 'Your ATS report is generated instantly, usually within 30 seconds. Our advanced AI system processes your resume quickly while maintaining accuracy. For more detailed analysis including industry-specific recommendations and keyword optimization, it may take up to 2 minutes.',
  },
  {
    id: 4,
    question: "What makes ResumeZen's AI different from others?",
    answer: "ResumeZen's AI is trained on millions of successful resumes and real hiring data. It understands industry-specific requirements, current job market trends, and ATS systems used by top companies. Our AI provides actionable feedback, not just generic suggestions, and learns from successful placements to continuously improve its recommendations.",
  },
  {
    id: 5,
    question: 'How often should I update my resume?',
    answer: "We recommend updating your resume every 3-6 months or whenever you have significant achievements or role changes. Our system keeps track of your resume versions and can highlight what's changed in your industry's requirements. Premium users get alerts when their resume might need updating based on new industry trends or job market changes.",
  },
];

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState(faqs[0].id);

  return (
    <section id="faq" className="section border-t border-line">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        {/* The heading keeps the reader company while the answers scroll */}
        <motion.header {...reveal()} className="lg:sticky lg:top-[calc(var(--nav-h)+2.5rem)] lg:self-start">
          <p className="t-label mb-5 flex items-center gap-3">
            <span className="text-primary-light">05</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
            Questions
          </p>
          <h2 className="t-h1">Asked <em className="t-em">often.</em></h2>
          <p className="t-lead mt-6 max-w-sm">
            The short answers. If yours is not here, the support form below reaches a person.
          </p>
        </motion.header>

        <motion.div {...reveal(0.08)} className="border-t border-line">
          {faqs.map((faq) => {
            const open = openFaq === faq.id;
            return (
              <div key={faq.id} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-panel-${faq.id}`}
                    id={`faq-button-${faq.id}`}
                    onClick={() => setOpenFaq(open ? null : faq.id)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className={`text-[1.0625rem] font-medium leading-snug ${open ? 'text-ink' : 'text-ink-muted group-hover:text-ink'}`}>
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={spring}
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${
                        open ? 'border-primary/40 text-primary-light' : 'border-line-strong text-ink-muted group-hover:text-ink'
                      }`}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`faq-panel-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-button-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: ease.out }}
                      className="overflow-hidden"
                    >
                      <p className="t-body max-w-prose pb-7 pr-12">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
