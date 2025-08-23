'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// iPhone frame SVG component
const IPhoneFrame = ({ children }) => (
  <div className="relative hidden min-[765px]:block">
    <svg
      width="360"
      height="640"
      viewBox="0 0 360 640"
      className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="4"
        width="352"
        height="632"
        rx="48"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <rect
        x="12"
        y="12"
        width="336"
        height="616"
        rx="40"
        fill="none"
        stroke="var(--border)"
        strokeWidth="1"
        opacity="0.6"
      />
      {/* Home indicator */}
      <rect
        x="160"
        y="620"
        width="40"
        height="4"
        rx="2"
        fill="var(--border)"
        opacity="0.8"
      />
      {/* Notch */}
      <rect
        x="130"
        y="12"
        width="100"
        height="20"
        rx="10"
        fill="var(--bg)"
        stroke="var(--border)"
        strokeWidth="1"
      />
    </svg>
    <div className="relative rounded-[48px] overflow-hidden border-4 border-[var(--border)]">
      {children}
    </div>
  </div>
);

export default function HeroMedia({ items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const observerRef = useRef(null);

  const currentItem = items.length > 0 ? items[currentIndex] : null;
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

  // Handle video play/pause based on visibility
  useEffect(() => {
    if (videoRef.current && isVideo) {
      if (isVisible && !isPaused) {
        videoRef.current.play().catch(() => {
          // Handle autoplay failure
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisible, isPaused, isVideo, currentIndex]);

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

  const handleDotClick = index => {
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

  const MediaContent = ({ className }) => (
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
          <video
            ref={videoRef}
            src={currentItem.src}
            poster={currentItem.poster}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
            loop
            controls={false}
            aria-label={currentItem.altKey}
          />
        ) : (
          <Image
            src={currentItem.src}
            alt={currentItem.altKey}
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
      className="relative w-full aspect-[9/16] max-h-[45vh] md:max-h-[80vh] cursor-pointer"
      role="region"
      aria-label="Hero media"
      onClick={handleContainerClick}
    >
      {/* Desktop: iPhone frame for ≥765px */}
      <div className="hidden min-[765px]:block h-full">
        <IPhoneFrame>
          <div className="w-full h-full overflow-hidden bg-[var(--surface-elevated)]">
            <MediaContent />
          </div>
        </IPhoneFrame>
      </div>

      {/* Mobile: no frame for <765px */}
      <div className="min-[765px]:hidden w-full h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]">
        <MediaContent />
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-4 flex gap-1 z-20">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={e => {
              e.stopPropagation(); // Prevent container click
              handleDotClick(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] ${
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
              <video
                src={item.src}
                poster={item.poster}
                preload={isNextItem ? 'metadata' : 'none'}
                muted
                playsInline
              />
            ) : (
              <Image
                src={item.src}
                alt={item.altKey}
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
