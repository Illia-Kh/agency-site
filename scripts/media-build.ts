#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'cross-spawn';
import chokidar from 'chokidar';
import sharp from 'sharp';

// Configuration
const RAW_DIR = path.join(process.cwd(), 'public/media/hero/_raw');
const OUT_DIR = path.join(process.cwd(), 'public/media/hero/_out');
const CACHE_FILE = path.join(OUT_DIR, '_cache.json');
const HERO_MEDIA_JSON = path.join(process.cwd(), 'content/heroMedia.json');

// Supported formats
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.webm'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALL_EXTENSIONS = [...VIDEO_EXTENSIONS, ...IMAGE_EXTENSIONS];

// Target dimensions (9:16 aspect ratio)
const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1920;

interface CacheEntry {
  inputPath: string;
  mtimeMs: number;
  size: number;
  sha1: string;
  outputs: string[];
  slug: string;
}

interface Cache {
  [key: string]: CacheEntry;
}

interface HeroMediaItem {
  id: string;
  type: 'video' | 'image';
  mp4?: string;
  webm?: string;
  poster?: string;
  src?: string;
  alt: string;
  duration: number;
}

class MediaBuilder {
  private cache: Cache = {};

  constructor() {
    this.loadCache();
    this.ensureDirectories();
  }

  private ensureDirectories() {
    [RAW_DIR, OUT_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private loadCache() {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        this.cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      }
    } catch (error) {
      console.log('📄 Creating new cache file');
      this.cache = {};
    }
  }

