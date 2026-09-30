import React from 'react';
import PaperGlyph from '../graphics/PaperGlyph';

/**
 * EmptyState — what a panel or page shows when it has nothing yet.
 *
 * Says what is missing, why, and what to do about it; never just "No data".
 *
 * Props:
 *   title   — what's empty, in a few words
 *   message — why, and what happens when it isn't (optional)
 *   action  — node, usually a Button (optional)
 *   art     — 'paper' | 'stack' | 'none': the illustration (default 'paper')
 *   icon    — heroicon component, used instead of the illustration for compact,
 *             in-panel states
 *   compact — tighter spacing for small panels
 */
export default function EmptyState({ title, message, action, art = 'paper', icon: Icon, compact = false, className = '' }) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-4 py-8' : 'px-6 py-14',
        className,
      ].filter(Boolean).join(' ')}
    >
      {Icon ? (
        <Icon className="mb-4 h-6 w-6 text-ink-faint" aria-hidden="true" />
      ) : art !== 'none' ? (
        <PaperGlyph
          size={compact ? 40 : 56}
          stacked={art === 'stack'}
          mark={art === 'stack' ? 'none' : 'line'}
          className={`${compact ? 'mb-4' : 'mb-6'} -rotate-3`}
        />
      ) : null}
      {title && <p className="t-title">{title}</p>}
      {message && <p className="mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-ink-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
