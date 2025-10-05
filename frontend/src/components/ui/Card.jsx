/**
 * Modern Card Components
 * Glassmorphism cards with subtle animations
 */

import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'default',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      className={`
        rounded-2xl
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-xl
        border border-gray-200/50 dark:border-gray-700/50
        shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20
        ${paddingClasses[padding]}
        ${className}
      `}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ 
  children, 
  className = '',
  title,
  subtitle,
  action 
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 ${className}`}>
      {children}
    </div>
  );
};

// Specialized card variants
export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  trend = 'neutral',
  className = '' 
}) => {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <Card className={`${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </Card>
  );
};

export const ActionCard = ({ 
  title, 
  description, 
  action,
  icon: Icon,
  className = '' 
}) => {
  return (
    <Card className={`text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
          <Icon className="w-8 h-8 text-white" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {description}
      </p>
      {action}
    </Card>
  );
};

export default Card;
