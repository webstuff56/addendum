/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",
    "./**/templates/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        // The Deep Navy for headers and text
        'navy-900': '#0A1128',
        
        // The Big Green Button (Forest Green)
        'forest-green': '#1B4332',
        
        // The warm background (Cream)
        'cream-50': '#FFFDF5',
        
        // The accent for bars or highlights (Gold)
        'accent-gold': '#D4AF37',
        
        // Conventional Black for fonts
        'conventional-black': '#000000',
      },
      fontFamily: {
        // High-trust serif for your headlines
        'serif': ['Playfair Display', 'serif'],
        // Clean sans-serif for body text
        'sans': ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}