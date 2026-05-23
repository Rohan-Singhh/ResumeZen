export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
      },
      colors: {
        // Neon Electric Purple / Blue vibe
        primary: '#8b5cf6', // Violet
        'primary-dark': '#7c3aed',
        'primary-light': '#a78bfa',
        secondary: '#06b6d4', // Cyan
        'secondary-dark': '#0891b2',
        accent: '#f472b6', // Pink
        
        // Dark Mode Base Colors
        dark: {
          bg: '#09090b', // Zinc 950
          card: '#18181b', // Zinc 900
          border: '#27272a', // Zinc 800
        },

        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        red: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        amber: {
          500: '#f59e0b',
        },
        purple: {
          500: '#a855f7',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-secondary': '0 0 20px rgba(6, 182, 212, 0.5)',
        'glow-accent': '0 0 20px rgba(244, 114, 182, 0.5)',
      },
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'spacing': 'margin, padding',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '0% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'fade-in': 'fadeIn 0.3s ease-out',
        'blob': 'blob 7s infinite',
      }
    },
  },
  safelist: [
    'border-blue-500',
    'border-green-500',
    'border-purple-500',
    'border-amber-500',
    'bg-blue-100',
    'bg-green-100',
    'bg-purple-100',
    'bg-amber-100',
    'text-blue-600',
    'text-green-600',
    'text-purple-600',
    'text-amber-600',
    'text-green-500',
    'text-red-500',
    'text-gray-500',
  ],
  plugins: [],
}