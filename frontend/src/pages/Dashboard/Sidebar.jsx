import React, { useState, useEffect, createContext, useContext } from 'react';
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
  ChevronDoubleRightIcon
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
      path: '/dashboard/analysis'
    },
    {
      name: 'Resume Analysis',
      icon: <DocumentMagnifyingGlassIcon className="h-5 w-5" />,
      path: '/dashboard/resume-analysis'
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
      {/* Fixed Three-Dot Toggle Button for Mobile */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMobileMenu}
          className="p-3 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <EllipsisHorizontalIcon className="h-6 w-6" />
        </motion.button>
      </div>
      
      {/* Sidebar for Desktop */}
      <motion.div 
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-20 bg-white shadow-sm border-r border-gray-200"
        variants={sidebarVariants}
        initial={isOpen ? "open" : "closed"}
        animate={isOpen ? "open" : "closed"}
        style={{"--sidebar-width": "18rem", "--sidebar-collapsed-width": "5rem"}}
      >
        <div className="flex flex-col flex-grow overflow-y-auto">
          {/* Logo and App Name */}
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl">
                R
              </div>
              <motion.span 
                variants={contentVariants}
                initial={isOpen ? "open" : "closed"}
                animate={isOpen ? "open" : "closed"}
                className="ml-3 text-lg font-bold text-gray-800"
              >
                ResumeZen
              </motion.span>
            </div>
            <motion.button
              variants={sidebarIconVariants}
              initial={isOpen ? "open" : "closed"}
              animate={isOpen ? "open" : "closed"}
              onClick={toggleSidebar}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? (
                <ChevronDoubleLeftIcon className="h-5 w-5" />
              ) : (
                <ChevronDoubleRightIcon className="h-5 w-5" />
              )}
            </motion.button>
          </div>
          
          {/* User Profile Section - Only when expanded */}
          {isOpen && (
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-primary font-semibold text-lg">
                  {getInitials()}
                </div>
                <motion.div 
                  variants={contentVariants}
                  initial="open"
                  animate="open"
                  className="ml-3"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {currentUser?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[160px]">
                    {currentUser?.email || currentUser?.mobileNumber || 'No email provided'}
                  </p>
                </motion.div>
              </div>
            </div>
          )}
          
          {/* Navigation Links */}
          <nav className="flex-1 py-4">
            <div className="px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) => 
                    `flex items-center px-2 py-2 rounded-lg text-sm transition-colors duration-200 ${
                      isActive || isNavItemActive(item.path)
                        ? 'bg-blue-50 text-primary font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <div className="flex items-center">
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isOpen && (
                      <motion.span 
                        variants={contentVariants}
                        initial="open"
                        animate="open"
                        className="ml-3"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </div>
                </NavLink>
              ))}
            </div>
          </nav>
          
          {/* Logout Button */}
          <div className="p-3 mt-auto">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-2 py-2 text-sm rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200`}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {isOpen && (
                <motion.span 
                  variants={contentVariants}
                  initial="open"
                  animate="open"
                  className="ml-3"
                >
                  Logout
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar Menu */}
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 bottom-0 left-0 w-64 bg-white z-50 shadow-xl flex flex-col md:hidden"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl">
                    R
                  </div>
                  <span className="ml-3 text-lg font-bold text-gray-800">
                    ResumeZen
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Mobile User Profile */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-primary font-semibold text-lg">
                    {getInitials()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[160px]">
                      {currentUser?.email || currentUser?.mobileNumber || 'No email provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="flex-1 py-4 overflow-y-auto">
                <div className="px-3 space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/dashboard'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => 
                        `flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                          isActive || isNavItemActive(item.path)
                            ? 'bg-blue-50 text-primary font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`
                      }
                    >
                      <div className="flex items-center">
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className="ml-3">{item.name}</span>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </nav>
              
              {/* Mobile Logout */}
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="ml-3">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 