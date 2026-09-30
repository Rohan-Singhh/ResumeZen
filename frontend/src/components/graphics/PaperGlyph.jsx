/**
 * PaperGlyph — a small sheet of paper. The spot illustration for uploads and
 * empty states: wherever the product is waiting for a resume, or has none.
 *
 * Props:
 *   size     — px width (height follows at ~1.28×)
 *   mark     — 'tick' | 'line' | 'none': the red-pen mark on the sheet
 *   stacked  — draw a second sheet behind, slightly turned (for "no reports yet")
 *   className
 */
export default function PaperGlyph({ size = 56, mark = 'line', stacked = false, className = '' }) {
  return (
    <svg
      width={size}
      height={size * 1.28}
      viewBox="0 0 50 64"
      fill="none"
      aria-hidden="true"
      className={`overflow-visible ${className}`}
    >
      {stacked && (
        <rect x="6" y="3" width="40" height="54" rx="2" fill="#CFC6B2" transform="rotate(7 26 30)" />
      )}
      {/* Soft contact shadow: the sheet sits on the desk */}
      <ellipse cx="25" cy="61" rx="17" ry="2.2" fill="#000" opacity="0.45" />
      <rect x="5" y="3" width="40" height="54" rx="2" fill="#F1EBDD" />
      <rect x="5.5" y="3.5" width="39" height="53" rx="1.5" stroke="#fff" strokeOpacity="0.5" />

      {/* Name + body lines */}
      <rect x="11" y="10" width="15" height="3" rx="1.5" fill="#1B1916" opacity="0.8" />
      <rect x="11" y="19" width="28" height="1.8" rx="0.9" fill="#1B1916" opacity="0.2" />
      <rect x="11" y="24" width="24" height="1.8" rx="0.9" fill="#1B1916" opacity="0.2" />
      <rect x="11" y="29" width="27" height="1.8" rx="0.9" fill="#1B1916" opacity="0.2" />
      <rect x="11" y="38" width="20" height="1.8" rx="0.9" fill="#1B1916" opacity="0.2" />
      <rect x="11" y="43" width="26" height="1.8" rx="0.9" fill="#1B1916" opacity="0.2" />

      {mark === 'line' && (
        <path d="M10.5 33.2C17 31.6 24 34.4 31 32.6" stroke="#D8412A" strokeWidth="1.6" strokeLinecap="round" />
      )}
      {mark === 'tick' && (
        <path d="M31 46.5C32.6 47.6 33.6 49 34.4 50.6C36 46.2 38.2 43 41.2 40.6" stroke="#D8412A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
