import { useId, useMemo } from 'react';
import { motion, useTransform, useMotionValue } from 'framer-motion';

/**
 * InkLandscape — the product's atmosphere: ink-wash ridges at dusk, mist
 * pooling between them, a vermilion sun.
 *
 * Every ridge is generated from a seed, so each placement (landing hero,
 * sign-in, closing section) is its own view of the same country rather than
 * one picture reused. Nothing here is a bitmap.
 *
 * Built for smooth scrolling: each depth plane is its own absolutely
 * positioned <svg>, so parallax is a compositor-only transform on a cached
 * layer instead of a repaint of one large drawing. No blur filters — haze is
 * gradient fills.
 *
 * Props:
 *   seed      — integer; changes the terrain
 *   progress  — MotionValue 0→1 (e.g. scrollYProgress). Planes drift apart as
 *               it advances; omit for a static scene.
 *   sun       — Tailwind classes that place and size the sun disc inside the
 *               scene (e.g. "left-[60%] top-[18%] h-56 w-56"), or false for
 *               none. Placed with CSS rather than drawn into the terrain so a
 *               layout can pin it to its own content at every screen size.
 *   horizon   — 0–1, how far down the ridges start (default 0.62)
 *   relief    — multiplier on ridge height; below 1 for a low, distant range
 *   mist      — a band of haze drifting slowly between the far and near
 *               ranges. One long transform loop; off under reduced motion.
 *   className — position/size of the scene (it fills its box)
 */
const W = 1440;
const H = 900;

// Small seeded PRNG (mulberry32): same seed, same mountains, on every render.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth 1D value noise over a table of random heights.
function valueNoise(rand) {
  const table = Array.from({ length: 256 }, rand);
  return (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = table[i & 255];
    const b = table[(i + 1) & 255];
    return a + (b - a) * (f * f * (3 - 2 * f));
  };
}

/**
 * One ridge silhouette. Layered noise, folded ("ridged") so the high points
 * come to a crest instead of a dome; `sharp` raises the result to a power,
 * which flattens valleys and leaves isolated peaks.
 */
function ridgePath({ seed, base, amp, freq, octaves = 4, sharp = 1.35 }) {
  const rand = prng(seed);
  const noise = valueNoise(rand);
  const shift = rand() * 200;
  const step = 6;

  // Extend past both edges so parallax never exposes the end of a plane
  let d = `M-80 ${H + 200}`;
  for (let x = -80; x <= W + 80; x += step) {
    let sum = 0;
    let weight = 1;
    let f = freq;
    let norm = 0;
    for (let o = 0; o < octaves; o += 1) {
      const v = 1 - Math.abs(noise(shift + x * f) * 2 - 1);
      sum += v * weight;
      norm += weight;
      weight *= 0.48;
      f *= 2.15;
    }
    const y = base - Math.pow(sum / norm, sharp) * amp;
    d += `L${x} ${y.toFixed(1)}`;
  }
  return `${d}L${W + 80} ${H + 200}Z`;
}

// Back to front. `crest` is the ink at the ridge line; it thins through `mid`
// into the haze pooled at the ridge's `foot`. Fills are opaque (the haze is
// mixed into the color, not alpha) so a ridge properly hides the sun behind
// it. Nearer planes are darker and drift less with scroll.
const PLANES = [
  { base: 0.00, amp: 250, freq: 0.0021, sharp: 1.7, crest: '#3B281E', mid: '#663824', foot: '#7A4329', drift: 150 },
  { base: 0.07, amp: 220, freq: 0.0030, sharp: 1.5, crest: '#2A1D16', mid: '#52301F', foot: '#653823', drift: 105 },
  { base: 0.16, amp: 190, freq: 0.0040, sharp: 1.4, crest: '#1C1410', mid: '#3A2318', foot: '#4A2B1C', drift: 64 },
  { base: 0.27, amp: 150, freq: 0.0052, sharp: 1.3, crest: '#120E0B', mid: '#20150F', foot: '#271910', drift: 30 },
  { base: 0.40, amp: 110, freq: 0.0070, sharp: 1.2, crest: '#0B0A09', mid: '#0B0A09', foot: '#0B0A09', drift: 0 },
];

const LAYER = 'absolute inset-0 h-full w-full';

function Plane({ progress, drift, children }) {
  const y = useTransform(progress, [0, 1], [0, drift]);
  return (
    <motion.div className={LAYER} style={{ y, willChange: drift ? 'transform' : undefined }}>
      {children}
    </motion.div>
  );
}

export default function InkLandscape({
  seed = 11,
  progress,
  sun = 'left-[62%] top-[16%] h-52 w-52',
  horizon = 0.62,
  relief = 1,
  mist = false,
  className = '',
}) {
  const uid = useId().replace(/:/g, '');
  const still = useMotionValue(0);
  const p = progress || still;

  const ridges = useMemo(
    () =>
      PLANES.map((plane, i) => ({
        ...plane,
        d: ridgePath({
          seed: seed * 97 + i * 13,
          base: H * (horizon + plane.base),
          amp: plane.amp * relief,
          freq: plane.freq,
          sharp: plane.sharp,
        }),
      })),
    [seed, horizon, relief]
  );

  const svgProps = {
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: 'xMidYMax slice',
    className: LAYER,
  };

  return (
    <div aria-hidden="true" className={`pointer-events-none overflow-hidden ${className}`}>
      {/* Sky: ink overhead, warming toward the horizon */}
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B0A09" />
            <stop offset="0.34" stopColor="#110D0B" />
            <stop offset="0.56" stopColor="#2A1710" />
            <stop offset="0.74" stopColor="#5A2D1B" />
            <stop offset="1" stopColor="#3A2016" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#${uid}-sky)`} />
      </svg>

      {/* Sun and its haze. Farthest plane, so it sinks fastest as you scroll.
          The haze is a radial gradient, not a blur filter. */}
      {sun && (
        <Plane progress={p} drift={230}>
          <div className={`absolute ${sun}`}>
            <div
              className="absolute left-1/2 top-1/2 h-[520%] w-[520%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(242,104,63,0.42), rgba(224,71,44,0.2) 26%, rgba(184,56,31,0.07) 58%, rgba(184,56,31,0) 100%)',
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(180deg, #F46B43 0%, #DD4528 55%, #C4381D 100%)' }}
            />
          </div>
        </Plane>
      )}

      {ridges.map((ridge, i) => (
        <Plane key={i} progress={p} drift={ridge.drift}>
          {/* Haze lying in front of the two far ranges, behind the rest. The
              strip is two identical halves, so sliding it by one half loops
              without a seam. */}
          {mist && i === 2 && (
            <div
              className="absolute bottom-[20%] left-0 h-[26%] w-[200%] animate-drift"
              style={{
                backgroundImage:
                  'radial-gradient(34% 58% at 22% 55%, rgba(150,84,52,0.34), rgba(150,84,52,0) 70%), radial-gradient(30% 46% at 68% 42%, rgba(150,84,52,0.26), rgba(150,84,52,0) 70%)',
                backgroundSize: '50% 100%',
                backgroundRepeat: 'repeat-x',
              }}
            />
          )}
          <svg {...svgProps}>
            <defs>
              <linearGradient id={`${uid}-r${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={ridge.crest} />
                <stop offset="0.4" stopColor={ridge.mid} />
                <stop offset="1" stopColor={ridge.foot} />
              </linearGradient>
            </defs>
            <path d={ridge.d} fill={`url(#${uid}-r${i})`} />
          </svg>
        </Plane>
      ))}
    </div>
  );
}
