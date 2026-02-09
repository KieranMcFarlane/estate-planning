# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pathway Estate Planning is a Next.js 16 website built with React 19 and TypeScript. It's a marketing/informational site for an estate planning service in Royal Leamington Spa, UK, offering services like wills, trusts, LPAs, inheritance tax planning, and more.

**Tech Stack**: Next.js 16, React 19, TypeScript, CSS Modules, no external component libraries or state management.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### App Router Structure (Next.js 16)

This project uses the Next.js App Router with the `src/app` directory structure:

- **Main page**: `src/app/page.tsx` - Landing page composed of multiple sections
- **Route pages**: Each service has its own route directory (e.g., `/wills`, `/trusts`, `/lpa`, `/estate-planning`)
- **Shared components**: `src/app/components/` contains reusable UI components

### Page Composition Pattern

The homepage (`src/app/page.tsx`) follows a composable architecture where the page is built from multiple section components:
- `Navbar` - Navigation with desktop/mobile responsive CTA
- `Hero` - Main hero section
- `TrustBadges` - Credibility indicators
- `ServiceCards` - Service overview cards
- `AboutUs`, `WhyChooseUs`, `Testimonials` - Trust-building sections
- `HowItWorks`, `PhoneCallAway` - Process explanation
- `Services`, `ExtendedSupport` - Detailed service information
- `Consultation`, `FinalCTA` - Conversion sections
- `Footer` - Site footer

### Route Page Pattern

Service pages (e.g., `/wills`, `/trusts`) follow a consistent pattern:
```tsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// ... other imports

export default function ServicePage() {
    return (
        <>
            <Navbar />
            <main>
                {/* Page content */}
            </main>
            <Footer />
        </>
    );
}
```

Each route page includes its own `page.module.css` for scoped styling.

### Component Architecture

**Component Structure** (`src/app/components/`):
- `base/` - Foundational UI components (Button, Card, Badge, Icon)
  - **Button** - Enhanced button with variants (`primary`, `secondary`, `outline`, `ghost`) and sizes (`sm`, `md`, `lg`), supports `href` (Link) and `onClick` (button)
  - **Card** - Card container component
  - **Badge** - Badge component with variants (`default`, `primary`, `success`, `warning`, `info`)
  - **Icon** - Icon wrapper component
- `layout/` - Layout primitives (Section, Grid)
  - **Section** - Section wrapper with variants (`default`, `alt`, `primary`, `dark`) and sizes
  - **Grid** - Grid layout component
- `sections/` - Composite section components (ProcessStep, FAQAccordion, TestimonialCard, CTASection, ServiceCard)
- **Root-level components** - Navbar, Footer, Hero, ServiceCards, AboutUs, WhyChooseUs, Testimonials, HowItWorks, PhoneCallAway, Services, ExtendedSupport, Consultation, FinalCTA

**Note**: There's an older `Button.tsx` at the root of components/ - prefer `src/app/components/base/Button.tsx` for new code.

All components use CSS Modules (`.module.css` files) for styling with the pattern `ComponentName.module.css`.

### Styling System

**CSS Custom Properties** (`src/app/globals.css`):

*Colors:*
- Primary: `--color-primary` (#2F6F6A - calm teal), with dark/light variants
- Secondary: `--color-secondary` (#C58B63 - warm clay/CTA color)
- Backgrounds: `--color-bg` (#F7F4EF), `--color-surface` (#FFFFFF), `--color-bg-alt` (#EEF2F0)
- Text: `--color-text` (#2B3A3A), `--color-text-muted` (#5F6F6F)
- Accents: `--color-accent` (#C9B27D), `--color-success` (#5C7A66), `--color-error` (#B85C5C)

*Legacy color aliases exist for compatibility:*
- `--primary-color`, `--cta-color`, `--text-main`, etc.

*Typography:*
- `--font-main` → DM Sans (via `next/font/google`)
- `--font-heading` → Instrument Serif (via `next/font/google`)
- Font sizes: `--text-xs` through `--text-4xl`

*Spacing:*
- `--spacing-xs` (0.5rem) through `--spacing-2xl` (6rem)

*Other:*
- Border radius: `--radius-sm` through `--radius-full`
- Shadows: `--shadow-sm` through `--shadow-xl`
- Container max-width: `--max-width` (1200px)
- Breakpoints: `--breakpoint-mobile` (768px), `--breakpoint-tablet` (1024px), `--breakpoint-desktop` (1280px)

**Utility Classes** (defined in `globals.css`):
- `.container` - Max-width container with horizontal padding
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost` - Base button styles
- `.section`, `.section-lg` - Vertical section spacing
- `.text-center`, `.text-left`, `.text-right` - Text alignment
- `.mb-*`, `.mt-*` - Margin utilities (xs, sm, md, lg, xl)
- `.sr-only` - Screen reader only content

**Component Styling**:
- Each component has its own `.module.css` file for component-specific styles
- Imports globals and adds component-specific classes
- Follows BEM-like naming: `.componentName`, `.componentName-element`

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Strict mode enabled
- Uses Next.js TypeScript plugin

### Key Design Principles

1. **Component Composition**: Pages are built by composing multiple section components
2. **CSS Modules**: Component-scoped styling with shared global utilities
3. **Responsive Design**: Mobile-first approach with responsive breakpoints (768px, 1024px, 1280px)
4. **No State Management**: This is a static marketing site with no client-side state, API routes, or external data fetching
5. **TypeScript**: All components use TypeScript with exported interfaces for props
6. **Typography Hierarchy**: Use Instrument Serif for headings, DM Sans for body text
7. **Color System**: Prefer CSS custom properties over hardcoded values for maintainability

### Adding New Content

**New Service Page**:
1. Create directory: `src/app/service-name/`
2. Add `page.tsx` following the route page pattern (import `Navbar`, `Footer`, use `Button` from base components)
3. Add `page.module.css` for page-specific styles
4. Wrap content in `<main className={styles.main}>` with `.container` inside

**New Homepage Section**:
1. Create component in `src/app/components/ComponentName.tsx` (or `sections/` if it's a composite section)
2. Create `ComponentName.module.css` for styling
3. Import and add to `src/app/page.tsx`
4. Follow existing component patterns for consistency

**New Base/Layout Component**:
1. Add to appropriate subdirectory (`base/` for UI primitives, `layout/` for layout components)
2. Export TypeScript interfaces for props
3. Follow naming convention: `ComponentName.tsx` and `ComponentName.module.css`
4. Use CSS Modules and utility classes from `globals.css`

### Content Notes

- Phone number: 07902 863999 (appears in Navbar and other components)
- Brand name: "Pathway Estate Planning"
- Tagline: "Estate planning made simple with calm, step-by-step support"
- Location: Royal Leamington Spa
- Tone: Warm, calm, trustworthy, professional but approachable
