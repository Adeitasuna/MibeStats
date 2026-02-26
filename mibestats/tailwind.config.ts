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
        // New design system
        mibe: {
          bg:        '#0d1117',
          'bg-alt':  '#1a1a2e',
          sidebar:   '#161b22',
          card:      '#21262d',
          hover:     '#30363d',
          border:    '#30363d',
          gold:      '#ffd700',
          cyan:      '#58a6ff',
          blue:      '#1f6feb',
          magenta:   '#ff69b4',
          green:     '#3fb950',
          red:       '#f85149',
          text:      '#e6edf3',
          'text-2':  '#8b949e',
          muted:     '#6e7681',
        },
        // Legacy Mibera brand palette
        mibera: {
          gold:    '#FFD700',
          silver:  '#C0C0C0',
          bronze:  '#CD7F32',
          purple:  '#7C3AED',
          pink:    '#EC4899',
          dark:    '#0d1117',
          surface: '#21262d',
          border:  '#30363d',
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
        title: ['"Pirata One"', 'cursive'],
        body:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:  ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
