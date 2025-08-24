'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import VideoSmart from './media/VideoSmart';

type MediaItem = {
  id: string;
  type: string;
  src: string;
  poster?: string;
  alt?: string;
  altKey?: string;
  duration?: number;
};

type HeroMediaProps = {
  items?: MediaItem[];
};

// iPhone-like frame: SVG overlay + rounded/clipping container
const IPhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full h-full">
    {/* Content area with rounding and clipping */}
    <div className="relative w-full h-full rounded-[40px] overflow-hidden border-[6px] border-[var(--border)] bg-[var(--surface-elevated)]">
      {children}
    </div>
    {/* Decorative outline overlay (no interactions) */}
    <svg
      width="360"
      height="640"
      viewBox="0 0 360 640"
      className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Notch */}
      <rect
        x="130"
        y="18"
        width="100"
        height="16"
        rx="8"
        fill="var(--bg)"
        stroke="var(--border)"
        strokeWidth="1"
      />
    </svg>
  </div>
);

export default function HeroMedia({ items = [] }: HeroMediaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const currentItem = items.length > 0 ? items[currentIndex] : null;
  const currentAlt = currentItem?.alt || currentItem?.altKey || '';
  const isVideo = currentItem?.type === 'video';

  // IntersectionObserver for auto-play/pause
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Auto-advance logic (10 seconds)
  useEffect(() => {
    if (!isVisible || isPaused || items.length <= 1) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const advanceSlide = () => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    };

    timerRef.current = setTimeout(advanceSlide, 10000); // 10 seconds

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isVisible, isPaused, items.length]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setIsPaused(true);
    }
  }, []);

  // Early return after hooks
  if (!items.length || !currentItem) {
    return null;
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleContainerClick = () => {
    // Scroll to #gallery
    const galleryElement = document.getElementById('gallery');
    if (galleryElement) {
      galleryElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fadeVariants = {
    initial: { opacity: 0, scale: 1.02 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  };

  const MediaContent = ({ className }: { className?: string }) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`absolute inset-0 ${className}`}
      >
        {isVideo ? (
          <VideoSmart
            src={currentItem.src}
            poster={currentItem.poster}
            className="w-full h-full"
            autoPlay={isVisible && !isPaused}
          />
        ) : (
          <Image
            src={currentItem.src}
            alt={currentAlt}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            sizes="(max-width: 765px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[9/16] max-h-[50vh] sm:max-h-[60vh] md:aspect-[9/19.5] md:max-h-[80vh] cursor-pointer"
      role="region"
      aria-label="Hero media"
      onClick={handleContainerClick}
    >
      {/* Desktop: phone-styled frame */}
      <div className="hidden min-[765px]:block h-full">
        <IPhoneFrame>
          <div className="w-full h-full">
            <MediaContent className="" />
          </div>
        </IPhoneFrame>
      </div>

      {/* Mobile: simple rounded container */}
      <div className="min-[765px]:hidden w-full h-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]">
        <MediaContent className="" />
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 sm:bottom-4 sm:right-4 sm:left-auto sm:transform-none flex gap-1 z-20">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={e => {
              e.stopPropagation(); // Prevent container click
              handleDotClick(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${
              index === currentIndex
                ? 'bg-[var(--primary)] opacity-90 scale-110'
                : 'bg-[var(--white)] opacity-40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Preload next media */}
      {items.map((item, index) => {
        if (index === currentIndex) return null;
        const isNextItem = index === (currentIndex + 1) % items.length;

        return (
          <div key={index} className="hidden">
            {item.type === 'video' ? (
              <VideoSmart
                src={item.src}
                poster={item.poster}
                autoPlay={false}
                className="w-full h-full"
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt || item.altKey || ''}
                width={100}
                height={100}
                loading={isNextItem ? 'eager' : 'lazy'}
                decoding="async"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
