'use client';
import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useTranslations } from 'next-intl';

/** Utility: clamp */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
/** Deg->Rad */
const toRad = deg => (deg * Math.PI) / 180;

/** Simple spring animator (critically damped-ish). */
function useSpring(
  value,
  { stiffness = 280, damping = 32, precision = 0.001 } = {}
) {
  const [x, setX] = useState(value);
  const vRef = useRef(0);
  const targetRef = useRef(value);
  const rafRef = useRef(0);

  const step = () => {
    const x0 = x;
    const v0 = vRef.current;
    const target = targetRef.current;
    // dt normalized to 1 frame (@60fps) since RAF is used
    const dt = 1;
    const k = stiffness;
    const c = damping;
    // spring-damper: x'' = -k(x - target) - c*x'
    const a = -k * (x0 - target) - c * v0;
    const v1 = v0 + (a * dt) / 1000; // scale down a bit
    const x1 = x0 + v1;
    vRef.current = v1;
    setX(x1);
    if (Math.abs(v1) + Math.abs(target - x1) > precision) {
      rafRef.current = requestAnimationFrame(step);
    }
  };

  const api = {
    setTarget: t => {
      targetRef.current = t;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(step);
    },
    setImmediate: t => {
      cancelAnimationFrame(rafRef.current);
      targetRef.current = t;
      vRef.current = 0;
      setX(t);
    },
    get: () => x,
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
  return [x, api];
}

/** RAF loop helper */
function useRafLoop(fn, enabled = true) {
  const rafRef = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    const loop = () => {
      fn();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, fn]);
}

/** Compute layout pose for an item on an arc. */
function computePose(i, n, rotDeg, arcDeg, radius, tiltDeg, orientation) {
  const t = n > 1 ? i / (n - 1) - 0.5 : 0; // -0.5..0.5
  const baseAngle = t * arcDeg + rotDeg; // degrees
  const rad = toRad(baseAngle);
  const approxZ = Math.cos(rad) * radius; // for zIndex sorting
  const yawTilt = (Math.sign(baseAngle) || 1) * Math.min(Math.abs(tiltDeg), 20);
  const transform =
    orientation === 'center'
      ? `translateZ(${radius}px) rotateY(${baseAngle}deg) rotateY(${yawTilt}deg)`
      : `rotateY(${baseAngle}deg) translateZ(${radius}px) rotateY(${yawTilt}deg)`;
  return { baseAngle, approxZ, transform };
}

