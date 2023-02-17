/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/index.js'
  ],
  theme: {
    extend: {
      colors: {
        'cyan': '#00FFFF',
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
