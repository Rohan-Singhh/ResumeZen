import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Steps from '../components/Steps';
import Pricing from '../components/Pricing';
import Reviews from '../components/Reviews';
import FAQ from '../components/FAQ';
import Support from '../components/Support';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const handleShowSuccessStories = () => {
    navigate('/success-stories');
  };

  return (
    <main className="bg-white">
      <Navbar />
      <Hero onShowSuccessStories={handleShowSuccessStories} />
      <Features />
      <Steps />
      <Pricing />
      <Reviews />
      <FAQ />
      <Support />
    </main>
  );
}