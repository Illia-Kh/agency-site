'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

// Using only first 4 benefits as per requirements
const BENEFIT_KEYS = ['turnkey', 'analytics', 'advertising', 'quickStart'];

const CHECKMARK_DURATION = 3000; // 3 seconds for checkmark animation
const BUFFER_DURATION = 1000; // 1 second buffer
const ROTATION_INTERVAL = CHECKMARK_DURATION + BUFFER_DURATION; // 4 seconds total

// Checkmark SVG component with animation
function AnimatedCheckmark({ isActive }) {
  const pathRef = useRef(null);

  useEffect(() => {
    if (isActive && pathRef.current) {
      const path = pathRef.current;
      const length = path.getTotalLength();

      // Reset the path
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.opacity = '1';

      // Animate the drawing
      const startTime = performance.now();

      const animate = currentTime => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / CHECKMARK_DURATION, 1);

        path.style.strokeDashoffset = length * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isActive]);

  return (
    <div className="w-6 h-6 flex items-center justify-center">
      {isActive && (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-[var(--success)]"
        >
          <path
            ref={pathRef}
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: 0,
              strokeDasharray: 0,
              strokeDashoffset: 0,
            }}
          />
        </svg>
      )}
    </div>
  );
}

export default function HeroBenefitCard() {
  const t = useTranslations('hero.benefits');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const timerRef = useRef(null);
  const checkmarkTimerRef = useRef(null);
  const containerRef = useRef(null);

  const currentBenefit = BENEFIT_KEYS[currentIndex];

  // Auto-rotation logic with checkmark timing
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (checkmarkTimerRef.current) {
        clearTimeout(checkmarkTimerRef.current);
        checkmarkTimerRef.current = null;
      }
      return;
    }

    // Show checkmark immediately when card appears
    setShowCheckmark(true);

    // Hide checkmark after 3 seconds and switch to next card after 4 seconds
    checkmarkTimerRef.current = setTimeout(() => {
      setShowCheckmark(false);
    }, CHECKMARK_DURATION);

    timerRef.current = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % BENEFIT_KEYS.length);
    }, ROTATION_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (checkmarkTimerRef.current) {
        clearTimeout(checkmarkTimerRef.current);
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
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[var(--text)] mb-2 leading-tight">
                {t(`${currentBenefit}.title`)}
              </h3>
              <p className="text-sm text-[var(--text)] opacity-80 leading-relaxed break-words">
                {t(`${currentBenefit}.text`)}
              </p>
            </div>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <AnimatedCheckmark isActive={showCheckmark} />
            </div>
          </div>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
