import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Steps from '../components/Steps';
import Pricing from '../components/Pricing';
import Reviews from '../components/Reviews';
import FAQ from '../components/FAQ';
import Support from '../components/Support';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();

  // Clear any logout flags when landing page mounts
  useEffect(() => {
    // If we're coming from logout, ensure all loading flags are cleared
    if (location.state?.fromLogout || sessionStorage.getItem('logoutInProgress') === 'true') {
      console.log('Clearing logout flags on landing page');
      sessionStorage.removeItem('logoutInProgress');
      
      // Replace the current history entry to remove the fromLogout state
      if (location.state?.fromLogout) {
        navigate('/', { replace: true, state: {} });
      }
    }
  }, [location, navigate]);

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