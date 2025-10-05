# TrustLens Design System

A comprehensive design system for the TrustLens AI-powered escrow platform, featuring modern UI components, dark/light mode support, and professional branding.

## 🎨 Brand Identity

### Color Palette

**Primary Colors (Trust Blue)**
- `primary-50` to `primary-950`: Deep blue tones representing trust and security
- Main brand color: `primary-500` (#0ea5e9)

**Secondary Colors (AI Cyan)**
- `secondary-50` to `secondary-950`: Vibrant cyan tones representing AI and technology
- Main AI color: `secondary-500` (#06b6d4)

**Trust Colors (Indigo)**
- `trust-50` to `trust-950`: Purple-indigo tones representing blockchain technology
- Main trust color: `trust-500` (#6366f1)

### Typography

- **Font Family**: Inter (system fallbacks: system-ui, sans-serif)
- **Clean, modern sans-serif** optimized for readability and professional appearance

## 🌓 Theme System

### Dark/Light Mode

The theme system provides:
- **Automatic detection** of system preference
- **localStorage persistence** for user preference
- **Smooth transitions** between themes
- **CSS custom properties** for consistent theming

### Usage

```jsx
import { ThemeProvider, useTheme } from './theme/ThemeProvider';

// Wrap your app
<ThemeProvider>
  <App />
</ThemeProvider>

// Use theme in components
const { theme, toggleTheme, isDark } = useTheme();
```

## 🧩 Component Library

### Core Components

- **Card**: Glassmorphism cards with hover effects
- **Button**: Gradient buttons with multiple variants
- **ThemeToggle**: Animated dark/light mode switch
- **Sidebar**: Collapsible navigation sidebar
- **TopNavbar**: Modern top navigation bar

### Layout Components

- **DashboardLayout**: Main layout with sidebar and navbar
- **DashboardOverview**: Modern dashboard with stats cards
- **Footer**: Professional footer with social links

### Logo Component

- **TrustLensLogo**: Adaptive logo with icon, text, and full variants
- **Theme-aware**: Automatically adjusts colors for light/dark modes
- **Scalable**: Multiple size options (xs, sm, md, lg, xl)

## 🎭 Design Principles

### Glassmorphism
- **Backdrop blur** effects for modern appearance
- **Semi-transparent** backgrounds with subtle borders
- **Layered depth** for visual hierarchy

### Animations
- **Framer Motion** integration for smooth transitions
- **Hover effects** with scale and lift animations
- **Loading states** with skeleton animations

### Accessibility
- **Focus indicators** with proper contrast
- **Keyboard navigation** support
- **Screen reader** friendly components

## 🚀 Getting Started

### Installation

```bash
npm install framer-motion
```

### Basic Usage

```jsx
import { ThemeProvider } from './theme/ThemeProvider';
import { Card, Button } from './components/ui';
import TrustLensLogo from './assets/logo/TrustLensLogo';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Card>
          <TrustLensLogo size="md" />
          <Button>Get Started</Button>
        </Card>
      </div>
    </ThemeProvider>
  );
}
```

## 🎯 Best Practices

### Theme Usage
- Always use theme-aware colors (`text-gray-900 dark:text-white`)
- Test components in both light and dark modes
- Use CSS custom properties for dynamic theming

### Component Usage
- Use semantic component variants (primary, secondary, outline)
- Apply consistent spacing using Tailwind utilities
- Maintain proper focus states for accessibility

### Performance
- Use `motion.div` sparingly for critical animations only
- Implement proper loading states
- Optimize bundle size with tree shaking

## 📱 Responsive Design

- **Mobile-first** approach with Tailwind breakpoints
- **Collapsible sidebar** for mobile devices
- **Touch-friendly** button sizes and spacing

## 🔧 Customization

### Adding New Colors
1. Update `tailwind.config.js` with new color definitions
2. Add corresponding CSS custom properties
3. Update theme provider if needed

### Creating New Components
1. Follow existing component patterns
2. Include theme support with dark mode classes
3. Add proper TypeScript types
4. Include accessibility attributes

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Inter Font](https://rsms.me/inter/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

Built with ❤️ by the TrustLens team
