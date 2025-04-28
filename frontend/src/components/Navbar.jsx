import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Height of the fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => scrollToSection('home')}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-2xl font-bold text-primary">ResumeZen</span>
          </motion.div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {[
                { name: 'Home', id: 'home' },
                { name: 'Features', id: 'features' },
                { name: 'How It Works', id: 'how-it-works' },
                { name: 'Pricing', id: 'pricing' },
                { name: 'Reviews', id: 'reviews' },
                { name: 'FAQ', id: 'faq' },
                { name: 'Support', id: 'support' }
              ].map((item) => (
                <motion.a
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className={`cursor-pointer transition-colors duration-200 ${
                    isScrolled ? 'text-gray-700 hover:text-primary' : 'text-gray-800 hover:text-primary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.button
                className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-6 rounded-lg transition duration-300 ml-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}