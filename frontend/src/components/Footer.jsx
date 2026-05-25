import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [modalData, setModalData] = useState({ isOpen: false, title: '' });

  const handleDemoClick = (e, title) => {
    e.preventDefault();
    setModalData({ isOpen: true, title });
  };

  return (
    <footer className="bg-dark-bg border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-t-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-glow-primary/20 group-hover:shadow-glow-primary/40 transition-shadow">
                <span className="text-white font-bold font-display text-sm">RZ</span>
              </div>
              <span className="font-bold text-white font-display text-xl tracking-tight">ResumeZen</span>
            </Link>
            <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
              The world's most advanced AI resume builder. Beat the ATS, highlight your impact, and get hired faster at top tech companies.
            </p>
            <div className="flex gap-4">
              <motion.button 
                onClick={(e) => handleDemoClick(e, 'Facebook Integration')}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#1877F2]/20 hover:text-[#1877F2] hover:border-[#1877F2]/50 transition-colors"
                whileHover={{ y: -5, rotate: [-10, 10, -10, 0] }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </motion.button>
              <motion.button 
                onClick={(e) => handleDemoClick(e, 'X Profile')}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white hover:border-white/50 transition-colors"
                whileHover={{ y: -5, scale: 1.1, rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.4 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.button>
              <a href="https://github.com/Rohan-Singhh/ResumeZen" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors group">
                <motion.svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </motion.svg>
              </a>
            </div>
          </div>
          
          {/* Links Column 1 */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Product</h3>
            <ul className="space-y-4">
              <li><a href="#features" className="text-gray-400 hover:text-primary transition-colors text-sm">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-primary transition-colors text-sm">How it Works</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-primary transition-colors text-sm">Pricing</a></li>
              <li><Link to="/success-stories" className="text-gray-400 hover:text-primary transition-colors text-sm">Success Stories</Link></li>
            </ul>
          </div>
          
          {/* Links Column 2 */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><a href="#faq" className="text-gray-400 hover:text-primary transition-colors text-sm">FAQ</a></li>
              <li><a href="#support" className="text-gray-400 hover:text-primary transition-colors text-sm">Help Center</a></li>
              <li><button onClick={(e) => handleDemoClick(e, 'Resume Templates')} className="text-gray-400 hover:text-primary transition-colors text-sm cursor-pointer">Resume Templates</button></li>
              <li><button onClick={(e) => handleDemoClick(e, 'Career Blog')} className="text-gray-400 hover:text-primary transition-colors text-sm cursor-pointer">Career Blog</button></li>
            </ul>
          </div>
          
          {/* Links Column 3 */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><button onClick={(e) => handleDemoClick(e, 'Privacy Policy')} className="text-gray-400 hover:text-primary transition-colors text-sm cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={(e) => handleDemoClick(e, 'Terms of Service')} className="text-gray-400 hover:text-primary transition-colors text-sm cursor-pointer">Terms of Service</button></li>
              <li><button onClick={(e) => handleDemoClick(e, 'Cookie Policy')} className="text-gray-400 hover:text-primary transition-colors text-sm cursor-pointer">Cookie Policy</button></li>
              <li><button onClick={(e) => handleDemoClick(e, 'Data Security')} className="text-gray-400 hover:text-primary transition-colors text-sm cursor-pointer">Data Security</button></li>
            </ul>
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} ResumeZen. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      <AnimatePresence>
        {modalData.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalData({ isOpen: false, title: '' })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-md bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
              
              <button 
                onClick={() => setModalData({ isOpen: false, title: '' })}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{modalData.title}</h3>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                  We're currently finalizing the content for this section. Check back soon for updates to our {modalData.title.toLowerCase()}.
                </p>
                
                <button 
                  onClick={() => setModalData({ isOpen: false, title: '' })}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-colors border border-white/10"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
