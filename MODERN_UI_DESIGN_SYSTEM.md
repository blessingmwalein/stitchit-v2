i meen i want you to wrap images on p[ages with cards liie th# Modern UI Design System - Stitchit Rug ERP

## Design Philosophy

A premium, soft, glassmorphic interface for a modern ERP system. Clean, confident, and calm—never flashy.

---

## Visual Style

### Core Aesthetic
- **Glassmorphism**: Soft, translucent cards with subtle blur effects
- **Rounded Corners**: 16–24px border radius throughout
- **Soft Shadows**: Low opacity, no harsh borders
- **Warm Neutrals**: Cream, soft yellow, light grey backgrounds
- **Airy Spacing**: Generous padding and margins for premium feel

### Mood
- Calm and minimal
- Professional yet friendly
- Modern SaaS quality
- Touchable, interactive elements

---

## Typography

### Font Stack
```
font-family: 'Inter', 'SF Pro Display', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif
```

### Weights
- **Regular**: 400 (body text)
- **Medium**: 500 (labels, secondary headings)
- **Semibold**: 600 (primary headings, emphasis)
- **Bold**: 700 (reserved for numbers/metrics only)

### Scale
- **Hero Numbers**: 2.5rem–3rem (40–48px), weight 700
- **H1**: 1.875rem (30px), weight 600
- **H2**: 1.5rem (24px), weight 600
- **H3**: 1.25rem (20px), weight 600
- **Body**: 0.875rem–1rem (14–16px), weight 400
- **Small**: 0.75rem–0.875rem (12–14px), weight 400

### Rendering
- Soft anti-aliasing
- Slightly increased letter-spacing on headings (0.01em)
- Line height: 1.5 for body, 1.2 for headings

---

## Color System

### Primary Palette
```css
--color-charcoal: #2A2A2E          /* Primary text, headers */
--color-charcoal-light: #4A4A52    /* Secondary text */
--color-charcoal-soft: #6A6A72     /* Tertiary text, labels */
```

### Accent Colors
```css
--color-accent-yellow: #F5C563     /* Primary accent, highlights */
--color-accent-yellow-soft: #F9E5B8 /* Hover, secondary accent */
--color-accent-yellow-bg: #FFF9EC  /* Background tints */
```

### Background System
```css
--color-bg-primary: #FDFDFC        /* Main background */
--color-bg-secondary: #F9F9F7      /* Secondary background */
--color-bg-tertiary: #F4F4F1       /* Tertiary background */
--color-bg-gradient: linear-gradient(135deg, #FDFDFC 0%, #F9F8F5 100%)
```

### Surface Colors (Cards)
```css
--color-surface: #FFFFFF           /* Card background */
--color-surface-hover: #FEFEFE     /* Card hover state */
--color-surface-border: rgba(42, 42, 46, 0.08) /* Subtle borders */
```

### Semantic Colors (Soft Variants)
```css
--color-success: #7FBB92           /* Completed, approved */
--color-success-bg: #F0F9F3        /* Success background */

--color-warning: #F5C563           /* Pending, in-progress */
--color-warning-bg: #FFF9EC        /* Warning background */

--color-error: #E89B9B             /* Error, cancelled */
--color-error-bg: #FEF4F4          /* Error background */

--color-info: #8BB9D4              /* Info, drafts */
--color-info-bg: #F0F7FB           /* Info background */
```

### Status Colors
```css
/* Production States */
--status-planned: #8BB9D4
--status-tufting: #F5C563
--status-finishing: #B8A8D4
--status-completed: #7FBB92

/* Order States */
--order-pending: #F5C563
--order-confirmed: #8BB9D4
--order-production: #B8A8D4
--order-completed: #7FBB92
--order-delivered: #A8C8A8
```

---

## Shadows & Elevation

### Shadow Scale
```css
/* Level 0 - Flat elements */
--shadow-none: none;

/* Level 1 - Subtle cards */
--shadow-sm: 0 1px 3px rgba(42, 42, 46, 0.04),
             0 1px 2px rgba(42, 42, 46, 0.06);

/* Level 2 - Standard cards */
--shadow-md: 0 4px 6px rgba(42, 42, 46, 0.04),
             0 2px 4px rgba(42, 42, 46, 0.06);

/* Level 3 - Elevated cards, modals */
--shadow-lg: 0 10px 15px rgba(42, 42, 46, 0.06),
             0 4px 6px rgba(42, 42, 46, 0.08);

/* Level 4 - Floating elements, dropdowns */
--shadow-xl: 0 20px 25px rgba(42, 42, 46, 0.08),
             0 8px 10px rgba(42, 42, 46, 0.10);
```

### Glow Effects
```css
--glow-focus: 0 0 0 3px rgba(245, 197, 99, 0.15);
--glow-hover: 0 0 20px rgba(245, 197, 99, 0.10);
```

---

## Spacing System

### Base Unit: 4px

```css
--space-1: 0.25rem  /* 4px */
--space-2: 0.5rem   /* 8px */
--space-3: 0.75rem  /* 12px */
--space-4: 1rem     /* 16px */
--space-5: 1.25rem  /* 20px */
--space-6: 1.5rem   /* 24px */
--space-8: 2rem     /* 32px */
--space-10: 2.5rem  /* 40px */
--space-12: 3rem    /* 48px */
--space-16: 4rem    /* 64px */
--space-20: 5rem    /* 80px */
```

### Component Padding
- **Cards**: 24–32px (--space-6 to --space-8)
- **Buttons**: 12px 24px (--space-3 --space-6)
- **Inputs**: 12px 16px (--space-3 --space-4)
- **Page Container**: 32–48px (--space-8 to --space-12)

---

## Border Radius

```css
--radius-sm: 8px    /* Small elements, badges */
--radius-md: 12px   /* Buttons, inputs */
--radius-lg: 16px   /* Cards, containers */
--radius-xl: 20px   /* Large cards */
--radius-2xl: 24px  /* Hero cards, modals */
--radius-full: 9999px /* Pills, avatars */
```

---

## Components

### Cards

#### Standard Card
```
Background: var(--color-surface)
Border Radius: var(--radius-lg) to var(--radius-xl)
Shadow: var(--shadow-md)
Padding: var(--space-6) to var(--space-8)
Border: 1px solid var(--color-surface-border) (optional, very subtle)
```

#### Glass Card (Auth, Modals)
```
Background: rgba(255, 255, 255, 0.75)
Backdrop Filter: blur(12px)
Border Radius: var(--radius-2xl)
Shadow: var(--shadow-lg)
Border: 1px solid rgba(255, 255, 255, 0.3)
```

#### Metric Card
```
Background: var(--color-surface)
Border Radius: var(--radius-xl)
Padding: var(--space-6)
Shadow: var(--shadow-sm)
Hover: scale(1.01), shadow-md transition
```

### Buttons

#### Primary
```
Background: var(--color-charcoal)
Color: white
Border Radius: var(--radius-md)
Padding: 12px 24px
Shadow: var(--shadow-sm)
Hover: background lightens 10%, shadow-md
Font Weight: 500
```

#### Secondary
```
Background: var(--color-accent-yellow-bg)
Color: var(--color-charcoal)
Border: 1px solid var(--color-accent-yellow-soft)
Border Radius: var(--radius-md)
Padding: 12px 24px
Hover: background to accent-yellow-soft
Font Weight: 500
```

#### Ghost
```
Background: transparent
Color: var(--color-charcoal-light)
Border Radius: var(--radius-md)
Padding: 12px 24px
Hover: background var(--color-bg-tertiary)
Font Weight: 400
```

### Inputs

```
Background: var(--color-surface)
Border: 1.5px solid var(--color-surface-border)
Border Radius: var(--radius-md)
Padding: 12px 16px
Font Size: 14px
Transition: border-color, shadow 200ms

Focus:
  Border: var(--color-accent-yellow)
  Shadow: var(--glow-focus)

Placeholder:
  Color: var(--color-charcoal-soft)
  Opacity: 0.6
```

### Badges/Pills

```
Background: Semantic color -bg variant
Color: Semantic color (darker)
Border Radius: var(--radius-full)
Padding: 4px 12px (--space-1 --space-3)
Font Size: 12px
Font Weight: 500
```

### Progress Bars

```
Background: var(--color-bg-tertiary)
Height: 8px
Border Radius: var(--radius-full)

Fill:
  Background: var(--color-accent-yellow)
  Border Radius: var(--radius-full)
  Transition: width 300ms ease
```

### Navigation

#### Top Navigation (Pill Style)
```
Background: var(--color-surface)
Border Radius: var(--radius-full)
Padding: 4px
Shadow: var(--shadow-sm)

Items:
  Padding: 8px 16px
  Border Radius: var(--radius-full)
  Active: background var(--color-charcoal), color white
  Inactive: color var(--color-charcoal-light)
  Hover: background var(--color-bg-tertiary)
```

#### Sidebar Navigation
```
Background: var(--color-surface)
Border Right: 1px solid var(--color-surface-border)

Items:
  Padding: 12px 16px
  Border Radius: var(--radius-md)
  Margin: 4px 8px
  Active: background var(--color-accent-yellow-bg)
  Hover: background var(--color-bg-tertiary)
```

---

## Layout Rules

### Grid System
- Max content width: 1400px
- Gutter: 24px (--space-6)
- Card grid: 2–4 columns on desktop
- Always maintain visual breathing room

### Dashboard Layout
```
Header: 64px height, sticky
Sidebar: 280px width (if used)
Content: max-width 1400px, centered
Card Gap: 24px (--space-6)
Section Gap: 48px (--space-12)
```

### Responsive Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1400px
```

---

## Animations & Transitions

### Duration
```
Fast: 150ms (hover, active)
Medium: 250ms (modals, drawers)
Slow: 350ms (page transitions)
```

### Easing
```
Default: cubic-bezier(0.4, 0.0, 0.2, 1)
Bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
Smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

### Common Transitions
```css
transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
```

### Micro-interactions
- Scale on hover: `transform: scale(1.02)`
- Lift on hover: `transform: translateY(-2px)`
- Glow on focus: Add `--glow-focus` shadow

---

## Page Templates

### Auth Pages
- Centered glass card (max-width: 400px)
- Soft gradient background
- Logo at top (120px height)
- Rounded inputs
- Primary CTA button
- Footer with terms link

### Dashboard
- Welcome section with gradient background card
- 4-column metric cards grid
- Recent activity cards (2 columns)
- Visual charts with soft colors

### List Views
- Filter bar at top (glass card)
- Card-based items (not tables)
- Pagination pills at bottom
- Empty states with soft illustrations

### Detail Views
- Side drawer (400px width)
- Drawer background: var(--color-surface)
- Drawer shadow: var(--shadow-xl)
- Section dividers: subtle, 1px, low opacity

---

## Icons & Illustrations

- Use: Lucide React or Heroicons
- Size: 16–24px standard
- Color: Inherit from text color
- Stroke Width: 1.5–2
- Style: Rounded, friendly

---

## Do's and Don'ts

### DO
✓ Use soft, rounded corners everywhere
✓ Add subtle shadows for depth
✓ Maintain generous spacing
✓ Use warm neutral colors
✓ Keep interactions smooth and delightful
✓ Design for touch (48px minimum touch targets)
✓ Use visual hierarchy clearly

### DON'T
✗ Sharp corners or hard edges
✗ Dense tables without breathing room
✗ Aggressive, saturated colors
✗ Heavy borders (> 2px)
✗ Flashy animations
✗ Cluttered interfaces
✗ Small, cramped elements

---

## Implementation Priority

1. **Design Tokens** (CSS variables)
2. **Base Components** (Button, Input, Card)
3. **Auth Pages** (Login, Register)
4. **Dashboard** (Home overview)
5. **Production Jobs** (Card-based tracking)
6. **Client Orders** (Slab cards)
7. **Inventory** (Visual progress)
8. **Remaining modules**

---

This design system ensures a consistent, premium, and delightful user experience across the entire Stitchit Rug ERP system.
