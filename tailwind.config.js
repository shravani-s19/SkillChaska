/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#00BCD4', light: '#B2EBF2' },
        accent: '#FFA932',
        background: '#171717',
        surface: '#262626',
        border: '#2F2F2F',
        text: { DEFAULT: '#FFFFFF', muted: '#A3A3A3' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}