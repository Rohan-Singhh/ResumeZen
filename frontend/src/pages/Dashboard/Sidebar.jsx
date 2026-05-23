import React, { createContext, useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);

export default function Sidebar() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, closeSidebar } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Failed to log out', error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: HomeIcon },
    { name: 'Uploads', path: '/dashboard/recent-uploads', icon: DocumentTextIcon },
    { name: 'Plans', path: '/dashboard/plans', icon: CreditCardIcon },
    { name: 'Profile', path: '/dashboard/profile', icon: Cog6ToothIcon },
    { name: 'Help', path: '/dashboard/help', icon: QuestionMarkCircleIcon },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f0f13]/80 backdrop-blur-2xl border-r border-white/5 w-64 shadow-2xl relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

      {/* Brand */}
      <div className="h-20 flex items-center px-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <span className="text-white font-bold font-display text-sm tracking-tighter">RZ</span>
          </div>
          <span className="font-bold text-zinc-100 font-display tracking-tight text-lg">ResumeZen</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Main Menu</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden ${
                isActive 
                  ? 'text-white' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
              }`}
            >
              {/* Active Background Glow */}
              {isActive && (
                <motion.div 
                  layoutId="activeNavBg"
                  className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-transparent border-l-2 border-violet-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <item.icon className={`h-5 w-5 mr-3 relative z-10 transition-colors ${isActive ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              <span className="relative z-10">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Upgrade Callout */}
      <div className="px-4 mb-4 relative z-10">
        <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 rounded-xl p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/20 rounded-full blur-xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
          <div className="relative z-10">
            <SparklesIcon className="h-5 w-5 text-violet-400 mb-2" />
            <h4 className="text-sm font-semibold text-zinc-100 mb-1">Go Unlimited</h4>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">Get infinite AI resume reviews and land your dream job faster.</p>
            <button onClick={() => navigate('/dashboard/plans')} className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2 rounded-lg transition-colors border border-white/5 shadow-sm">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-600 p-[2px] shadow-lg">
            <div className="h-full w-full rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <span className="text-sm font-bold text-zinc-200">
                {currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-200 truncate font-display">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-zinc-500 truncate">{currentUser?.email || 'No email'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-zinc-400 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-colors group"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-zinc-500 group-hover:text-red-400 transition-colors" />
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full z-20 sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={closeSidebar}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <SidebarContent />
              <button
                onClick={closeSidebar}
                className="absolute top-4 -right-12 p-2 text-zinc-400 hover:text-white bg-zinc-900/50 backdrop-blur-md rounded-lg border border-white/10"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}