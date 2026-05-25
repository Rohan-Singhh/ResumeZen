import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
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

function TopNav() {
  const { logout, currentUser, userPlans } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    { name: 'Uploads', path: '/dashboard/recent-uploads', icon: DocumentTextIcon },
    { name: 'Jobs', path: '/dashboard/jobs', icon: BriefcaseIcon },
    { name: 'Plans', path: '/dashboard/plans', icon: CreditCardIcon },
    { name: 'Profile', path: '/dashboard/profile', icon: Cog6ToothIcon },
    { name: 'Help', path: '/dashboard/help', icon: QuestionMarkCircleIcon },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-[#0f0f13]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <span className="text-white font-bold font-display text-sm tracking-tighter">RZ</span>
                </div>
                <span className="font-bold text-zinc-100 font-display tracking-tight text-lg">ResumeZen</span>
              </div>
              
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
                        isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
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
                      <item.icon className={`h-4 w-4 relative z-10 ${isActive ? 'text-violet-400' : ''}`} />
                      <span className="relative z-10">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Right Side Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              {!hasUnlimitedPlan && (
                <button 
                  onClick={() => navigate('/dashboard/plans')} 
                  className="flex items-center gap-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
                >
                  <SparklesIcon className="h-4 w-4" /> Go Unlimited
                </button>
              )}
              
              <div className="h-6 w-px bg-white/10"></div>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 focus:outline-none"
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
              className="md:hidden border-t border-white/5 bg-[#0f0f13]/95 backdrop-blur-2xl"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || 
                                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-3 ${
                        isActive ? 'bg-violet-500/20 text-white border border-violet-500/30' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-violet-400' : ''}`} />
                      {item.name}
                    </NavLink>
                  );
                })}
                
                <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                  {!hasUnlimitedPlan && (
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard/plans'); }} 
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-glow-primary transition-all"
                    >
                      <SparklesIcon className="h-5 w-5" /> Go Unlimited
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-zinc-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-4 py-3 rounded-xl transition-colors"
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

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-zinc-100 overflow-hidden relative selection:bg-violet-500/30">
      
      {/* Massive Ambient Background Glows (Landing Page Style) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-violet-600/10 rounded-[100%] blur-[120px] pointer-events-none mix-blend-screen z-0"></div>
      <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-cyan-600/10 rounded-[100%] blur-[100px] pointer-events-none mix-blend-screen z-0"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-600/5 rounded-[100%] blur-[120px] pointer-events-none mix-blend-screen z-0"></div>

      {/* Top Navigation replacing Sidebar */}
      <TopNav />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}