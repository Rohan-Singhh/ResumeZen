import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/20/solid';
import Skeleton from './ui/Skeleton';
import { hoverLift } from '../utils/motion';

/**
 * PlanCard — one plan, the same on the landing page and in the dashboard.
 *
 * The featured plan is set on paper: the brightest object in the row, so the
 * eye lands on it first.
 *
 * Props:
 *   name      — plan name
 *   price     — number
 *   currency  — 'INR' | other (rendered as ₹ or $)
 *   period    — short suffix after the price ("one-time", "3 months")
 *   headline  — the line that matters most, above the feature list
 *               (e.g. "5 resume checks")
 *   features  — string[]
 *   featured  — paper treatment
 *   tag       — small label beside the name ("Popular", "Unlimited")
 *   action    — node; the button. Rendered at the bottom so cards align.
 *   ...rest   — forwarded to the motion.article (entrance props)
 */
export default function PlanCard({
  name,
  price,
  currency = 'INR',
  period,
  headline,
  features = [],
  featured = false,
  tag,
  action,
  className = '',
  ...rest
}) {
  return (
    <motion.article
      whileHover={hoverLift}
      className={`relative flex flex-col overflow-hidden rounded-xl p-7 sm:p-8 ${
        featured ? 'bg-paper text-paper-ink shadow-sheet' : 'border border-line bg-surface shadow-e1'
      } ${className}`}
      {...rest}
    >
      {featured && <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-60" />}

      <div className="relative flex min-h-[1.75rem] items-center justify-between gap-3">
        <h3 className={`text-[0.9375rem] font-semibold ${featured ? 'text-paper-ink' : 'text-ink'}`}>{name}</h3>
        {tag && (
          <span
            className={`rounded-full px-2.5 py-1 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] ${
              featured ? 'bg-primary text-white' : 'border border-line-strong text-ink-muted'
            }`}
          >
            {tag}
          </span>
        )}
      </div>

      <p className="relative mt-6 flex items-baseline gap-2">
        <span className={`t-num text-[3.25rem] ${featured ? 'text-paper-ink' : ''}`}>
          <span className="mr-0.5 align-[0.35em] text-[0.5em]">{currency === 'INR' ? '₹' : '$'}</span>
          {price}
        </span>
        {period && <span className={`text-sm ${featured ? 'text-paper-muted' : 'text-ink-faint'}`}>{period}</span>}
      </p>

      <ul className={`relative mt-7 flex-1 space-y-3 border-t pt-7 ${featured ? 'border-paper-line' : 'border-line'}`}>
        {headline && (
          <li className={`pb-1 text-[0.9375rem] font-medium ${featured ? 'text-paper-ink' : 'text-ink'}`}>{headline}</li>
        )}
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm leading-snug">
            <CheckIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${featured ? 'text-primary' : 'text-ink-faint'}`} aria-hidden="true" />
            <span className={featured ? 'text-paper-ink/85' : 'text-ink-muted'}>{feature}</span>
          </li>
        ))}
      </ul>

      {action && <div className="relative mt-9">{action}</div>}
    </motion.article>
  );
}

/** Placeholder in the shape of a PlanCard. */
export function PlanCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-surface p-7 sm:p-8" aria-hidden="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-7 h-12 w-32" />
      <div className="mt-8 space-y-3.5 border-t border-line pt-7">
        {[92, 78, 85, 64, 72].map((w) => <Skeleton key={w} className="h-3" style={{ width: `${w}%` }} />)}
      </div>
      <Skeleton className="mt-9 h-12 w-full rounded-md" />
    </div>
  );
}
