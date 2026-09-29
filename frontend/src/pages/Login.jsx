import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginOptions from '../components/auth/LoginOptions';
import { useLoading } from '../App';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import Glow from '../components/Glow';
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { springSoft, staggerContainer, staggerItem } from '../utils/motion';

// ─── Sample report preview ──────────────────────────────────
// Illustrative content for the visual panel, labelled as a sample on screen.
// It mirrors the real report's sections so the page shows the product rather
// than describing it.
const SAMPLE = {
  score: 82,
  bars: [
    { label: 'ATS match', value: 88 },
    { label: 'Technical depth', value: 79 },
    { label: 'Impact & ownership', value: 71 },
  ],
  flags: [
    'Add numbers to the payments migration: how many users, how much faster?',
    'Lead each bullet with the outcome, not the responsibility.',
  ],
  keywords: ['Kubernetes', 'CI/CD', 'System design'],
};

const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;

function ScoreRing({ value }) {
  return (
    <div className="relative h-24 w-24 flex-shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={RING_R} fill="none" strokeWidth="7" className="stroke-white/[0.07]" />
        <motion.circle
          cx="40" cy="40" r={RING_R} fill="none" strokeWidth="7" strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={RING_C}
          initial={{ strokeDashoffset: RING_C }}
          animate={{ strokeDashoffset: RING_C * (1 - value / 100) }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold tabular-nums leading-none text-ink">{value}</span>
        <span className="mt-0.5 text-[10px] font-medium text-ink-faint">/ 100</span>
      </div>
    </div>
  );
}

function SampleReport() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative mx-auto w-full max-w-[420px]"
    >
      {/* Main report card */}
      <motion.div
        variants={staggerItem}
        className="relative rounded-2xl border border-line-strong bg-surface-raised p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white/[0.04]">
              <DocumentTextIcon className="h-4 w-4 text-ink-muted" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">resume.pdf</p>
              <p className="text-[11px] text-ink-faint">Sample report</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400">
            <CheckBadgeIcon className="h-3.5 w-3.5" /> Likely to pass
          </span>
        </div>

        <div className="flex items-center gap-6">
          <ScoreRing value={SAMPLE.score} />
          <div className="flex-1 space-y-3">
            {SAMPLE.bars.map((bar, i) => (
              <div key={bar.label}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-ink-muted">{bar.label}</span>
                  <span className="font-semibold tabular-nums text-ink">{bar.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                    className="h-full w-full origin-left rounded-full bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: bar.value / 100 }}
                    transition={{ duration: 0.9, delay: 0.45 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">Missing keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE.keywords.map((kw) => (
              <span key={kw} className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary-light">
                + {kw}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recruiter feedback card, overlapping the report */}
      <motion.div
        variants={staggerItem}
        className="relative -mt-6 ml-10 mr-[-2rem] rounded-2xl border border-line-strong bg-surface p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
      >
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-ink-faint">What a recruiter would flag</p>
        <ul className="space-y-2.5">
          {SAMPLE.flags.map((flag) => (
            <li key={flag} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-muted">
              <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
              {flag}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────

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
      <div className="flex min-h-screen items-center justify-center bg-surface-void">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // The route's PageTransition already fades the page in; no second fade here.
  return (
    <div className="grid min-h-screen bg-surface-void selection:bg-primary/30 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">

      {/* FORM SIDE */}
      <div className="relative flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14">
        <Glow className="left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 lg:hidden" strength={0.12} />

        <header className="relative z-10">
          <Link
            to="/"
            aria-label="ResumeZen home"
            className="inline-flex rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Logo size="md" />
          </Link>
        </header>

        <main className="relative z-10 flex flex-1 items-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: springSoft }}
            className="mx-auto w-full max-w-sm"
          >
            <h1 className="mb-3 font-display text-3xl font-semibold tracking-tight text-ink [text-wrap:balance] sm:text-4xl">
              Welcome to ResumeZen
            </h1>
            <p className="mb-8 text-base leading-relaxed text-ink-muted">
              Sign in to score your resume, see what a recruiter would flag, and find roles that fit.
            </p>

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

            <LoginOptions onError={handleError} onSuccessNavigation={handleNavigate} />
          </motion.div>
        </main>

        <footer className="relative z-10 flex items-center justify-between text-xs text-ink-faint">
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-md py-1 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
          <span>© {new Date().getFullYear()} ResumeZen</span>
        </footer>
      </div>

      {/* VISUAL SIDE — sample report, large screens only */}
      <div className="hidden p-3 lg:block">
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface px-12 py-14 xl:px-16">
          {/* Faint grid, faded toward the edges */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />
          <Glow className="left-1/2 top-[38%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2" strength={0.2} />

          <div className="relative z-10 flex flex-1 items-center justify-center pb-10">
            <SampleReport />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { ...springSoft, delay: 0.25 } }}
            className="relative z-10 max-w-md"
          >
            <h2 className="mb-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink [text-wrap:balance] xl:text-4xl">
              Know exactly what to fix before you apply.
            </h2>
            <p className="text-base leading-relaxed text-ink-muted">
              A scored report, recruiter-style feedback and the keywords you&apos;re missing, in about a minute.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
