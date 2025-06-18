/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./about.html",
    "./sources.html",
    "./src/components/header.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Catching all JS files in src and its subdirectories
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

