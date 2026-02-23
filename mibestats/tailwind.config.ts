import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Mibera brand palette
        mibera: {
          gold:    '#FFD700',
          silver:  '#C0C0C0',
          bronze:  '#CD7F32',
          purple:  '#7C3AED',
          pink:    '#EC4899',
          dark:    '#0A0A0A',
          surface: '#111111',
          border:  '#222222',
        },
        // Swag Rank colours
        rank: {
          sss: '#FFD700',
          ss:  '#C0C0C0',
          s:   '#CD7F32',
          a:   '#7C3AED',
          b:   '#3B82F6',
          c:   '#22C55E',
          d:   '#6B7280',
          f:   '#374151',
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
