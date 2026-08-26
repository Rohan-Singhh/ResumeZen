import React from 'react';
import Card from './Card';

/**
 * StatTile — a single KPI cell: label, value, optional trend chip.
 *
 * Neutral by default. The one primary metric can opt into an accent by passing
 * `accent`; the rest stay monochrome so color carries meaning instead of
 * decorating every tile a different hue.
 *
 * Props:
 *   icon   — heroicon component (optional)
 *   label  — string
 *   value  — string | number
 *   trend  — number (signed) | null; renders a +/- chip when non-zero
 *   accent — highlight this tile's icon/value in the accent color
 */
export default function StatTile({ icon: Icon, label, value, trend = null, accent = false }) {
  return (
    <Card padded={false} hover className="group p-4">
      <div className="mb-3 flex items-center justify-between">
        {Icon && (
          <span
            className={[
              'flex h-8 w-8 items-center justify-center rounded-lg border',
              accent ? 'border-primary/30 bg-primary/10' : 'border-line bg-white/[0.03]',
            ].join(' ')}
          >
            <Icon className={['h-4 w-4', accent ? 'text-primary' : 'text-ink-muted'].join(' ')} />
          </span>
        )}

        {trend !== null && trend !== 0 && (
          <span
            className={[
              'rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
              trend > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400',
            ].join(' ')}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}
          </span>
        )}
      </div>

      <p
        className={[
          'font-display text-2xl font-semibold tabular-nums leading-none tracking-tight',
          accent ? 'text-primary' : 'text-ink',
        ].join(' ')}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </p>
    </Card>
  );
}
