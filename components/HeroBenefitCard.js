'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

const BENEFIT_KEYS = [
  'turnkey',
  'analytics',
  'advertising',
  'quickStart',
  'minimal',
  'support',
  'reports',
  'scalability',
];

const ROTATION_INTERVAL = 5000; // 5 seconds

export default function HeroBenefitCard() {
  const t = useTranslations('hero.benefits');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const currentBenefit = BENEFIT_KEYS[currentIndex];

  // Auto-rotation logic
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % BENEFIT_KEYS.length);
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

  const fadeVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div
      ref={containerRef}
      className="mt-2 h-20 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Rotating benefits"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBenefit}
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full"
        >
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 h-full flex flex-col justify-center">
            <h3 className="text-base font-semibold text-[var(--text)] mb-1 line-clamp-1">
              {t(`${currentBenefit}.title`)}
            </h3>
            <p className="text-sm text-[var(--text)] opacity-80 line-clamp-2 leading-relaxed">
              {t(`${currentBenefit}.text`)}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="mt-2 flex justify-center gap-1">
        {BENEFIT_KEYS.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-6 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-[var(--primary)]'
                : 'bg-[var(--border)]'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
