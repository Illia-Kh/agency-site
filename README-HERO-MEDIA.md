# Hero Media CDN Setup Guide

This guide explains how to set up and manage media files for the hero section's auto-playing gallery.

## Overview

The hero section features an auto-playing media gallery that cycles through case studies and project showcases. Media files are defined in `content/heroMedia.json` and should be hosted on a CDN for optimal performance.

## Media Manifest Structure

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

## Recommended CDN Options

### Option 1: Vercel Blob + CDN (Recommended for Next.js)

- **Pros**: Native integration, automatic optimization, global CDN
- **Setup**:
  ```bash
  npm install @vercel/blob
  ```
- **Configuration**: Set `BLOB_READ_WRITE_TOKEN` in environment variables
- **URL Pattern**: `https://xyz123.public.blob.vercel-storage.com/hero/filename.ext`

### Option 2: Cloudflare R2 + CDN

- **Pros**: Cost-effective, excellent global performance, custom domains
- **Setup**:
  1. Create R2 bucket: `hero-media`
  2. Configure public access policy
  3. Set up custom domain: `media.yourdomain.com`
- **URL Pattern**: `https://media.yourdomain.com/hero/filename.ext`

### Option 3: BunnyCDN

- **Pros**: Affordable, fast, excellent for video streaming
- **Setup**:
  1. Create storage zone: `agency-hero-media`
  2. Create pull zone linked to storage
  3. Enable smart caching
- **URL Pattern**: `https://your-pull-zone.b-cdn.net/hero/filename.ext`

## Media Requirements

### Images

- **Format**: WebP with JPEG fallback, or SVG for graphics
- **Dimensions**: 1600×900 (16:9 aspect ratio)
- **Size**: ≤ 300-400 KB per image
- **Optimization**: Use next/image compatible formats

### Videos (Future)

- **Format**: H.264/MP4 primary, WebM/VP9 secondary
- **Dimensions**: 1600×900 or 1920×1080 (16:9 aspect ratio)
- **Duration**: 8-12 seconds maximum
- **Size**: ≤ 4-6 MB per video
- **Audio**: Muted (remove audio track entirely)
- **Poster**: Required thumbnail image (WebP/JPEG)

### File Naming Convention

- Use kebab-case: `analytics-dashboard-v1.webp`
- Include version numbers for cache busting
- Descriptive names that match content

## Deployment Steps

### 1. Prepare Media Files

```bash
# Optimize images
npx @squoosh/cli --webp '{"quality":85}' source-images/*.jpg

# Create fallback JPEGs
npx @squoosh/cli --mozjpeg '{"quality":80}' source-images/*.jpg
```

### 2. Upload to CDN

```bash
# Example for Cloudflare R2
aws s3 cp ./media/hero/ s3://your-bucket/hero/ --recursive \
  --endpoint-url https://your-account.r2.cloudflarestorage.com
```

### 3. Update heroMedia.json

Replace placeholder URLs with actual CDN URLs:

```json
{
  "src": "https://your-cdn.com/hero/analytics-dashboard-v1.webp",
  "alt": "Analytics dashboard showing 340% lead growth"
}
```

### 4. Set Cache Headers

Configure your CDN to serve proper cache headers:

```
Cache-Control: public, max-age=31536000, immutable
Content-Type: image/webp (or appropriate MIME type)
```

## Performance Optimizations

### Preloading Strategy

- First image: `loading="eager"` and high priority
- Subsequent images: Preload next item only
- Use IntersectionObserver to pause when out of viewport

### Image Optimization

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### Video Optimization (Future)

```html
<video preload="metadata" muted playsinline poster="poster.webp">
  <source src="video.webm" type="video/webm" />
  <source src="video.mp4" type="video/mp4" />
</video>
```

## Accessibility Considerations

- Provide meaningful `alt` text for all media
- Support `prefers-reduced-motion` to disable autoplay
- Ensure keyboard navigation works for dot indicators
- Use ARIA labels for interactive elements

## Content Guidelines

### Image Content Ideas

1. **Analytics Dashboard**: Show growth metrics, conversion funnels
2. **Ad Campaign Setup**: Meta/Google Ads interface mockups
3. **Landing Page Preview**: Client website examples
4. **Keitaro Dashboard**: Tracking and attribution screenshots

### Content Requirements

- No real client data (use anonymized/mock data)
- Brand-neutral (avoid platform logos)
- High contrast, readable at small sizes
- Consistent visual style matching site theme

## Troubleshooting

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

## Monitoring

Track CDN performance metrics:

- Cache hit ratio (target: >95%)
- Average response time (target: <100ms)
- Bandwidth usage
- Error rates

Use tools like:

- Google PageSpeed Insights
- WebPageTest
- CDN provider dashboards
