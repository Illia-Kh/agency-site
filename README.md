This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Infrastructure

### Font System
This project uses **system fonts only** - no external font dependencies from Google Fonts or CDNs. Font families are defined in `app/globals.css` with system font stacks:
- **Sans-serif**: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, etc.
- **Monospace**: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, etc.

### Theme System
The project uses a **single source of truth** for theming via `<html data-theme>`:
- **No-FOUC initialization**: Theme is set before hydration in `app/layout.js` 
- **Theme toggle**: Integrated into Logo component (`components/header/Logo.js`)
- **CSS Variables**: All styling uses CSS custom properties defined in `styles/theme.css`
- **Supports**: Light/dark modes with system preference detection

### Tailwind CSS
- **Content paths**: Configured to scan `./app/**/*`, `./components/**/*`, `./styles/**/*`
- **CSS Variables**: Supports arbitrary values like `bg-[var(--primary)]` 
- **Import order**: Tailwind → custom styles via `app/globals.css` → `styles/theme.css`

### Line Endings
- **Normalized**: `.gitattributes` enforces LF line endings across all files
- **Prettier**: Configured with `endOfLine: "auto"` for cross-platform compatibility

## Code Quality & Development

This project includes automated code quality checks and CI/CD pipeline:

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check Prettier formatting

### Code Quality Tools

- **ESLint**: Configured with Next.js recommended rules + custom strict rules
- **Prettier**: Enforces consistent code formatting
- **GitHub Actions**: Automated CI pipeline that runs on PRs and main branch

### CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on **Node 18 & 20** for PRs and main branch pushes:

1. **Install**: `npm ci` - Clean dependency installation
2. **Lint**: `npm run lint` - ESLint code quality checks
3. **Format**: `npm run format:check` - Prettier formatting verification  
4. **Build**: `npm run build` - Production build validation
5. **Artifacts**: Uploads build files (.next) for Node 20.x runs

The pipeline ensures code quality, formatting consistency, and build stability.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