  private saveCache() {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(this.cache, null, 2));
  }

  private getFileHash(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha1').update(fileBuffer).digest('hex');
  }

  private getFileStats(filePath: string) {
    const stats = fs.statSync(filePath);
    return {
      mtimeMs: stats.mtimeMs,
      size: stats.size,
      sha1: this.getFileHash(filePath)
    };
  }

  private generateSlug(baseName: string, existingSlugs: Set<string>): string {
    // Convert to kebab-case and clean up
    let slug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Handle conflicts
    let finalSlug = slug;
    let counter = 1;
    while (existingSlugs.has(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    
    existingSlugs.add(finalSlug);
    return finalSlug;
  }

  private humanizeAlt(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async runFFmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args, { stdio: 'pipe' });
      
      let stderr = '';
      ffmpeg.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`Failed to start FFmpeg: ${error.message}`));
      });
    });
  }

  private async getVideoDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        inputPath
      ], { stdio: 'pipe' });

      let stdout = '';
      ffprobe.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code === 0) {
          const duration = parseFloat(stdout.trim());
          // Clamp duration between 6-10 seconds, default to 8 if longer than 15s
          const clampedDuration = duration > 15 ? 8 : Math.max(6, Math.min(10, Math.round(duration)));
          resolve(clampedDuration);
        } else {
          resolve(8); // Default fallback
        }
      });

      ffprobe.on('error', () => {
        resolve(8); // Default fallback
      });
    });
  }

  private async convertVideo(inputPath: string, outputDir: string, slug: string): Promise<string[]> {
    const mp4Path = path.join(outputDir, `${slug}.mp4`);
    const webmPath = path.join(outputDir, `${slug}.webm`);
    const posterPath = path.join(outputDir, `${slug}.webp`);

    console.log(`🎬 Converting video: ${path.basename(inputPath)}`);

    // Convert to MP4 with vertical format and proper encoding
    await this.runFFmpeg([
      '-y', '-i', inputPath,
      '-t', '8',
      '-vf', `scale=-2:${TARGET_HEIGHT},crop=${TARGET_WIDTH}:${TARGET_HEIGHT}:(in_w-${TARGET_WIDTH})/2:0,fps=30`,
      '-c:v', 'libx264',
      '-crf', '23',
      '-preset', 'veryslow',
      '-pix_fmt', 'yuv420p',
      '-an', // Remove audio
      mp4Path
    ]);

    // Convert MP4 to WebM
    await this.runFFmpeg([
      '-y', '-i', mp4Path,
      '-c:v', 'libvpx-vp9',
      '-b:v', '0',
      '-crf', '32',
      '-row-mt', '1',
      '-an',
      webmPath
    ]);

    // Generate poster from first frame
    await this.runFFmpeg([
      '-y', '-i', mp4Path,
      '-vframes', '1',
      '-q:v', '3',
      posterPath
    ]);

    return [mp4Path, webmPath, posterPath];
  }

  private async convertImage(inputPath: string, outputDir: string, slug: string): Promise<string[]> {
    const outputPath = path.join(outputDir, `${slug}.webp`);

    console.log(`🖼️  Converting image: ${path.basename(inputPath)}`);

    // Use sharp for image processing with center crop
    await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    return [outputPath];
  }

  private needsReprocessing(inputPath: string, cacheKey: string): boolean {
    const cacheEntry = this.cache[cacheKey];
    if (!cacheEntry) return true;

    const currentStats = this.getFileStats(inputPath);
    return (
      cacheEntry.mtimeMs !== currentStats.mtimeMs ||
      cacheEntry.size !== currentStats.size ||
      cacheEntry.sha1 !== currentStats.sha1
    );
  }

  private async processFile(inputPath: string, existingSlugs: Set<string>): Promise<void> {
    const ext = path.extname(inputPath).toLowerCase();
    const baseName = path.basename(inputPath, ext);
    const cacheKey = path.relative(RAW_DIR, inputPath);

    // Check if reprocessing is needed
    if (!this.needsReprocessing(inputPath, cacheKey)) {
      console.log(`⏭️  Skipping ${path.basename(inputPath)} (cached)`);
      return;
    }

    const slug = this.generateSlug(baseName, existingSlugs);
    const outputDir = path.join(OUT_DIR, slug);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let outputs: string[] = [];

    try {
      if (VIDEO_EXTENSIONS.includes(ext)) {
        outputs = await this.convertVideo(inputPath, outputDir, slug);
      } else if (IMAGE_EXTENSIONS.includes(ext)) {
        outputs = await this.convertImage(inputPath, outputDir, slug);
      }

      // Update cache
      const stats = this.getFileStats(inputPath);
      this.cache[cacheKey] = {
        inputPath,
        mtimeMs: stats.mtimeMs,
        size: stats.size,
        sha1: stats.sha1,
        outputs,
        slug
      };

      console.log(`✅ Processed: ${slug}`);
    } catch (error) {
      console.error(`❌ Failed to process ${path.basename(inputPath)}:`, error);
    }
  }

  private async generateHeroMediaJson(): Promise<void> {
    console.log('📝 Generating heroMedia.json...');

    const items: HeroMediaItem[] = [];
    const outputDirs = fs.readdirSync(OUT_DIR).filter(name => 
      name !== '_cache.json' && 
      fs.statSync(path.join(OUT_DIR, name)).isDirectory()
    );

    for (const slug of outputDirs) {
      const dirPath = path.join(OUT_DIR, slug);
      const files = fs.readdirSync(dirPath);
      
      const mp4File = files.find(f => f.endsWith('.mp4'));
      const webmFile = files.find(f => f.endsWith('.webm'));
      const posterFile = files.find(f => f.endsWith('.webp'));
      const imageFile = files.find(f => f.endsWith('.webp') && f === `${slug}.webp`);

      if (mp4File) {
        // Video item
        const mp4Path = path.join(dirPath, mp4File);
        const duration = await this.getVideoDuration(mp4Path);
        
        const item: HeroMediaItem = {
          id: slug,
          type: 'video',
          mp4: `/media/hero/_out/${slug}/${mp4File}`,
          duration,
          alt: this.humanizeAlt(slug)
        };

        if (webmFile) {
          item.webm = `/media/hero/_out/${slug}/${webmFile}`;
        }
        if (posterFile) {
          item.poster = `/media/hero/_out/${slug}/${posterFile}`;
        }

        items.push(item);
      } else if (imageFile) {
        // Image item
        const item: HeroMediaItem = {
          id: slug,
          type: 'image',
          src: `/media/hero/_out/${slug}/${imageFile}`,
          duration: 6, // Default duration for images
          alt: this.humanizeAlt(slug)
        };

        items.push(item);
      }
    }

    // Write the JSON file with nice formatting
    fs.writeFileSync(HERO_MEDIA_JSON, JSON.stringify(items, null, 2));
    console.log(`✅ Generated heroMedia.json with ${items.length} items`);
  }

  async build(): Promise<void> {
    console.log('🚀 Starting media build...');

    if (!fs.existsSync(RAW_DIR)) {
      console.log('📁 No _raw directory found, creating it...');
      fs.mkdirSync(RAW_DIR, { recursive: true });
      console.log('📄 Place your media files in public/media/hero/_raw/');
      return;
    }

    const files = fs.readdirSync(RAW_DIR)
      .filter(file => ALL_EXTENSIONS.includes(path.extname(file).toLowerCase()))
      .map(file => path.join(RAW_DIR, file));

    if (files.length === 0) {
      console.log('📄 No media files found in _raw directory');
      // Still generate empty heroMedia.json
      await this.generateHeroMediaJson();
      return;
    }

    const existingSlugs = new Set<string>();
    
    // Process all files
    for (const file of files) {
      await this.processFile(file, existingSlugs);
    }

    // Save cache and generate JSON
    this.saveCache();
    await this.generateHeroMediaJson();

    console.log('✅ Media build complete!');
  }

  async watch(): Promise<void> {
    console.log('👀 Watching for changes in _raw directory...');
    
    // Initial build
    await this.build();

    // Setup file watcher
    const watcher = chokidar.watch(RAW_DIR, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    const existingSlugs = new Set<string>();

    watcher
      .on('add', async (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (ALL_EXTENSIONS.includes(ext)) {
          console.log(`🔍 New file detected: ${path.basename(filePath)}`);
          await this.processFile(filePath, existingSlugs);
          this.saveCache();
          await this.generateHeroMediaJson();
        }
      })
      .on('change', async (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (ALL_EXTENSIONS.includes(ext)) {
          console.log(`♻️  File changed: ${path.basename(filePath)}`);
          await this.processFile(filePath, existingSlugs);
          this.saveCache();
          await this.generateHeroMediaJson();
        }
      })
      .on('unlink', async (filePath) => {
        console.log(`🗑️  File removed: ${path.basename(filePath)}`);
        const cacheKey = path.relative(RAW_DIR, filePath);
        delete this.cache[cacheKey];
        this.saveCache();
        await this.generateHeroMediaJson();
      });

    console.log('Press Ctrl+C to stop watching...');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping file watcher...');
      watcher.close();
      process.exit(0);
    });
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const builder = new MediaBuilder();

  switch (command) {
    case 'build':
      await builder.build();
      break;
    case 'watch':
      await builder.watch();
      break;
    default:
      console.log('Usage: tsx media-build.ts [build|watch]');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}