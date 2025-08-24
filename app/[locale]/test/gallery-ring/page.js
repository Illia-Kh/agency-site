import GalleryRing from '../../../../components/GalleryRing';

export default function GalleryRingTest() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-[var(--text)]">
          GalleryRing Component Test
        </h1>
        <GalleryRing />

        <div className="mt-16 text-center text-[var(--text)] opacity-60">
          <p>• Click any card to center it</p>
          <p>• Auto-rotation every 4 seconds</p>
          <p>• Hover to pause rotation</p>
          <p>• Responsive design: mobile-first with desktop scaling</p>
        </div>
      </div>
    </div>
  );
}
