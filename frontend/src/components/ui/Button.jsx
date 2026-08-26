import React from 'react';

/**
 * Button — the one button primitive. Replaces inline class strings.
 *
 * Variants: primary (accent) | secondary (surface) | ghost | danger
 * Sizes:    sm | md
 */
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ' +
  'disabled:opacity-50 disabled:pointer-events-none';

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-white/[0.06] text-ink hover:bg-white/[0.1] border border-line',
  ghost: 'text-ink-muted hover:text-ink hover:bg-white/[0.05]',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
};

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={[BASE, VARIANTS[variant] || VARIANTS.primary, SIZES[size] || SIZES.md, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
