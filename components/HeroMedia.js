import MediaCarousel from './carousel/MediaCarousel';

export default function HeroMedia({ items = [] }) {
  return (
    <section className="relative w-full py-8 sm:py-12">
      <MediaCarousel items={items} variant="hero" />
    </section>
  );
}
