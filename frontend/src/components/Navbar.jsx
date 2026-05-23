import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'Features', id: 'features' },
  { name: 'How It Works', id: 'how-it-works' },
  { name: 'Pricing', id: 'pricing' },
  { name: 'Reviews', id: 'reviews' },
  { name: 'FAQ', id: 'faq' }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
    ? 'bg-dark-bg/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
    : 'bg-dark-bg/0 backdrop-blur-sm border-b border-white/5 shadow-none';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${navShellClass}`}>
      <div className="flex justify-between items-center h-20 px-6 sm:px-12 lg:px-20 w-full mx-auto">
        
        {/* Left: Logo */}
        <motion.div
          className="flex-shrink-0 cursor-pointer"
          onClick={() => handleSectionNavigation('home')}
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
            Resume<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Zen</span>
          </span>
        </motion.div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => handleSectionNavigation(item.id)}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group"
              whileHover={{ y: -1 }}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
            </motion.button>
          ))}
        </div>

        {/* Right: CTA Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {currentUser ? (
            <>
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-300 border border-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.button>
              {!isLandingPage && (
                <motion.button
                  onClick={handleLogout}
                  className="bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              )}
            </>
          ) : (
            <>
              <motion.button
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white font-semibold py-2.5 px-4 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log in
              </motion.button>
              <motion.button
                onClick={() => navigate('/login')}
                className="bg-white text-dark-bg hover:shadow-glow-primary font-bold py-2.5 px-6 rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign up free
              </motion.button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-md border border-white/10 text-white hover:bg-white/10 transition-all"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-dark-bg/95 border-b border-white/10 backdrop-blur-xl"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSectionNavigation(item.id)}
                  className="text-left py-2 font-medium text-gray-300 hover:text-white transition-colors text-lg"
                >
                  {item.name}
                </button>
              ))}

              <div className="h-px bg-white/10 my-2"></div>

              {currentUser ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 text-center"
                  >
                    Dashboard
                  </button>
                  {!isLandingPage && (
                    <button
                      onClick={handleLogout}
                      className="bg-transparent border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition duration-300 text-center"
                    >
                      Logout
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white/10 text-white font-bold py-3 px-4 rounded-lg transition duration-300 text-center border border-white/10"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white text-dark-bg font-bold py-3 px-4 rounded-lg transition duration-300 text-center"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
