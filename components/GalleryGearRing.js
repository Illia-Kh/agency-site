'use client';
import { useState, useEffect, useRef } from 'react';
import { useReducedMotion, animate } from 'framer-motion';
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

  // Motion state as specified
  const [rotationRad, setRotationRad] = useState(0);
  const rotationRef = useRef(0); // mirror of rotationRad for RAF math

  useEffect(() => {
    rotationRef.current = rotationRad;
  }, [rotationRad]);

  // Constants as specified
  const TAU = Math.PI * 2;
  const AUTO_SPEED = 0.22; // radians per second (clockwise, small and smooth)
  const SPRING = { type: 'spring', stiffness: 120, damping: 22 };

  // Utils (keep EXACT as specified)
  const normalize = a => ((a + Math.PI) % TAU) - Math.PI;
  const thetaOf = (i, rot) => (TAU / items.length) * i + rot;
  const frontIndex = () =>
    items.reduce(
      (best, _, i) => {
        const th = thetaOf(i, rotationRef.current);
        const d = Math.abs(normalize(th));
        return d < best.d ? { i, d } : best;
      },
      { i: 0, d: Infinity }
    ).i;

  // Reduced motion
  const prefersReduced = useReducedMotion();

  // Hover pause
  const hoverRef = useRef(false);
  const onEnter = () => (hoverRef.current = true);
  const onLeave = () => (hoverRef.current = false);

  // Visibility pause
  const hiddenRef = useRef(false);
  useEffect(() => {
    const onVis = () =>
      (hiddenRef.current = document.visibilityState !== 'visible');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

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

  // RAF autorotation loop
  useEffect(() => {
    if (prefersReduced) return; // no autorotation
    let rafId,
      last = performance.now();
    const loop = t => {
      const dt = (t - last) / 1000;
      last = t;
      if (!hoverRef.current && !hiddenRef.current) {
        const next = rotationRef.current + AUTO_SPEED * dt;
        rotationRef.current = next;
        setRotationRad(next);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [prefersReduced]);

  // Click to focus handler
  const focusIndex = i => {
    const th = thetaOf(i, rotationRef.current);
    const delta = -normalize(th); // shortest arc to 0
    const target = rotationRef.current + delta;
    // animate numeric value and update React state on each frame
    const controls = animate(rotationRef.current, target, {
      ...SPRING,
      onUpdate: v => {
        rotationRef.current = v;
        setRotationRad(v);
      },
    });
    return () => controls.stop();
  };

  // Keyboard handler
  const handleKeyDown = e => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusIndex((frontIndex() + 1) % items.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusIndex((frontIndex() - 1 + items.length) % items.length);
    }
  };

  // Geometry constants
  const radius = isDesktop ? 340 : 200;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-[-80px]">
      {/* 3D Stage Container */}
      <div
        className="relative mx-auto flex items-center justify-center h-[42vh] sm:h-[48vh] md:h-[52vh]"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
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
              onClick={() => focusIndex(index)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  focusIndex(index);
                }
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
