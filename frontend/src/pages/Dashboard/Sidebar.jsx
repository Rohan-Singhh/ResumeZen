import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { 
  HomeIcon, 
  UserCircleIcon, 
  CreditCardIcon, 
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar({ onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();

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
      name: 'Home',
      icon: HomeIcon,
      path: '/dashboard'
    },
    {
      name: 'Edit Profile',
      icon: UserCircleIcon,
      path: '/dashboard/profile'
    },
    {
      name: 'Plans',
      icon: CreditCardIcon,
      path: '/dashboard/plans'
    },
    {
      name: 'Help',
      icon: QuestionMarkCircleIcon,
      path: '/dashboard/help'
    }
  ];

  // Animation variants
  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' }
  };

  const logoTextVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { opacity: 0, display: 'none', transition: { duration: 0.2 } }
  };

  const navTextVariants = {
    expanded: { opacity: 1, x: 0, display: 'block' },
    collapsed: { opacity: 0, x: -10, display: 'none', transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      className="h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Logo and App Name */}
      <div className="p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-md bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">RZ</span>
          </div>
          <motion.span 
            variants={logoTextVariants}
            className="ml-3 text-xl font-semibold text-gray-900"
          >
            ResumeZen
          </motion.span>
        </div>
        
        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full hover:bg-gray-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
          )}
        </motion.button>
      </div>
      
      {/* User Profile */}
      <div className={`px-4 pb-6 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center text-white font-medium">
            {getInitials()}
          </div>
          <motion.div variants={navTextVariants} className="ml-3">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[150px]">
              {currentUser?.email || 'user@example.com'}
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/dashboard/');
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-700 hover:bg-gray-100'
              } ${
                isCollapsed ? 'justify-center' : ''
              } group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors`}
            >
              <item.icon 
                className={`${
                  isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700'
                } ${
                  isCollapsed ? 'w-6 h-6' : 'mr-3 w-5 h-5'
                } flex-shrink-0 transition-colors`} 
              />
              <motion.span variants={navTextVariants}>
                {item.name}
              </motion.span>
            </NavLink>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 mt-auto">
        <button
          onClick={onLogout}
          className={`${
            isCollapsed ? 'justify-center' : ''
          } text-red-600 hover:bg-red-50 group flex w-full items-center px-2 py-3 text-sm font-medium rounded-md transition-colors`}
        >
          <ArrowRightOnRectangleIcon className="text-red-500 w-5 h-5 flex-shrink-0" />
          <motion.span variants={navTextVariants} className="ml-3">
            Sign out
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
} 