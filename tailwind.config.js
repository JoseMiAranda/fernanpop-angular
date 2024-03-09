/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        products: 'repeat(auto-fill, minmax(300px, 1fr))',
      }
    },
  },
  plugins: [
    require('tailwindcss-animated')
  ],
}

