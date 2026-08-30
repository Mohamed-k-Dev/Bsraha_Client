/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f6f3',
          100: '#ede9e1',
          200: '#dccfb8',
          300: '#c4b291',
          400: '#a08d65',
          500: '#7d6c49',
          600: '#5d5037',
          700: '#3f3624',
          800: '#211b11',
          900: '#100c07',
          950: '#08060200',
        },
        paper: {
          50: '#fdfcf9',
          100: '#faf8f1',
          200: '#f4f0e4',
          300: '#ebe5d3',
        },
        ember: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        moss: {
          50: '#f1f8f0',
          100: '#e0f0dc',
          200: '#c2e1bb',
          300: '#97cb8c',
          400: '#6ab05b',
          500: '#4a9437',
          600: '#387728',
          700: '#2c5d20',
          800: '#23491b',
          900: '#1c3a17',
        },
        sky: {
          accent: '#2563a8',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,12,7,0.06), 0 8px 24px -12px rgba(16,12,7,0.18)',
        cardLg: '0 2px 4px rgba(16,12,7,0.06), 0 24px 48px -20px rgba(16,12,7,0.28)',
        float: '0 12px 40px -10px rgba(249,115,22,0.35)',
        inset: 'inset 0 1px 2px rgba(16,12,7,0.06)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-slower': 'float 9s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
