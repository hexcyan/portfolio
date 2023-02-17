/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/index.js'
  ],
  theme: {
    extend: {
      colors: {
        'cyan': {
          '50': '#edfffe',
          '100': '#c0feff',
          '200': '#81fbff',
          '300': '#3af8ff',
          '400': '#00ffff',
          '500': '#00e1e2',
          '600': '#00b2b7',
          '700': '#008c91',
          '800': '#006c72',
          '900': '#04585d',
        },      
        'rose': "#FF3053",
        'dark': '#10102E'
      },
    },
  },
  plugins: [],
}
