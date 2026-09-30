import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import InkLandscape from '../components/graphics/InkLandscape';
import Logo from '../components/Logo';
import { buttonClasses } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { ease } from '../utils/motion';

/**
 * 404. Unknown addresses used to render a blank page; this says what happened
 * and offers the two places a lost visitor most likely wanted.
 */
export default function NotFound() {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-surface-void">
      <InkLandscape seed={53} horizon={0.8} relief={0.7} sun={false} className="absolute inset-0 -z-10 opacity-80" />

      <header className="shell flex h-[var(--nav-h)] items-center">
        <Link to="/" aria-label="ResumeZen home" className="-ml-1 inline-flex rounded-md p-1">
          <Logo size="md" />
        </Link>
      </header>

      <main className="shell flex flex-1 items-center pb-[18vh]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: ease.out }}
          className="max-w-xl"
        >
          <p className="t-label mb-6 flex items-center gap-3">
            <span className="text-primary-light">404</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
            Page not found
          </p>
          <h1 className="t-h1">Nothing is written <em className="t-em">here.</em></h1>
          <p className="t-lead mt-6">
            There is no page at <span className="break-all font-mono text-[0.9em] text-ink">{pathname}</span>.
            The link may be old, or the address mistyped.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/" className={buttonClasses({ size: 'lg' })}>
              <ArrowLeftIcon className="h-4 w-4" /> Back to home
            </Link>
            <Link to={currentUser ? '/dashboard' : '/login'} className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
              {currentUser ? 'Open dashboard' : 'Sign in'}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
