import { useId } from 'react';

/**
 * ResumeZen brand mark: a "Z" with an AI sparkle on a violet squircle.
 * Same geometry as public/favicon.svg, so the tab icon and in-app logo match.
 *
 * Props:
 *   size      — rendered size in px (default 32)
 *   className — extra classes
 */
export function LogoMark({ size = 32, className = '' }) {
  // Unique gradient id per instance: several marks can be on one page, and a
  // shared id breaks when the first instance is hidden (e.g. a mobile-only nav).
  const gradientId = `rz-mark-${useId().replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a497fc" />
          <stop offset="0.55" stopColor="#7c6cf6" />
          <stop offset="1" stopColor="#4b3bc2" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8.25" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.5" />
      <path d="M8.5 11.5H18.5L8.5 22.5H22.5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23.5 4.6C23.9 7.6 24.7 8.4 27.7 8.8C24.7 9.2 23.9 10 23.5 13C23.1 10 22.3 9.2 19.3 8.8C22.3 8.4 23.1 7.6 23.5 4.6Z" fill="#fff" />
    </svg>
  );
}

const SIZES = {
  sm: { mark: 28, text: 'text-lg', gap: 'gap-2' },
  md: { mark: 32, text: 'text-xl', gap: 'gap-2.5' },
  lg: { mark: 36, text: 'text-2xl', gap: 'gap-3' },
};

/**
 * Mark + "ResumeZen" wordmark. "Zen" carries the accent so the name reads as
 * two words at a glance without a space.
 */
export default function Logo({ size = 'md', className = '' }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark size={s.mark} />
      <span className={`font-display font-semibold tracking-tight leading-none text-ink ${s.text}`}>
        Resume<span className="bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">Zen</span>
      </span>
    </span>
  );
}
