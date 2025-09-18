/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'gmarket': ['GmarketSans', 'sans-serif'],
        'noto': ['Noto Sans KR', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        'synapse': {
          'primary': '#4A90E2',
          'secondary': '#FF41D5',
          'bg': '#0D1117',
          'surface': '#161B22',
          'text': '#E6EDF3',
          'text-muted': '#8B949E',
          'border': '#30363D',
          'success': '#238636',
          'warning': '#F85149',
          'info': '#1F6FEB',
        },
        'team': {
          'openai': '#10A37F',
          'google': '#4285F4',
          'anthropic': '#D97706',
          'xai': '#8B5CF6',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
        'gradient': 'gradient 6s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        }
      },
      typography: {
        'synapse': {
          css: {
            '--tw-prose-body': '#E6EDF3',
            '--tw-prose-headings': '#E6EDF3',
            '--tw-prose-lead': '#8B949E',
            '--tw-prose-links': '#4A90E2',
            '--tw-prose-bold': '#E6EDF3',
            '--tw-prose-counters': '#8B949E',
            '--tw-prose-bullets': '#8B949E',
            '--tw-prose-hr': '#30363D',
            '--tw-prose-quotes': '#8B949E',
            '--tw-prose-quote-borders': '#30363D',
            '--tw-prose-captions': '#8B949E',
            '--tw-prose-code': '#E6EDF3',
            '--tw-prose-pre-code': '#E6EDF3',
            '--tw-prose-pre-bg': '#161B22',
            '--tw-prose-th-borders': '#30363D',
            '--tw-prose-td-borders': '#30363D',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
