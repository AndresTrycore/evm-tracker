/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          disabled: 'var(--text-disabled)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          subtle: 'var(--accent-subtle)',
        },
        health: {
          green: 'var(--health-green)',
          yellow: 'var(--health-yellow)',
          orange: 'var(--health-orange)',
          red: 'var(--health-red)',
          gray: 'var(--health-gray)',
        },
        glass: {
          bg: 'var(--glass-bg)',
          border: 'var(--glass-border)',
        }
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
      },
      backdropBlur: {
        md: '12px',
      }
    },
  },
  plugins: [],
}
