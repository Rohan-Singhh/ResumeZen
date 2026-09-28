import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginOptions from '../components/auth/LoginOptions';
import { useLoading } from '../App';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { staggerContainer, staggerItem } from '../utils/motion';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  exit: { opacity: 0 }
};

// What the product actually does — no invented scores or growth figures
const VALUE_POINTS = [
  {
    icon: ChartBarIcon,
    title: 'Scored, not guessed',
    body: 'An overall score with an ATS, technical-depth and impact breakdown.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Recruiter-style review',
    body: 'Specific feedback on what a screener would question, and why.',
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Keyword gaps',
    body: 'The terms your resume is missing for the roles it targets.',
  },
  {
    icon: BriefcaseIcon,
    title: 'Matched jobs',
    body: 'Open roles ranked against the skills in your latest resume.',
  },
];

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
      <div className="min-h-screen flex items-center justify-center bg-surface-void">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col lg:flex-row relative bg-surface-void selection:bg-primary/30"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Static accent wash — replaces the WebGL scene, which cost a three.js
          bundle and a GPU loop on the one page that should load fastest */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 50% at 75% 40%, rgba(124,108,246,0.10), transparent 65%), radial-gradient(40% 35% at 15% 85%, rgba(124,108,246,0.06), transparent 60%)',
        }}
      />

      {/* LEFT COLUMN: sign-in */}
      <div className="relative z-10 flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[45%] lg:px-20 lg:py-0 xl:w-[40%]">

        <button
          onClick={() => navigate('/')}
          className="group absolute left-6 top-8 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:left-12 lg:left-20"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </button>

        <div className="mx-auto mt-16 w-full max-w-[420px] lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-surface-raised">
              <span className="font-display text-sm font-bold text-ink">RZ</span>
            </div>
            <h1 className="mb-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Sign in to ResumeZen
            </h1>
            <p className="mb-8 text-base text-ink-muted">
              Pick up where you left off with your resume reports.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10"
                >
                  <div className="flex items-start gap-3 px-4 py-3.5">
                    <ExclamationCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                    <p className="text-sm font-medium leading-relaxed text-red-300">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7">
              <LoginOptions
                onError={handleError}
                onSuccessNavigation={handleNavigate}
              />
            </div>

            <p className="mt-10 text-center text-xs text-ink-faint">
              © {new Date().getFullYear()} ResumeZen
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT COLUMN: what you get */}
      <div className="relative z-10 hidden flex-1 items-center border-l border-line p-14 lg:flex xl:p-20">
        <div className="mx-auto w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              What you get
            </p>
            <h2 className="mb-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink xl:text-5xl">
              Know exactly what to fix before you apply.
            </h2>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-ink-muted">
              Upload a PDF and get a structured report in about a minute.
            </p>
          </motion.div>

          <motion.ul
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-3"
          >
            {VALUE_POINTS.map(({ icon: Icon, title, body }) => (
              <motion.li
                key={title}
                variants={staggerItem}
                className="rounded-xl border border-line bg-surface p-5"
              >
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <p className="mb-1 font-display text-sm font-semibold text-ink">{title}</p>
                <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </motion.div>
  );
}
