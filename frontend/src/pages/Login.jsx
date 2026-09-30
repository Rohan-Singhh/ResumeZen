import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import LoginOptions from '../components/auth/LoginOptions';
import { useLoading } from '../App';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import Spinner from '../components/ui/Spinner';
import InkLandscape from '../components/graphics/InkLandscape';
import ResumeSheet from '../components/graphics/ResumeSheet';
import { ease, springGentle } from '../utils/motion';

const rise = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: ease.out },
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  // LoginOptions sends users back here with a reason when the backend
  // handshake fails after Google sign-in
  const [error, setError] = useState(location.state?.authError || '');
  const navigatingRef = useRef(false);
  const { setLoading } = useLoading();
  // AuthContext already owns the Firebase listener; reuse its "checked" flag
  // instead of subscribing a second (and, with LoginOptions, third) listener.
  const { currentUser, authStatusChecked } = useAuth();

  // state may carry only authError, so default the redirect target independently
  const fromPath = location.state?.from?.pathname || '/dashboard';

  const handleError = useCallback((message) => {
    setError(message);
  }, []);

  const handleNavigate = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;

    setLoading(false);
    navigate(fromPath, { replace: true });
  }, [navigate, fromPath, setLoading]);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (currentUser) handleNavigate();
  }, [currentUser, handleNavigate]);

  if (!authStatusChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-void text-ink-muted" role="status" aria-label="Checking your session">
        <Spinner size={28} />
      </div>
    );
  }

  // The route's PageTransition already fades the page in; no second fade here.
  return (
    <div className="grid grid-cols-1 min-h-screen bg-surface-void lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">

      {/* FORM SIDE */}
      <div className="relative flex min-h-screen flex-col px-6 pb-7 sm:px-10 lg:px-14">
        {/* Small screens get the scene as a quiet backdrop instead of a panel */}
        <InkLandscape seed={17} horizon={0.78} relief={0.75} sun="right-7 top-24 h-16 w-16" className="absolute inset-0 opacity-70 lg:hidden" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-surface-void via-surface-void/85 to-transparent lg:hidden" />

        <header className="relative z-10 flex h-[var(--nav-h)] items-center">
          <Link to="/" aria-label="ResumeZen home" className="-ml-1 inline-flex rounded-md p-1">
            <Logo size="md" />
          </Link>
        </header>

        <main className="relative z-10 flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-[23rem]">
            <motion.p {...rise(0)} className="t-label mb-6 flex items-center gap-2.5 text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Sign in
            </motion.p>
            <motion.h1 {...rise(0.06)} className="t-h1 !text-[clamp(2.1rem,4vw,2.9rem)]">
              Let&apos;s read <em className="t-em">yours.</em>
            </motion.h1>
            <motion.p {...rise(0.12)} className="t-lead mt-5 !text-[1.0625rem]">
              Sign in to upload a resume, get the marked-up report, and see roles that fit.
            </motion.p>

            <motion.div {...rise(0.2)} className="mt-9">
              <AnimatePresence>
                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: ease.out }}
                    className="overflow-hidden"
                  >
                    <div className="mb-5 flex items-start gap-2.5 rounded-md border border-bad/25 bg-bad/10 px-4 py-3">
                      <ExclamationCircleIcon className="mt-px h-5 w-5 flex-shrink-0 text-bad" />
                      <p className="text-sm leading-relaxed text-bad">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <LoginOptions onError={handleError} onSuccessNavigation={handleNavigate} />
            </motion.div>
          </div>
        </main>

        <footer className="relative z-10 flex items-center justify-between">
          <Link to="/" className="group inline-flex items-center gap-1.5 rounded py-1 text-[0.8125rem] text-ink-muted hover:text-ink">
            <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform duration-base ease-out group-hover:-translate-x-0.5" />
            Back to home
          </Link>
          <span className="t-meta">© {new Date().getFullYear()} ResumeZen</span>
        </footer>
      </div>

      {/* SCENE SIDE — large screens only */}
      <div className="hidden p-3 lg:block">
        <div className="relative isolate flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line px-12 pb-12 pt-14 xl:px-16">
          <InkLandscape
            seed={17}
            horizon={0.7}
            sun="left-[calc(50%-15rem)] top-[11%] h-52 w-52"
            className="absolute inset-0 -z-10"
          />

          <div className="flex flex-1 items-center justify-center pb-10">
            <motion.div
              initial={{ opacity: 0, y: 50, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 1.5 }}
              transition={{ ...springGentle, delay: 0.15 }}
              className="w-full max-w-[28rem]"
            >
              <ResumeSheet play delay={0.9} className="w-full text-[11px] xl:text-[12px]" />
            </motion.div>
          </div>

          <motion.div {...rise(0.4)} className="max-w-md">
            <p className="t-h2">Know what to fix before you apply.</p>
            <p className="t-body mt-3">
              A score, a recruiter&apos;s notes and the keywords you&apos;re missing, in about a minute.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
