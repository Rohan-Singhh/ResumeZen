import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import SectionHeading from './ui/SectionHeading';
import Badge from './ui/Badge';
import ResumeSheet from './graphics/ResumeSheet';
import Enso from './graphics/Enso';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { ease, reveal } from '../utils/motion';

/**
 * "The report" — the landing page's centrepiece.
 *
 * On wide screens the marked-up resume stays pinned while the reader scrolls
 * through what each mark turns into; the mark being discussed stays vivid and
 * the rest recede. On narrow screens it is a plain sequence of chapters.
 *
 * Every fragment below is a small, honest piece of the real report UI with
 * sample content for the fictional resume on the sheet.
 */

// A fragment of the report, on the same surface the dashboard uses
function Fragment({ children }) {
  return (
    <div className="mt-6 rounded-lg border border-line bg-surface p-5 shadow-e1">
      {children}
    </div>
  );
}

function FragLabel({ children, className = '' }) {
  return <p className={`t-label ${className}`}>{children}</p>;
}

const SCORE_ROWS = [
  { label: 'ATS match', value: 88 },
  { label: 'Technical depth', value: 79 },
  { label: 'Impact & ownership', value: 71 },
];

const chapters = [
  {
    mark: 'voice',
    title: 'What a recruiter would flag',
    body: 'A screening verdict, a hiring-risk level, and the specific lines that would make someone stop reading. Written the way a recruiter would say it across a desk.',
    fragment: (
      <Fragment>
        <div className="flex items-center justify-between gap-3">
          <FragLabel>Recruiter screen</FragLabel>
          <Badge variant="good">Low hiring risk</Badge>
        </div>
        <p className="t-h3 mt-3 text-good">Likely to pass screening</p>
        <ul className="mt-4 space-y-2.5 border-t border-line pt-4">
          {[
            '“Responsible for” tells me what you were assigned, not what you did.',
            'Two roles list duties with no result attached.',
          ].map((line) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
              <span aria-hidden="true" className="mt-[0.68em] h-[2px] w-3 flex-shrink-0 rounded-full bg-primary" />
              {line}
            </li>
          ))}
        </ul>
      </Fragment>
    ),
  },
  {
    mark: 'impact',
    title: 'Claims without numbers',
    body: 'Every line that asserts impact but never proves it, with a way to rewrite it. You supply the figures; the report shows you where they go.',
    fragment: (
      <Fragment>
        <FragLabel>Claim without a number</FragLabel>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
          Migrated the payments service to an event-driven architecture.
        </p>
        <ArrowDownIcon className="my-3 h-4 w-4 text-ink-faint" aria-hidden="true" />
        <FragLabel className="text-primary-light">Try</FragLabel>
        <p className="mt-2.5 text-sm leading-relaxed text-ink">
          Migrated payments for <Slot>N users</Slot> to an event-driven service,
          cutting failed checkouts by <Slot>X%</Slot>.
        </p>
      </Fragment>
    ),
  },
  {
    mark: 'keywords',
    title: 'The keywords you’re missing',
    body: 'Terms that roles like yours ask for and your resume never mentions. Add the ones that are true, and the automated filters stop passing you over.',
    fragment: (
      <Fragment>
        <FragLabel>Missing keywords</FragLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Kubernetes', 'CI/CD', 'System design', 'Observability'].map((kw) => (
            <Badge key={kw} variant="accent">+ {kw}</Badge>
          ))}
        </div>
      </Fragment>
    ),
  },
  {
    mark: 'proof',
    title: 'A score you can move',
    body: 'One overall number, broken into the parts that produce it. Fix something, upload again, and see exactly which part moved.',
    fragment: (
      <Fragment>
        <div className="flex items-center gap-6">
          <Enso value={82} size={96} animated={false} />
          <div className="flex-1 space-y-3">
            {SCORE_ROWS.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[0.8125rem] text-ink-muted">{row.label}</span>
                  <span className="t-meta text-ink">{row.value}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-ink/70" style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Fragment>
    ),
  },
  {
    mark: null,
    title: 'Roles that fit what you’ve done',
    body: 'Live listings matched against your resume, each with the reason it fits and the skills you’d still need. Apply where the page you just fixed will land.',
    fragment: (
      <Fragment>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="t-title">Senior Backend Engineer, Payments</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-ink-muted">
              <BuildingOffice2Icon className="h-4 w-4 text-ink-faint" aria-hidden="true" />
              Harbor · Remote
            </p>
          </div>
          <Enso value={86} size={52} weight={9} label={false} animated={false} />
        </div>
        <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-ink-muted">
          <span className="text-ink">Why it fits:</span> Go, Kafka and three years on a payments team.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="t-label">To build</span>
          <Badge variant="warn">Kubernetes</Badge>
        </div>
      </Fragment>
    ),
  },
];

// A blank to fill in: the report never invents your numbers for you
function Slot({ children }) {
  return (
    <span className="rounded-sm border-b border-dashed border-primary-light/70 bg-primary/10 px-1 font-mono text-[0.8125rem] text-primary-light">
      {children}
    </span>
  );
}

export default function Features() {
  const isWide = useMediaQuery('(min-width: 1024px)');
  const [activeIndex, setActiveIndex] = useState(0);

  // Pinned-sheet storytelling only where there's room for two columns
  const activeMark = isWide ? chapters[activeIndex].mark : null;

  return (
    <section id="features" className="section">
      <div className="shell">
        <SectionHeading
          index="01"
          eyebrow="The report"
          title={<>Every mark on the page, <em className="t-em">explained.</em></>}
          lead="We read your resume the way a careful editor would, then hand you the page back with the marks on it. Here is what each one becomes."
        />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          {/* Wide screens only: on a phone the hero's sheet is one scroll
              above, and a second copy would just push the content down */}
          <motion.div
            {...reveal()}
            className="hidden lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:block lg:self-start"
          >
            <div className="-rotate-1">
              <ResumeSheet active={activeMark} seal={false} className="w-full text-[10px] sm:text-[12px]" />
            </div>
            <p className="t-meta mt-5">A sample resume. Yours stays private to your account.</p>
          </motion.div>

          <ol className="lg:pb-[12vh]">
            {chapters.map((chapter, i) => {
              const dim = isWide && activeIndex !== i;
              return (
                <motion.li
                  key={chapter.title}
                  onViewportEnter={() => setActiveIndex(i)}
                  viewport={{ margin: '-45% 0px -45% 0px' }}
                  animate={{ opacity: dim ? 0.32 : 1 }}
                  transition={{ duration: 0.4, ease: ease.standard }}
                  className="border-t border-line py-9 first:border-t-0 first:pt-0 lg:flex lg:min-h-[58vh] lg:flex-col lg:justify-center lg:border-t-0 lg:py-10"
                >
                  <p className="t-label mb-4 text-ink-muted">0{i + 1}</p>
                  <h3 className="t-h2">{chapter.title}</h3>
                  <p className="t-body mt-4 max-w-prose">{chapter.body}</p>
                  {chapter.fragment}
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
