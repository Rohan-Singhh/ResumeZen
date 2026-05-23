import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Sidebar, { SidebarProvider, useSidebar } from './Sidebar';
import { BellIcon } from '@heroicons/react/24/outline';

function DashboardContent() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const { isOpen } = useSidebar();

  // Update page title based on location
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/dashboard') {
      setPageTitle('Dashboard');
    } else if (path.includes('/profile')) {
      setPageTitle('Profile Settings');
    } else if (path.includes('/plans')) {
      setPageTitle('Subscription Plans');
    } else if (path.includes('/recent-uploads')) {
      setPageTitle('Recent Uploads');
    } else if (path.includes('/resume-analysis')) {
      setPageTitle('Resume Analysis');
    } else if (path.includes('/help')) {
      setPageTitle('Help & Support');
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />
      
      {/* Main Content - Adjust margin based on sidebar state */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden w-full transition-all duration-300 ease-in-out ${
          isOpen ? 'md:ml-72' : 'md:ml-20'
        }`}
      >
        {/* Top Header */}
        <header className="bg-zinc-950/40 backdrop-blur-md border-b border-white/5 z-10">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-zinc-100 font-display">{pageTitle}</h1>
              
              <div className="flex items-center">
                {/* Notifications */}
                <div className="relative">
                  <button className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/5 focus:outline-none">
                    <BellIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* User Avatar - Mobile only */}
                <div className="md:hidden ml-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-medium">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-16 md:pb-6 bg-zinc-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="enter"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Footer */}
        <footer className="bg-transparent border-t border-white/5 py-3 px-4 sm:px-6 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              &copy; {new Date().getFullYear()} ResumeZen
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
} 