'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

// Using only first 4 benefits as per requirements
const BENEFIT_KEYS = ['turnkey', 'analytics', 'advertising', 'quickStart'];

// Faster checkmark draw and switch 1s after it finishes
const CHECKMARK_DURATION = 1000; // 1.0s draw
const AFTER_DRAW_DELAY = 2000; // switch 2s after drawing completes
const ROTATION_INTERVAL = CHECKMARK_DURATION + AFTER_DRAW_DELAY; // total ~2s per card

// Checkmark SVG component with animation
function AnimatedCheckmark({ activationKey }) {
  const safeId = String(activationKey || 'chk').replace(/[^a-zA-Z0-9_-]/g, '');
  const brushId = `brush-${safeId}`;
  const neonId = `neon-${safeId}`;
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        key={`chk-${activationKey}`}
        width="100%"
        height="100%"
        viewBox="0 0 48 48"
        fill="none"
        shapeRendering="geometricPrecision"
        className="saturate-150 translate-y-[1px]"
        style={{ ['--chk-duration']: `${CHECKMARK_DURATION}ms` }}
      >
        <defs>
          <filter
            id={brushId}
            filterUnits="objectBoundingBox"
            x="-0.08"
            y="-0.08"
            width="1.16"
            height="1.16"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="1"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="0.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id={neonId} x="-0.08" y="-0.08" width="1.16" height="1.16">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M8 31 L18 41 L40 19"
          stroke="#00ffa3"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${neonId})`}
          pathLength="1"
          className="chk-path chk-glow"
        />
        <path
          d="M8 31 L18 41 L40 19"
          stroke="#00e07a"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${brushId})`}
          pathLength="1"
          className="chk-path"
        />
      </svg>
    </div>
  );
}

export default function HeroBenefitCard() {
  const t = useTranslations('hero.benefits');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const currentBenefit = BENEFIT_KEYS[currentIndex];

  // Auto-rotation logic with checkmark timing
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Switch to the next card AFTER_DRAW_DELAY after draw completes
    timerRef.current = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % BENEFIT_KEYS.length);
      setCycle(c => c + 1);
    }, ROTATION_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isPaused]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setIsPaused(true);
    }
  }, []);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (!prefersReducedMotion) {
      setIsPaused(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div
      ref={containerRef}
      className="mt-6 max-md:order-1 max-md:mt-6"
      role="region"
      aria-label="Rotating benefits"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.a
          key={currentBenefit}
          href="#about"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="block rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 min-h-[100px] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--bg-secondary)_85%,var(--text))] focus:bg-[color-mix(in_oklab,var(--bg-secondary)_85%,var(--text))] focus:outline-2 focus:outline-[var(--focus)] cursor-pointer"
          aria-label={t('readMore')}
        >
          <div className="flex items-stretch justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[var(--text)] mb-2 leading-tight">
                {t(`${currentBenefit}.title`)}
              </h3>
              <p className="text-sm text-[var(--text)] opacity-80 leading-relaxed break-words">
                {t(`${currentBenefit}.text`)}
              </p>
            </div>
            <div className="flex-shrink-0 self-center w-12 h-12 rounded-md border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-secondary)_85%,transparent)] overflow-hidden">
              <div className="w-full h-full p-1 grid place-items-center">
                <AnimatedCheckmark
                  activationKey={`${BENEFIT_KEYS[currentIndex]}-${cycle}`}
                />
              </div>
            </div>
          </div>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
