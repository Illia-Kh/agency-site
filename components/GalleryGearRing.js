import Image from 'next/image';

export default function GalleryGearRing() {
  // Static items array with 5 demo entries
  const items = [
    { id: 1, image: '/gallery/demo1.png' },
    { id: 2, image: '/gallery/demo2.png' },
    { id: 3, image: '/gallery/demo3.png' },
    { id: 4, image: '/gallery/demo4.png' },
    { id: 5, image: '/gallery/demo5.png' },
  ];

  return (
    <section className="flex justify-center items-center gap-4 py-8">
      {items.map(item => (
        <div
          key={item.id}
          className="w-24 sm:w-32 md:w-40 aspect-[9/16] rounded-2xl border border-gray-300/70 bg-graphite-900 overflow-hidden shadow-[0_0_6px_rgba(192,192,192,0.9),0_0_20px_rgba(192,192,192,0.2)]"
        >
          <Image
            src={item.image}
            alt={`Gallery item ${item.id}`}
            width={180}
            height={320}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      ))}
    </section>
  );
}
