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
        // Cypherpunk design system
        mibe: {
          bg:        '#0a0a0a',
          'bg-alt':  '#111111',
          sidebar:   '#0e0e0e',
          card:      '#141414',
          hover:     '#1a1a1a',
          border:    '#2a2a2a',
          gold:      '#ffd700',
          cyan:      '#58a6ff',
          blue:      '#1f6feb',
          magenta:   '#ff69b4',
          green:     '#3fb950',
          red:       '#f85149',
          text:      '#e0e0e0',
          'text-2':  '#888888',
          muted:     '#555555',
        },
        // Legacy Mibera brand palette
        mibera: {
          gold:    '#FFD700',
          silver:  '#C0C0C0',
          bronze:  '#CD7F32',
          purple:  '#7C3AED',
          pink:    '#EC4899',
          dark:    '#0a0a0a',
          surface: '#141414',
          border:  '#2a2a2a',
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
        terminal: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
        body:  ['"Share Tech Mono"', '"Courier New"', 'monospace'],
        mono:  ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
