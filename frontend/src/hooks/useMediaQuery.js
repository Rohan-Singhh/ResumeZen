import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query.
 * Use only where behaviour (not just styling) differs by breakpoint; styling
 * belongs in Tailwind's responsive classes.
 *
 * @param {string} query - e.g. '(min-width: 1024px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
