/** @type {import('tailwindcss').Config} */

module.exports = {
    content: [
        './src/components/*.{js,jsx,ts,tsx}',
        './src/index.js'
    ],
    theme: {
        colors: {
          'cyan': '#00FFFF',
          'rose': '#FF546E',
          'orang': '#FF9F38',
          'dark': '#121233',
          'white': "#FFFFFF",
          'black': "#000000"
        }
    },
    plugins: [],
}