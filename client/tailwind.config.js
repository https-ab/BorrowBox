/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F4',
        ink: {
          DEFAULT: '#17141F',
          soft: '#4B4658',
          muted: '#8B8697',
        },
        brand: {
          50: '#F1EFFE',
          100: '#E4E0FD',
          200: '#CCC5FB',
          300: '#ACA0F8',
          400: '#8B79F5',
          500: '#6D5EF3',
          600: '#5843E8',
          700: '#4733C7',
          800: '#3A2BA0',
          900: '#2F2478',
        },
        lime: {
          300: '#E2F9A0',
          400: '#D3F573',
          500: '#C2EE4A',
          600: '#A8D62E',
        },
        mint: {
          100: '#DCFCE7',
          500: '#22C55E',
          700: '#15803D',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(23, 20, 31, 0.06), 0 8px 24px -8px rgba(23, 20, 31, 0.08)',
        lift: '0 4px 16px -4px rgba(23, 20, 31, 0.10), 0 16px 40px -12px rgba(23, 20, 31, 0.16)',
        glow: '0 0 0 4px rgba(109, 94, 243, 0.15)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '4xl': '2rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
