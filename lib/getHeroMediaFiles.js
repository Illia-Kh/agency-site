import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { revalidateTag } from 'next/cache';

const HERO_MEDIA_PATH = join(process.cwd(), 'public/hero-media');
const SUPPORTED_IMAGE_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];
const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm'];

/**
 * Server helper to read hero media files from /public/hero-media/
 * Automatically scans for images and videos, sorts by filename, and finds poster images for videos
 * @returns {Promise<Array<{type: "image"|"video", src: string, poster?: string, altKey: string}>>}
 */
export async function getHeroMediaFiles() {
  try {
    const files = await readdir(HERO_MEDIA_PATH);
    const mediaItems = [];
    const processedFiles = new Set();

    // Sort files alphabetically by name for consistent order
    files.sort();

    for (const file of files) {
      if (processedFiles.has(file)) continue;

      const filePath = join(HERO_MEDIA_PATH, file);

      try {
        const stats = await stat(filePath);

        // Skip directories
        if (!stats.isFile()) continue;

        const ext = extname(file).toLowerCase();
        const baseName = basename(file, ext);
        const altKey = baseName
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        // Handle images
        if (SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
          mediaItems.push({
            type: 'image',
            src: `/hero-media/${file}`,
            altKey,
          });
          processedFiles.add(file);
        }
        // Handle videos
        else if (SUPPORTED_VIDEO_EXTENSIONS.includes(ext)) {
          const mediaItem = {
            type: 'video',
            src: `/hero-media/${file}`,
            altKey,
          };

          // Look for poster image with same base name
          for (const posterExt of SUPPORTED_IMAGE_EXTENSIONS) {
            const posterFile = `${baseName}${posterExt}`;
            const posterPath = join(HERO_MEDIA_PATH, posterFile);

            try {
              await stat(posterPath);
              if (!processedFiles.has(posterFile)) {
                mediaItem.poster = `/hero-media/${posterFile}`;
                processedFiles.add(posterFile);
                break;
              }
            } catch {
              // Poster file doesn't exist, continue
            }
          }

          mediaItems.push(mediaItem);
          processedFiles.add(file);
        }
      } catch {
        // Skip files that can't be accessed
        continue;
      }
    }

    return mediaItems;
  } catch (error) {
    // Log error for debugging but don't crash
    // eslint-disable-next-line no-console
    console.error('Error reading hero media files:', error);
    return [];
  }
}

/**
 * Revalidate hero media cache
 */
export function revalidateHeroMedia() {
  revalidateTag('hero-media');
}
