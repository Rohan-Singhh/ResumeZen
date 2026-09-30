import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import SuccessStories from '../components/SuccessStories';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { buttonClasses } from '../components/ui/Button';

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-surface-void text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-surface-void/85 backdrop-blur-md">
        <div className="shell flex h-[var(--nav-h)] items-center justify-between">
          <Link to="/" aria-label="ResumeZen home" className="-ml-1 inline-flex rounded-md p-1">
            <Logo size="md" />
          </Link>
          <Link to="/" className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'group' })}>
            <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform duration-base ease-out group-hover:-translate-x-0.5" />
            Back to home
          </Link>
        </div>
      </header>

      <main>
        <SuccessStories />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
