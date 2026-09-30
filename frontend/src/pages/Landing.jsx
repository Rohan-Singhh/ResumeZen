import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Steps from '../components/Steps';
import Pricing from '../components/Pricing';
import Reviews from '../components/Reviews';
import FAQ from '../components/FAQ';
import Support from '../components/Support';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();

  // Clear any logout flags when landing page mounts
  useEffect(() => {
    if (location.state?.fromLogout || sessionStorage.getItem('logoutInProgress') === 'true') {
      sessionStorage.removeItem('logoutInProgress');

      // Replace the current history entry to remove the fromLogout state
      if (location.state?.fromLogout) {
        navigate('/', { replace: true, state: {} });
      }
    }
  }, [location, navigate]);

  return (
    <>
      <Navbar />
      <main className="bg-surface-void text-ink">
        <Hero />
        <Features />
        <Steps />
        <Pricing />
        <Reviews />
        <FAQ />
        <Support />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
