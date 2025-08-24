'use client';
import { useState, useEffect, useRef } from 'react';
import { useReducedMotion, animate } from 'framer-motion';
import Image from 'next/image';

export default function GalleryGearRing({
  items,
  autoSpeed = 0.22,
  radiusMobile = 200,
  radiusDesktop = 340,
  sectorDeg = 180,
  idleTimeoutMs = 3500,
} = {}) {
  // Default items array with 5 demo entries (fallback if no items prop)
  const defaultItems = [
    { id: 1, image: '/gallery/demo1.png' },
    { id: 2, image: '/gallery/demo2.png' },
    { id: 3, image: '/gallery/demo3.png' },
    { id: 4, image: '/gallery/demo4.png' },
    { id: 5, image: '/gallery/demo5.png' },
  ];

  const galleryItems = items || defaultItems;

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
  const AUTO_SPEED = autoSpeed; // radians per second (clockwise, small and smooth)
  const SPRING = { type: 'spring', stiffness: 110, damping: 24 };
  const SECTOR_TO_TAU = Math.PI; // one sector ~180° for drag conversion
  const IDLE_TIMEOUT = idleTimeoutMs;

  // Utils (keep EXACT as specified)
  const normalize = a => ((a + Math.PI) % TAU) - Math.PI;
  const thetaOf = (i, rot) => (TAU / galleryItems.length) * i + rot;
  const frontIndex = () =>
    galleryItems.reduce(
      (best, _, i) => {
        const th = thetaOf(i, rotationRef.current);
        const d = Math.abs(normalize(th));
        return d < best.d ? { i, d } : best;
      },
      { i: 0, d: Infinity }
    ).i;

  // Reduced motion
  const prefersReduced = useReducedMotion();

  // Pause refs - hover, hidden, dragging, offscreen
  const hoverRef = useRef(false);
  const hiddenRef = useRef(false);
  const draggingRef = useRef(false);
  const offscreenRef = useRef(false);
  const lastUserInputRef = useRef(0);

  // Stage ref for intersection observer and drag events
  const stageRef = useRef(null);

  // Drag state
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startRot: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  const onEnter = () => (hoverRef.current = true);
  const onLeave = () => (hoverRef.current = false);

  // Visibility pause
  useEffect(() => {
    const onVis = () =>
      (hiddenRef.current = document.visibilityState !== 'visible');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Offscreen pause using IntersectionObserver
  useEffect(() => {
    if (!stageRef.current || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        offscreenRef.current = entry.isIntersecting === false;
      },
      { threshold: 0.4 }
    );

    observer.observe(stageRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Initial check
    checkDesktop();

    // Listen for resize
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Touch/Drag functionality with Pointer Events
  const handlePointerDown = e => {
    if (!stageRef.current) return;

    e.preventDefault();
    stageRef.current.setPointerCapture(e.pointerId);

    const rect = stageRef.current.getBoundingClientRect();
    const stageWidth = rect.width;

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startRot: rotationRef.current,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocity: 0,
      stageWidth,
      pointerId: e.pointerId,
    };

    draggingRef.current = true;
    lastUserInputRef.current = Date.now();
  };

  const handlePointerMove = e => {
    if (!dragStateRef.current.isDragging) return;

    e.preventDefault();
    const now = performance.now();
    const deltaX = e.clientX - dragStateRef.current.startX;
    const deltaAngle =
      (deltaX / dragStateRef.current.stageWidth) * SECTOR_TO_TAU;
    const newRotation = dragStateRef.current.startRot + deltaAngle;

    // Calculate velocity for inertia
    const timeDiff = now - dragStateRef.current.lastTime;
    if (timeDiff > 0) {
      const positionDiff = e.clientX - dragStateRef.current.lastX;
      dragStateRef.current.velocity = positionDiff / timeDiff; // px/ms
    }

    dragStateRef.current.lastX = e.clientX;
    dragStateRef.current.lastTime = now;

    rotationRef.current = newRotation;
    setRotationRad(newRotation);
    lastUserInputRef.current = Date.now();
  };

  const handlePointerUp = e => {
    if (!dragStateRef.current.isDragging) return;

    e.preventDefault();
    if (stageRef.current) {
      stageRef.current.releasePointerCapture(dragStateRef.current.pointerId);
    }

    // Apply inertia based on velocity
    const velocity = dragStateRef.current.velocity;
    const velocityRad =
      (velocity / dragStateRef.current.stageWidth) * SECTOR_TO_TAU; // convert to rad/ms
    const target = rotationRef.current + velocityRad * 0.35; // decay factor

    // Start inertial animation
    if (Math.abs(velocityRad) > 0.001) {
      const controls = animate(rotationRef.current, target, {
        ...SPRING,
        onUpdate: v => {
          rotationRef.current = v;
          setRotationRad(v);
        },
      });

      // Store controls for cleanup
      dragStateRef.current.inertialControls = controls;
    }

    dragStateRef.current.isDragging = false;
    draggingRef.current = false;
    lastUserInputRef.current = Date.now();
  };

  const handlePointerCancel = e => {
    handlePointerUp(e);
  };

  // Enhanced RAF autorotation loop with pause policy
  useEffect(() => {
    if (prefersReduced) return; // no autorotation

    let rafId;
    let last = performance.now();

    const loop = t => {
      const dt = Math.min((t - last) / 1000, 0.05); // clamp dt to avoid jumps
      last = t;

      // Check if any pause conditions are active
      const isPaused =
        hoverRef.current ||
        hiddenRef.current ||
        draggingRef.current ||
        offscreenRef.current;

      // Auto-resume logic: only resume if all pauses cleared and idle timeout passed
      const timeSinceUserInput = Date.now() - lastUserInputRef.current;
      const canAutoResume = !isPaused && timeSinceUserInput > IDLE_TIMEOUT;

      if (
        canAutoResume ||
        (!hoverRef.current &&
          !hiddenRef.current &&
          !draggingRef.current &&
          !offscreenRef.current &&
          timeSinceUserInput > IDLE_TIMEOUT)
      ) {
        const next = rotationRef.current + AUTO_SPEED * dt;
        rotationRef.current = next;
        setRotationRad(next);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReduced, AUTO_SPEED, IDLE_TIMEOUT]);

  // Click to focus handler
  const focusIndex = i => {
    const th = thetaOf(i, rotationRef.current);
    const delta = -normalize(th); // shortest arc to 0
    const target = rotationRef.current + delta;

    // Stop any ongoing inertial animation
    if (dragStateRef.current.inertialControls) {
      dragStateRef.current.inertialControls.stop();
    }

    // animate numeric value and update React state on each frame
    const controls = animate(rotationRef.current, target, {
      ...SPRING,
      onUpdate: v => {
        rotationRef.current = v;
        setRotationRad(v);
      },
    });

    lastUserInputRef.current = Date.now();
    return () => controls.stop();
  };

  // Enhanced keyboard handler
  const handleKeyDown = e => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusIndex((frontIndex() + 1) % galleryItems.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusIndex(
        (frontIndex() - 1 + galleryItems.length) % galleryItems.length
      );
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusIndex(galleryItems.length - 1);
    }
  };

  // Geometry constants
  const radius = isDesktop ? radiusDesktop : radiusMobile;
  const sectorRadians = (sectorDeg * Math.PI) / 180;

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up any ongoing animations
      if (dragStateRef.current.inertialControls) {
        dragStateRef.current.inertialControls.stop();
      }
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-[-80px]">
      {/* 3D Stage Container */}
      <div
        ref={stageRef}
        className="relative mx-auto flex items-center justify-center h-[42vh] sm:h-[48vh] md:h-[52vh]"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        tabIndex={0}
        role="region"
        aria-label="Website gallery ring"
        style={{
          perspective: '1200px',
          transformStyle: 'preserve-3d',
          touchAction: 'none', // Prevent default touch behaviors
        }}
      >
        {galleryItems.map((item, index) => {
          // STRICT math: theta calculation
          const theta =
            ((2 * Math.PI) / galleryItems.length) * index + (rotationRad || 0);

          // Angle normalization and visibility (front sector only)
          const absAng = Math.abs(
            ((theta + Math.PI) % (2 * Math.PI)) - Math.PI
          ); // (-π..π]
          const visible = absAng <= sectorRadians / 2; // show only ±sectorDeg/2
          const depth = Math.max(0, Math.cos(theta)); // frontness [0..1], back half→0

          // Ensure depth is a valid number
          const safeDepth = isNaN(depth) ? 0 : depth;

          // Accents
          const scale = 0.92 + 0.2 * safeDepth; // 0.92..1.12
          const opacity = visible ? 0.4 + 0.6 * safeDepth : 0;
          const zIndex = Math.round(1000 * (0.001 + safeDepth));
          const pointer = visible ? 'auto' : 'none';

          // Precise halo (strong inner + weak outer)
          const inner = `0 0 2px rgba(192,192,192,${0.65 + 0.25 * safeDepth})`;
          const outer = `0 0 14px rgba(192,192,192,${0.05 + 0.1 * safeDepth})`;
          const boxShadow = visible ? `${inner}, ${outer}` : 'none';

          // Check if this is the front card
          const isFront = frontIndex() === index;

          // Style object for performance (removed useMemo due to being inside map callback)
          const cardStyle = {
            transform: `rotateY(${theta}rad) translateZ(${radius}px) rotateY(${-theta}rad)`,
            transformStyle: 'preserve-3d',
            position: 'absolute',
            willChange: 'transform, opacity',
            scale: scale.toString(),
            opacity,
            zIndex,
            pointerEvents: pointer,
            boxShadow,
          };

          return (
            <div
              key={item.id}
              style={cardStyle}
              onClick={() => focusIndex(index)}
              role="button"
              tabIndex={visible ? 0 : -1}
              aria-hidden={!visible}
              aria-current={isFront ? 'true' : undefined}
              className="focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:outline-none"
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
