import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { 
  HomeIcon, 
  UserCircleIcon, 
  CreditCardIcon, 
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon,
  EllipsisHorizontalIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

// Create context for sidebar state
export const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  return (
    <SidebarContext.Provider value={{ 
      isOpen, 
      toggleSidebar, 
      isMobileMenuOpen,
      toggleMobileMenu,
      setIsMobileMenuOpen
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isMobileView, setIsMobileView] = useState(false);
  
  // If used outside provider, create local state
  const sidebarContext = useSidebar();
  const [isLocalOpen, setIsLocalOpen] = useState(true);
  const [isLocalMobileOpen, setIsLocalMobileOpen] = useState(false);
  
  // Use context if available, otherwise use local state
  const isOpen = sidebarContext?.isOpen ?? isLocalOpen;
  const toggleSidebar = sidebarContext?.toggleSidebar ?? (() => setIsLocalOpen(!isLocalOpen));
  const isMobileMenuOpen = sidebarContext?.isMobileMenuOpen ?? isLocalMobileOpen;
  const toggleMobileMenu = sidebarContext?.toggleMobileMenu ?? (() => setIsLocalMobileOpen(!isLocalMobileOpen));
  const setIsMobileMenuOpen = sidebarContext?.setIsMobileMenuOpen ?? setIsLocalMobileOpen;

  const sidebarRef = useRef(null);

  // Check if mobile view on initial render and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      
      // Auto-close sidebar on small screens
      if (window.innerWidth < 768 && isOpen && !isMobileMenuOpen) {
        if (sidebarContext?.setIsOpen) {
          sidebarContext.setIsOpen(false);
        } else {
          setIsLocalOpen(false);
        }
      }
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when clicking outside (desktop only)
  useEffect(() => {
    function handleClickOutside(event) {
      // Only on desktop
      if (window.innerWidth < 768) return;
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (isOpen) toggleSidebar();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, toggleSidebar]);

  // Get user initials for the avatar
  const getInitials = () => {
    if (!currentUser || !currentUser.name) return 'U';
    return currentUser.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      path: '/dashboard'
    },
    {
      name: 'Profile',
      icon: <UserCircleIcon className="h-5 w-5" />,
      path: '/dashboard/profile'
    },
    {
      name: 'Plans',
      icon: <CreditCardIcon className="h-5 w-5" />,
      path: '/dashboard/plans'
    },
    {
      name: 'Recent Uploads',
      icon: <DocumentTextIcon className="h-5 w-5" />,
      path: '/dashboard/recent-uploads'
    },
    {
      name: 'Help & Support',
      icon: <QuestionMarkCircleIcon className="h-5 w-5" />,
      path: '/dashboard/help'
    }
  ];

  // Mobile menu animation variants
  const mobileMenuVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      x: '-100%', 
      opacity: 0,
      transition: { 
        duration: 0.3
      }
    }
  };
  
  // Desktop sidebar variants
  const sidebarVariants = {
    open: { width: 'var(--sidebar-width)', transition: { duration: 0.3 } },
    closed: { width: 'var(--sidebar-collapsed-width)', transition: { duration: 0.3 } }
  };
  
  const sidebarIconVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 }
  };
  
  const contentVariants = {
    open: { opacity: 1, x: 0, display: 'block', transition: { delay: 0.2, duration: 0.2 } },
    closed: { opacity: 0, x: -10, transitionEnd: { display: 'none' }, transition: { duration: 0.2 } }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check if nav item is active
  const isNavItemActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/dashboard';
  };

  return (
    <>
      {/* Sidebar for Desktop */}
      <motion.div 
        ref={sidebarRef}
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-20 bg-white/70 backdrop-blur-xl shadow-2xl border-r border-gray-200 rounded-tr-3xl rounded-br-3xl overflow-hidden overflow-x-hidden sidebar-glass"
        variants={sidebarVariants}
        initial={isOpen ? "open" : "closed"}
        animate={isOpen ? "open" : "closed"}
        style={{"--sidebar-width": "18rem", "--sidebar-collapsed-width": "5rem"}}
      >
        <div className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden relative">
          {/* Logo and App Name */}
          <div className="p-4 flex items-center gap-2 border-b border-gray-200 bg-white/60 backdrop-blur-md">
            {/* Responsive Profile Avatar (toggles sidebar) */}
            <motion.div
              className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-purple-200 cursor-pointer animate-pulse-glow"
              whileHover={{ scale: 1.12, boxShadow: '0 0 0 6px #f472b6' }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              title="Toggle sidebar"
            >
              R
            </motion.div>
            <motion.span 
              variants={contentVariants}
              initial={isOpen ? "open" : "closed"}
              animate={isOpen ? "open" : "closed"}
              className="ml-3 text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 drop-shadow-lg"
            >
              ResumeZen
            </motion.span>
          </div>
          
          {/* User Profile Section - Only when expanded */}
          {isOpen && (
            <div className="px-4 py-6 border-b border-gray-200 flex flex-col items-center gap-2 bg-white/40 backdrop-blur-sm">
              {/* Responsive Profile Avatar (toggles sidebar) */}
              <motion.div
                className="relative flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.08, boxShadow: '0 0 0 6px #f472b6' }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                title="Toggle sidebar"
              >
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center shadow-xl ring-4 ring-pink-200 animate-pulse-glow">
                  <span className="text-2xl font-bold text-white drop-shadow-lg">{getInitials()}</span>
                </div>
                <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white animate-pulse"></span>
              </motion.div>
              <motion.div 
                variants={contentVariants}
                initial="open"
                animate="open"
                className="text-center"
              >
                <p className="text-base font-semibold text-gray-800">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">
                  {currentUser?.email || currentUser?.mobileNumber || 'No email provided'}
                </p>
              </motion.div>
            </div>
          )}
          
          {/* Navigation Links */}
          <nav className="flex-1 py-6">
            <div className="px-3 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) => 
                    `group flex items-center px-3 py-3 rounded-xl text-base font-medium transition-all duration-300 shadow-sm ${
                      isActive || isNavItemActive(item.path)
                        ? 'bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 text-purple-700 scale-105 shadow-lg'
                        : 'text-gray-600 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-blue-50 hover:scale-105'
                    }`
                  }
                >
                  <motion.span
                    className="flex-shrink-0 mr-3"
                    whileHover={{ scale: 1.2, rotate: 8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {item.icon}
                  </motion.span>
                  {isOpen && (
                    <motion.span 
                      variants={contentVariants}
                      initial="open"
                      animate="open"
                      className=""
                    >
                      {item.name}
                    </motion.span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
          
          {/* Logout Button */}
          <div className="p-4 mt-auto">
            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-3 py-3 text-base rounded-xl text-purple-500 bg-white/60 hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-blue-50 shadow-md hover:shadow-xl transition-all duration-300 font-semibold"
              whileHover={{ scale: 1.07, backgroundColor: '#f3e8ff' }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
              {isOpen && (
                <motion.span 
                  variants={contentVariants}
                  initial="open"
                  animate="open"
                  className=""
                >
                  Logout
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      {/* Mobile Menu (no three-dot button, avatar toggles menu) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar Menu */}
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 bottom-0 left-0 w-72 bg-white/80 backdrop-blur-2xl z-50 shadow-2xl flex flex-col md:hidden rounded-tr-3xl rounded-br-3xl overflow-hidden"
            >
              {/* Mobile Header with responsive avatar */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white/60 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 text-white flex items-center justify-center font-bold text-xl shadow-lg ring-2 ring-purple-200 cursor-pointer"
                    whileHover={{ scale: 1.12, boxShadow: '0 0 0 6px #f472b6' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    title="Close menu"
                  >
                    R
                  </motion.div>
                  <span className="ml-2 text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 drop-shadow-lg">
                    ResumeZen
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full text-purple-400 hover:bg-purple-100 shadow-md transition-all duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Mobile User Profile with responsive avatar */}
              <div className="p-5 border-b border-gray-200 flex flex-col items-center gap-2 bg-white/40 backdrop-blur-sm">
                <motion.div
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center shadow-xl ring-2 ring-pink-200 cursor-pointer"
                  whileHover={{ scale: 1.08, boxShadow: '0 0 0 6px #f472b6' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title="Close menu"
                >
                  <span className="text-xl font-bold text-white drop-shadow-lg">{getInitials()}</span>
                </motion.div>
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-800">
                    {currentUser?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[160px]">
                    {currentUser?.email || currentUser?.mobileNumber || 'No email provided'}
                  </p>
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="flex-1 py-6 overflow-y-auto">
                <div className="px-4 space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/dashboard'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => 
                        `group flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 shadow-sm ${
                          isActive || isNavItemActive(item.path)
                            ? 'bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 text-purple-700 scale-105 shadow-lg'
                            : 'text-gray-600 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-blue-50 hover:scale-105'
                        }`
                      }
                    >
                      <motion.span
                        className="flex-shrink-0 mr-3"
                        whileHover={{ scale: 1.2, rotate: 8 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {item.icon}
                      </motion.span>
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </nav>
              
              {/* Mobile Logout */}
              <div className="p-5 border-t border-gray-200">
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base rounded-xl text-purple-500 bg-white/60 hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-blue-50 shadow-md hover:shadow-xl transition-all duration-300 font-semibold"
                  whileHover={{ scale: 1.07, backgroundColor: '#f3e8ff' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 