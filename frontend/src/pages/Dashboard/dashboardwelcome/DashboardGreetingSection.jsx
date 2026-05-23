import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ClockIcon } from '@heroicons/react/24/outline';

/**
 * DashboardGreetingSection
 * @param {Object} props
 * @param {Object} props.currentUser - The current user object
 * @param {Date} props.lastActive - Last active date
 * @param {Function} props.getInitials - Function to get user initials
 * @param {Function} props.formatLastActive - Function to format last active time
 */
const DashboardGreetingSection = () => {
  const { currentUser } = useAuth();
  const [lastActive, setLastActive] = useState(null);

  useEffect(() => {
    if (currentUser && currentUser.lastLoginAt) {
      setLastActive(new Date(currentUser.lastLoginAt));
    }
  }, [currentUser]);

  const getInitials = () => {
    if (!currentUser || !currentUser.name) return 'U';
    return currentUser.name.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatLastActive = (date) => {
    if (!date) return 'First time here';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-zinc-900/30 rounded-xl p-5 border border-white/10 mb-6 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">{currentUser?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <div className="flex items-center mt-2">
            <ClockIcon className="h-4 w-4 text-zinc-500 mr-1" />
            <p className="text-sm text-zinc-400">
              Last active: {formatLastActive(lastActive)}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            {getInitials()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGreetingSection; 