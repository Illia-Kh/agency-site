'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function GalleryGearRing() {
  // Static items array with 5 demo entries
  const items = [
    { id: 1, image: '/gallery/demo1.png' },
    { id: 2, image: '/gallery/demo2.png' },
    { id: 3, image: '/gallery/demo3.png' },
    { id: 4, image: '/gallery/demo4.png' },
    { id: 5, image: '/gallery/demo5.png' },
  ];

  // State for responsive radius detection
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Initial check
    checkDesktop();

    // Listen for resize
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Geometry constants
  const N = items.length;
  const rotationRad = 0; // Static for now (no autorotation yet)
  const radius = isDesktop ? 340 : 200;
  const FRONT_CUTOFF = Math.PI / 2; // 90°

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-[-80px]">
      {/* 3D Stage Container */}
      <div
        className="relative mx-auto flex items-center justify-center h-[42vh] sm:h-[48vh] md:h-[52vh]"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {items.map((item, i) => {
          // Calculate angle for this card
          const theta = ((2 * Math.PI) / N) * i + rotationRad;

          // Depth factor based on frontness
          const depth = Math.cos(theta);

          // Visibility window (front sector only)
          const absAng = Math.abs(
            ((theta + Math.PI) % (2 * Math.PI)) - Math.PI
          );
          const visible = absAng <= FRONT_CUTOFF;

          // Opacity (only front sector)
          const opacity = visible ? 0.4 + 0.6 * Math.max(0, depth) : 0;

          // Scale (center emphasized, sides smaller, back hidden)
          const t = Math.max(0, depth); // back half clamps to 0
          const scale = 0.9 + 0.2 * t; // front 1.1; sides ≈ 0.9–1.0

          // Z-index for stacking (higher when closer)
          const zIndex = Math.round(1000 * (0.001 + t));

          // Pointer events
          const pointerEvents = visible ? 'auto' : 'none';

          return (
            <div
              key={item.id}
              className="absolute will-change-transform"
              style={{
                transform: `rotateY(${theta}rad) translateZ(${radius}px) rotateY(${-theta}rad) scale(${scale})`,
                opacity,
                zIndex,
                pointerEvents,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-24 sm:w-32 md:w-40 aspect-[9/16] rounded-2xl border border-gray-300/70 bg-graphite-900 overflow-hidden shadow-[0_0_6px_rgba(192,192,192,0.9),0_0_20px_rgba(192,192,192,0.2)]">
                <Image
                  src={item.image}
                  alt={`Gallery item ${item.id}`}
                  width={180}
                  height={320}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
