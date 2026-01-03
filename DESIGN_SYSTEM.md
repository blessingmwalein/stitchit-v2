# 🎨 Stitchit ERP v2 - Design System & Color Palette

## Color Palette

### Primary Colors

#### Background Colors
```css
/* Light Mode */
--background: oklch(0.99 0.01 85)    /* #FFFBF5 - Warm Cream */
--card: oklch(1 0 0)                 /* #FFFFFF - Pure White */
--foreground: oklch(0.25 0 0)        /* #1A1A1A - Dark Charcoal */

/* Dark Mode */
--background: oklch(0.15 0 0)        /* #0A0A0A - Very Dark */
--card: oklch(0.18 0 0)              /* #1F1F1F - Dark Card */
--foreground: oklch(0.98 0 0)        /* #F5F5F5 - Off White */
```

#### Accent & Interactive Colors
```css
/* Light Mode */
--primary: oklch(0.35 0.02 85)       /* #2D2D2D - Dark Charcoal (Buttons) */
--accent: oklch(0.82 0.10 85)        /* #F5C563 - Warm Gold */
--secondary: oklch(0.97 0.005 85)    /* #F9F8F6 - Light Cream */

/* Dark Mode */
--primary: oklch(0.82 0.10 85)       /* #F5C563 - Gold */
--accent: oklch(0.75 0.12 85)        /* #E0B050 - Darker Gold */
```

#### Semantic Colors
```css
--muted: oklch(0.96 0.008 85)        /* #F8F6F3 - Muted Cream */
--muted-foreground: oklch(0.55 0 0)  /* #737373 - Medium Gray */
--border: oklch(0.93 0.005 85)       /* #E8E5E0 - Soft Border */
--destructive: oklch(0.577 0.245 27) /* #DC2626 - Red */
```

---

## Usage Guide

### When to Use Each Color

#### Warm Cream (#FFFBF5)
- ✅ Page backgrounds
- ✅ Section backgrounds
- ✅ Empty states
- ❌ Text (low contrast)

#### Pure White (#FFFFFF)
- ✅ Card backgrounds
- ✅ Modal backgrounds
- ✅ Input backgrounds
- ✅ Dropdown menus
- ❌ Large areas (can be harsh)

#### Dark Charcoal (#1A1A1A / #2D2D2D)
- ✅ Primary buttons
- ✅ Headlines (font-semibold+)
- ✅ Important text
- ✅ Navigation active states
- ❌ Body text in large blocks

#### Warm Gold (#F5C563)
- ✅ Hover states
- ✅ Active indicators
- ✅ Progress bars
- ✅ Highlights
- ✅ Call-to-action accents
- ❌ Primary text (readability)

#### Light Cream (#F9F8F6)
- ✅ Secondary buttons
- ✅ Hover backgrounds
- ✅ Disabled states
- ✅ Subtle section dividers
- ✅ Card alternating rows

#### Medium Gray (#737373)
- ✅ Secondary text
- ✅ Descriptions
- ✅ Placeholders
- ✅ Subtle labels
- ❌ Important information

---

## Chart Colors

### Data Visualization Palette
```css
--chart-1: oklch(0.82 0.10 85)    /* #F5C563 - Warm Gold */
--chart-2: oklch(0.35 0.02 85)    /* #2D2D2D - Dark Charcoal */
--chart-3: oklch(0.65 0.12 160)   /* #4ECDC4 - Teal Green */
--chart-4: oklch(0.75 0.15 65)    /* #FF9B71 - Warm Orange */
--chart-5: oklch(0.70 0.08 50)    /* #FF6B6B - Coral */
```

### Usage in Charts
- **chart-1 (Gold)**: Primary data series, highlights
- **chart-2 (Dark)**: Secondary data, comparisons
- **chart-3 (Teal)**: Positive trends, success metrics
- **chart-4 (Orange)**: Neutral data, ongoing activities
- **chart-5 (Coral)**: Warnings, attention needed

