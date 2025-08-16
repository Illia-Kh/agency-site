import Hero from '@/components/Hero';
import About from '@/components/About';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <About />
      <Gallery />
      <Footer />
    </main>
  );
}
