# V0 Project Guidelines

## PROJECT FOUNDATION

**Tech Stack & Versions:**
- Next.js 14.2.25 (App Router)
- React 18.3.1
- TypeScript 5.7.3
- Tailwind CSS 3.4.17
- Custom font: AA00BusinessSystem (TTF in /public/fonts)

**Key Dependencies:**
- Radix UI (all components via @radix-ui/*)
- react-hook-form + @hookform/resolvers
- recharts for data visualization / charts
- next-themes for dark mode
- lucide-react for icons
- sonner for toast notifications

## DESIGN SYSTEM

**Colors:**
- Brutalist aesthetic: Pure black (#000) & white (#FFF) with 2px borders
- Dark mode support via next-themes
- Minimal accent colors (avoid purple/violet)
- Design tokens in CSS variables

**Typography:**
- Headings: font-helvetica (Helvetica)
- Body: font-business (AA00BusinessSystem custom font)
- Line-height: 1.4-1.6 for body text (use leading-relaxed or leading-6)

**Layout:**
- Mobile-first approach
- Flexbox for most layouts (Tailwind flex classes)
- No floats or absolute positioning unless unavoidable
- Semantic HTML: use main, header, nav elements

**Key Constraints:**
- Max 3-5 colors total
- Max 2 font families
- Hidden scrollbars with .scrollbar-hide class
- No arbitrary Tailwind values - use spacing scale (p-4, gap-6, etc.)

## ARCHITECTURE PATTERNS

**State Management:**
- URL params for filter/view state where applicable
- React Context for global state (theme, user, etc.)
- React hooks for local component state

**Component Structure:**
- Split into multiple components (never large single pages)
- Reusable UI components in /components/ui
- Use shadcn/ui patterns for composable components
- Semantic components with ARIA attributes

**Performance:**
- Image optimization with Next.js Image component
- Lazy load routes and components
- Memoize heavy computations with useMemo
- Split code into multiple components to avoid re-renders

## SECURITY & BEST PRACTICES

**Environment Variables:**
- NEXT_PUBLIC_* for client-side vars only
- Secret vars server-only (API keys, tokens)
- Use Vercel environment variables page, not .env files

**Data Persistence:**
- Use Supabase for data storage and authentication
- Implement Row Level Security for data access control

## DEPLOYMENT

- Deploy to Vercel (native Next.js support)
- Connect GitHub repo for auto-deployments
- Set environment variables in Vercel project settings