---

## Functional Colors

### Status Colors
```css
/* Success */
bg-green-50    /* Light: #F0FDF4 */
text-green-600 /* Dark: #16A34A */
text-green-700 /* Darker: #15803D */

/* Warning */
bg-amber-50    /* Light: #FFFBEB */
text-amber-600 /* Dark: #D97706 */
text-amber-700 /* Darker: #B45309 */

/* Error */
bg-red-50      /* Light: #FEF2F2 */
text-red-600   /* Dark: #DC2626 */
text-red-700   /* Darker: #B91C1C */

/* Info */
bg-blue-50     /* Light: #EFF6FF */
text-blue-600  /* Dark: #2563EB */
text-blue-700  /* Darker: #1D4ED8 */
```

### Icon Background Colors
```css
/* Blue - Clients, Users */
bg-blue-50     /* #EFF6FF */
text-blue-600  /* #2563EB */

/* Green - Orders, Success */
bg-green-50    /* #F0FDF4 */
text-green-600 /* #16A34A */

/* Purple - Inventory, Storage */
bg-purple-50   /* #FAF5FF */
text-purple-600/* #9333EA */

/* Orange - Production, Activity */
bg-accent/10   /* Gold tint */
text-accent    /* #F5C563 */

/* Red - Alerts, Warnings */
bg-red-50      /* #FEF2F2 */
text-red-600   /* #DC2626 */
```

---

## Typography Scale

### Font Families
```css
font-sans: 'Inter', system-ui, sans-serif
```

### Font Sizes
```css
text-xs    /* 0.75rem - 12px */  → Badges, small labels
text-sm    /* 0.875rem - 14px */ → Body text, descriptions
text-base  /* 1rem - 16px */     → Default body text
text-lg    /* 1.125rem - 18px */ → Section headers
text-xl    /* 1.25rem - 20px */  → Card titles
text-2xl   /* 1.5rem - 24px */   → Page titles
text-3xl   /* 1.875rem - 30px */ → Hero headlines
text-4xl   /* 2.25rem - 36px */  → Stat numbers
```

### Font Weights
```css
font-normal   /* 400 */ → Body text
font-medium   /* 500 */ → Labels, emphasized text
font-semibold /* 600 */ → Headings, buttons
font-bold     /* 700 */ → Large numbers, important headlines
```

---

## Spacing Scale

### Gap & Padding
```css
gap-2  / p-2   /* 0.5rem - 8px */   → Tight spacing
gap-3  / p-3   /* 0.75rem - 12px */ → Compact spacing
gap-4  / p-4   /* 1rem - 16px */    → Default spacing
gap-5  / p-5   /* 1.25rem - 20px */ → Comfortable spacing
gap-6  / p-6   /* 1.5rem - 24px */  → Card padding
gap-8  / p-8   /* 2rem - 32px */    → Section padding
```

### Margin
```css
mt-2  /* 0.5rem - 8px */   → Small vertical rhythm
mt-4  /* 1rem - 16px */    → Default vertical rhythm
mt-6  /* 1.5rem - 24px */  → Section separation
```

---

## Border Radius Scale

### Rounded Corners
```css
rounded-lg   /* 0.5rem - 8px */   → Inputs, small components
rounded-xl   /* 0.75rem - 12px */ → Buttons, medium cards
rounded-2xl  /* 1rem - 16px */    → Large cards, containers
rounded-full /* 9999px */         → Pills, circular elements
```

### Usage
- **rounded-lg**: Inputs, tags, small cards
- **rounded-xl**: Buttons, navigation items, medium cards
- **rounded-2xl**: Page cards, modal dialogs, sections
- **rounded-full**: Avatar placeholders, status indicators

---

## Shadow Scale

### Elevation
```css
shadow-sm  /* Small shadow */  → Cards at rest, inputs
shadow-md  /* Medium shadow */ → Cards on hover, dropdowns
shadow-lg  /* Large shadow */  → Modals, important pop-ups
```

