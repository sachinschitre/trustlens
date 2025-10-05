/**
 * TrustLens Logo Component
 * AI eye lens + blockchain circuit motif
 * Adapts to light/dark themes
 */

import React from 'react';

export const TrustLensLogo = ({ 
  size = 'md', 
  variant = 'full', 
  className = '',
  theme = 'light' 
}) => {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const textSizes = {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const isDark = theme === 'dark';

  const LogoIcon = () => (
    <svg
      viewBox="0 0 64 64"
      className={`${sizes[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring - blockchain circuit */}
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke={isDark ? '#0ea5e9' : '#0284c7'}
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      
      {/* Inner blockchain nodes */}
      <circle cx="20" cy="20" r="2" fill={isDark ? '#06b6d4' : '#0891b2'} />
      <circle cx="44" cy="20" r="2" fill={isDark ? '#06b6d4' : '#0891b2'} />
      <circle cx="20" cy="44" r="2" fill={isDark ? '#06b6d4' : '#0891b2'} />
      <circle cx="44" cy="44" r="2" fill={isDark ? '#06b6d4' : '#0891b2'} />
      
      {/* Circuit connections */}
      <path
        d="M20 20 L32 32 M44 20 L32 32 M20 44 L32 32 M44 44 L32 32"
        stroke={isDark ? '#06b6d4' : '#0891b2'}
        strokeWidth="1.5"
        opacity="0.6"
      />
      
      {/* AI Eye lens - main focal point */}
      <circle
        cx="32"
        cy="32"
        r="12"
        fill={isDark ? 'url(#eyeGradientDark)' : 'url(#eyeGradientLight)'}
        stroke={isDark ? '#0ea5e9' : '#0284c7'}
        strokeWidth="2"
      />
      
      {/* Eye pupil - AI core */}
      <circle
        cx="32"
        cy="32"
        r="6"
        fill={isDark ? '#0f172a' : '#ffffff'}
      />
      
      {/* AI highlight */}
      <circle
        cx="28"
        cy="28"
        r="2"
        fill={isDark ? '#06b6d4' : '#0ea5e9'}
        opacity="0.8"
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="eyeGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="eyeGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return (
      <span className={`font-bold ${textSizes[size]} bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ${className}`}>
        TrustLens
      </span>
    );
  }

  // Full logo with icon and text
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoIcon />
      <span className={`font-bold ${textSizes[size]} bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent`}>
        TrustLens
      </span>
    </div>
  );
};

export default TrustLensLogo;
