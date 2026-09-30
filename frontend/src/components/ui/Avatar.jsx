import React from 'react';

/**
 * Avatar — the user's photo, or their initial on a raised disc.
 *
 * Props:
 *   user — { name, avatarUrl }
 *   size — Tailwind size classes (default "h-8 w-8")
 *   text — Tailwind text size for the initial (default "text-xs")
 */
export default function Avatar({ user, size = 'h-8 w-8', text = 'text-xs', className = '' }) {
  return (
    <span className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong bg-surface-raised ${size} ${className}`}>
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className={`font-medium text-ink-muted ${text}`}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
      )}
    </span>
  );
}
