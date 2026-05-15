/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all files in app/ and src/ for class names
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
}

