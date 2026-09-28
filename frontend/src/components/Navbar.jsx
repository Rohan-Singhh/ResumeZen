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

  // Passive listener, at most one read per frame, and a state update only when
  // the threshold is actually crossed — not a handler on every scroll event.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev === scrolled ? prev : scrolled));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Sections carry scroll-margin-top (index.css) for the fixed bar, so the
  // browser handles the offset; honor reduced motion for the jump itself.
  const scrollToSection = (element) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  // Coming from another page the section is not mounted yet. Wait for it
  // frame by frame (up to ~1s) instead of guessing with a fixed 140ms timeout.
  const scrollWhenReady = (sectionId, framesLeft = 60) => {
    const element = document.getElementById(sectionId);
    if (element) {
      scrollToSection(element);
    } else if (framesLeft > 0) {
      requestAnimationFrame(() => scrollWhenReady(sectionId, framesLeft - 1));
    }
  };

  const handleSectionNavigation = (sectionId) => {
    setIsMobileOpen(false);
    if (!isLandingPage) navigate('/');
    scrollWhenReady(sectionId);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  // Blur only once content scrolls under the bar, and transition colors only:
  // the old transition-all animated backdrop-filter, re-blurring the whole bar
  // every frame each time it crossed the threshold.
  const navShellClass = isScrolled
    ? 'bg-dark-bg/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
    : 'bg-dark-bg/0 border-b border-white/5 shadow-none';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-[background-color,border-color,box-shadow] duration-300 ${navShellClass}`}>
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
              <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-300 group-hover:scale-x-100"></span>
            </motion.button>
          ))}
        </div>

        {/* Right: CTA Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {currentUser ? (
            <>
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-lg transition-[color,background-color,border-color,box-shadow] duration-300 border border-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.button>
              {!isLandingPage && (
                <motion.button
                  onClick={handleLogout}
                  className="bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-semibold py-2.5 px-4 rounded-lg transition-[color,background-color,border-color,box-shadow] duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              )}
            </>
          ) : (
            <motion.button
              onClick={() => navigate('/login')}
              className="bg-white text-dark-bg hover:shadow-glow-primary font-bold py-2.5 px-6 rounded-lg transition-[color,background-color,border-color,box-shadow] duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-md border border-white/10 text-white hover:bg-white/10 transition-colors"
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
                    className="bg-white text-dark-bg font-bold py-3 px-4 rounded-lg transition duration-300 text-center"
                  >
                    Get Started
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
