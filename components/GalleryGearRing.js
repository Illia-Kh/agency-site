'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function GalleryGearRing() {
  // Gallery items array with demo images
  const items = [
    { id: 1, image: '/gallery/demo1.png' },
    { id: 2, image: '/gallery/demo2.png' },
    { id: 3, image: '/gallery/demo3.png' },
    { id: 4, image: '/gallery/demo4.png' },
    { id: 5, image: '/gallery/demo5.png' },
    { id: 6, image: '/gallery/demo6.png' },
  ];

  const [rotationAngle, setRotationAngle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [radius, setRadius] = useState(280); // Responsive radius
  const [isClient, setIsClient] = useState(false); // Track hydration
  const timerRef = useRef(null);

  // Client-side mounting check to prevent SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update radius based on viewport size for responsiveness
  useEffect(() => {
    if (!isClient) return;

    const updateRadius = () => {
      // Add a small delay to prevent race conditions during resize
      setTimeout(() => {
        if (window.innerWidth < 768) {
          setRadius(200); // Smaller on mobile
        } else if (window.innerWidth < 1024) {
          setRadius(280); // Medium on tablet
        } else {
          setRadius(350); // Larger on desktop
        }
      }, 10);
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, [isClient]);

  // Auto-rotation logic - continuous clockwise rotation
  useEffect(() => {
    if (!isClient || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Smooth continuous rotation - update every 50ms for fluid motion
    timerRef.current = setInterval(() => {
      setRotationAngle(prev => (prev + 0.5) % 360); // 0.5 degrees per step
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, isClient]);

  // Respect prefers-reduced-motion for accessibility
  useEffect(() => {
    if (!isClient) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setIsPaused(true);
    }
  }, [isClient]);

  // Handle card click - rotate the clicked card to center position
  const handleCardClick = index => {
    if (!isClient) return;

    // Calculate angle step between cards
    const angleStep = 360 / items.length;
    // Calculate target rotation to bring clicked card to front (0 degrees)
    const targetRotation = -(index * angleStep);

    setRotationAngle(targetRotation);

    // Pause auto-rotation briefly when user interacts
    setIsPaused(true);
    setTimeout(() => {
      if (!isClient) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (!prefersReducedMotion) {
        setIsPaused(false);
      }
    }, 3000); // Resume after 3 seconds
  };

  // Calculate individual card properties based on position in the ring
  const getCardProps = index => {
    // Ensure we have valid numbers to prevent NaN
    const safeRotationAngle = isNaN(rotationAngle) ? 0 : rotationAngle;
    const safeRadius = isNaN(radius) ? 280 : radius;

    // Angle calculation: distribute cards evenly around 360°
    const angleStep = 360 / items.length;
    const cardAngle = (index * angleStep + safeRotationAngle) % 360;

    // Normalize angle to [0, 360] for consistent calculations
    const normalizedAngle = cardAngle < 0 ? cardAngle + 360 : cardAngle;

    // Determine if card is in front arc (visible) or back arc (hidden)
    // Front arc: -90° to +90° (270° to 90° when normalized)
    const isFrontArc = normalizedAngle <= 90 || normalizedAngle >= 270;

    // Calculate distance from center (0° = front center)
    let distanceFromCenter = Math.min(
      Math.abs(normalizedAngle),
      Math.abs(normalizedAngle - 360)
    );
    if (normalizedAngle > 180) {
      distanceFromCenter = 360 - normalizedAngle;
    }

    // Scale based on position - center card larger, side cards smaller
    let scale = 0.9;
    if (distanceFromCenter <= 30) {
      scale = 1.1; // Center card - prominent
    } else if (distanceFromCenter <= 60) {
      scale = 1.0; // Adjacent cards - normal
    } else {
      scale = 0.9; // Side cards - smaller
    }

    // Opacity for torus perspective - only front arc visible
    let opacity = isFrontArc ? 1 : 0;
    if (isFrontArc && distanceFromCenter > 60) {
      opacity = Math.max(0.3, 1 - (distanceFromCenter - 60) / 90);
    }

    // Z-index based on distance from center
    const zIndex = isFrontArc ? Math.round(10 - distanceFromCenter / 10) : 0;

    // Glow intensity - stronger for center card
    const glowIntensity = distanceFromCenter <= 30 ? 'strong' : 'subtle';

    return {
      angle: isNaN(normalizedAngle) ? 0 : normalizedAngle,
      scale: isNaN(scale) ? 0.9 : scale,
      opacity: isNaN(opacity) ? 0 : opacity,
      zIndex: isNaN(zIndex) ? 0 : zIndex,
      glowIntensity,
      isFrontArc,
      radius: safeRadius,
    };
  };

  return (
    <div className="flex justify-center items-center mt-[-80px]">
      <div className="relative w-full max-w-4xl h-[500px] md:h-[600px]">
        <div className="relative w-full h-full flex items-center justify-center">
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

              // Skip rendering back cards (behind the ellipse)
              if (!cardProps.isFrontArc || cardProps.opacity === 0) {
                return null;
              }

              return (
                <motion.div
                  key={item.id}
                  className="absolute cursor-pointer"
                  style={{
                    zIndex: cardProps.zIndex,
                  }}
                  animate={{
                    // CSS transform: rotate(angle) translate(radius) rotate(-angle)
                    // This keeps cards upright while positioning them around the circle
                    transform: `rotate(${cardProps.angle}deg) translateY(-${cardProps.radius}px) rotate(-${cardProps.angle}deg) scale(${cardProps.scale})`,
                    opacity: cardProps.opacity,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 25,
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
                  {/* Vertical card (9:16 aspect ratio) with silver border and glow */}
                  <div
                    className={`
                      relative aspect-[9/16] w-24 sm:w-32 md:w-36 lg:w-40
                      rounded-2xl border border-gray-300/70 bg-graphite-900
                      overflow-hidden transition-all duration-300
                      ${
                        cardProps.glowIntensity === 'strong'
                          ? 'shadow-[0_0_20px_4px_rgba(192,192,192,0.6),0_0_40px_8px_rgba(192,192,192,0.2)] drop-shadow-[0_0_8px_rgba(192,192,192,0.4)]'
                          : 'shadow-[0_0_8px_2px_rgba(192,192,192,0.4),0_0_16px_4px_rgba(192,192,192,0.1)] drop-shadow-[0_0_4px_rgba(192,192,192,0.2)]'
                      }
                    `}
                  >
                    {/* Placeholder image */}
                    <Image
                      src={item.image}
                      alt={`Gallery gear tooth ${item.id}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 144px, 160px"
                      loading="lazy"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Optional: Center point indicator for development/debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
    </div>
  );
}
