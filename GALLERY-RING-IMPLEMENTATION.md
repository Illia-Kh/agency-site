# GalleryRing Component

A ring-shaped gallery component displaying vertical mobile-first website previews with smooth animations and interactions.

## Overview

The `GalleryRing` component creates an interactive circular gallery of cards arranged in a ring layout. Each card displays a website preview image with a 9:16 aspect ratio (mobile-first). The component features auto-rotation, click-to-center interactions, and responsive design.

## Key Features

### ✅ Ring Layout
- Cards positioned along a circular path using CSS transforms
- Center card emphasized with larger scale (110%) and stronger glow
- Side cards scaled down (90%) with reduced opacity
- Back cards completely hidden (opacity: 0)

### ✅ Mobile-First Design
- All cards use 9:16 aspect ratio for mobile preview
- Responsive radius: 280px (mobile) to 380px (desktop)
- Card sizes: 128px (mobile), 160px (tablet), 192px (desktop)

### ✅ Interactive Features
- **Auto-rotation**: Continuous clockwise rotation every 4 seconds
- **Click interaction**: Cards smoothly animate to center position
- **Hover effects**: Pause auto-rotation and subtle scale animations
- **Dot indicators**: Clickable navigation dots below the ring

### ✅ Styling & Effects
- Rounded corners (`rounded-2xl`)
- Silver border (`border-gray-300/70`)
- Glow effects: Intense for center card, subtle for others
- Dark background (`bg-graphite-900`)
- Smooth hover overlays

### ✅ Accessibility & Performance
- Respects `prefers-reduced-motion` setting
- Proper ARIA labels for navigation
- Next.js Image optimization with responsive sizing
- Client-side hydration handling to prevent SSR issues

## Usage

```jsx
import GalleryRing from './components/GalleryRing';

// Basic usage with default demo images
<GalleryRing />

// Custom configuration
<GalleryRing
  items={[
    { id: 1, image: '/gallery/project1.png' },
    { id: 2, image: '/gallery/project2.png' },
    { id: 3, image: '/gallery/project3.png' },
    // ... more items
  ]}
  autoRotate={true}
  rotationInterval={4000}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array | Demo images | Array of objects with `id` and `image` properties |
| `autoRotate` | Boolean | `true` | Enable/disable automatic rotation |
| `rotationInterval` | Number | `4000` | Rotation interval in milliseconds |

### Items Array Structure

```javascript
const items = [
  { id: 1, image: '/gallery/demo1.png' },
  { id: 2, image: '/gallery/demo2.png' },
  // ... more items
];
```

## Technical Implementation

### Ring Positioning Mathematics

Cards are positioned using the transform formula:
```css
transform: rotate(angle) translateY(-radius) rotate(-angle)
```

Where:
- `angle` = (index - currentCenter) * (360 / totalCards)
- `radius` = responsive value (280px mobile, 380px desktop)
- Double rotation keeps cards upright while positioning them in circle

### State Management

- `currentCenter`: Index of the card in center position
- `isPaused`: Controls auto-rotation pause state
- `radius`: Responsive radius based on screen size
- `isClient`: Hydration state to prevent SSR mismatches

### Animation System

Uses Framer Motion with:
- Spring transitions for smooth card movement
- Hover and tap gestures for interaction feedback
- Conditional rendering to avoid hydration issues

## File Structure

```
components/
└── GalleryRing.js          # Main component file
public/gallery/             # Default demo images
├── demo1.png
├── demo2.png
├── demo3.png
├── demo4.png
└── demo5.png
```

## Requirements Met

- ✅ **Next.js 15 & React 19 compatible**
- ✅ **TailwindCSS styling with CSS variables**
- ✅ **Framer Motion animations**
- ✅ **Mobile-first 9:16 aspect ratio**
- ✅ **Ring layout with N cards (default 5)**
- ✅ **Auto-rotation and click interactions**
- ✅ **Responsive design**
- ✅ **Proper glow effects and styling**
- ✅ **Client-side hydration handling**

## Example Integration

```jsx
// In a page component
import GalleryRing from '../components/GalleryRing';

export default function HomePage() {
  return (
    <section id="gallery" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">Our Work</h2>
        <p className="text-gray-600 mt-4">
          Explore our latest projects in an interactive gallery
        </p>
      </div>
      
      <GalleryRing />
    </section>
  );
}
```

The component is designed to be dropped into any section of a page and will handle all its styling, animations, and interactions automatically.