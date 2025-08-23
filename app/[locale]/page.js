import Hero from '@/components/Hero';
import About from '@/components/About';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';
import { getHeroMediaFiles } from '@/lib/getHeroMediaFiles';

export default async function Home() {
  // Fetch hero media files on the server
  const heroMediaItems = await getHeroMediaFiles();

  return (
    <main className="flex min-h-screen flex-col">
      <Hero heroMediaItems={heroMediaItems} />
      <About />
      <Gallery />
      <Footer />
    </main>
  );
}
