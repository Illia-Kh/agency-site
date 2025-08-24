'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src: string;
  poster?: string;
  className?: string;
};

export default function VideoSmart({
  src,
  poster,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  ...rest
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      return; // Don't auto-play if user prefers reduced motion
    }

    const observer: IntersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!el) return;
        if (entry.isIntersecting && autoPlay) {
          el.muted = true; // Ensure muted before play
          el.play().catch(() => {
            // Handle autoplay failure silently
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [autoPlay]);

  // Render poster image instead of video if prefers-reduced-motion
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion && poster) {
      return (
        <Image
          src={poster}
          alt=""
          fill
          className={className}
          style={{ objectFit: 'cover' }}
        />
      );
    }
  }

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      playsInline
      // @ts-ignore – Safari boolean attr
      webkit-playsinline="true"
      muted={muted}
      loop={loop}
      autoPlay={autoPlay}
      preload="metadata"
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      {...rest}
    />
  );
}
