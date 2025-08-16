# IKH Agency Site

A modern, internationalized agency website built with Next.js App Router, featuring SSR-safe theme persistence and comprehensive multi-language support.

## Stack

- **Next.js 15.4.5** with App Router
- **next-intl** for internationalization with SSR support
- **React 19** with modern hooks and features
- **CSS Variables** design system with light/dark themes
- **System fonts only** - no external dependencies
- **Custom middleware** for locale detection and routing

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

## Theme System

### SSR-Safe Cookie Strategy

Theme persistence uses cookies instead of localStorage for SSR compatibility:

- **Cookie**: `theme=light|dark` with 1-year expiration
- **SSR**: Theme read from cookie in `app/[locale]/layout.js`
- **HTML**: `data-theme` attribute set on `<html>` element
- **No Flash**: Theme applied before hydration, no FOUC

### Theme Toggle

Integrated theme toggle in Logo component:

- Updates `document.documentElement.dataset.theme`
- Sets cookie `theme=${newTheme}; path=/; max-age=31536000`
- Works consistently across locale switches
- Visual feedback with glowing bulb icon

### Design System Variables

All styling uses CSS custom properties from `styles/theme.css`:

```css
/* Core variables */
--bg, --bg-secondary, --surface-elevated
--border, --text, --primary, --on-primary
--shadow-sm, --shadow-md
--brand-orange, --white
```

**Rule**: Never use raw hex/rgb/hsl values - only CSS variables.

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

- Hover intent detection (24px movement threshold in 80ms)
- 120ms open delay, 200ms close delay
- Portal-based dropdown (no header height changes)
- Conditional rendering (null when closed)
- Integrated theme toggle
- i18n navigation links

### Language Switcher

**Location**: `components/header/LanguageSwitcher.js`

**Features**:

- Compact globe icon + current locale display
- Dropdown with all available locales
- Client-side navigation (preserves theme)
- Accessible with ARIA roles and keyboard navigation

### Contact Dropdown

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

## Project Structure

```
app/
├── layout.js              # Root layout (minimal)
├── [locale]/              # Locale-based routing
│   ├── layout.js          # Locale layout (theme + i18n)
│   └── page.js            # Home page

components/
├── header/                # Header components
│   ├── Header.js          # Main header
│   ├── Logo.js            # Logo + dropdown + theme toggle
│   ├── ContactDropdown.js # Contact form dropdown
│   └── LanguageSwitcher.js # Language selection
├── contact/
│   └── ContactForm.js     # Reusable contact form
├── Hero.js                # Hero section
├── About.js               # About section
├── Footer.js              # Footer with contacts
└── Gallery.js             # Gallery component

messages/                  # Translation files
├── en.json               # English
├── cs.json               # Czech
├── de.json               # German
└── ru.json               # Russian

styles/
└── theme.css             # Design system variables

middleware.ts             # Custom locale detection
i18n.ts                  # next-intl configuration
```

## Internationalization

### Translation Structure

Organized by namespace for scalability:

```json
{
  "header": { "contact": "...", "language": "..." },
  "nav": { "about": "...", "cases": "...", "contacts": "..." },
  "hero": { "title": "...", "subtitle": "...", "cta": "..." },
  "about": { "title": "...", "sites": { "title": "...", "text": "..." } },
  "contact": { "title": "...", "name": "...", "submit": "..." },
  "footer": { "contacts": "...", "copyright": "..." }
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

### Component Design

- Follow existing animation patterns
- Use portal for overlays to prevent layout shift
- Implement proper focus management
- Maintain consistent hover/interaction delays

### Code Quality

- ESLint enforces Next.js best practices
- Prettier ensures consistent formatting
- Remove console statements in production builds
- Use semantic HTML and ARIA attributes

## Deployment

The project builds to static pages for all locales:

- `/en`, `/cs`, `/de`, `/ru` routes pre-generated
- Middleware handles locale detection at edge
- Optimized bundle with shared chunks
- CSS variables ensure consistent theming

## Contributing

1. Follow existing code patterns and component structure
2. Test theme persistence across locale switches
3. Ensure all text is internationalized
4. Run `npm run lint` and `npm run format` before commits
5. Verify build success with `npm run build`
