/**
 * Input Component
 * Reusable input field with consistent styling and variants
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ 
  className, 
  type = "text", 
  variant = "default",
  size = "default",
  ...props 
}, ref) => {
  const baseClasses = "flex w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200";
  
  const variants = {
    default: "border-gray-300 dark:border-gray-600",
    error: "border-red-500 dark:border-red-400 focus:ring-red-500",
    success: "border-green-500 dark:border-green-400 focus:ring-green-500",
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <input
      type={type}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
