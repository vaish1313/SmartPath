# Flat Minimal Design System

This document describes the flat minimal design system for the SmartPath patient dashboard.

## Overview

The design system replaces the previous glassmorphism aesthetic with a clean, flat design using:
- Solid colors instead of transparency and blur
- Subtle 0.5px borders for separation
- No shadows or gradients
- Consistent border radius (8px for small elements, 12px for cards)

## Usage

### Importing Constants

```typescript
import { colors, spacing, tailwindClasses } from '@/lib/constants';
import { getStatusClasses, cn } from '@/lib/utils';
```

### Color Palette

#### Primary Colors
```typescript
colors.primary // '#1D9E75' - Teal
```

#### Backgrounds
```typescript
colors.background.page        // '#F5F5F3' - Light gray page background
colors.background.card        // '#FFFFFF' - White card background
colors.background.darkAccent  // '#0F6E56' - Dark teal accent
```

#### Borders
```typescript
colors.border.default  // '#E5E5E5' - Default border
colors.border.light    // '#F3F4F6' - Light border
```

#### Text
```typescript
colors.text.primary    // '#1E293B' - Primary text (Slate 800)
colors.text.secondary  // '#64748B' - Secondary text (Slate 500)
colors.text.tertiary   // '#94A3B8' - Tertiary text (Slate 400)
```

#### Status Colors
```typescript
colors.status.teal   // '#1D9E75' - Active/Primary
colors.status.blue   // '#3B82F6' - Information
colors.status.amber  // '#F59E0B' - Warning/Pending
colors.status.red    // '#EF4444' - Error/Cancelled
```

### Spacing & Sizing

```typescript
spacing.borderWidth              // '0.5px'
spacing.borderRadius.small       // '8px'
spacing.borderRadius.card        // '12px'
spacing.sidebar.width            // '220px'
```

### Tailwind Classes

#### Card Styling
```typescript
// Base card
<div className={tailwindClasses.card.base}>
  {/* bg-white border border-gray-200 rounded-xl */}
</div>

// Card with hover effect
<div className={tailwindClasses.card.hover}>
  {/* bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors */}
</div>
```

#### Borders
```typescript
// Default border
<div className={tailwindClasses.border.default}>
  {/* border border-gray-200 */}
</div>

// Light separator
<div className={tailwindClasses.border.light}>
  {/* border-b border-gray-100 */}
</div>
```

#### Border Radius
```typescript
// Small elements (buttons, badges)
<button className={tailwindClasses.rounded.small}>
  {/* rounded-lg (8px) */}
</button>

// Cards
<div className={tailwindClasses.rounded.card}>
  {/* rounded-xl (12px) */}
</div>
```

#### Backgrounds
```typescript
// Page background
<main className={tailwindClasses.background.page}>
  {/* bg-[#F5F5F3] */}
</main>

// Card background
<div className={tailwindClasses.background.card}>
  {/* bg-white */}
</div>
```

### Utility Functions

#### Status Badge Classes
```typescript
import { getStatusClasses } from '@/lib/utils';

const booking = { status: 'completed' };
<span className={getStatusClasses(booking.status)}>
  {/* bg-teal-50 text-teal-700 border-teal-200 */}
</span>
```

Available statuses:
- `completed` - Teal
- `processing` - Amber
- `pending` - Slate
- `confirmed` - Blue
- `cancelled` - Red
- `sample-collected` - Purple

#### Health Metric Classes
```typescript
import { getHealthMetricClasses } from '@/lib/utils';

<div className={getHealthMetricClasses('heart')}>
  {/* bg-red-50 text-red-600 */}
</div>
```

Available metrics:
- `heart` - Red
- `glucose` - Blue
- `haemoglobin` - Amber
- `immunity` - Teal

#### Stats Card Classes
```typescript
import { getStatsCardClasses } from '@/lib/utils';

<div className={getStatsCardClasses('teal')}>
  {/* bg-teal-50 text-teal-600 */}
</div>
```

