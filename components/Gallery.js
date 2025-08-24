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
function computePose(
  i,
  n,
  rotDeg,
  arcDeg,
  radius,
  tiltEdgeDeg,
  tiltCenterDeg,
  tiltPower,
  orientation
) {
  const t = n > 1 ? i / (n - 1) - 0.5 : 0; // -0.5..0.5
  const baseAngle = t * arcDeg + rotDeg; // degrees
  const rad = toRad(baseAngle);
  const approxZ = Math.cos(rad) * radius; // for zIndex sorting
  const edge = arcDeg / 2 || 1;
  const centerFactor =
    1 - Math.min(1, Math.pow(Math.abs(baseAngle) / edge, tiltPower)); // 0..1 (центр=1)
  const yawAbs = tiltEdgeDeg + (tiltCenterDeg - tiltEdgeDeg) * centerFactor;
  const yawTilt = (Math.sign(baseAngle) || 1) * Math.min(Math.abs(yawAbs), 20);
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
function MetalFrame({ width, height, frame, lightAngle = 30, children }) {
  const borderR = 16;
  return (
    <div
      className="relative"
      style={{
        width,
        height,
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
    radius = 820,
    arcDeg = 84,
    // базовый «диапазон» наклона разобьём на край/центр
    tiltEdgeDeg = 1.5,
    tiltCenterDeg = 8,
    tiltPower = 1.1,
    orientation = 'outward',
    itemW = 234, // «маленький телефон» в CSS-px
    itemH = 416, // 9:16
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

  // Если в пропсы не передали items — подставим 9 нумерованных карточек
  const defaultItems = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          className="w-full h-full grid place-items-center text-3xl font-medium"
          style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
        >
          {i + 1}
        </div>
      )),
    []
  );

  const ctrl = useArcController({
    count: (items && items.length ? items : defaultItems).length,
    arcDeg,
    radius,
    tiltDeg: tiltCenterDeg, // Use center tilt for controller compatibility
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
  const n = (items && items.length ? items : defaultItems).length;
  const rot = ctrl.state.rot;

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label="3D arc gallery"
      tabIndex={-1}
      className={`relative mx-auto select-none ${className}`}
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        height: itemH * 1.08,
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
        {(items && items.length ? items : defaultItems).map((it, i) => {
          const { baseAngle, approxZ, transform } = computePose(
            i,
            n,
            rot,
            arcDeg,
            radius,
            tiltEdgeDeg,
            tiltCenterDeg,
            tiltPower,
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
              <MetalFrame width={itemW} height={itemH} frame={frameWidth}>
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

  const handleSelect = index => {
    // Could navigate to a detail page or open a modal
    console.log('Selected item:', index); // eslint-disable-line no-console
  };

  // Create actual gallery items with case study content
  const galleryItems = useMemo(
    () => [
      <GalleryCard
        key="clinic"
        title={t('cases.clinic')}
        details={t('details')}
      />,
      <GalleryCard key="ecom" title={t('cases.ecom')} details={t('details')} />,
      <GalleryCard
        key="google"
        title={t('cases.google')}
        details={t('details')}
      />,
      <GalleryCard key="meta" title={t('cases.meta')} details={t('details')} />,
      <GalleryCard
        key="keitaro"
        title={t('cases.keitaro')}
        details={t('details')}
      />,
      <GalleryCard
        key="whitepage"
        title={t('cases.whitepage')}
        details={t('details')}
      />,
      <GalleryCard key="extra1" title="Case Study 7" details={t('details')} />,
      <GalleryCard key="extra2" title="Case Study 8" details={t('details')} />,
      <GalleryCard key="extra3" title="Case Study 9" details={t('details')} />,
    ],
    [t]
  );

  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ArcGallery
          ref={galleryRef}
          items={galleryItems}
          onSelect={handleSelect}
          snap={true}
          autoplay={false}
          className="w-full"
        />
      </div>
    </section>
  );
}

// Gallery Card Component
function GalleryCard({ title, details = 'Details' }) {
  return (
    <div className="w-full h-full flex flex-col bg-[var(--surface-elevated)] text-[var(--text)]">
      {/* Image placeholder */}
      <div className="flex-1 bg-gradient-to-br from-[var(--primary-200)] to-[var(--primary-400)] flex items-center justify-center">
        <div className="text-white text-lg font-medium opacity-80">Preview</div>
      </div>

      {/* Case title */}
      <div className="p-4 text-center">
        <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        <p className="text-xs text-[var(--text)] opacity-60 mt-1">{details}</p>
      </div>
    </div>
  );
}
