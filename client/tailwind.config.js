/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        sand: "#f4efe2",
        gold: "#f9bf1a",
        steel: "#9a9a9a",
        smoke: "#141414"
      },
      fontFamily: {
        display: ["Times New Roman", "sans-serif"],
        body: ["Times New Roman", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(249, 191, 26, 0.15), 0 20px 50px rgba(0, 0, 0, 0.35)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(249, 191, 26, 0.09) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};
