/**
 * Utility Functions for Design System
 * 
 * Helper functions for working with the flat minimal design system.
 */

import { colors, statusStyles, healthMetricColors, statsCardColors } from './constants';

/**
 * Get status badge classes for a given status
 * 
 * @param status - The booking status
 * @returns Tailwind classes for the status badge
 */
export function getStatusClasses(status: string): string {
  return statusStyles[status] || statusStyles.pending;
}

/**
 * Get health metric color classes
 * 
 * @param metric - The health metric type
 * @returns Tailwind classes for the metric card
 */
export function getHealthMetricClasses(metric: keyof typeof healthMetricColors): string {
  return healthMetricColors[metric];
}

/**
 * Get stats card icon color classes
 * 
 * @param color - The color scheme name
 * @returns Tailwind classes for the icon background
 */
export function getStatsCardClasses(color: keyof typeof statsCardColors): string {
  return statsCardColors[color];
}

/**
 * Combine multiple class names, filtering out falsy values
 * 
 * @param classes - Array of class names or conditional classes
 * @returns Combined class string
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
