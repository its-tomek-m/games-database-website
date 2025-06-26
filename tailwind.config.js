/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./about.html",
    "./sources.html",
    "./src/components/header.html",
    "./src/components/footer.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Catching all JS files in src and its subdirectories
  ],
  theme: {
    extend: {
      backgroundImage: {
        'footer-image': "url('../src/assets/images/background-games-pattern.svg')",
      },
    },
  },
  plugins: [],
}

