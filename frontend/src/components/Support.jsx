import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const contactMethods = [
  {
    id: 1,
    icon: EnvelopeIcon,
    title: "Email Support",
    description: "Get detailed assistance via email",
    detail: "support@resumezen.com",
    response: "Response within 24 hours",
  },
  {
    id: 2,
    icon: PhoneIcon,
    title: "Phone Support",
    description: "Direct line for urgent queries",
    detail: "+91 (800) 123-4567",
    response: "Available 9 AM - 6 PM IST",
  },
  {
    id: 3,
    icon: ChatBubbleLeftRightIcon,
    title: "Live Chat",
    description: "Instant help from our experts",
    detail: "Available on website",
    response: "Typical response in 5 mins",
  },
  {
    id: 4,
    icon: ClockIcon,
    title: "24/7 Help Center",
    description: "Browse our knowledge base",
    detail: "help.resumezen.com",
    response: "Updated regularly",
  }
];

export default function Support() {
  const [showModal, setShowModal] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setShowModal(true);
  }

  return (
    <section id="support" className="bg-white pt-8 pb-24 sm:pt-12 sm:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-lg font-bold uppercase tracking-[0.2em] text-primary mb-4 bg-primary/10 px-6 py-2 rounded-full">
              SUPPORT
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-3">
              We're Here to Help 🤝
            </h2>
            <p className="text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Get assistance anytime, anywhere. Our dedicated support team is ready to help you create the perfect resume.
            </p>
          </motion.div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.id}
              className="relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                <method.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-600 mb-4">{method.description}</p>
              <div className="text-primary font-semibold mb-2">{method.detail}</div>
              <div className="text-sm text-gray-500">{method.response}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="grid md:grid-cols-2 gap-8 p-8 lg:p-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Quick Support Form</h3>
              <p className="text-gray-600">
                Have a specific question? Fill out this form and we'll get back to you as soon as possible.
              </p>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guaranteed response within 24 hours
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Detailed solutions to your queries
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Follow-up support if needed
                  </li>
                </ul>
              </div>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 placeholder:text-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  placeholder="Your Message"
                  rows="4"
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 placeholder:text-gray-500"
                ></textarea>
              </div>
              <motion.button
                type="submit"
                className="w-full bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-secondary transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Animated Modal Popup */}
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative"
            >
              <h4 className="text-2xl font-bold text-primary mb-2">Thank you!</h4>
              <p className="text-gray-700 mb-6">We are working on it, and this feature will be implemented soon.</p>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-all duration-200 focus:outline-none"
                autoFocus
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}