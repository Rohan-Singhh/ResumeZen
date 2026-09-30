import { motion } from 'framer-motion';
import { reveal } from '../../utils/motion';

/**
 * SectionHeading — the opening of a marketing section.
 *
 * A numbered mono eyebrow, a serif heading, and an optional lead set to the
 * right on wide screens so the heading keeps its own line length.
 *
 * Props:
 *   index    — "01", "02"… shown before the eyebrow
 *   eyebrow  — short section name
 *   title    — node; wrap the emphasised words in <em className="t-em">
 *   lead     — supporting paragraph (optional)
 *   aside    — node rendered under the lead (e.g. a link)
 *   stacked  — keep the lead under the heading at every width
 */
export default function SectionHeading({ index, eyebrow, title, lead, aside, stacked = false, className = '' }) {
  return (
    <motion.header
      {...reveal()}
      className={[
        'mb-12 sm:mb-16',
        stacked ? 'max-w-3xl' : 'grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16',
        className,
      ].join(' ')}
    >
      <div>
        <p className="t-label mb-5 flex items-center gap-3">
          {index && <span className="text-primary-light">{index}</span>}
          <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
          {eyebrow}
        </p>
        <h2 className="t-h1">{title}</h2>
      </div>
      {(lead || aside) && (
        <div className={stacked ? 'mt-6' : 'lg:pb-2'}>
          {lead && <p className="t-lead">{lead}</p>}
          {aside && <div className="mt-5">{aside}</div>}
        </div>
      )}
    </motion.header>
  );
}
