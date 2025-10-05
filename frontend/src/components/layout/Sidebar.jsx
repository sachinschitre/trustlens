/**
 * Sidebar Navigation Component
 * Modern sidebar with glassmorphism and smooth animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Shield, 
  Brain, 
  ImageIcon, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import TrustLensLogo from '../../assets/logo/TrustLensLogo';
import { useTheme } from '../../theme/ThemeProvider';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'escrows', label: 'Escrows', icon: Shield, href: '/escrows' },
  { id: 'ai-verifier', label: 'AI Verifier', icon: Brain, href: '/ai-verifier' },
  { id: 'nft-receipts', label: 'NFT Receipts', icon: ImageIcon, href: '/nft-receipts' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export const Sidebar = ({ 
  isCollapsed = false, 
  onToggleCollapse,
  activeItem = 'dashboard',
  onNavigate 
}) => {
  const { theme } = useTheme();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '4rem' : '16rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`
        fixed left-0 top-0 h-full z-40
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-xl border-r
        border-gray-200/50 dark:border-gray-700/50
        ${isCollapsed ? 'px-2' : 'px-6'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TrustLensLogo size="sm" variant="text" theme={theme} />
          </motion.div>
        )}
        
        <motion.button
          onClick={onToggleCollapse}
          className="
            p-1.5 rounded-lg
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors duration-200
          "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <ul className="space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <motion.button
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  {!isCollapsed && (
                    <motion.span
                      className="font-medium text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div
          className="absolute bottom-6 left-6 right-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Built with ❤️ by TrustLens</p>
            <p>Powered by Aeternity & Solana</p>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
