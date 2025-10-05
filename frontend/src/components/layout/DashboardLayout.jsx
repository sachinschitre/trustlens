/**
 * Dashboard Layout Component
 * Main layout with sidebar, navbar, and content area
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeProvider';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export const DashboardLayout = ({ children, currentView, onNavigate }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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

  const sidebarWidth = sidebarCollapsed ? '4rem' : '16rem';

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigate = (itemId) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  const handleWalletConnect = () => {
    // Handle wallet connection
    console.log('Connect wallet');
  };

  const handleProfileClick = () => {
    // Handle profile click
    console.log('Profile clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
            <Sidebar 
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleSidebar}
              activeItem={currentView}
              onNavigate={handleNavigate}
            />

      {/* Top Navbar */}
      <TopNavbar
        sidebarWidth={sidebarWidth}
        onWalletConnect={handleWalletConnect}
        onProfileClick={handleProfileClick}
      />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="transition-all duration-300"
        style={{ 
          marginLeft: sidebarWidth,
          marginTop: '4rem',
          minHeight: 'calc(100vh - 4rem)'
        }}
      >
        <div className="p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
