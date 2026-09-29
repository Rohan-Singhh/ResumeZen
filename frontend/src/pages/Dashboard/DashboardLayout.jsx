import React, { useState } from 'react';
import { useOutlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  Cog6ToothIcon, 
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import SupportWidget from '../../components/SupportWidget';
import Logo from '../../components/Logo';

function Avatar({ user, size = 'h-7 w-7' }) {
  return (
    <span className={`${size} flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-raised`}>
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-ink-muted">{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
      )}
    </span>
  );
}

function TopNav() {
  const { logout, currentUser, userPlans } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const firstName = currentUser?.name?.split(' ')[0] || 'Account';

  // Check if user already has an active unlimited plan
  const hasUnlimitedPlan = userPlans?.some(p => p.isActive && p.planId?.isUnlimited);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to log out', error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: HomeIcon },
    { name: 'Studio', path: '/dashboard/studio', icon: DocumentTextIcon },
    { name: 'Jobs', path: '/dashboard/jobs', icon: BriefcaseIcon },
    { name: 'Plans', path: '/dashboard/plans', icon: CreditCardIcon },
    { name: 'Profile', path: '/dashboard/profile', icon: Cog6ToothIcon },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-surface-void/80 backdrop-blur-2xl border-b border-line">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate('/dashboard')}
                aria-label="ResumeZen overview"
                className="flex items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Logo size="sm" />
              </button>
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || 
                                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        isActive ? 'text-ink' : 'text-ink-muted hover:text-ink hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="topNavActiveBg"
                          className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon className={`h-4 w-4 relative z-10 ${isActive ? 'text-primary' : ''}`} />
                      <span className="relative z-10">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Right Side Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {!hasUnlimitedPlan && (
                <button
                  onClick={() => navigate('/dashboard/plans')}
                  className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary-light transition-colors hover:bg-primary/20"
                >
                  <SparklesIcon className="h-4 w-4" /> Go unlimited
                </button>
              )}

              <div className="h-6 w-px bg-line" />

              {/* Who is signed in — previously nowhere on the page */}
              <NavLink
                to="/dashboard/profile"
                title={currentUser?.email}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-ink-muted transition-colors hover:bg-white/[0.05] hover:text-ink"
              >
                <Avatar user={currentUser} />
                <span className="max-w-[120px] truncate">{firstName}</span>
              </NavLink>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Log out"
                title="Log out"
                className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-ink-muted hover:text-ink hover:bg-white/5 focus:outline-none"
              >
                {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-line bg-surface-void/95 backdrop-blur-2xl"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                <div className="mb-2 flex items-center gap-3 border-b border-line px-3 pb-4 pt-2">
                  <Avatar user={currentUser} size="h-9 w-9" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{currentUser?.name || 'Your account'}</p>
                    <p className="truncate text-xs text-ink-faint">{currentUser?.email}</p>
                  </div>
                </div>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || 
                                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-3 ${
                        isActive ? 'bg-primary/15 text-ink border border-primary/30' : 'text-ink-muted hover:text-ink hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                      {item.name}
                    </NavLink>
                  );
                })}
                
                <div className="mt-6 pt-6 border-t border-line space-y-4">
                  {!hasUnlimitedPlan && (
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard/plans'); }} 
                      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors"
                    >
                      <SparklesIcon className="h-5 w-5" /> Go Unlimited
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-ink-muted hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-4 py-3 rounded-xl transition-colors"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  // Capture the outlet element per render. A live <Outlet /> inside the exiting
  // motion.div would already show the *new* tab while fading out, so each tab
  // switch flashed the destination twice.
  const outlet = useOutlet();

  return (
    <div className="flex flex-col h-screen bg-surface-void text-ink overflow-hidden relative selection:bg-primary/30">

      {/* Top Navigation replacing Sidebar */}
      <TopNav />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global Support Widget */}
      <SupportWidget />
    </div>
  );
}