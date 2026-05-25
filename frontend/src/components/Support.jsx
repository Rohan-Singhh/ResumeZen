import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import axios from 'axios';

const contactMethods = [
  {
    id: 1,
    icon: EnvelopeIcon,
    title: "Email Support",
    description: "Get detailed assistance via email",
    detail: "support@resumezen.com",
    response: "Response within 24 hours",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    id: 2,
    icon: PhoneIcon,
    title: "Phone Support",
    description: "Direct line for urgent queries",
    detail: "+91 (800) 123-4567",
    response: "Available 9 AM - 6 PM IST",
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
  },
  {
    id: 3,
    icon: ChatBubbleLeftRightIcon,
    title: "Live Chat",
    description: "Instant help from our experts",
    detail: "Available on website",
    response: "Typical response in 5 mins",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    id: 4,
    icon: ClockIcon,
    title: "24/7 Help Center",
    description: "Browse our knowledge base",
    detail: "help.resumezen.com",
    response: "Updated regularly",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  }
];

export default function Support() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  
  // New state variables for form fields and errors
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [formError, setFormError] = useState('');

  const priorities = ['Low', 'Normal', 'Urgent'];
  const maxCharacters = 500;
  const progress = Math.min((message.length / maxCharacters) * 100, 100);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      const payload = {
        name,
        email,
        subject,
        priority: selectedPriority,
        message
      };

      const response = await axios.post('/api/support', payload);

      if (response.data.success) {
        setShowModal(true);
        // Reset form
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setSelectedPriority('Normal');
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="support" className="bg-dark-bg py-24 sm:py-32 border-t border-white/5 relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 relative z-10">
        <div className="text-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-sm font-bold uppercase tracking-[0.2em] text-secondary mb-6 bg-secondary/10 border border-secondary/20 px-6 py-2 rounded-full">
              Help Desk
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 font-display">
              We're Here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Help 🤝</span>
            </h2>
            <p className="text-lg md:text-xl leading-8 text-gray-400 max-w-2xl mx-auto font-light">
              Get assistance anytime, anywhere. Our dedicated support team is ready to help you create the perfect resume.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-20">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.id}
              className={`relative bg-dark-card p-8 rounded-3xl border border-white/10 backdrop-blur-md hover:bg-white/5 transition-colors duration-300 group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className={`flex items-center justify-center w-14 h-14 ${method.bg} border ${method.border} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <method.icon className={`h-7 w-7 ${method.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">{method.title}</h3>
              <p className="text-gray-400 font-light mb-6">{method.description}</p>
              <div className={`${method.color} font-bold mb-2`}>{method.detail}</div>
              <div className="text-sm text-gray-500 font-medium">{method.response}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="rounded-3xl overflow-hidden border border-white/10 bg-dark-card/50 backdrop-blur-xl shadow-2xl relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Form Background Decor */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0">
             <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 blur-[100px] rounded-full"></div>
             <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/20 blur-[100px] rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-5 gap-0 relative z-10">
            <div className="p-8 lg:p-12 lg:col-span-2 border-b lg:border-b-0 lg:border-r border-white/10 bg-white/5">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white font-display">Quick Support Form</h3>
                <p className="text-gray-400 font-light text-lg">
                  Have a specific question? Fill out this form and we'll get back to you as soon as possible.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  Live Support Queue
                </div>
                
                <div className="mt-10 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mt-1">
                      <ClockIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Fast Response Time</h4>
                      <p className="text-gray-400 text-sm font-light">Guaranteed response within 24 hours for all inquiries.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-secondary/10 text-secondary mt-1">
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Detailed Solutions</h4>
                      <p className="text-gray-400 text-sm font-light">Comprehensive answers to help you get unstuck quickly.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <form className="p-8 lg:p-12 lg:col-span-3 space-y-6" onSubmit={handleSubmit}>
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 text-white bg-dark-bg border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200 placeholder:text-gray-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                    className="w-full px-4 py-3 text-white bg-dark-bg border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200 placeholder:text-gray-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 text-white bg-dark-bg border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200 placeholder:text-gray-600 outline-none"
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-3">Priority</span>
                <div className="flex flex-wrap gap-3">
                  {priorities.map((priority) => {
                    const isActive = selectedPriority === priority;
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setSelectedPriority(priority)}
                        className={`rounded-xl border px-6 py-2 text-sm font-bold transition-all duration-200 ${
                          isActive
                            ? 'border-primary bg-primary text-white shadow-glow-primary'
                            : 'border-white/10 bg-dark-bg text-gray-400 hover:border-primary/50 hover:text-primary'
                        }`}
                      >
                        {priority}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">Message</label>
                  <span className="text-xs text-gray-500 font-medium">{message.length}/{maxCharacters}</span>
                </div>
                <textarea
                  placeholder="Your Message"
                  required
                  rows="4"
                  maxLength={maxCharacters}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full px-4 py-3 text-white bg-dark-bg border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200 placeholder:text-gray-600 outline-none resize-none"
                ></textarea>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-dark-bg border border-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                className="w-full bg-white text-dark-bg font-bold py-4 px-8 rounded-xl hover:shadow-glow-primary transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 text-lg mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Transmission...' : `Send Message • ${selectedPriority}`}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Animated Modal Popup */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg/80 backdrop-blur-sm px-4"
            >
              <motion.div
                initial={{ scale: 0.8, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-dark-card border border-white/10 rounded-3xl shadow-glow-primary p-10 max-w-sm w-full text-center relative"
              >
                <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-green-400 text-2xl font-bold">✓</span>
                </div>
                <h4 className="text-2xl font-bold text-white mb-3 font-display">Signal Received!</h4>
                <p className="text-gray-400 mb-8 font-light">Thanks for reaching out. Our support crew has your message in the queue and will respond soon.</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-6 py-3 bg-white text-dark-bg rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 focus:outline-none"
                  autoFocus
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
