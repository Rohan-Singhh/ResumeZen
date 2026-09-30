import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Underlined, Circled, Tick, Note } from './Marks';
import Seal from './Seal';

/**
 * ResumeSheet — a resume as a sheet of paper, being marked up.
 *
 * This is what the product does, shown rather than described: a page, a red
 * pen, a verdict. It is illustrative (a fictional candidate), sized in `em`
 * so one `fontSize` scales the whole sheet.
 *
 * Props:
 *   className — outer box; give it a width and a font size (e.g. "w-full
 *               text-[12px]"). The sheet is ~38em wide at its natural size.
 *   play      — force the marks on/off; by default they draw when scrolled into view
 *   delay     — seconds before the first mark
 *   active    — 'impact' | 'voice' | 'proof' | 'keywords' | null. When set, that
 *               mark stays vivid and the rest recede (scroll storytelling).
 *   seal      — text for the verdict stamp, or false for none
 */
function Bar({ w }) {
  return <span className="block h-[0.5em] rounded-full bg-paper-ink/[0.13]" style={{ width: w }} />;
}

function SectionLabel({ children }) {
  return (
    <p className="mb-[0.9em] mt-[1.9em] border-b border-paper-line pb-[0.5em] font-mono text-[0.68em] font-medium uppercase tracking-[0.16em] text-paper-muted">
      {children}
    </p>
  );
}

export default function ResumeSheet({
  play,
  delay = 0.3,
  active = null,
  seal = 'Likely to pass',
  className = '',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const on = play ?? inView;

  // A mark is vivid when nothing is singled out, or when it is the one that is
  const focus = (id) => ({
    animate: { opacity: active == null || active === id ? 1 : 0.22 },
    transition: { duration: 0.35 },
  });

  const bullet = 'relative pl-[1.1em] before:absolute before:left-0 before:top-[0.68em] before:h-[0.26em] before:w-[0.26em] before:rounded-full before:bg-paper-ink/50';

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-sheet bg-paper text-paper-ink shadow-sheet ${className}`}
    >
      <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative px-[2.6em] pb-[2.8em] pt-[2.4em] leading-[1.55]">
        {/* Header */}
        <div>
          <div>
            <p className="font-display text-[2.1em] font-medium leading-none tracking-[-0.02em]" style={{ fontVariationSettings: "'SOFT' 30" }}>
              Maya Iyer
            </p>
            <p className="mt-[0.7em] font-mono text-[0.72em] tracking-[0.02em] text-paper-muted">
              Backend Engineer · Bengaluru · maya@example.com
            </p>
          </div>
        </div>

        <SectionLabel>Experience</SectionLabel>

        <div className="flex items-baseline justify-between gap-[1em]">
          <p className="text-[1em] font-semibold">Software Engineer, Payments <span className="font-normal text-paper-muted">· Lumen Labs</span></p>
          <p className="flex-shrink-0 font-mono text-[0.72em] text-paper-muted">2022 – Now</p>
        </div>

        {/* Text column + a margin wide enough for the editor's notes */}
        <ul className="mt-[0.6em] space-y-[0.75em] text-[0.95em]">
          <motion.li {...focus('impact')} className="grid grid-cols-[1fr_8.6em] items-start gap-[1em]">
            <span className={bullet}>
              <Underlined play={on} delay={delay}>Migrated the payments service</Underlined>{' '}
              to an event-driven architecture.
            </span>
            <Note play={on} delay={delay + 0.45} className="text-[1.28em]">how many users? how much faster?</Note>
          </motion.li>

          <motion.li {...focus('voice')} className="grid grid-cols-[1fr_8.6em] items-start gap-[1em]">
            <span className={bullet}>
              <Circled play={on} delay={delay + 0.85}>Responsible for</Circled>{' '}
              on-call and incident response.
            </span>
            <Note play={on} delay={delay + 1.4} tilt={2} className="text-[1.28em]">lead with the outcome</Note>
          </motion.li>

          <motion.li {...focus('proof')} className="grid grid-cols-[1fr_8.6em] items-start gap-[1em]">
            <span className={bullet}>Cut p95 checkout latency from 840ms to 310ms.</span>
            <span className="flex items-center gap-[0.4em]">
              <Tick play={on} delay={delay + 1.75} className="h-[1.3em] w-[1.3em] flex-shrink-0" />
              <Note play={on} delay={delay + 1.9} className="text-[1.28em]">keep this</Note>
            </span>
          </motion.li>
        </ul>

        <div className="mt-[1.4em] flex items-baseline justify-between gap-[1em]">
          <p className="text-[1em] font-semibold">Engineering Intern <span className="font-normal text-paper-muted">· Northwind</span></p>
          <p className="flex-shrink-0 font-mono text-[0.72em] text-paper-muted">2021</p>
        </div>
        <div className="mt-[0.8em] space-y-[0.7em] pr-[9.6em]">
          <Bar w="94%" />
          <Bar w="78%" />
        </div>

        <SectionLabel>Skills</SectionLabel>
        <motion.div {...focus('keywords')} className="grid grid-cols-[1fr_8.6em] items-start gap-[1em] text-[0.95em]">
          <span>Go · PostgreSQL · Kafka · Redis · AWS</span>
          <Note play={on} delay={delay + 2.2} tilt={-2} className="text-[1.28em]">+ Kubernetes, CI/CD</Note>
        </motion.div>

        <SectionLabel>Education</SectionLabel>
        <div className="space-y-[0.7em] pr-[9.6em]">
          <Bar w="66%" />
          <Bar w="42%" />
        </div>

        {/* The verdict, stamped last */}
        {seal && (
          <div className="absolute bottom-[2.2em] right-[2em]">
            <Seal animated={on} delay={delay + 2.6} size="md" tilt={-8} className="!text-[0.86em]">
              {seal}
            </Seal>
          </div>
        )}
      </div>
    </div>
  );
}
