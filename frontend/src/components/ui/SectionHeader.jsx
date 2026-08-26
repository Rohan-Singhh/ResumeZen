import React from 'react';

/**
 * SectionHeader — icon-in-tinted-box + title, with an optional right slot.
 *
 * Unifies the panel headers that were hand-repeated with slightly different
 * padding/radius across every dashboard widget.
 *
 * Props:
 *   icon   — heroicon component (optional)
 *   title  — string
 *   right  — node rendered flush-right (optional)
 */
export default function SectionHeader({ icon: Icon, title, right, className = '' }) {
  return (
    <div className={['flex items-center justify-between gap-3', className].filter(Boolean).join(' ')}>
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </span>
        )}
        <h3 className="truncate font-display text-base font-semibold text-ink">{title}</h3>
      </div>
      {right != null && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}
