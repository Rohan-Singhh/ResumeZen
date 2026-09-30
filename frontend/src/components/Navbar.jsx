import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bars2Icon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import Button from './ui/Button';
import { duration, ease, spring } from '../utils/motion';
import { scrollToSection } from '../utils/scrollToSection';

const navLinks = [
  { name: 'The report', id: 'features' },
  { name: 'How it works', id: 'how-it-works' },
  { name: 'Pricing', id: 'pricing' },
  { name: 'Reviews', id: 'reviews' },
  { name: 'FAQ', id: 'faq' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
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
      const scrolled = window.scrollY > 24;
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

  // Scroll-spy: mark the section that currently owns the middle of the screen.
  // An observer, not scroll math, so it costs nothing while scrolling.
  useEffect(() => {
    if (!isLandingPage) return undefined;
    // Every section with an id, including ones with no nav link (hero,
    // support): crossing into those clears the marker instead of leaving it
    // on whichever link was last.
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, [isLandingPage]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // The mobile menu is a full-screen sheet; the page behind must not scroll
  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isMobileOpen]);

  const handleSectionNavigation = (sectionId) => {
    setIsMobileOpen(false);
    if (!isLandingPage) navigate('/');
    scrollToSection(sectionId);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  // Blur only once content scrolls under the bar, and transition colors only:
  // animating backdrop-filter re-blurs the whole bar every frame.
  const shell = isScrolled || isMobileOpen
    ? 'border-line bg-surface-void/85 backdrop-blur-md'
    : 'border-transparent bg-transparent';

  return (
    <>
      <nav
        aria-label="Primary"
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-slow ${shell}`}
      >
        <div className="shell flex h-[var(--nav-h)] items-center justify-between">
          <motion.button
            type="button"
            aria-label="ResumeZen home"
            className="-ml-1 flex-shrink-0 rounded-md p-1"
            onClick={() => handleSectionNavigation('home')}
            whileTap={{ scale: 0.97 }}
          >
            <Logo size="md" />
          </motion.button>

          {/* Desktop links */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
            {navLinks.map((item) => {
              const active = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSectionNavigation(item.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`relative rounded-md px-3 py-2 text-sm ${active ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}
                >
                  {item.name}
                  {active && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                      transition={spring}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {currentUser ? (
              <>
                {!isLandingPage && (
                  <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
                )}
                <Button size="sm" onClick={() => navigate('/dashboard')}>
                  Open dashboard <ArrowRightIcon className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
                <Button size="sm" onClick={() => navigate('/login')}>Get your report</Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-ink lg:hidden"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars2Icon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu: a full sheet with the links set large, not a cramped dropdown */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-surface-void px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(var(--nav-h)+1.5rem)] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base }}
          >
            <ul className="flex-1">
              {navLinks.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.04 + i * 0.045, ease: ease.out }}
                  className="border-b border-line"
                >
                  <button
                    type="button"
                    onClick={() => handleSectionNavigation(item.id)}
                    className="flex w-full items-center justify-between py-4 text-left font-display text-[1.75rem] leading-tight tracking-[-0.02em] text-ink"
                  >
                    {item.name}
                    <span className="t-meta">0{i + 1}</span>
                  </button>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3, ease: ease.out }}
              className="flex flex-col gap-2.5"
            >
              {currentUser ? (
                <>
                  <Button size="lg" onClick={() => navigate('/dashboard')}>Open dashboard</Button>
                  {!isLandingPage && <Button variant="secondary" size="lg" onClick={handleLogout}>Log out</Button>}
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/login')}>Get your report</Button>
                  <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>Sign in</Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
