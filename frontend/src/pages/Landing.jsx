import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Steps from '../components/Steps';
import Features from '../components/Features';
import Reviews from '../components/Reviews';
import Pricing from '../components/Pricing';
import Support from '../components/Support';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Steps />
      <Features />
      <Reviews />
      <Pricing />
      <Support />
    </div>
  );
}