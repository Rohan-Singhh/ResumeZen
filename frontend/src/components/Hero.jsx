import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import InkLandscape from './graphics/InkLandscape';
import ResumeSheet from './graphics/ResumeSheet';
import Enso from './graphics/Enso';
import { Underlined } from './graphics/Marks';
import Button from './ui/Button';
import { ease, springGentle } from '../utils/motion';
import { scrollToSection } from '../utils/scrollToSection';

// Illustrative numbers for the floating report card; they match the sample
// resume on the sheet beside it.
const SAMPLE = [
  { label: 'ATS match', value: 88 },
  { label: 'Technical depth', value: 79 },
  { label: 'Impact', value: 71 },
];

const FACTS = ['PDF, up to 5 MB', 'Report in about a minute', 'Sign in with Google'];

const rise = (delay) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: ease.out },
});

export default function Hero() {
  const navigate = useNavigate();
  const ref = useRef(null);

  // 0 while the hero fills the screen, 1 once it has scrolled away. Drives the
  // landscape's depth planes and lets the sheet drift up a little faster than
  // the page — all transforms, nothing that lays out.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const sheetY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section id="home" ref={ref} className="relative isolate overflow-hidden">
      {/* Scene. The sun is pinned to the sheet's corner (the sheet's left edge
          sits at 50% + 80px inside the 1200px shell), so the red disc rises
          from behind the paper at every desktop width. */}
      <InkLandscape
        progress={scrollYProgress}
        seed={11}
        mist
        sun="left-[74%] top-[5.25rem] h-20 w-20 sm:left-[77%] sm:top-20 sm:h-32 sm:w-32 lg:left-[calc(50%+22px)] lg:top-[calc(50%-330px)] lg:h-60 lg:w-60"
        className="absolute inset-0 -z-10"
      />
      {/* Ink pooled behind the copy so type never fights the ridges */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(11,10,9,0.86)_0%,rgba(11,10,9,0.55)_32%,rgba(11,10,9,0)_58%)]"
      />
      {/* The scene sinks into the page */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-surface-void to-transparent" />

      <div className="shell grid min-h-[100svh] grid-cols-1 items-center gap-14 pb-36 pt-[calc(var(--nav-h)+3rem)] sm:pb-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-10 lg:pb-28">
        {/* Copy */}
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="max-w-[40rem]">
          <motion.p {...rise(0.05)} className="t-label mb-7 flex items-center gap-2.5 text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Resume review, by AI
          </motion.p>

          <motion.h1 {...rise(0.12)} className="t-display">
            Read your resume the way a{' '}
            <span className="t-em">
              <Underlined delay={1.15} color="#E0472C" weight={1.3}>recruiter</Underlined>
            </span>{' '}
            will.
          </motion.h1>

          <motion.p {...rise(0.24)} className="t-lead mt-9 max-w-[34rem]">
            Upload a PDF. In about a minute you get a scored report: the notes a recruiter
            would make, the keywords you&apos;re missing, and roles that fit.
          </motion.p>

          <motion.div {...rise(0.36)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" onClick={() => navigate('/login')} className="group">
              Get your report
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-base ease-out group-hover:translate-x-0.5" />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => scrollToSection('features')}>
              See what&apos;s in it
            </Button>
          </motion.div>

          <motion.ul {...rise(0.48)} className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5">
            {FACTS.map((fact) => (
              <li key={fact} className="t-meta flex items-center gap-2 text-ink-muted">
                <span aria-hidden="true" className="h-px w-3 bg-ink-faint" />
                {fact}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* The page being marked, and the report it becomes */}
        <motion.div style={{ y: sheetY }} className="relative mx-auto w-full max-w-[30rem] lg:mx-0 lg:ml-auto">
          <motion.div
            initial={{ opacity: 0, y: 70, rotate: 5 }}
            animate={{ opacity: 1, y: 0, rotate: 2.2 }}
            transition={{ ...springGentle, delay: 0.35 }}
            className="origin-bottom-right"
          >
            <ResumeSheet play delay={1.25} className="w-full text-[10.5px] sm:text-[12px]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1, ease: ease.out }}
            className="absolute -bottom-20 -left-1 flex items-center gap-4 rounded-lg border border-line-strong bg-surface-raised p-4 pr-5 shadow-e3 sm:-bottom-10 sm:-left-12 sm:gap-5 sm:p-5 sm:pr-6"
          >
            <Enso value={82} size={84} delay={1.3} />
            <div className="w-[9.5rem] space-y-2.5">
              {SAMPLE.map((row, i) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[0.75rem] text-ink-muted">{row.label}</span>
                    <span className="t-meta text-ink">{row.value}</span>
                  </div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-ink/10">
                    <motion.div
                      className="h-full w-full origin-left rounded-full bg-ink/70"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: row.value / 100 }}
                      transition={{ duration: 1, delay: 1.45 + i * 0.1, ease: ease.out }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
