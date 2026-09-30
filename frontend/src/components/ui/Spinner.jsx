/**
 * Spinner — an open brush circle, turning. The one loading indicator; replaces
 * the border-trick spinners each screen used to hand-roll.
 *
 * Inherits color from the parent (`currentColor`).
 *
 * Props:
 *   size      — px (default 20)
 *   label     — accessible label; omit when nearby text already says what loads
 */
export default function Spinner({ size = 20, label, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      style={{ animationDuration: '0.9s' }}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2.5" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Centered, page-sized loading state. */
export function PageSpinner({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex min-h-[50vh] flex-col items-center justify-center gap-4 text-ink-muted ${className}`} role="status">
      <Spinner size={28} />
      <p className="t-label">{label}</p>
    </div>
  );
}
