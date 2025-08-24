'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function GalleryGearRing() {
  // Gallery items array with exactly 5 demo images as specified
  const items = [
    { id: 1, image: '/gallery/demo1.png' },
    { id: 2, image: '/gallery/demo2.png' },
    { id: 3, image: '/gallery/demo3.png' },
    { id: 4, image: '/gallery/demo4.png' },
    { id: 5, image: '/gallery/demo5.png' },
  ];

  // Static implementation - no auto-rotation for initial version
  const [radius, setRadius] = useState(180); // Responsive radius: 180px mobile, 300px desktop
  const [isClient, setIsClient] = useState(false); // Track hydration

  // Client-side mounting check to prevent SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update radius based on viewport size for responsiveness
  // Mobile: ~180px, Desktop: ~300px as specified
  useEffect(() => {
    if (!isClient) return;

    const updateRadius = () => {
      if (window.innerWidth < 768) {
        setRadius(180); // Mobile: ~180px
      } else {
        setRadius(300); // Desktop: ~300px
      }
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, [isClient]);

  // Calculate individual card properties based on position in the ring
  // Static ring - no rotation, cards positioned at fixed angles
  const getCardProps = index => {
    // Angle calculation: distribute 5 cards evenly around 360°
    // Card 0 at front center (0°), others at 72° intervals
    const angleStep = 360 / items.length; // 360 / 5 = 72°
    const cardAngle = index * angleStep; // 0°, 72°, 144°, 216°, 288°

    // Determine if card is in front arc (visible) or back arc (hidden)
    // Front arc: cards within ~180° of front (270° to 90° when normalized)
    // Only show about 180° arc as specified
    const isFrontArc = cardAngle <= 90 || cardAngle >= 270;

    // Calculate distance from center (0° = front center)
    const distanceFromCenter = Math.min(cardAngle, 360 - cardAngle);

    // Scale and opacity based on position
    let scale = 0.9; // Default for side cards
    let opacity = 0.6; // Default for side cards

    if (distanceFromCenter === 0) {
      // Central front card: scale-110, stronger glow
      scale = 1.1;
      opacity = 1;
    } else if (isFrontArc) {
      // Side cards: scale-90, opacity-60
      scale = 0.9;
      opacity = 0.6;
    } else {
      // Back cards: opacity-0 (completely hidden)
      scale = 0.9;
      opacity = 0;
    }

    // Z-index based on distance from center
    const zIndex = isFrontArc ? Math.round(10 - distanceFromCenter / 10) : 0;

    // Glow intensity - stronger for center card
    const isCenter = distanceFromCenter === 0;

    return {
      angle: cardAngle,
      scale,
      opacity,
      zIndex,
      isCenter,
      isFrontArc,
      radius,
    };
  };

  return (
    <section className="relative flex justify-center items-center mt-[-80px]">
      <div className="relative w-full max-w-4xl h-[400px] md:h-[500px]">
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

              // Skip rendering back cards (opacity-0 as specified)
              if (cardProps.opacity === 0) {
                return null;
              }

              return (
                <motion.div
                  key={item.id}
                  className="absolute"
                  style={{
                    zIndex: cardProps.zIndex,
                  }}
                  animate={{
                    // Transform logic: rotate(angle) translate(radius) rotate(-angle)
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
                >
                  {/* Vertical card (9:16 aspect ratio) with silver border and glow */}
                  <div
                    className={`
                      relative aspect-[9/16] w-24 sm:w-32 md:w-36 lg:w-40
                      rounded-2xl border border-gray-300/70 bg-[var(--bg-secondary)]
                      overflow-hidden
                      ${
                        cardProps.isCenter
                          ? // Central card: intense silver glow (~2px spread), very subtle fade beyond
                            'shadow-[0_0_4px_2px_rgba(192,192,192,0.8),0_0_12px_4px_rgba(192,192,192,0.3),0_0_20px_8px_rgba(192,192,192,0.1)]'
                          : // Side cards: subtle silver glow
                            'shadow-[0_0_2px_1px_rgba(192,192,192,0.6),0_0_6px_2px_rgba(192,192,192,0.2)]'
                      }
                    `}
                  >
                    {/* Placeholder image with object-cover and rounded corners */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={`Gallery item ${item.id}`}
                      className="w-full h-full object-cover rounded-2xl"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