Available colors:
- `teal` - Teal
- `blue` - Cyan
- `amber` - Amber
- `violet` - Violet

#### Class Name Utility
```typescript
import { cn } from '@/lib/utils';

const isActive = true;
<div className={cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)}>
  {/* Combines classes, filters out falsy values */}
</div>
```

## Tailwind Config Extensions

The design system extends Tailwind with custom utilities:

### Custom Colors
```css
bg-flat-primary      /* #1D9E75 */
bg-flat-page-bg      /* #F5F5F3 */
bg-flat-dark-accent  /* #0F6E56 */
```

### Custom Border Width
```css
border-flat  /* 0.5px */
```

### Custom Border Radius
```css
rounded-flat-sm    /* 8px */
rounded-flat-card  /* 12px */
```

### Custom Spacing
```css
w-sidebar  /* 220px */
```

## Design Principles

### 1. Solid Colors
Replace all transparent/blurred backgrounds with solid colors:
```typescript
// ❌ Old (glassmorphism)
className="bg-white/60 backdrop-blur-xl"

// ✅ New (flat)
className="bg-white"
```

### 2. Minimal Borders
Use thin 0.5px borders for subtle separation:
```typescript
className="border border-gray-200"
```

### 3. No Shadows
Remove all shadow effects:
```typescript
// ❌ Old
className="shadow-lg hover:shadow-xl"

// ✅ New
className="hover:border-gray-300 transition-colors"
```

### 4. No Gradients
Use solid colors instead of gradients:
```typescript
// ❌ Old
className="bg-gradient-to-t from-teal-500 to-cyan-400"

// ✅ New
className="bg-teal-500"
```

### 5. Consistent Radius
- Small elements: 8px (`rounded-lg`)
- Cards: 12px (`rounded-xl`)

### 6. Clear Hierarchy
Use color contrast and spacing instead of shadows for visual hierarchy.

### 7. Accessibility
All color combinations maintain WCAG AA contrast ratios:
- Primary text on white: 12.6:1 (AAA)
- Secondary text on white: 5.7:1 (AA)
- Teal on white: 3.2:1 (suitable for large text/icons)

## Migration Guide

### Replacing Glassmorphism Classes

| Old (Glassmorphism) | New (Flat) |
|---------------------|------------|
| `bg-white/60 backdrop-blur-xl` | `bg-white` |
| `border-white/40` | `border-gray-200` |
| `shadow-lg` | (remove) |
| `shadow-xl` | (remove) |
| `bg-gradient-to-t from-teal-500 to-cyan-400` | `bg-teal-500` |
| Glow orb divs | (remove entirely) |

### Hover States
```typescript
// ❌ Old
className="hover:shadow-xl hover:bg-white/70"

// ✅ New
className="hover:border-gray-300 transition-colors"
```

## Examples

### Card Component
```typescript
<div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
  <h3 className="text-slate-800 font-bold">Card Title</h3>
  <p className="text-slate-500 text-sm">Card content</p>
</div>
```

### Status Badge
```typescript
import { getStatusClasses } from '@/lib/utils';

<span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusClasses(status)}`}>
  {status}
</span>
```

### Health Metric Card
```typescript
import { getHealthMetricClasses } from '@/lib/utils';

<div className={`rounded-xl p-4 ${getHealthMetricClasses('heart')}`}>
  <Heart className="w-4 h-4" />
  <p className="text-2xl font-bold">72 <span className="text-sm">bpm</span></p>
</div>
```

### Stats Card
```typescript
import { getStatsCardClasses } from '@/lib/utils';

<div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
  <div className="flex items-center justify-between mb-3">
    <span className="text-slate-500 text-xs font-semibold">Total Bookings</span>
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${getStatsCardClasses('teal')}`}>
      <Icon className="w-4 h-4" />
    </div>
  </div>
  <p className="text-2xl font-bold text-slate-800">12</p>
</div>
```
