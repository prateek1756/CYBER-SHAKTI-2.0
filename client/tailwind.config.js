/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: "#080c14",
          card: "#0d1321",
          teal: "#14b8a6",
          cyan: "#0ea5e9",
          red: "#ef4444",
          border: "#1f2937",
          text: "#e2e8f0"
        }
      }
    },
  },
  plugins: [],
}
