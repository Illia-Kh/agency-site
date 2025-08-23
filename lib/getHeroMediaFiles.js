import { readdir } from 'fs/promises';
import { join } from 'path';
import { revalidateTag } from 'next/cache';

const HERO_MEDIA_PATH = join(process.cwd(), 'public/hero-media');
const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

/**
 * Server helper to read hero media files from /public/hero-media/
 * Automatically generates slide data from file names
 * @returns {Promise<Array<{src: string, altKey: string}>>}
 */
export async function getHeroMediaFiles() {
  try {
    const files = await readdir(HERO_MEDIA_PATH);

    // Filter and process image files
    const mediaFiles = files
      .filter(file => {
        const ext = file.toLowerCase().substring(file.lastIndexOf('.'));
        return SUPPORTED_EXTENSIONS.includes(ext);
      })
      .map(file => {
        const altKey = file.substring(0, file.lastIndexOf('.'));
        return {
          src: `/hero-media/${file}`,
          altKey,
        };
      })
      .sort((a, b) => a.altKey.localeCompare(b.altKey)); // Sort alphabetically for consistent order

    return mediaFiles;
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
