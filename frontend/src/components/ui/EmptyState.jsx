import React from 'react';

/**
 * EmptyState — icon + message shown when a panel has no data yet.
 * Replaces the five near-identical empty blocks across the overview widgets.
 *
 * Props:
 *   icon    — heroicon component
 *   message — string
 *   action  — optional node (e.g. a Button) rendered below the message
 */
export default function EmptyState({ icon: Icon, message, action, className = '' }) {
  return (
    <div className={['flex flex-col items-center justify-center py-10 text-center', className].filter(Boolean).join(' ')}>
      {Icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white/[0.02]">
          <Icon className="h-6 w-6 text-ink-faint" />
        </span>
      )}
      <p className="text-sm font-medium text-ink-muted">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
