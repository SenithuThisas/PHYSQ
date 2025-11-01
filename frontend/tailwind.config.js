/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: {
          DEFAULT: "#0A0A0A",
          100: "#0A0A0A",
          200: "#161616"
        },
        violet: {
          500: "#7B2FFF",
          600: "#A259FF"
        }
      },
      boxShadow: {
        neon: "0 0 10px rgba(123,47,255,0.7), 0 0 20px rgba(162,89,255,0.5)"
      }
    }
  },
  plugins: []
};

