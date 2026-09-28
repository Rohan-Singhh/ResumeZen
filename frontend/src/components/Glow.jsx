/**
 * Glow — soft colored light behind the marketing sections.
 *
 * A radial gradient is painted once and then only composited. The previous
 * glows were large solid divs run through `blur-[100px..150px]` (several with
 * `mix-blend-screen`): huge Gaussian filters the browser had to re-rasterize
 * as sections scrolled into view, which is what made the landing page stutter.
 *
 * Props:
 *   className — position and size (Tailwind), e.g. "top-0 left-0 w-96 h-96"
 *   color     — "r,g,b" of the light (defaults to the primary accent)
 *   strength  — alpha at the center (0–1)
 */
export const GLOW = {
  primary: '124,108,246',
  secondary: '6,182,212',
  accent: '244,114,182',
};

export default function Glow({ className = '', color = GLOW.primary, strength = 0.15 }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{ background: `radial-gradient(closest-side, rgba(${color},${strength}), rgba(${color},0))` }}
    />
  );
}
