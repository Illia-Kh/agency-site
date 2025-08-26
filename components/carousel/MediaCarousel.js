'use client';
import { useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

export default function MediaCarousel({ items = [], variant = 'hero' }) {
  const autoplayRef = useRef(
    Autoplay({
      delay: 3500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 20,
    },
    [autoplayRef.current]
  );

  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  // IntersectionObserver for autoplay pause when out of viewport
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Control autoplay based on visibility
  useEffect(() => {
    if (!emblaApi || !autoplayRef.current) return;

    if (isVisible) {
      autoplayRef.current.play();
    } else {
      autoplayRef.current.stop();
    }
  }, [emblaApi, isVisible]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion && autoplayRef.current) {
      autoplayRef.current.stop();
    }
  }, []);

  if (!items.length) {
    return null;
  }

  // Variant-specific styling
  const getWrapperClasses = () => {
    if (variant === 'hero') {
      return `
        aspect-[9/16] rounded-2xl border border-[var(--border)] bg-[var(--surface)]
        overflow-hidden max-w-[540px] sm:max-w-[600px]
      `.trim();
    }

    if (variant === 'gallery') {
      return `
        aspect-[16/9] sm:aspect-[2/1] rounded-2xl border border-[var(--border)] 
        bg-[var(--surface)] overflow-hidden max-w-6xl
      `.trim();
    }

    return '';
  };

  const getMaxHeight = () => {
    if (variant === 'hero') {
      return { maxHeight: 'calc(100svh - var(--header-h) - 24px)' };
    }
    return {};
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${getWrapperClasses()}`}
      style={getMaxHeight()}
    >
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="embla__slide flex-none w-full relative"
            >
              {item.type === 'video' ? (
                <video
                  src={item.src}
                  poster={item.poster}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  autoPlay
                  loop
                  controls={false}
                  aria-label={item.alt || item.altKey || ''}
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt || item.altKey || ''}
                  fill
                  className="object-cover"
                  sizes={
                    variant === 'hero'
                      ? '(max-width: 640px) 540px, 600px'
                      : '(max-width: 1536px) 100vw, 1536px'
                  }
                  priority={index === 0}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots for multiple items */}
      {items.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1 z-20">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
              style={{
                backgroundColor: 'var(--white)',
                opacity: 0.6,
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
