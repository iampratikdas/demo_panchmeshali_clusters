/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#B8E986',
        secondary: '#6BCB77',
        background: '#F8FAF9',
        card: '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        danger: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        border: '#E5E7EB',
        primaryMuted: '#E8F8D8',
        secondaryMuted: '#E6F7E9',
        dangerMuted: '#FEE2E2',
        warningMuted: '#FEF3C7',
        successMuted: '#DCFCE7',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
