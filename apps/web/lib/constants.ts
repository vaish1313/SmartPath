/**
 * Design System Constants - Flat Minimal Design
 * 
 * This file defines the flat design system for the SmartPath patient dashboard.
 * It replaces the previous glassmorphism aesthetic with solid colors, subtle borders,
 * and minimal styling for improved clarity and accessibility.
 */

/**
 * Color Palette
 * 
 * Primary colors, backgrounds, borders, and status indicators
 * following the flat minimal design system.
 */
export const colors = {
  /** Primary brand color - Teal */
  primary: '#1D9E75',
  
  /** Background colors */
  background: {
    /** Page background - Light gray */
    page: '#F5F5F3',
    /** Card background - White */
    card: '#FFFFFF',
    /** Dark accent background for special elements */
    darkAccent: '#0F6E56',
  },
  
  /** Border colors */
  border: {
    /** Default border - Light gray */
    default: '#E5E5E5',
    /** Lighter border for subtle separation */
    light: '#F3F4F6',
  },
  
  /** Text colors */
  text: {
    /** Primary text - Slate 800 */
    primary: '#1E293B',
    /** Secondary text - Slate 500 */
    secondary: '#64748B',
    /** Tertiary text - Slate 400 */
    tertiary: '#94A3B8',
  },
  
  /** Status colors for indicators and badges */
  status: {
    /** Teal - Primary/Active status */
    teal: '#1D9E75',
    /** Blue - Information/Reports */
    blue: '#3B82F6',
    /** Amber - Warning/Pending */
    amber: '#F59E0B',
    /** Red - Error/Cancelled */
    red: '#EF4444',
  },
} as const;

/**
 * Spacing and Sizing Constants
 * 
 * Border widths, border radius values, and component dimensions
 * for consistent spacing throughout the application.
 */
export const spacing = {
  /** Border width for cards and containers */
  borderWidth: '0.5px',
  
  /** Border radius values */
  borderRadius: {
    /** Small elements (buttons, badges, nav items) - 8px */
    small: '8px',
    /** Card elements - 12px */
    card: '12px',
  },
  
  /** Component dimensions */
  sidebar: {
    /** Sidebar width */
    width: '220px',
  },
} as const;

/**
 * Tailwind CSS Class Utilities
 * 
 * Pre-composed Tailwind classes for common design patterns.
 * These ensure consistency and reduce duplication across components.
 */
export const tailwindClasses = {
  /** Card styling - white background with border */
  card: {
    /** Base card style */
    base: 'bg-white border border-gray-200 rounded-xl',
    /** Card with hover effect */
    hover: 'bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors',
  },
  
  /** Border utilities */
  border: {
    /** Default border */
    default: 'border border-gray-200',
    /** Light border for subtle separation */
    light: 'border-b border-gray-100',
  },
  
  /** Border radius utilities */
  rounded: {
    /** Small elements */
    small: 'rounded-lg',
    /** Card elements */
    card: 'rounded-xl',
  },
  
  /** Background utilities */
  background: {
    /** Page background */
    page: 'bg-[#F5F5F3]',
    /** Card background */
    card: 'bg-white',
  },
} as const;

/**
 * Status Badge Styles
 * 
 * Tailwind classes for status badges used in bookings and other components.
 * Each status has a specific color scheme with background, text, and border.
 */
export const statusStyles: Record<string, string> = {
  completed: 'bg-teal-50 text-teal-700 border-teal-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-slate-100 text-slate-600 border-slate-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  'sample-collected': 'bg-purple-50 text-purple-700 border-purple-200',
} as const;

/**
 * Health Metric Color Schemes
 * 
 * Color schemes for health metric cards with tinted backgrounds.
 * Each metric uses a specific color without borders.
 */
export const healthMetricColors = {
  heart: 'bg-red-50 text-red-600',
  glucose: 'bg-blue-50 text-blue-600',
  haemoglobin: 'bg-amber-50 text-amber-700',
  immunity: 'bg-teal-50 text-teal-700',
} as const;

/**
 * Stats Card Color Schemes
 * 
 * Icon background colors for statistics cards.
 */
export const statsCardColors = {
  teal: 'bg-teal-50 text-teal-600',
  blue: 'bg-cyan-50 text-cyan-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
} as const;

/**
 * Design System Rules
 * 
 * Core principles of the flat minimal design system:
 * 
 * 1. Solid Colors: Use solid backgrounds instead of transparency/blur
 * 2. Minimal Borders: Use 0.5px borders for subtle separation
 * 3. No Shadows: Remove all shadow effects for flat appearance
 * 4. No Gradients: Use solid colors instead of gradients
 * 5. Consistent Radius: 8px for small elements, 12px for cards
 * 6. Clear Hierarchy: Use color contrast and spacing instead of shadows
 * 7. Accessibility: Maintain WCAG AA contrast ratios
 */
