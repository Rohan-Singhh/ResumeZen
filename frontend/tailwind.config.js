/**
 * ResumeZen design tokens — "Ink & Paper".
 *
 * A warm ink-dark studio, resumes as paper, and one vermilion accent that
 * always means "a mark on your resume" (the seal, the red pen). Tokens are
 * semantic: components reference roles (surface, ink, line, paper, good/warn/
 * bad), never raw hues.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        // Red-pen margin notes inside illustrations only
        hand: ['Caveat', 'cursive'],
      },

      colors: {
        // Backgrounds, darkest to lightest
        surface: {
          sunken: '#080706',  // wells: inputs, code, inset tracks
          void: '#0B0A09',    // page
          DEFAULT: '#131210', // card
          raised: '#1B1916',  // hover / raised card / dialog
          overlay: '#24211D', // popovers, menus, toasts
        },
        // Hairlines (warm white at low alpha so they sit on any surface)
        line: {
          DEFAULT: 'rgba(239,233,220,0.09)',
          strong: 'rgba(239,233,220,0.17)',
        },
        // Text on ink surfaces
        ink: {
          DEFAULT: '#EFE9DC',
          muted: '#ABA497',
          faint: '#8A8478',
        },
        // The resume itself, and anything that should read as a physical sheet
        paper: {
          DEFAULT: '#F1EBDD',
          bright: '#FBF7EE',
          dim: '#E2DAC8',
          ink: '#1B1916',
          muted: '#5E584E',
          line: 'rgba(27,25,22,0.14)',
        },
        // Vermilion: the seal and the red pen. Marks, never decoration.
        primary: {
          DEFAULT: '#E0472C',
          dark: '#BE3920',
          light: '#F27A5E',
        },
        // Status tones
        good: '#74B88F', // jade
        warn: '#DBA748', // ochre
        bad: '#EE6A5B',  // soft red, lighter than the seal so the two never read as one
      },

      // Controls 8 · cards 12 · panels 16 · feature blocks 24 · paper sheets 3
      borderRadius: {
        sheet: '3px',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },

      // Elevation on a dark UI is mostly a lit top edge plus a deep, tight shadow
      boxShadow: {
        e1: 'inset 0 1px 0 rgba(255,250,240,0.04), 0 1px 2px rgba(0,0,0,0.4)',
        e2: 'inset 0 1px 0 rgba(255,250,240,0.05), 0 12px 28px -14px rgba(0,0,0,0.7)',
        e3: 'inset 0 1px 0 rgba(255,250,240,0.06), 0 32px 80px -24px rgba(0,0,0,0.85), 0 8px 24px -12px rgba(0,0,0,0.6)',
        sheet: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.35), 0 28px 60px -28px rgba(0,0,0,0.9)',
        'button': 'inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 2px rgba(0,0,0,0.4)',
      },

      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '400ms',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
      },

      keyframes: {
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
      },
      animation: {
        sweep: 'sweep 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out both',
        drift: 'drift 90s linear infinite',
      },

      maxWidth: {
        shell: '1200px',
        prose: '62ch',
      },
    },
  },
  plugins: [],
}