### Usage
```css
/* Default state */
.card {
  @apply shadow-sm;
}

/* Hover state */
.card:hover {
  @apply shadow-md;
}

/* Active/Modal */
.modal {
  @apply shadow-lg;
}
```

---

## Component Patterns

### Card Pattern
```tsx
<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
  {/* Card content */}
</div>
```

### Button Pattern
```tsx
<button className="h-10 rounded-xl bg-foreground px-5 text-sm font-semibold text-white hover:bg-foreground/90">
  Button Text
</button>
```

### Input Pattern
```tsx
<input className="h-10 rounded-lg border border-input bg-background px-3.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
```

### Stat Card Pattern
```tsx
<div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md">
  <div className="flex items-start justify-between">
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Label</p>
      <p className="text-4xl font-bold tracking-tight text-foreground">123</p>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="rounded-md bg-green-50 px-2 py-0.5 font-semibold text-green-700">+12%</span>
      </div>
    </div>
    <div className="rounded-xl bg-blue-50 p-3">
      {/* Icon */}
    </div>
  </div>
</div>
```

---

## Accessibility

### Color Contrast Ratios

✅ **AAA Compliant (7:1+)**
- Dark Charcoal on Warm Cream: 15.2:1
- Dark Charcoal on White: 16.5:1

✅ **AA Compliant (4.5:1+)**
- Medium Gray on White: 4.7:1
- Medium Gray on Warm Cream: 4.5:1

⚠️ **Use with caution**
- Gold on White: 2.8:1 (decorative only)
- Gold on Dark: 8.5:1 (okay for text)

### Focus States
All interactive elements must have visible focus indicators:
```css
focus:ring-2 focus:ring-accent/20 focus:border-accent
```

---

## Dark Mode Considerations

### Color Adjustments
1. **Backgrounds**: Much darker (oklch 0.15)
2. **Text**: Off-white, not pure white (reduces eye strain)
3. **Borders**: Subtle, low contrast
4. **Accents**: Slightly darker gold for better visibility

### Testing
- Verify all colors in both modes
- Check text readability
- Ensure borders are visible
- Test interactive states

---

## Export for Designers

### Figma/Sketch Colors
```
Background (Light): #FFFBF5
Card (Light): #FFFFFF
Foreground (Light): #1A1A1A
Accent: #F5C563
Border: #E8E5E0
Muted: #F8F6F3
Text Secondary: #737373

Background (Dark): #0A0A0A
Card (Dark): #1F1F1F
Foreground (Dark): #F5F5F5
```

### CSS Variables (Copy-Paste Ready)
```css
:root {
  --color-background: #FFFBF5;
  --color-card: #FFFFFF;
  --color-text: #1A1A1A;
  --color-accent: #F5C563;
  --color-border: #E8E5E0;
  --color-muted: #F8F6F3;
  --color-text-secondary: #737373;
}
```

---

## Quick Reference

### Most Common Combinations

**Primary Button**
```
bg-foreground text-white hover:bg-foreground/90
```

**Secondary Button**
```
bg-secondary text-foreground hover:bg-secondary/80
```

**Outline Button**
```
border-2 border-border hover:border-accent hover:bg-accent/10
```

**Success Badge**
```
bg-green-50 text-green-700 px-2 py-0.5 rounded-md
```

**Stat Card**
```
rounded-2xl border border-border bg-card p-6 shadow-sm
```

**Input Field**
```
h-10 rounded-lg border border-input bg-background px-3.5
```

---

## Notes

- All colors use oklch color space for better perceptual uniformity
- Warm tones create a professional, inviting atmosphere
- High contrast ensures accessibility
- Consistent spacing creates visual rhythm
- Modern rounded corners feel contemporary
- Subtle shadows add depth without distraction

---

**Last Updated**: January 3, 2026  
**Version**: 2.0.0  
**Design System**: Modern SaaS Dashboard
