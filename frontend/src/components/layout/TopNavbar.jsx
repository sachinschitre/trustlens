/**
 * Top Navigation Bar Component
 * Modern navbar with wallet connection, theme toggle, and profile
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, User, Wallet } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useTheme } from '../../theme/ThemeProvider';
import ThemeToggle from '../ui/ThemeToggle';

export const TopNavbar = ({ 
  sidebarWidth = '16rem',
  onWalletConnect,
  onProfileClick 
}) => {
  const { account, isConnected, balance } = useWallet();
  
  // Safely get theme with fallback
  let theme = 'light';
  try {
    const themeContext = useTheme();
    theme = themeContext?.theme || 'light';
  } catch (error) {
    console.warn('ThemeProvider not available, using light theme as fallback');
  }

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

          {/* Profile Avatar */}
          <motion.button
            onClick={onProfileClick}
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
            <User className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;
