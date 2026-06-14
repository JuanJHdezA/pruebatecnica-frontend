/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a' // El azul profundo de tu login
      }
    }
  },
  plugins: []
};
