# Hero Media CDN Setup Guide

> Complete guide for setting up and managing media files for the hero section's auto-playing gallery.

## 🎯 Overview

The hero section features an auto-playing media gallery that cycles through case studies and project showcases. Media files are defined in `content/heroMedia.json` and should be hosted on a CDN for optimal performance.

## 📋 Media Manifest Structure

```json
[
  {
    "id": "unique-identifier",
    "type": "video|image",
    "src": "https://cdn.example.com/hero/filename.ext",
    "poster": "https://cdn.example.com/hero/poster.jpg", // video only
    "duration": 10, // seconds
    "alt": "Descriptive text for accessibility"
  }
]
```

## 🚀 Recommended CDN Options

### Option 1: Vercel Blob + CDN (Recommended)

**Best for Next.js projects with native integration**

- ✅ Native integration with automatic optimization
- ✅ Global CDN with excellent performance
- ✅ Simple setup and management

```bash
npm install @vercel/blob
```

Set `BLOB_READ_WRITE_TOKEN` in environment variables.  
**URL Pattern**: `https://xyz123.public.blob.vercel-storage.com/hero/filename.ext`

### Option 2: Cloudflare R2 + CDN

**Best for cost-effectiveness and custom domains**

- ✅ Cost-effective with excellent global performance
- ✅ Custom domain support
- ✅ Robust API and management tools

1. Create R2 bucket: `hero-media`
2. Configure public access policy
3. Set up custom domain: `media.yourdomain.com`

**URL Pattern**: `https://media.yourdomain.com/hero/filename.ext`

### Option 3: BunnyCDN

**Best for video streaming and budget optimization**

- ✅ Affordable pricing
- ✅ Excellent video streaming capabilities
- ✅ Fast global delivery

1. Create storage zone: `agency-hero-media`
2. Create pull zone linked to storage
3. Configure caching rules

**URL Pattern**: `https://yourpullzone.b-cdn.net/hero/filename.ext`

## 📊 Media Requirements

### Image Specifications

- **Format**: WebP (fallback to JPEG)
- **Size**: 1920x1080px (16:9 aspect ratio)
- **Quality**: 85% compression for optimal balance
- **File Size**: Under 500KB per image

### Video Specifications (Future Support)

- **Format**: WebM (H.264 fallback)
- **Resolution**: 1920x1080px maximum
- **Duration**: 10-15 seconds maximum
- **File Size**: Under 2MB per video

## 🛠️ Quick Setup

### 1. Prepare Media Files

```bash
# Optimize images (example with ImageMagick)
magick input.jpg -resize 1920x1080^ -gravity center -extent 1920x1080 -quality 85 -format webp output.webp
```

### 2. Upload to CDN

Upload optimized files to your chosen CDN provider.

### 3. Update heroMedia.json

```json
[
  {
    "id": "analytics-dashboard",
    "type": "image",
    "src": "https://your-cdn.com/hero/analytics-dashboard.webp",
    "duration": 8,
    "alt": "Analytics dashboard showing conversion metrics and traffic growth"
  },
  {
    "id": "ad-campaign-setup",
    "type": "image",
    "src": "https://your-cdn.com/hero/ad-campaign-setup.webp",
    "duration": 10,
    "alt": "Meta and Google Ads campaign setup interface"
  }
]
```

### 4. Set Cache Headers

Configure your CDN to serve proper cache headers:

```
Cache-Control: public, max-age=31536000, immutable
Content-Type: image/webp
```

## ⚡ Performance Optimizations

### Preloading Strategy

- **First image**: `loading="eager"` and high priority
- **Subsequent images**: Preload next item only
- **Viewport optimization**: Use IntersectionObserver to pause when out of viewport

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

## ♿ Accessibility Considerations

- ✅ Provide meaningful `alt` text for all media
- ✅ Support `prefers-reduced-motion` to disable autoplay
- ✅ Ensure keyboard navigation works for dot indicators
- ✅ Use ARIA labels for interactive elements

## 🎨 Content Guidelines

### Image Content Ideas

1. **Analytics Dashboard**: Growth metrics, conversion funnels
2. **Ad Campaign Setup**: Meta/Google Ads interface mockups
3. **Landing Page Preview**: Client website examples
4. **Keitaro Dashboard**: Tracking and attribution screenshots

### Content Requirements

- ❌ No real client data (use anonymized/mock data)
- ❌ Brand-neutral (avoid platform logos)
- ✅ High contrast, readable at small sizes
- ✅ Consistent visual style matching site theme

## 🔧 Troubleshooting

### Common Issues

- **Images not loading**: Check CORS headers and CDN configuration
- **Slow loading**: Verify image optimization and CDN cache hit rates
- **Layout shift**: Ensure proper aspect-ratio CSS is applied
- **Auto-rotation not working**: Check IntersectionObserver browser support

### Testing Checklist

- [ ] Images load correctly in all browsers
- [ ] Auto-rotation works when in viewport
- [ ] Dot navigation responds to clicks
- [ ] Mobile layout stacks properly
- [ ] Reduced motion preference respected
- [ ] Keyboard navigation functional
- [ ] Alt text present and descriptive

## 📈 Monitoring

Track CDN performance metrics:

- **Cache hit ratio** (target: >95%)
- **Average response time** (target: <100ms)
- **Bandwidth usage**
- **Error rates**

**Recommended tools**:

- Google PageSpeed Insights
- WebPageTest
- CDN provider dashboards
