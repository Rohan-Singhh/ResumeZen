import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How many resumes can I upload?",
      answer: "It depends on your plan. One-Time Check allows 1 resume, while Boost Pack allows 5 resumes. Our Enterprise plan offers unlimited resume uploads and analysis. Each resume can be revised multiple times with our AI feedback system to ensure the best possible outcome for your job applications."
    },
    {
      id: 2,
      question: "What payment options do you accept?",
      answer: "We accept a wide range of payment methods to make it convenient for you. This includes all major UPI apps (Google Pay, PhonePe, Paytm), credit/debit cards (Visa, MasterCard, American Express), net banking, and international payment options like PayPal. All transactions are secure and encrypted."
    },
    {
      id: 3,
      question: "How fast is the report generation?",
      answer: "Your ATS report is generated instantly, usually within 30 seconds. Our advanced AI system processes your resume quickly while maintaining accuracy. For more detailed analysis including industry-specific recommendations and keyword optimization, it may take up to 2 minutes."
    },
    {
      id: 4,
      question: "What makes ResumeZen's AI different from others?",
      answer: "ResumeZen's AI is trained on millions of successful resumes and real hiring data. It understands industry-specific requirements, current job market trends, and ATS systems used by top companies. Our AI provides actionable feedback, not just generic suggestions, and learns from successful placements to continuously improve its recommendations."
    },
    {
      id: 5,
      question: "How often should I update my resume?",
      answer: "We recommend updating your resume every 3-6 months or whenever you have significant achievements or role changes. Our system keeps track of your resume versions and can highlight what's changed in your industry's requirements. Premium users get alerts when their resume might need updating based on new industry trends or job market changes."
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Frequently Asked Questions 💭
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get answers to common questions about ResumeZen
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <motion.button
                  className="w-full p-6 text-left flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <h4 className="font-semibold text-lg pr-4">{faq.question}</h4>
                  <motion.div
                    animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {openFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-800 border-t text-base leading-relaxed font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 