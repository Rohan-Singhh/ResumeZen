import React from 'react';

/**
 * PageHeader — the top of every dashboard page.
 *
 * Props:
 *   eyebrow     — small mono line above the title (optional)
 *   title       — node; page name or greeting, set in the display serif
 *   description — one supporting sentence (optional)
 *   actions     — node rendered right on wide screens, below on narrow (optional)
 */
export default function PageHeader({ eyebrow, title, description, actions, className = '' }) {
  return (
    <header className={`mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && <p className="t-label mb-3">{eyebrow}</p>}
        <h1 className="t-h1 !text-[clamp(1.85rem,3.4vw,2.5rem)]">{title}</h1>
        {description && <p className="t-body mt-2.5 max-w-xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
