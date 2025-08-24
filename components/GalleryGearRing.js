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
  idleTimeoutMs = 3500, // eslint-disable-line no-unused-vars -- kept for API compatibility
  forceAuto = false,
  debug = false,
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

  const onMouseEnter = () => {
    hoverRef.current = true;
  };

  const onMouseLeave = () => {
    hoverRef.current = false;
  };

  // Visibility pause
  useEffect(() => {
    const onVis = () =>
      (hiddenRef.current = document.visibilityState !== 'visible');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Offscreen pause using IntersectionObserver with lower threshold
  useEffect(() => {
    if (!stageRef.current || typeof window === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => {
        offscreenRef.current =
          !entry.isIntersecting || entry.intersectionRatio < 0.2;
      },
      { threshold: [0, 0.2, 0.4, 1] }
    );

    io.observe(stageRef.current);

    return () => io.disconnect();
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

  // Enhanced RAF autorotation loop with robust pause policy
  useEffect(() => {
    let rafId,
      last = performance.now();
    const loop = t => {
      const dt = Math.min((t - last) / 1000, 0.05); // clamp to 50ms
      last = t;

      // Define paused state exactly as specified
      const paused =
        !forceAuto &&
        (prefersReduced ||
          hoverRef.current ||
          hiddenRef.current ||
          offscreenRef.current ||
          draggingRef.current);

      if (!paused || forceAuto) {
        const next = rotationRef.current + AUTO_SPEED * dt;
        rotationRef.current = next;
        setRotationRad(next);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [forceAuto, prefersReduced, AUTO_SPEED]);

  // Click to focus handler - always works regardless of pause state
  const focusIndex = i => {
    const th = thetaOf(i, rotationRef.current);
    const delta = -normalize(th); // shortest arc to 0
    const target = rotationRef.current + delta;

    // Stop any ongoing inertial animation
    if (dragStateRef.current.inertialControls) {
      dragStateRef.current.inertialControls.stop();
    }

    // animate using framer-motion animate with SPRING config
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

  // Debug HUD component
  const DebugHUD = () => {
    if (!debug) return null;

    // Calculate paused state for display
    const paused =
      !forceAuto &&
      (prefersReduced ||
        hoverRef.current ||
        hiddenRef.current ||
        offscreenRef.current ||
        draggingRef.current);

    return (
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          zIndex: 9999,
          fontFamily: 'monospace',
          fontSize: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          borderRadius: '4px',
          padding: '4px 8px',
          lineHeight: '1.2',
        }}
      >
        <div>PRM: {String(prefersReduced)}</div>
        <div>hover: {hoverRef.current.toString()}</div>
        <div>hidden: {hiddenRef.current.toString()}</div>
        <div>offscreen: {offscreenRef.current.toString()}</div>
        <div>drag: {draggingRef.current.toString()}</div>
        <div>paused: {paused.toString()}</div>
        <div>rot: {rotationRef.current.toFixed(2)}</div>
        <div>front: {frontIndex()}</div>
      </div>
    );
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-[-80px]">
      {/* 3D Stage Container */}
      <div
        ref={stageRef}
        className="relative mx-auto flex items-center justify-center h-[42vh] sm:h-[48vh] md:h-[52vh]"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
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
          touchAction: 'pan-y', // Allow vertical scroll while enabling horizontal drag
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

        {/* Debug HUD */}
        <DebugHUD />
      </div>
    </section>
  );
}
