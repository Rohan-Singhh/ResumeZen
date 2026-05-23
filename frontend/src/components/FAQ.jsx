import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

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
    <section id="faq" className="py-24 sm:py-32 bg-dark-bg border-t border-white/5 relative">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          <div className="lg:w-1/3 sticky top-32">
            <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-accent mb-6 bg-accent/10 border border-accent/20 px-6 py-2 rounded-full flex items-center w-max gap-2">
              <QuestionMarkCircleIcon className="h-5 w-5" />
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-display tracking-tight">
              Got Questions? <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">We've Got Answers.</span>
            </h2>
            <p className="text-lg text-gray-400 font-light">
              Everything you need to know about ResumeZen and how we help you land your dream job faster.
            </p>
          </div>

          <div className="lg:w-2/3 w-full">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <motion.button
                    className="w-full p-6 text-left flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h4 className="font-bold text-lg text-white pr-4">{faq.question}</h4>
                    <motion.div
                      animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.3, type: "spring" }}
                      className={`p-2 rounded-full ${openFaq === faq.id ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-400'}`}
                    >
                      <ChevronDownIcon className="h-5 w-5" />
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
                        <div className="p-6 pt-0 text-gray-300 border-t border-white/10 text-base leading-relaxed font-light mt-4">
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
      </div>
    </section>
  );
}