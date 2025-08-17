# IKH Agency Site

A modern, internationalized agency website built with Next.js App Router 15, featuring hydration-safe SSR, theme persistence across locale changes, and complete multi-language support.

## Stack (2025)

- **Next.js 15.4.5** with App Router for SSR/SSG optimization
- **next-intl 4.3** for type-safe internationalization with SSR support
- **React 19** with concurrent features and modern hooks
- **CSS Variables** design system with seamless light/dark theme transitions  
- **Portal-based dropdowns** preventing layout shifts and header jumping
- **Custom middleware** for intelligent locale detection and routing
- **Cookie-based theme persistence** preventing FOUC across navigation

## Locales

The site supports 4 locales with complete translation coverage:

- **EN** (English) - default locale
- **CS** (Čeština) - Czech
- **DE** (Deutsch) - German
- **RU** (Русский) - Russian

### Locale-prefixed Routing

All routes are prefixed with locale codes:

- `/en/` - English content
- `/cs/` - Czech content
- `/de/` - German content
- `/ru/` - Russian content

### Accept-Language Detection

Custom middleware automatically detects preferred language from:

1. Exact locale match (e.g., `cs` → `/cs/`)
2. Base language match (e.g., `cs-CZ` → `/cs/`)
3. Fallback to English (`en`) if no match

### Adding a New Locale

1. Create translation file: `messages/[locale].json`
2. Add locale to `i18n.ts` locales array
3. Add locale to `middleware.ts` locales array
4. Add locale to `app/[locale]/layout.js` locales array
5. Update `LanguageSwitcher.js` LANGUAGES array

## Theme System (2025)

### SSR-Safe Cookie Strategy

Theme persistence uses cookies with hydration-safe SSR rendering:

- **Cookie**: `theme=light|dark` with 1-year expiration (defaults to `dark`)
- **SSR**: Theme read from cookie in `app/[locale]/layout.js` and applied to `<html>`
- **HTML**: `data-theme` attribute set on `<html>` element before hydration
- **No Flash**: Theme applied server-side, preventing FOUC on any navigation
- **Locale Persistence**: Theme maintained across language switches

### Theme Toggle

Integrated theme toggle in Logo component with immediate feedback:

- Updates `document.documentElement.dataset.theme` instantly
- Sets persistent cookie `theme=${newTheme}; path=/; max-age=31536000`
- Works consistently across locale switches and page navigation
- Visual feedback with animated glowing bulb icon
- Accessible with proper ARIA labels

### Design System Variables

All styling uses CSS custom properties from `styles/theme.css` with automatic theme switching:

```css
/* Core color variables */
--bg, --bg-secondary, --surface-elevated
--border, --text, --primary, --primary-hover
--shadow-sm, --shadow-md, --focus
--brand-orange, --white
```

**2025 Rule**: Never use raw hex/rgb/hsl values - only CSS variables for consistent theming.

## Components

### Header

**Location**: `components/header/Header.js`

Sticky header with:

- Logo with dropdown navigation
- Contact dropdown
- Language switcher

### Logo with Dropdown

**Location**: `components/header/Logo.js`

**Features**:

- Hover intent detection (24px movement threshold in 80ms to prevent accidental opens)
- Smart delays: 120ms open delay, 200ms close delay for stable UX
- **Portal-based dropdown** to `document.body` with `position: fixed` (prevents header height changes)
- Conditional rendering (returns `null` when closed, not `visibility: hidden`)
- Integrated theme toggle with visual feedback and glow animation
- i18n navigation links with proper translations
- Accessible with ARIA roles and keyboard navigation

### Language Switcher

**Location**: `components/header/LanguageSwitcher.js`

**Features**:

- Compact globe icon + current locale display
- **Portal-based dropdown** with fixed positioning (no header jumping)
- URL-only navigation (preserves theme, no body/html class manipulation)
- Client-side routing with `router.replace()` to prevent history pollution
- Loading state with visual feedback during route change
- Accessible with ARIA roles and keyboard navigation

### Contact Dropdown

**Location**: `components/header/ContactDropdown.js`

**Features**:

- **Portal-based form dropdown** with fixed positioning
- Dynamic position calculation for proper alignment
- Focus trap implementation for accessibility
- Form integration with ContactForm component
- Outside click and Escape key handling
- Proper focus management (returns to button on close)

**Location**: `components/header/ContactDropdown.js`

Portal-based contact form dropdown with form validation and i18n support.

### Theme-Aware Components

All components follow the design system:

- CSS variables only (no raw colors)
- Light/dark theme compatibility
- Consistent animation patterns
- Focus management with `--focus` variable

## Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format with Prettier
npm run format:check # Check Prettier formatting
npm run type-check   # TypeScript validation
```

## Project Structure (2025)

```
app/
├── layout.js              # Root layout (minimal wrapper)
├── [locale]/              # Locale-based routing
│   ├── layout.js          # Locale layout (HTML/body + theme + i18n)
│   └── page.js            # Home page

