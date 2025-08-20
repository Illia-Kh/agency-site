# IKH Agency Site

A modern, multilingual agency website built with Next.js 15 (App Router), React 19, Tailwind CSS, and Framer Motion. Features an automated media pipeline for hero section content and complete internationalization support.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure (2025)

```
agency-site/
├── app/                      # Next.js App Router
│   └── [locale]/            # Internationalized routing
├── components/              # React components
│   ├── header/             # Header components (nav, language switcher)
│   ├── HeroMedia.js        # Auto-playing media gallery
│   └── ...
├── content/                # Content and data
│   └── heroMedia.json      # Auto-generated media manifest
├── messages/               # Internationalization files
│   ├── en.json             # English (Default)
│   ├── cs.json             # Czech (Čeština)
│   ├── de.json             # German (Deutsch)
│   └── ru.json             # Russian (Русский)
├── public/
│   └── media/
│       └── hero/
│           ├── _raw/       # Raw media files (input)
│           └── _out/       # Processed media (output)
├── scripts/
│   ├── media-build.ts      # Media pipeline automation
│   └── extract-translation-keys.js
├── styles/
│   └── theme.css           # CSS variables design system
├── middleware.ts           # Custom locale detection with fallbacks
└── i18n.ts                # next-intl configuration with validation
```

## 🎬 Hero Media Pipeline

### Overview

Automated media processing pipeline that converts raw video/image files into optimized 9:16 vertical format for the hero section gallery.

### Features

- **Automatic Processing**: Drop files in `_raw/` → script converts and organizes automatically
- **Video Support**: MP4 + WebM outputs with poster generation
- **Image Support**: WebP conversion with center crop
- **Smart Caching**: SHA1-based incremental processing
- **Slug Generation**: Automatic kebab-case naming with conflict resolution
- **Watch Mode**: Real-time processing during development

### Setup & Usage

#### 1. Add Media Files

Place your source files in `public/media/hero/_raw/`:

**Supported formats:**
- **Videos**: `.mp4`, `.mov`, `.mkv`, `.webm`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.webp`

#### 2. Process Media

```bash
# One-time processing
npm run media:build

# Watch mode (processes changes automatically)
npm run media:watch
```

#### 3. Automatic Output

The script automatically:
- Converts videos to 1080×1920 (9:16), 30fps, no audio
- Generates MP4 (H.264) + WebM (VP9) + WebP poster
- Converts images to 1080×1920 WebP with center crop
- Creates organized folders in `_out/`
- Updates `content/heroMedia.json`

### Media Processing Rules

#### Video Conversion
- **Target**: 1080×1920 (9:16 aspect ratio)
- **Frame Rate**: 30fps
- **Duration**: Max 8 seconds (longer videos are trimmed)
- **Audio**: Removed automatically
- **Outputs**: 
  - MP4: H.264, CRF 23, preset veryslow
  - WebM: VP9, CRF 32, row-mt enabled
  - Poster: First frame as WebP

#### Image Conversion
- **Target**: 1080×1920 (9:16 aspect ratio)  
- **Crop**: Center crop (object-cover behavior)
- **Output**: WebP, quality 85

#### Caching System
- **Cache File**: `public/media/hero/_out/_cache.json`
- **Tracking**: SHA1 hash, modification time, file size
- **Incremental**: Only processes changed/new files

### Generated Structure

```
public/media/hero/_out/
├── _cache.json
├── analytics-dashboard/
│   ├── analytics-dashboard.mp4
│   ├── analytics-dashboard.webm
│   └── analytics-dashboard.webp
└── landing-preview/
    └── landing-preview.webp
