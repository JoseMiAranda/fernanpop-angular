/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f1fbff',
        'on-surface': '#131d21',
        'on-surface-variant': '#3d4947',
        primary: '#006a62',
        'primary-container': '#3ba59a',
        secondary: '#586062',
        'outline-variant': '#bdc9c6',
        'surface-container-low': '#eaf5fa',
        'gallery-bg': '#f3f7f8',
      },
      fontFamily: {
        headline: ['Montserrat', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      maxWidth: {
        'container-max': '1280px',
      },
      spacing: {
        'margin-desktop': '64px',
        'margin-mobile': '16px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        'section-gap': '80px',
        gutter: '24px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animated')
  ],
}

