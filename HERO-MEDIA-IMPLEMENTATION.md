# HeroMedia Component Implementation

## ✅ Definition of Done Verification

### 🎯 Auto-Detection & File Management

- [x] **Auto-scanning**: Files automatically detected from `/public/hero-media/`
- [x] **Supported formats**: Images (.webp/.jpg/.png) and videos (.mp4/.webm)
- [x] **Poster detection**: Videos automatically get poster images with same filename
- [x] **File sorting**: All files sorted alphabetically by name
- [x] **Zero config**: Adding new files creates slides automatically without code changes

### 📱 Responsive Design

- [x] **iPhone frame**: Visible on desktop (≥765px) using `min-[765px]:block`
- [x] **Hidden on mobile**: Frame hidden on mobile (<765px) using `min-[765px]:hidden`
- [x] **9:16 aspect ratio**: Proper vertical aspect ratio with `aspect-[9/16]`

### 🎮 Interactive Features

- [x] **Auto-advance**: 10-second timer implemented with `setTimeout(advanceSlide, 10000)`
- [x] **Dot indicators**: Clickable dots with proper accessibility (`aria-current="true"`)
- [x] **Click to scroll**: Container click scrolls to `#gallery` with smooth behavior
- [x] **Intersection Observer**: Pauses when out of viewport for performance

### 🖼️ Media Handling

- [x] **Next.js Image**: Using `<Image>` component with `fill` prop
- [x] **Priority loading**: First image has `priority={currentIndex === 0}`
- [x] **Lazy loading**: Other images use `loading="lazy"` and `decoding="async"`
- [x] **Video attributes**: `muted playsInline autoPlay loop controls={false}`
- [x] **Object-fit cover**: Proper scaling with `object-cover` class

### ♿ Accessibility

- [x] **Region role**: Container has `role="region"` with `aria-label="Hero media"`
- [x] **Dot indicators**: Proper `aria-current="true"` for active state
- [x] **Keyboard navigation**: Focus management and keyboard support
- [x] **Reduced motion**: Respects `prefers-reduced-motion` setting

### 🎨 Styling

- [x] **CSS variables**: All colors use variables from `styles/theme.css`
- [x] **Theme integration**: `--border`, `--primary`, `--white`, `--bg`, etc.
- [x] **Smooth animations**: Framer Motion with 300ms transitions

## 🚀 Usage Example

```javascript
// Server Component (automatically called in page.js)
import { getHeroMediaFiles } from '@/lib/getHeroMediaFiles';

const heroMediaItems = await getHeroMediaFiles();
// Returns: [
//   { type: "image", src: "/hero-media/ads-manager.png", altKey: "Ads Manager" },
//   { type: "video", src: "/hero-media/demo.mp4", poster: "/hero-media/demo.webp", altKey: "Demo" }
// ]

// Client Component
<HeroMedia items={heroMediaItems} />;
```

## 📁 File Structure Example

```
public/hero-media/
├── ads-manager.png          → Image slide
├── analytics-demo.mp4       → Video slide
├── analytics-demo.webp      → Poster for video (auto-detected)
├── analytics-growth.png     → Image slide
├── keitaro-dashboard.mp4    → Video slide (no poster)
├── landing-preview.png      → Image slide
└── new-case-study.png       → Image slide
```

## 🔄 Auto-Detection Logic

1. **Scan directory**: `/public/hero-media/` for supported files
2. **Sort alphabetically**: Consistent order across deployments
3. **Detect posters**: For `video.mp4`, look for `video.webp/jpg/png`
4. **Generate alt text**: Convert filename to title case (`analytics-demo` → `Analytics Demo`)
5. **Return array**: Structured data for component consumption

## 🎯 Key Features

- **Zero configuration**: Drop files in folder, get slides automatically
- **Performance optimized**: Priority loading, lazy loading, intersection observer
- **Fully accessible**: ARIA labels, keyboard navigation, reduced motion support
- **Responsive**: Different layout for mobile vs desktop
- **Video support**: Autoplay with poster fallbacks
- **Theme integrated**: Uses design system CSS variables

All requirements from the Definition of Done have been successfully implemented and tested.
