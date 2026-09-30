import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';
import ResumeSheet from '../../../components/graphics/ResumeSheet';
import { springGentle } from '../../../utils/motion';

const STEPS = [
  { title: 'Upload a PDF', body: 'The resume you would actually send.' },
  { title: 'Wait about a minute', body: 'You can leave; it finishes in the background.' },
  { title: 'Read the marks', body: 'Score, recruiter notes, missing keywords.' },
];

/**
 * FirstRun — the overview before any resume has been analyzed.
 *
 * Instead of six empty panels, one card that shows what a marked-up resume
 * looks like and the three things that are about to happen.
 */
export default function FirstRun() {
  return (
    <Card padded={false} className="relative h-full overflow-hidden">
      <div className="grid grid-cols-1 h-full md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="t-label">Your first report</p>
          <h2 className="t-h2 mt-3">It starts with <em className="t-em">one PDF.</em></h2>
          <p className="t-body mt-3 max-w-sm">
            Nothing here yet. Add a resume and this page fills with its score and everything worth fixing.
          </p>

          <ol className="mt-7 space-y-4 border-t border-line pt-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3.5">
                <span className="t-meta mt-0.5 w-5 flex-shrink-0 text-primary-light">0{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-ink">{step.title}</p>
                  <p className="text-[0.8125rem] text-ink-faint">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* A sample, cropped by the card edge: a glimpse, not a demo */}
        <div aria-hidden="true" className="relative hidden min-h-[20rem] overflow-hidden border-l border-line bg-surface-sunken md:block">
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 7 }}
            animate={{ opacity: 1, y: 0, rotate: 4 }}
            transition={{ ...springGentle, delay: 0.2 }}
            className="absolute left-8 top-10 w-[30rem] origin-top-left"
          >
            <ResumeSheet play delay={0.8} seal={false} className="w-full text-[11px]" />
          </motion.div>
          <p className="t-label absolute bottom-4 right-5 rounded bg-surface-sunken/90 px-2 py-1.5">Sample</p>
        </div>
      </div>
    </Card>
  );
}
