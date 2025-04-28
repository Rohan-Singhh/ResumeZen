import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Steps from '../components/Steps';
import Pricing from '../components/Pricing';
import Reviews from '../components/Reviews';
import FAQ from '../components/FAQ';
import Support from '../components/Support';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <Steps />
      <Pricing />
      <Reviews />
      <FAQ />
      <Support />
    </div>
  );
}