import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import SectionHeading from './ui/SectionHeading';
import Button from './ui/Button';
import { reveal } from '../utils/motion';

const steps = [
  {
    title: 'Sign in with Google',
    description: 'No form and no password. Signing in is what creates your account.',
  },
  {
    title: 'Pick a plan',
    description: 'A single check or a pack. Each analysis uses one credit, refunded if it fails.',
  },
  {
    title: 'Upload your PDF',
    description: 'The resume you would actually send, up to 5 MB. Drag it in or choose a file.',
  },
  {
    title: 'Read the report',
    description: 'Score, recruiter notes, missing keywords and matching roles, in about a minute.',
  },
];

export default function Steps() {
  const navigate = useNavigate();
  const trackRef = useRef(null);

  // The brush line draws itself across the steps as the row moves up the
  // screen: scroll position in, scaleX out. No per-frame layout.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 85%', 'start 35%'] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="how-it-works" className="section border-t border-line">
      <div className="shell">
        <SectionHeading
          index="02"
          eyebrow="How it works"
          title={<>Four steps. <em className="t-em">One of them</em> is reading.</>}
          lead="There is nothing to set up and nothing to learn. If you have a PDF, you are most of the way there."
        />

        <div ref={trackRef} className="relative">
          {/* Track + the line that fills it (wide screens) */}
          <div aria-hidden="true" className="absolute left-0 right-0 top-[1.375rem] hidden h-px bg-line lg:block" />
          <motion.div
            aria-hidden="true"
            style={{ scaleX: lineScale }}
            className="absolute left-0 right-0 top-[calc(1.375rem-0.5px)] hidden h-[2px] origin-left rounded-full bg-primary lg:block"
          />

          <ol className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.li key={step.title} {...reveal(i * 0.08)} className="relative">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface-void font-mono text-[0.8125rem] text-ink">
                  0{i + 1}
                </span>
                <h3 className="t-h3 mt-6">{step.title}</h3>
                <p className="t-body mt-2.5 max-w-[18rem]">{step.description}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div {...reveal(0.1)} className="mt-14 flex flex-col items-start gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-body">Signing in is free. Look around the dashboard before you buy anything.</p>
          <Button onClick={() => navigate('/login')} className="group flex-shrink-0">
            Start with step one
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-base ease-out group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
