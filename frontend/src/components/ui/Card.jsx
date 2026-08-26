import React from 'react';

/**
 * Card — the single surface primitive for the dashboard.
 *
 * Replaces the two competing hand-rolled card recipes (the
 * `from-white/[0.08]` gradient-glass card and the `#0d0d12/80` panel) with one
 * neutral-enterprise surface: flat near-black fill, one crisp border, no glow,
 * no decorative blur blob.
 *
 * Props:
 *   as       — element/component to render (default 'div')
 *   hover    — subtle border-lighten on hover (for clickable cards)
 *   padded   — apply default padding (default true); set false for custom insets
 *   className— extra classes, appended last so callers can override
 */
export default function Card({
  as: Tag = 'div',
  hover = false,
  padded = true,
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={[
        'rounded-xl border border-line bg-surface',
        padded ? 'p-5 sm:p-6' : '',
        hover ? 'transition-colors hover:border-line-strong' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
