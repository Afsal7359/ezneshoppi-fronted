/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
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
        peach: {
          50: '#fef6f0',
          100: '#fbe8da',
          200: '#f7d1b5',
          300: '#f1b488',
        },
        ink: {
          900: '#0b1220',
          800: '#141c2e',
          700: '#1f2a3d',
          500: '#64748b',
          400: '#94a3b8',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15,23,42,0.06)',
        card: '0 2px 12px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.04)',
        lift: '0 18px 40px -12px rgba(15,23,42,0.18)',
      },
      borderRadius: { xl2: '1.25rem' },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        fadeUp: 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
