'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import FannedReel from './gallery/FannedReel';
import type { GalleryItem } from '@/types/gallery';

const galleryItems: GalleryItem[] = [
  {
    id: 'clinic-landing',
    title: 'Clinic Landing',
    kind: 'image',
    src: '/media/gallery/clinic-landing.svg',
    alt: 'Clinic landing vertical preview',
  },
  {
    id: 'auto-service',
    title: 'Auto Service Promo',
    kind: 'image',
    src: '/media/gallery/auto-service.svg',
    alt: 'Auto service promo vertical',
  },
  {
    id: 'cafe-delivery',
    title: 'Cafe Delivery',
    kind: 'image',
    src: '/media/gallery/cafe-delivery.svg',
    alt: 'Cafe delivery app vertical',
  },
  {
    id: 'ecom-store',
    title: 'eCom Store',
    kind: 'image',
    src: '/media/gallery/ecom-store.svg',
    alt: 'eCommerce storefront vertical',
  },
];

export default function Gallery() {
  const router = useRouter();

  const handleSelect = (item: GalleryItem) => {
    router.push(`/en/contact?case=${item.id}`);
  };

  return (
    <section
      id="gallery"
      className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:pb-20"
    >
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text)]">
          Gallery / Cases
        </h2>
        <a
          href={`/en/contact?case=${galleryItems[0]?.id ?? 'case'}`}
          className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 rounded"
        >
          I want one like this →
        </a>
      </div>

      {/* Check for prefers-reduced-motion and provide fallback */}
      <div className="motion-safe:hidden">
        {/* Fallback simple grid for reduced motion */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {galleryItems.map(item => (
            <figure
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]"
            >
              <div className="aspect-[9/16] bg-[var(--surface-elevated)] flex items-center justify-center">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={340}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="flex items-center justify-between px-4 py-3 text-sm text-[var(--text)]">
                <span>{item.title}</span>
                <a
                  href={`/en/contact?case=${item.id}`}
                  className="opacity-60 group-hover:opacity-100 text-[var(--primary)]"
                >
                  Details
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* FannedReel for normal motion */}
      <div className="motion-reduce:hidden">
        <FannedReel items={galleryItems} onSelect={handleSelect} />
      </div>
    </section>
  );
}
