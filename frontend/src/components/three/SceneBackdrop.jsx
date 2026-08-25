/**
 * SceneBackdrop — the atmosphere layer.
 *
 * Lazily loads the WebGL scene (so three.js never touches the critical
 * bundle), and degrades honestly: no WebGL or prefers-reduced-motion gets a
 * static aurora wash instead of a frozen canvas. Vignette + film grain sit
 * on top so the 3D reads as photographed in a studio, not pasted on.
 */
import { lazy, Suspense, useMemo } from 'react';

const MonolithScene = lazy(() => import('./MonolithScene'));

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export default function SceneBackdrop({ compact = false, className = '' }) {
  const enabled = useMemo(
    () =>
      typeof window !== 'undefined' &&
      webglAvailable() &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Static aurora wash — also the Suspense/fallback state */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 68% 42%, rgba(124,108,246,0.13), transparent 65%), radial-gradient(45% 40% at 22% 78%, rgba(85,70,180,0.10), transparent 60%), #08080c',
        }}
      />

      {enabled && (
        <Suspense fallback={null}>
          <MonolithScene compact={compact} />
        </Suspense>
      )}

      {/* Studio vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_8%,transparent_38%,rgba(4,4,8,0.72)_100%)]" />
      {/* Film grain — kills the flat "rendered vector" look */}
      <div className="grain-overlay absolute inset-0" />
    </div>
  );
}
