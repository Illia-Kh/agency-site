'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Gallery() {
  // Gallery items with placeholder images
  const galleryItems = [
    { id: 1, imageSrc: '/gallery/demo1.png' },
    { id: 2, imageSrc: '/gallery/demo2.png' },
    { id: 3, imageSrc: '/gallery/demo3.png' },
    { id: 4, imageSrc: '/gallery/demo4.png' },
    { id: 5, imageSrc: '/gallery/demo5.png' },
  ];

  const [currentIndex, setCurrentIndex] = useState(2); // Start with middle card active
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-rotation logic - rotate clockwise every 4-5 seconds
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % galleryItems.length);
    }, 4500); // 4.5 seconds

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isPaused, galleryItems.length]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setIsPaused(true);
    }
  }, []);

  // Handle card click - move clicked card to center
  const handleCardClick = index => {
    setCurrentIndex(index);
    // Pause auto-rotation briefly when user interacts
    setIsPaused(true);
    setTimeout(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (!prefersReducedMotion) {
        setIsPaused(false);
      }
    }, 3000); // Resume after 3 seconds
  };

  // Desktop positioning logic - diagonal/arc layout
  const getDesktopCardStyle = index => {
    const relativeIndex = index - currentIndex;
    const totalCards = galleryItems.length;

    // Normalize relative index to handle wrapping
    const normalizedIndex =
      ((relativeIndex % totalCards) + totalCards) % totalCards;
    const adjustedIndex =
      normalizedIndex > totalCards / 2
        ? normalizedIndex - totalCards
        : normalizedIndex;

    // Base positioning for diagonal arc layout
    const baseX = 50; // Center X
    const baseY = 50; // Center Y
    const radius = 25; // Arc radius
    const angleStep = 30; // Degrees between cards

    const angle = adjustedIndex * angleStep;
    const x = baseX + Math.sin((angle * Math.PI) / 180) * radius;
    const y = baseY - Math.cos((angle * Math.PI) / 180) * radius * 0.3; // Flatter arc

    const isCenter = adjustedIndex === 0;
    const scale = isCenter ? 1.1 : 0.85 + Math.abs(adjustedIndex) * -0.1;
    const zIndex = isCenter ? 20 : 10 - Math.abs(adjustedIndex);
    const rotateZ = isCenter ? 0 : adjustedIndex * -8; // Slight rotation for non-center cards

    return {
      left: `${Math.max(10, Math.min(90, x))}%`,
      top: `${Math.max(10, Math.min(80, y))}%`,
      transform: `translate(-50%, -50%) scale(${scale}) rotateZ(${rotateZ}deg)`,
      zIndex,
    };
  };

  // Mobile positioning logic - vertical stack
  const getMobileCardStyle = index => {
    const relativeIndex = index - currentIndex;
    const totalCards = galleryItems.length;

    const normalizedIndex =
      ((relativeIndex % totalCards) + totalCards) % totalCards;
    const adjustedIndex =
      normalizedIndex > totalCards / 2
        ? normalizedIndex - totalCards
        : normalizedIndex;

    const isCenter = adjustedIndex === 0;
    const yOffset = adjustedIndex * 60; // Vertical spacing
    const scale = isCenter ? 1.05 : 0.9;
    const opacity =
      Math.abs(adjustedIndex) > 2 ? 0 : 1 - Math.abs(adjustedIndex) * 0.3;
    const zIndex = isCenter ? 20 : 10 - Math.abs(adjustedIndex);

    return {
      transform: `translateY(${yOffset}px) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  return (
    <section id="gallery" className="w-full bg-graphite-950 py-16">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden lg:block relative h-[600px] overflow-hidden">
          {galleryItems.map((item, index) => {
            const style = getDesktopCardStyle(index);
            const isCenter =
              (index - currentIndex + galleryItems.length) %
                galleryItems.length ===
              0;

            return (
              <motion.div
                key={item.id}
                className="absolute cursor-pointer"
                style={style}
                onClick={() => handleCardClick(index)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: isCenter ? 1.2 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                  duration: 0.6,
                }}
                whileHover={{
                  scale: isCenter ? 1.25 : 1.05,
                }}
              >
                {/* Card with floating website preview styling */}
                <div className="w-80 aspect-[16/9] rounded-2xl border border-azure/20 shadow-xl shadow-graphite/40 drop-shadow-[0_0_12px_var(--primary)] bg-graphite-900 overflow-hidden">
                  <Image
                    src={item.imageSrc}
                    alt={`Website preview ${item.id}`}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden relative h-[400px] overflow-hidden">
          <div className="flex flex-col items-center justify-center h-full">
            {galleryItems.map((item, index) => {
              const style = getMobileCardStyle(index);
              const relativeIndex = index - currentIndex;
              const totalCards = galleryItems.length;
              const normalizedIndex =
                ((relativeIndex % totalCards) + totalCards) % totalCards;
              const adjustedIndex =
                normalizedIndex > totalCards / 2
                  ? normalizedIndex - totalCards
                  : normalizedIndex;
              const isVisible = Math.abs(adjustedIndex) <= 2;

              if (!isVisible) return null;

              return (
                <motion.div
                  key={item.id}
                  className="absolute cursor-pointer"
                  style={style}
                  onClick={() => handleCardClick(index)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: style.opacity,
                    y: adjustedIndex * 60,
                    scale: adjustedIndex === 0 ? 1.05 : 0.9,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 25,
                    duration: 0.6,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Card with mobile aspect ratio */}
                  <div className="w-64 aspect-[9/16] rounded-2xl border border-azure/20 shadow-xl shadow-graphite/40 drop-shadow-[0_0_12px_var(--primary)] bg-graphite-900 overflow-hidden">
                    <Image
                      src={item.imageSrc}
                      alt={`Website preview ${item.id}`}
                      width={225}
                      height={400}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
