/** @type {import('tailwindcss').Config} */

module.exports = {
    content: [
        './src/components/*.{js,jsx,ts,tsx}',
        './src/index.js'
    ],
    theme: {
      extend: {
        colors: {
            'cyan': '#00FFFF',
            'dark': '#121233',
        }
      },
    },
    plugins: [],
  }