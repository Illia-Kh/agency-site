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
  const rotationRad = 0; // Static for now (no autorotation yet)
  const radius = isDesktop ? 340 : 200;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-[-80px]">
      {/* 3D Stage Container */}
      <div
        className="relative mx-auto flex items-center justify-center h-[42vh] sm:h-[48vh] md:h-[52vh]"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {items.map((item, index) => {
          // STRICT math: theta calculation
          const theta = ((2 * Math.PI) / items.length) * index + rotationRad;

          // Angle normalization and visibility (front sector only)
          const absAng = Math.abs(
            ((theta + Math.PI) % (2 * Math.PI)) - Math.PI
          ); // (-π..π]
          const visible = absAng <= Math.PI / 2; // show only ±90°
          const depth = Math.max(0, Math.cos(theta)); // frontness [0..1], back half→0

          // Accents
          const scale = 0.92 + 0.2 * depth; // 0.92..1.12
          const opacity = visible ? 0.4 + 0.6 * depth : 0;
          const zIndex = Math.round(1000 * (0.001 + depth));
          const pointer = visible ? 'auto' : 'none';

          // Silver halo intensity by depth
          const boxShadow = visible
            ? `0 0 6px rgba(192,192,192,${0.5 + 0.4 * depth}), 0 0 20px rgba(192,192,192,${0.05 + 0.15 * depth})`
            : 'none';

          return (
            <div
              key={item.id}
              style={{
                transform: `rotateY(${theta}rad) translateZ(${radius}px) rotateY(${-theta}rad)`,
                transformStyle: 'preserve-3d',
                position: 'absolute',
                willChange: 'transform',
                scale: scale.toString(),
                opacity,
                zIndex,
                pointerEvents: pointer,
                boxShadow,
              }}
            >
              <div className="w-24 sm:w-32 md:w-40 aspect-[9/16] rounded-2xl border border-gray-300/70 bg-graphite-900 overflow-hidden">
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
