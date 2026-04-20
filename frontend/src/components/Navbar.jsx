import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const primaryLinks = [
  { name: 'Home', id: 'home' },
  { name: 'Features', id: 'features' },
  { name: 'Pricing', id: 'pricing' }
];

const secondaryLinks = [
  { name: 'How It Works', id: 'how-it-works' },
  { name: 'Reviews', id: 'reviews' },
  { name: 'FAQ', id: 'faq' },
  { name: 'Support', id: 'support' }
];

const allLinks = [...primaryLinks, ...secondaryLinks];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsMoreOpen(false);
  }, [location.pathname]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const offset = 88;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const handleSectionNavigation = (sectionId) => {
    if (!isLandingPage) {
      navigate('/');
      setTimeout(() => scrollToSection(sectionId), 140);
      return;
    }

    scrollToSection(sectionId);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const navShellClass = isScrolled
    ? 'bg-white/95 backdrop-blur-md border border-gray-100 shadow-lg'
    : 'bg-white/70 backdrop-blur-md border border-white/80 shadow-md';

  return (
    <nav className="fixed top-0 w-full z-50 px-3 sm:px-5 lg:px-8 pt-3">
      <div className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${navShellClass}`}>
        <div className="flex justify-between items-center h-16 px-4 sm:px-6">
          <motion.div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => handleSectionNavigation('home')}
            whileHover={{ scale: 1.03 }}
          >
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-primary">ResumeZen</span>
          </motion.div>

          <div className="hidden lg:flex items-center gap-2">
            {primaryLinks.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => handleSectionNavigation(item.id)}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/10 transition-all"
                whileHover={{ y: -1 }}
              >
                {item.name}
              </motion.button>
            ))}

            <div className="relative">
              <motion.button
                onClick={() => setIsMoreOpen((prev) => !prev)}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/10 transition-all"
                whileHover={{ y: -1 }}
              >
                More
              </motion.button>

              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-gray-100 shadow-xl p-2"
                  >
                    {secondaryLinks.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          handleSectionNavigation(item.id);
                          setIsMoreOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                      >
                        {item.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 ml-3">
            {currentUser ? (
              <>
                <motion.button
                  onClick={() => navigate('/dashboard')}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-5 rounded-full transition duration-300"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Dashboard
                </motion.button>
                {!isLandingPage && (
                  <motion.button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-full transition duration-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Logout
                  </motion.button>
                )}
              </>
            ) : (
              <motion.button
                onClick={() => navigate('/login')}
                className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-5 rounded-full transition duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started
              </motion.button>
            )}
          </div>

          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? '✕' : '☰'}
          </button>
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden px-4 pb-4"
            >
              <div className="border-t border-gray-100 pt-3 flex flex-col gap-1">
                {allLinks.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleSectionNavigation(item.id)}
                    className="text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </button>
                ))}

                {currentUser ? (
                  <>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="mt-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Dashboard
                    </button>
                    {!isLandingPage && (
                      <button
                        onClick={handleLogout}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300"
                      >
                        Logout
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-2 bg-primary hover:bg-secondary text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
