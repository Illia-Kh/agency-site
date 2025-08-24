'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function GalleryRing({
  items = [
    { id: 1, image: '/gallery/demo1.png' },
    { id: 2, image: '/gallery/demo2.png' },
    { id: 3, image: '/gallery/demo3.png' },
    { id: 4, image: '/gallery/demo4.png' },
    { id: 5, image: '/gallery/demo5.png' },
  ],
  autoRotate = true,
  rotationInterval = 4000,
}) {
  const [currentCenter, setCurrentCenter] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [radius, setRadius] = useState(320); // Default radius
  const [isClient, setIsClient] = useState(false); // Track hydration
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Client-side mounting check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update radius based on screen size - only on client side
  useEffect(() => {
    if (!isClient) return;

    const updateRadius = () => {
      setRadius(window.innerWidth < 768 ? 280 : 380);
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, [isClient]);

  // Auto-rotation logic - only start after client hydration
  useEffect(() => {
    if (!isClient || !autoRotate || isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setCurrentCenter(prev => (prev + 1) % items.length);
    }, rotationInterval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    currentCenter,
    isPaused,
    autoRotate,
    rotationInterval,
    items.length,
    isClient,
  ]);

  // Respect prefers-reduced-motion - only on client side
  useEffect(() => {
    if (!isClient) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setIsPaused(true);
    }
  }, [isClient]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (!isClient) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (!prefersReducedMotion) {
      setIsPaused(false);
    }
  };

  const handleCardClick = index => {
    setCurrentCenter(index);
    // Pause auto-rotation temporarily after click
    setIsPaused(true);
    setTimeout(() => {
      if (!isClient) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (!prefersReducedMotion) {
        setIsPaused(false);
      }
    }, rotationInterval);
  };

  // Calculate card positions and properties based on their relation to center
  const getCardProps = index => {
    const totalCards = items.length;
    // Calculate angular distance from center (in terms of card positions)
    let distance = Math.abs(index - currentCenter);
    distance = Math.min(distance, totalCards - distance); // Handle wrap-around

    // Calculate angle: distribute cards evenly around circle
    const angleStep = 360 / totalCards;
    let angle = ((index - currentCenter) * angleStep) % 360;

    // Normalize angle to [-180, 180] for cleaner calculations
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;

    // Ensure we have valid numbers
    const normalizedAngle = isNaN(angle) ? 0 : Math.round(angle * 100) / 100;
    const safeRadius = isNaN(radius) ? 320 : Math.round(radius);

    // Calculate z-index (center card should be on top)
    const zIndex = distance === 0 ? 10 : 10 - distance;

    // Calculate scale based on distance from center
    let scale = 1;
    if (distance === 0)
      scale = 1.1; // Center card
    else if (distance === 1)
      scale = 0.9; // Adjacent cards
    else scale = 0.7; // Far cards

    // Calculate opacity
    let opacity = 1;
    if (distance === 0)
      opacity = 1; // Center card
    else if (distance === 1)
      opacity = 0.8; // Adjacent cards
    else if (distance === 2)
      opacity = 0.4; // Second adjacent
    else opacity = 0; // Back cards (hidden)

    return {
      angle: normalizedAngle,
      radius: safeRadius,
      scale,
      opacity,
      zIndex,
      distance,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gallery Ring Container */}
      <div className="relative h-[600px] sm:h-[700px] lg:h-[800px] flex items-center justify-center">
        {/* Show loading state until hydrated */}
        {!isClient && (
          <div className="animate-pulse text-[var(--text)] opacity-60">
            Loading gallery...
          </div>
        )}

        {/* Render cards only after hydration */}
        {isClient &&
          items.map((item, index) => {
            const cardProps = getCardProps(index);

            return (
              <motion.div
                key={item.id}
                className="absolute cursor-pointer"
                style={{
                  zIndex: cardProps.zIndex,
                }}
                animate={{
                  transform: `rotate(${cardProps.angle}deg) translateY(-${cardProps.radius}px) rotate(-${cardProps.angle}deg)`,
                  scale: cardProps.scale,
                  opacity: cardProps.opacity,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  duration: 0.6,
                }}
                onClick={() => handleCardClick(index)}
                whileHover={{
                  scale: cardProps.scale * 1.05,
                }}
                whileTap={{
                  scale: cardProps.scale * 0.95,
                }}
              >
                {/* Card with glow effect */}
                <div
                  className={`
                  relative aspect-[9/16] w-32 sm:w-40 lg:w-48
                  rounded-2xl border border-gray-300/70 bg-graphite-900
                  overflow-hidden transition-all duration-300
                  ${
                    cardProps.distance === 0
                      ? 'shadow-[0_0_20px_4px_rgba(192,192,192,0.4),0_0_40px_8px_rgba(192,192,192,0.1)]'
                      : 'shadow-[0_0_8px_2px_rgba(192,192,192,0.3),0_0_16px_4px_rgba(192,192,192,0.05)]'
                  }
                `}
                >
                  {/* Card content */}
                  <Image
                    src={item.image}
                    alt={`Gallery item ${item.id}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Optional: Dots indicator for current center */}
      {isClient && (
        <div className="flex justify-center mt-8 space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentCenter
                  ? 'bg-gray-300 scale-125'
                  : 'bg-gray-300/40 hover:bg-gray-300/60'
              }`}
              onClick={() => handleCardClick(index)}
              aria-label={`Go to gallery item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
