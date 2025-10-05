/**
 * Modern Footer Component
 * Brand footer with social links and credits
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, MessageCircle, Heart } from 'lucide-react';
import TrustLensLogo from '../../assets/logo/TrustLensLogo';
import { useTheme } from '../../theme/ThemeProvider';

export const Footer = () => {
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

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com/sachinschitre/trustlens',
      color: 'hover:text-gray-900 dark:hover:text-white',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://twitter.com/trustlens',
      color: 'hover:text-blue-400',
    },
    {
      name: 'Discord',
      icon: MessageCircle,
      href: 'https://discord.gg/trustlens',
      color: 'hover:text-purple-400',
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <TrustLensLogo size="md" variant="text" theme={theme} />
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">
              TrustLens is an AI-powered escrow platform that combines the security of blockchain 
              with intelligent verification for transparent, trustworthy transactions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#dashboard" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="#escrows" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Escrows
                </a>
              </li>
              <li>
                <a 
                  href="#ai-verifier" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  AI Verifier
                </a>
              </li>
              <li>
                <a 
                  href="#nft-receipts" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  NFT Receipts
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Credits */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Connect With Us
            </h3>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      p-2 rounded-lg bg-gray-100 dark:bg-gray-800
                      text-gray-600 dark:text-gray-300
                      ${link.color}
                      transition-all duration-200
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={link.name}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Built with</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.span>
              <span>by the TrustLens team</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <span>Powered by</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                  Aeternity
                </span>
                <span className="px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium">
                  Solana
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>© 2024 TrustLens. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
