/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        epic: ['Cinzel', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(251, 191, 36, 0.5)',
        'gold-glow-lg': '0 0 25px rgba(251, 191, 36, 0.6)',
      }
    },
  },
  plugins: [],
}
