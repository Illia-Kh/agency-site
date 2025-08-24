// COMMENTED OUT - OLD GALLERY COMPONENT
// This component has been replaced with a new clean GalleryGearRing implementation

// Temporary placeholder - this file should be removed in future iterations
export default function Gallery() {
  return null;
}

/*
// OLD IMPLEMENTATION - COMMENTED OUT FOR REFERENCE
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Gallery() {
  // Gallery items with placeholder images
  const galleryItems = [
    { id: 1, imageSrc: '/gallery/demo1.png' },
    { id: 2, imageSrc: '/gallery/demo2.png' },
    { id: 3, imageSrc: '/gallery/demo3.png' },
    { id: 4, imageSrc: '/gallery/demo4.png' },
    { id: 5, imageSrc: '/gallery/demo5.png' },
  ];

  const [currentIndex, setCurrentIndex] = useState(2); // Start with middle card active
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // ... rest of the complex implementation was here ...

  return (
    <section id="gallery" className="w-full bg-graphite-950 py-16">
      // ... complex gallery implementation was here ...
    </section>
  );
}
*/