```

### JSON Manifest Format

`content/heroMedia.json` is auto-generated:

```json
[
  {
    "id": "analytics-dashboard",
    "type": "video",
    "mp4": "/media/hero/_out/analytics-dashboard/analytics-dashboard.mp4",
    "webm": "/media/hero/_out/analytics-dashboard/analytics-dashboard.webm", 
    "poster": "/media/hero/_out/analytics-dashboard/analytics-dashboard.webp",
    "duration": 8,
    "alt": "Analytics Dashboard"
  },
  {
    "id": "landing-preview", 
    "type": "image",
    "src": "/media/hero/_out/landing-preview/landing-preview.webp",
    "duration": 6,
    "alt": "Landing Preview"
  }
]
```

## 🌍 Internationalization (2025)

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

### Supported Locales

| Locale | Language | Status |
|--------|----------|--------|
| `en` | English | Default ✅ |
| `cs` | Czech (Čeština) | Complete ✅ |
| `de` | German (Deutsch) | Complete ✅ |
| `ru` | Russian (Русский) | Complete ✅ |

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

## 🎨 Theme System (2025)

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

CSS variables enable seamless theme transitions:

```css
:root[data-theme="light"] {
  --bg: #ffffff;
  --surface: #f8fafc;
  --border: #e2e8f0;
  --primary: #3b82f6;
}

:root[data-theme="dark"] {
  --bg: #0f172a;
  --surface: #1e293b;
  --border: #334155;
  --primary: #60a5fa;
}
```

## ⚡ Stack (2025)

- **Next.js 15.4.5** with App Router for SSR/SSG optimization
- **next-intl 4.3** for type-safe internationalization with SSR support
- **React 19** with concurrent features and modern hooks
- **CSS Variables** design system with seamless light/dark theme transitions
- **Portal-based dropdowns** preventing layout shifts and header jumping
- **Custom middleware** for intelligent locale detection and routing
- **Cookie-based theme persistence** preventing FOUC across navigation

## 🧩 Components

### HeroMediaCarousel

Auto-playing media gallery with:
- **Aspect Ratio**: 9:16 vertical format
- **Video Support**: MP4/WebM with autoplay and loop
- **Image Support**: WebP with lazy loading
- **Navigation**: Dot indicators with click support
- **Accessibility**: Pause on `prefers-reduced-motion`
- **Performance**: IntersectionObserver for viewport-based control
- **Responsive**: Max height constraints and proper scaling

### LanguageSwitcher

Portal-based dropdown with:
- **No Layout Shift**: Portal rendering prevents header jumping
- **Smooth Transitions**: Loading states and animation feedback
- **Keyboard Support**: Full accessibility with arrow navigation
- **Focus Management**: Proper focus restoration after selection

### Theme-Aware Components

All components follow the design system:

- CSS variables only (no raw colors)
- Light/dark theme compatibility
- Consistent animation patterns
- Focus management with `--focus` variable

## 🚀 Deployment (2025)

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

## 📋 Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build           # Production build
npm run start           # Start production server

# Code Quality
npm run lint            # ESLint check
npm run lint:fix        # ESLint auto-fix
npm run format          # Prettier format
npm run format:check    # Prettier check
npm run type-check      # TypeScript check

# Media Pipeline
npm run media:build     # Process all media files
npm run media:watch     # Watch and process changes

# Internationalization
npm run i18n:gen        # Generate translation key types
```

## 🔧 Configuration Files

- **next.config.mjs**: Next.js configuration
- **tailwind.config.js**: Tailwind CSS setup
- **tsconfig.json**: TypeScript configuration
- **i18n.ts**: Internationalization settings
- **middleware.ts**: Custom locale detection

## 📋 Requirements

- **Node.js**: 18+ 
- **FFmpeg**: Required for video processing
- **FFprobe**: Required for video duration detection

### Installing FFmpeg

```bash
# macOS (Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows (Chocolatey)
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

## 🚨 Important Notes

### Media Pipeline
- **Manual editing**: Never edit `content/heroMedia.json` manually - it's auto-generated
- **Cache**: Delete `public/media/hero/_out/_cache.json` to force re-processing
- **Performance**: Large video files will take time to process
- **Dependencies**: Requires FFmpeg and FFprobe in system PATH

### Development
- **Theme Testing**: Test both light/dark themes during development
- **Locale Testing**: Verify all locales render correctly
- **Media Testing**: Test with actual video/image files in pipeline

### Production
- **Static Generation**: All routes are pre-generated at build time
- **CDN Ready**: Optimized for deployment with CDN caching
- **Performance**: Bundle size optimized with shared chunks

---

Built with ❤️ using modern web technologies. For questions or contributions, please check the repository issues.