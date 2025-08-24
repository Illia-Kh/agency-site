'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import VideoSmart from '@/components/media/VideoSmart';
import { useState, useRef, useEffect } from 'react';
import type { GalleryItem } from '@/types/gallery';

type FannedReelProps = {
  items: GalleryItem[];
  // eslint-disable-next-line no-unused-vars
  onSelect?: (selectedItem: GalleryItem) => void;
};

export default function FannedReel({ items, onSelect }: FannedReelProps) {
  const [active, setActive] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActive(prev => (prev === null ? 0 : Math.max(0, prev - 1)));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActive(prev =>
          prev === null ? 0 : Math.min(items.length - 1, (prev || 0) + 1)
        );
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActive(null);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [items.length]);

  if (!items.length) return null;

  const displayItems = items.slice(0, 4);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Project gallery"
      className="relative mx-auto w-full max-w-5xl px-2 sm:px-0"
      tabIndex={-1}
    >
      <div className="relative h-[60svh] sm:h-[70svh]">
        {displayItems.map((item, i) => {
          const isActive = active === i;
          const angle = [-6, -2, 2, 6][i] || 0; // slight arc
          const offset = [-32, -10, 10, 32][i] || 0; // px overlap

          return (
            <motion.button
              key={item.id}
              type="button"
              aria-selected={isActive}
              onClick={() => {
                const newActive = isActive ? null : i;
                setActive(newActive);
                if (newActive !== null && onSelect) {
                  onSelect(item);
                }
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded-2xl"
              style={{ zIndex: isActive ? 20 : 10 + i }}
              initial={false}
              animate={{
                rotate: isActive ? 0 : angle,
                x: isActive ? 0 : offset,
                y: isActive ? 0 : 0,
                scale: isActive ? 1.06 : 0.92 + i * 0.02,
              }}
              whileHover={{ scale: isActive ? 1.06 : 0.95 + i * 0.02 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <div className="aspect-[9/16] w-[260px] sm:w-[300px] md:w-[340px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated),transparent_15%)] shadow-sm">
                {item.kind === 'image' ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={340}
                    height={600}
                    className="h-full w-full object-cover"
                    priority={i === 0}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                ) : (
                  <VideoSmart
                    src={item.src}
                    poster={item.poster}
                    className="h-full w-full object-cover"
                    autoPlay={isActive}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* CTA row */}
      <div className="mt-4 flex justify-end">
        <a
          href={`/en/contact?case=${displayItems[0]?.id ?? 'case'}`}
          className="text-[var(--primary)] underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 rounded"
        >
          I want one like this →
        </a>
      </div>
    </div>
  );
}