components/
├── header/                # Header components with portal dropdowns
│   ├── Header.js          # Main header
│   ├── Logo.js            # Logo + dropdown + theme toggle
│   ├── ContactDropdown.js # Portal-based contact form dropdown
│   └── LanguageSwitcher.js # Portal-based language selection
├── contact/
│   └── ContactForm.js     # Reusable contact form
├── Hero.js                # Hero section
├── About.js               # About section  
├── Footer.js              # Footer with contacts
└── Gallery.js             # Gallery component

messages/                  # Complete translation files
├── en.json               # English (default)
├── cs.json               # Czech (Čeština)
├── de.json               # German (Deutsch)
└── ru.json               # Russian (Русский)

styles/
└── theme.css             # CSS variables design system

middleware.ts             # Custom locale detection with fallbacks
i18n.ts                  # next-intl configuration with validation
```

## Internationalization (2025)

### Translation Structure

Organized by logical namespaces with complete coverage:

```json
{
  "header": { "contact": "...", "language": "...", "agency": "..." },
  "nav": { "about": "...", "cases": "...", "contacts": "..." },
  "hero": { "title": "...", "subtitle": "...", "cta": "...", "features": {...} },
  "about": { "title": "...", "sites": {...}, "tracking": {...}, "traffic": {...}, "analytics": {...} },
  "contact": { "title": "...", "name": "...", "submit": "...", "validation": {...} },
  "footer": { "contacts": "...", "copyright": "...", "companyName": "...", "email": "...", "telegram": "..." },
  "gallery": { "title": "...", "ctaText": "...", "cases": {...}, "details": "..." }
}
```

### Usage in Components

```javascript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('namespace');
  return <h1>{t('key')}</h1>;
}
```

### Server Components

```javascript
import { getTranslations } from 'next-intl/server';

async function ServerComponent() {
  const t = await getTranslations('namespace');
  return <h1>{t('key')}</h1>;
}
```

## Development Guidelines

### Theme Consistency

- Always use CSS variables from `styles/theme.css`
- Test components in both light and dark themes
- Ensure proper contrast and accessibility

### Internationalization

- All user-facing text must use `useTranslations`
- Organize keys by logical namespaces
- Provide translations for all supported locales

### Component Design (2025)

- Follow existing animation patterns with consistent timing
- **Always use portals** for dropdowns/overlays to prevent layout shift  
- Implement proper focus management and keyboard navigation
- Maintain consistent hover/interaction delays (120ms open, 200ms close)
- Ensure conditional rendering (null when closed) for performance

### Code Quality

- ESLint enforces Next.js 15 and React 19 best practices
- Prettier ensures consistent formatting
- Remove console statements in production builds (dev warnings OK)
- Use semantic HTML and ARIA attributes for accessibility
- Test in both light and dark themes

## Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build with static generation
npm run build  

# Start production server
npm run start

# Lint with Next.js ESLint
npm run lint
npm run lint:fix

# Format with Prettier
npm run format
npm run format:check

# Type checking (if using TypeScript)
npm run type-check
```

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000/en (or /cs, /de, /ru)
```

The development server includes:
- Hot reload with Turbopack
- SSR theme persistence testing  
- i18n route generation for all locales
- Real-time translation error warnings (dev only)

## Deployment (2025)

The project builds to optimized static pages:

- **Static Generation**: `/en`, `/cs`, `/de`, `/ru` routes pre-generated at build time
- **Edge Middleware**: Handles locale detection with Accept-Language fallbacks
- **Bundle Optimization**: Shared chunks between locales, tree-shaking
- **Theme Consistency**: CSS variables ensure consistent theming across routes
- **No Hydration Issues**: SSR-safe theme application prevents FOUC

Build output example:
```
Route (app)                    Size  First Load JS
├── /en                       159 B    114 kB
├── /cs                       159 B    114 kB  
├── /de                       159 B    114 kB
└── /ru                       159 B    114 kB
Middleware                           44.4 kB
```

## Contributing (2025)

1. **Setup**: `npm install && npm run dev`
2. **Code Style**: Follow existing patterns, run `npm run lint:fix && npm run format`
3. **Theme Testing**: Test both light/dark themes across all locales
4. **i18n Coverage**: Ensure all text uses `useTranslations()` with proper namespaces
5. **Portal Usage**: Use portals for all dropdowns/overlays (prevents header jumping)
6. **Build Verification**: Run `npm run build` to verify static generation works
7. **Accessibility**: Test keyboard navigation and screen reader compatibility

### Key Rules

- Never use raw colors - only CSS variables
- All dropdowns must use portals with fixed positioning  
- Theme must persist across locale changes
- No hydration mismatches (avoid client-only logic in SSR components)
- Complete translation coverage for all 4 locales
