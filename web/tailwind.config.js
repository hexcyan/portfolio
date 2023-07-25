/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/index.js'
  ],
  safelist: [
    'drop-shadow-[0_0_24px_cyan]',
    'drop-shadow-[0_0_24px_magenta]',
    'drop-shadow-[0_0_24px_yellow]',
    'drop-shadow-[0_0_24px_white]',
  ],
  theme: {
    extend: {
      colors: {
        'cyan': {
          DEFAULT: '#00FFFF',
          aero: '#00FFFF66',
        },
        'blue': {
          DEFAULT: '#1d6188',
          aero: '#1d6188be',
        },
        'yellow': '#FFFF00',
        'magenta': '#FF00FF',
        'rose': "#FF3053",
        'dark': '#10102E',
        'light': '#FFFFFF'
      },
    },
  },
  plugins: [],
}
