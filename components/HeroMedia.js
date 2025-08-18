'use client';
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import heroMediaData from '@/content/heroMedia.json';

export default function HeroMedia() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const observerRef = useRef(null);

  const currentItem = heroMediaData[currentIndex];
  const isVideo = currentItem.type === 'video';

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

  // Auto-advance logic
  useEffect(() => {
    if (!isVisible || isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const advanceSlide = () => {
      setCurrentIndex(prev => (prev + 1) % heroMediaData.length);
    };

    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      const handleVideoEnd = () => {
        advanceSlide();
      };

      video.addEventListener('ended', handleVideoEnd);

      return () => {
        video.removeEventListener('ended', handleVideoEnd);
      };
    } else {
      // For images, use timer
      timerRef.current = setTimeout(advanceSlide, currentItem.duration * 1000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [currentIndex, isVisible, isPaused, isVideo]);

  // Handle video play/pause based on visibility
  useEffect(() => {
    if (videoRef.current && isVideo) {
      if (isVisible && !isPaused) {
        videoRef.current.play().catch(() => {
          // Handle autoplay restrictions gracefully
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

  const handleDotClick = index => {
    setCurrentIndex(index);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const fadeVariants = {
    initial: { opacity: 0, scale: 1.02 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface-elevated)]"
      role="region"
      aria-label="Media gallery"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentItem.src}
              poster={currentItem.poster}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
              aria-label={currentItem.alt}
              onLoadedData={() => {
                if (isVisible && !isPaused && videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
              }}
            />
          ) : (
            <img
              src={currentItem.src}
              alt={currentItem.alt}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {heroMediaData.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] ${
              index === currentIndex
                ? 'bg-[var(--primary)]'
                : 'border-2 border-[var(--primary)] bg-transparent'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-pressed={index === currentIndex}
          />
        ))}
      </div>

      {/* Preload next media */}
      {heroMediaData.map((item, index) => {
        if (index === currentIndex) return null;
        const isNextItem = index === (currentIndex + 1) % heroMediaData.length;

        return (
          <div key={item.id} className="hidden">
            {item.type === 'video' ? (
              <video
                src={item.src}
                poster={item.poster}
                preload={isNextItem ? 'metadata' : 'none'}
                muted
                playsInline
              />
            ) : (
              <img
                src={item.src}
                alt={item.alt}
                loading={isNextItem ? 'eager' : 'lazy'}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
