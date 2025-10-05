/**
 * Theme Toggle Component
 * Animated dark/light mode toggle with smooth transitions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-xl
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="relative w-6 h-6"
        initial={false}
        animate={{
          rotate: isDark ? 180 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.8 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <Sun className="w-4 h-4 text-yellow-500" />
        </motion.div>
        
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          <Moon className="w-4 h-4 text-blue-400" />
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
