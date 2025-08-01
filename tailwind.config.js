/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      /*animation: {
        'slide-right-to-left': 'slide-right-to-left linear forwards',
      },
      keyframes: {
        'slide-right-to-left': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animationPlayState: { 
        paused: 'paused',
        running: 'running',
      },*/
    },
  },
  plugins: [],
};