/** Headless controller hook. */
function useArcController({
  count,
  arcDeg = 120,
  radius = 300,
  tiltDeg = 6,
  orientation = 'outward',
  dragSensitivity = 0.25, // deg per px
  friction = 0.93,
  snap = true,
  autoplay = false,
  autoplayInterval = 4000,
}) {
  const [rot, setRot] = useState(0); // degrees
  const velRef = useRef(0); // deg/frame
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTsRef = useRef(performance.now());
  const [centerIndex, setCenterIndex] = useState(Math.floor((count - 1) / 2));
  const [mode, setMode] = useState('idle'); // idle|drag|inertia|snapping|centering|autoplay
  const [, spring] = useSpring(0);

  // derive: index nearest to front (angle 0)
  const stepDeg = count > 1 ? arcDeg / (count - 1) : 0;
  const angleOfIndex = useMemo(
    () => idx => (idx / (count - 1) - 0.5) * arcDeg,
    [count, arcDeg]
  );

  // autoplay
  useEffect(() => {
    if (!autoplay || mode === 'drag') return;
    const id = setInterval(() => {
      centerOn((centerIndex + 1) % count);
      setMode('autoplay');
    }, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplay, centerIndex, count, autoplayInterval, mode]);

  // inertia loop
  useRafLoop(() => {
    if (mode !== 'inertia') return;
    setRot(r => {
      const next = r + velRef.current;
      velRef.current *= friction;
      if (Math.abs(velRef.current) < 0.02) {
        velRef.current = 0;
        if (snap && stepDeg > 0) {
          // snap to nearest
          const idx = nearestIndexFromRot(next, count, arcDeg);
          setCenterIndex(idx);
          spring.setImmediate(next);
          spring.setTarget(-angleOfIndex(idx));
          setMode('snapping');
          return next;
        }
        setMode('idle');
        return next;
      }
      return next;
    });
  }, mode === 'inertia');

  // snapping/centering via spring
  useEffect(() => {
    if (mode !== 'snapping' && mode !== 'centering') return;
    const id = requestAnimationFrame(function tick() {
      setRot(spring.get());
      if (Math.abs(spring.get() - spring.target) < 0.1) {
        setRot(spring.target);
        setMode('idle');
        cancelAnimationFrame(id);
      } else {
        requestAnimationFrame(tick);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [mode]);

  // pointer handlers (headless)
  const onPointerDown = x => {
    draggingRef.current = true;
    lastXRef.current = x;
    lastTsRef.current = performance.now();
    velRef.current = 0;
    setMode('drag');
  };
  const onPointerMove = x => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dx = x - lastXRef.current;
    setRot(r => r + dx * dragSensitivity);
    const dt = Math.max(1, now - lastTsRef.current);
    velRef.current = ((dx * dragSensitivity) / dt) * 16; // normalize to 60fps
    lastXRef.current = x;
    lastTsRef.current = now;
  };
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (Math.abs(velRef.current) > 0.01) {
      setMode('inertia');
    } else if (snap && stepDeg > 0) {
      const idx = nearestIndexFromRot(rot, count, arcDeg);
      setCenterIndex(idx);
      spring.setImmediate(rot);
      spring.setTarget(-angleOfIndex(idx));
      setMode('snapping');
    } else {
      setMode('idle');
    }
  };

  // programmatic API
  const centerOn = useMemo(
    () => idx => {
      setCenterIndex(idx);
      spring.setImmediate(rot);
      spring.setTarget(-angleOfIndex(idx));
      setMode('centering');
    },
    [spring, rot, angleOfIndex]
  );
  const next = () => centerOn(clamp(centerIndex + 1, 0, count - 1));
  const prev = () => centerOn(clamp(centerIndex - 1, 0, count - 1));

  return {
    state: { rot, mode, centerIndex, arcDeg, radius, tiltDeg, orientation },
    handlers: { onPointerDown, onPointerMove, onPointerUp },
    api: {
      centerOn,
      next,
      prev,
      setRot,
      setArc: () => setRot(r => r) /* placeholder */,
    },
  };
}

function nearestIndexFromRot(rot, count, arcDeg) {
  if (count <= 1) return 0;
  const angleOfIndex = idx => (idx / (count - 1) - 0.5) * arcDeg;
  let best = 0,
    bestAbs = Infinity;
  for (let i = 0; i < count; i++) {
    const a = angleOfIndex(i) + rot;
    const d = Math.abs(a);
    if (d < bestAbs) {
      bestAbs = d;
      best = i;
    }
  }
  return best;
}

/** MetalFrame view primitive */
function MetalFrame({ size, frame, lightAngle = 30, children }) {
  const borderR = 16;
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        padding: frame,
        borderRadius: borderR,
        background: `conic-gradient(from ${lightAngle}deg at 50% 50%,
          var(--metal-light) 0deg,
          var(--metal-mid) 45deg,
          var(--metal-dark) 90deg,
          var(--metal-mid) 135deg,
          var(--metal-light) 180deg,
          var(--metal-mid) 225deg,
          var(--metal-dark) 270deg,
          var(--metal-mid) 315deg,
          var(--metal-light) 360deg
        )`,
        boxShadow: `0 0 0 1px color-mix(in oklab, var(--metal-dark) 70%, transparent),
          inset 0 1px 2px color-mix(in oklab, var(--metal-light) 35%, transparent),
          inset 0 -1px 2px color-mix(in oklab, var(--metal-dark) 30%, transparent)`,
      }}
    >
      <div
        className="overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: borderR - Math.min(6, frame / 2),
          background: 'var(--surface-2)',
          boxShadow:
            'inset 0 0 0 1px color-mix(in oklab, var(--metal-dark) 25%, transparent)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Presentational view with headless controller */
const ArcGallery = forwardRef(function ArcGallery(
  {
    items = [],
    radius = 300,
    arcDeg = 120,
    tiltDeg = 6,
    orientation = 'outward',
    itemSize = 128,
    frameWidth = 12,
    onSelect = () => {},
    snap = true,
    autoplay = false,
    autoplayInterval = 4000,
    className = '',
  },
  ref
) {
  const containerRef = useRef(null);
  const ctrl = useArcController({
    count: items.length,
    arcDeg,
    radius,
    tiltDeg,
    orientation,
    snap,
    autoplay,
    autoplayInterval,
  });

  useImperativeHandle(ref, () => ({
    centerOn: ctrl.api.centerOn,
    next: ctrl.api.next,
    prev: ctrl.api.prev,
    get state() {
      return ctrl.state;
    },
  }));

  // accessibility: keyboard
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = e => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        ctrl.api.next();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        ctrl.api.prev();
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(ctrl.state.centerIndex);
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [onSelect]);

  // pointer events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const getX = ev => (ev.touches ? ev.touches[0].clientX : ev.clientX);
    const onDown = ev => {
      el.setPointerCapture?.(ev.pointerId ?? 1);
      ctrl.handlers.onPointerDown(getX(ev));
    };
    const onMove = ev => ctrl.handlers.onPointerMove(getX(ev));
    const onUp = () => ctrl.handlers.onPointerUp();
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // render
  const n = items.length;
  const rot = ctrl.state.rot;

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="3D arc gallery"
      tabIndex={0}
      className={`relative mx-auto select-none ${className}`}
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        height: itemSize * 1.32,
        touchAction: 'pan-y',
        ['--metal-dark']: 'var(--metal-dark)',
        ['--metal-mid']: 'var(--metal-mid)',
        ['--metal-light']: 'var(--metal-light)',
        ['--surface-2']: 'var(--surface-2)',
      }}
      onClick={e => {
        // click-to-center: find closest item by screen X using dataset index
        const target = e.target.closest?.('[data-idx]');
        if (target) {
          const idx = Number(target.getAttribute('data-idx'));
          const angleAtRot = (idx / (n - 1) - 0.5) * arcDeg + rot;
          if (Math.abs(angleAtRot) > 6) ctrl.api.centerOn(idx);
          else onSelect(idx);
        }
      }}
    >
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {items.map((it, i) => {
          const { baseAngle, approxZ, transform } = computePose(
            i,
            n,
            rot,
            arcDeg,
            radius,
            tiltDeg,
            orientation
          );
          // simple virtualization: render only within arc + margin
          const visible = Math.abs(baseAngle) <= arcDeg / 2 + 35;
          if (!visible) return null;
          return (
            <div
              key={i}
              data-idx={i}
              role="option"
              aria-selected={i === nearestIndexFromRot(rot, n, arcDeg)}
              className="will-change-transform"
              style={{
                position: 'absolute',
                transform,
                zIndex: 1000 + Math.round(approxZ),
                backfaceVisibility: 'hidden',
              }}
            >
              <MetalFrame size={itemSize} frame={frameWidth}>
                {typeof it === 'string' ? (
                  <img
                    src={it}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 12,
                    }}
                  />
                ) : (
                  it
                )}
              </MetalFrame>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default function Gallery() {
  const t = useTranslations('gallery');
  const galleryRef = useRef(null);

  // Create gallery items using translation data
  const galleryItems = [
    { id: 'clinic', label: t('cases.clinic') },
    { id: 'ecom', label: t('cases.ecom') },
    { id: 'google', label: t('cases.google') },
    { id: 'meta', label: t('cases.meta') },
    { id: 'keitaro', label: t('cases.keitaro') },
    { id: 'whitepage', label: t('cases.whitepage') },
  ];

  // Convert to display elements for the Arc Gallery
  const items = galleryItems.map((item, i) => (
    <div
      key={item.id}
      className="w-full h-full grid place-items-center text-sm font-medium"
      style={{
        background: 'var(--bg-secondary)',
        color: 'var(--text)',
        padding: '8px',
      }}
    >
      <div className="text-center">
        <div className="text-2xl mb-2">
          {i === 0
            ? '🏥'
            : i === 1
              ? '🛒'
              : i === 2
                ? '🎯'
                : i === 3
                  ? '📱'
                  : i === 4
                    ? '📊'
                    : '🔒'}
        </div>
        <div className="text-xs leading-tight">{item.label}</div>
      </div>
    </div>
  ));

  const handleSelect = index => {
    // Could navigate to a detail page or open a modal
    console.log('Selected item:', galleryItems[index]); // eslint-disable-line no-console
  };

  return (
    <section
      id="gallery"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text)]">
          {t('title')}
        </h2>
        <p className="mt-3 text-[var(--text)] opacity-70">
          Arc Gallery concept - 3D interactive showcase
        </p>
        <a
          href="#contact"
          className="mt-4 inline-block text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
        >
          {t('ctaText')}
        </a>
      </div>

      {/* Arc Gallery Integration */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors"
            onClick={() => galleryRef.current?.prev()}
          >
            ← Prev
          </button>
          <button
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors"
            onClick={() => galleryRef.current?.next()}
          >
            Next →
          </button>
          <button
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
            onClick={() => galleryRef.current?.centerOn(2)}
          >
            Center #3
          </button>
        </div>

        <ArcGallery
          ref={galleryRef}
          items={items}
          arcDeg={120}
          radius={280}
          tiltDeg={7}
          itemSize={120}
          frameWidth={10}
          onSelect={handleSelect}
          snap={true}
          autoplay={false}
          className="max-w-full"
        />

        <p className="text-xs text-[var(--text)] opacity-60 text-center max-w-lg">
          Interactive 3D gallery: drag to rotate, click items to center them,
          use arrow keys for navigation
        </p>
      </div>
    </section>
  );
}
