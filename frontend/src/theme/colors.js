/**
 * TrustLens Brand Colors
 * Professional color palette inspired by trust, AI, and decentralization
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main brand blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Secondary AI/Neon Cyan
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4', // Main AI cyan
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  
  // Trust/Indigo
  trust: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Main trust indigo
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  
  // Neutral Grays
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Status Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
  },
};

// Gradient combinations
export const gradients = {
  primary: 'from-primary-500 to-secondary-500',
  trust: 'from-trust-500 to-primary-500',
  ai: 'from-secondary-400 to-primary-600',
  dark: 'from-neutral-800 to-neutral-900',
  glass: 'from-white/10 to-white/5',
  glassDark: 'from-neutral-800/50 to-neutral-900/50',
};

// Theme-specific color mappings
export const themeColors = {
  light: {
    background: colors.neutral[50],
    surface: colors.neutral[100],
    surfaceElevated: '#ffffff',
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      muted: colors.neutral[500],
    },
    border: colors.neutral[200],
    accent: colors.primary[500],
  },
  dark: {
    background: colors.neutral[950],
    surface: colors.neutral[900],
    surfaceElevated: colors.neutral[800],
    text: {
      primary: colors.neutral[50],
      secondary: colors.neutral[300],
      muted: colors.neutral[400],
    },
    border: colors.neutral[700],
    accent: colors.primary[400],
  },
};

export default colors;
