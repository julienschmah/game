/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0d13',
        panel: '#101420',
        neon: '#7aa2f7'
      }
    },
  },
  plugins: [],
}
