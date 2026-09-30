/**
 * ResumeZen brand mark: a vermilion seal carved with a "Z".
 *
 * The seal is the product's signature. The same shape stamps verdicts on
 * reports (see graphics/Seal.jsx), so the logo and the thing the product does
 * are one gesture. Same geometry as public/favicon.svg.
 *
 * Props:
 *   size      — rendered size in px (default 32)
 *   className — extra classes
 */
export function LogoMark({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="7" fill="#E0472C" />
      {/* Lit top edge, so the seal reads as an object rather than a flat swatch */}
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" fill="none" stroke="#fff" strokeOpacity="0.18" />
      <path
        d="M9.2 10.2H22.8L9.2 21.8H22.8"
        fill="none"
        stroke="#FBF7EE"
        strokeWidth="3.3"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeMiterlimit="2"
      />
    </svg>
  );
}

const SIZES = {
  sm: { mark: 26, text: 'text-[1.0625rem]', gap: 'gap-2' },
  md: { mark: 30, text: 'text-[1.1875rem]', gap: 'gap-2.5' },
  lg: { mark: 34, text: 'text-[1.375rem]', gap: 'gap-2.5' },
};

/**
 * Mark + wordmark. "Zen" is set in italic so the name reads as two words
 * without a space or a second color.
 *
 * Props:
 *   size     — sm | md | lg
 *   markOnly — hide the wordmark (collapsed sidebar, tight headers)
 */
export default function Logo({ size = 'md', markOnly = false, className = '' }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark size={s.mark} />
      {!markOnly && (
        <span
          className={`font-display font-medium leading-none tracking-[-0.02em] text-ink ${s.text}`}
          style={{ fontVariationSettings: "'SOFT' 40" }}
        >
          Resume<span className="italic" style={{ fontVariationSettings: "'SOFT' 100" }}>Zen</span>
        </span>
      )}
    </span>
  );
}
