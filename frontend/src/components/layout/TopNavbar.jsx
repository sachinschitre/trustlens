/**
 * Top Navigation Bar Component
 * Modern navbar with wallet connection, theme toggle, and profile
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, User, Wallet, LogOut, Settings, UserCircle } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import ThemeToggle from '../ui/ThemeToggle';

export const TopNavbar = ({ 
  sidebarWidth = '16rem',
  onWalletConnect,
  onProfileClick 
}) => {
  const { account, isConnected, balance } = useWallet();
  const { user, logout, isClient, isFreelancer } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Safely get theme with fallback
  let theme = 'light';
  try {
    const themeContext = useTheme();
    if (themeContext) {
      theme = themeContext.theme || 'light';
    }
  } catch (error) {
    // ThemeProvider not available during initial render - this is normal
  }

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        fixed top-0 right-0 z-30 h-16
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-xl border-b
        border-gray-200/50 dark:border-gray-700/50
      `}
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - empty for now */}
        <div className="flex-1">
          {/* Could add breadcrumbs or page title here */}
        </div>

        {/* Right side - actions */}
        <div className="flex items-center space-x-4">
          {/* Wallet Status */}
          {isConnected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Connected
                </span>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {balance ? `${balance} AE` : '0 AE'}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.button
              onClick={onWalletConnect}
              className="
                flex items-center space-x-2 px-4 py-2
                bg-gradient-to-r from-blue-500 to-cyan-500
                text-white rounded-lg font-medium
                hover:from-blue-600 hover:to-cyan-600
                transition-all duration-200
                shadow-lg shadow-blue-500/25
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </motion.button>
          )}

          {/* Notifications */}
          <motion.button
            className="
              p-2 rounded-lg
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors duration-200
              relative
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {/* Notification badge */}
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="
                w-10 h-10 rounded-full
                bg-gradient-to-r from-blue-500 to-cyan-500
                flex items-center justify-center
                hover:from-blue-600 hover:to-cyan-600
                transition-all duration-200
                shadow-lg shadow-blue-500/25
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </motion.button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          isClient() 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {isClient() ? 'Client' : isFreelancer() ? 'Freelancer' : 'User'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      if (onProfileClick) onProfileClick();
                      setShowProfileDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserCircle className="w-4 h-4 mr-3" />
                    View Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      // Navigate to settings
                      setShowProfileDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;
