import React from 'react';

/**
 * SectionHeader — the title row of a dashboard panel.
 *
 * Props:
 *   title  — string
 *   hint   — short supporting text under the title (optional)
 *   right  — node rendered flush-right: a count, a link, an action (optional)
 */
export default function SectionHeader({ title, hint, right, className = '' }) {
  return (
    <div className={['flex items-start justify-between gap-4', className].filter(Boolean).join(' ')}>
      <div className="min-w-0">
        <h3 className="t-title truncate">{title}</h3>
        {hint && <p className="mt-1 text-[0.8125rem] leading-snug text-ink-faint">{hint}</p>}
      </div>
      {right != null && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}
