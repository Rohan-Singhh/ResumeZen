import React from 'react';

/**
 * Skeleton — a placeholder block with a slow sweep (see `.skeleton` in
 * index.css). Compose these into the shape of the content that is loading so
 * the page doesn't jump when data arrives.
 *
 * Props:
 *   className — size and shape, e.g. "h-4 w-32" or "h-10 w-10 rounded-full"
 */
export default function Skeleton({ className = '', style }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} style={style} />;
}

/** A few text lines; the last one is shorter, like a real paragraph. */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div aria-hidden="true" className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-3" style={{ width: i === lines - 1 ? '62%' : '100%' }} />
      ))}
    </div>
  );
}
