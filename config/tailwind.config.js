/** Tailwind configuration for Haven Estates */
module.exports = {
  content: [
    "./*.html",
    "./partials/**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F8F7F4",
        forest: {
          DEFAULT: "#183D32",
          deep: "#0E2A21",
          mid: "#1F4A3D",
          soft: "#2C5B4C"
        },
        ink: {
          DEFAULT: "#202522",
          soft: "#5C635D"
        },
        sage: {
          DEFAULT: "#A9B8A7",
          light: "#C6D0C2",
          dark: "#859A83"
        },
        sand: "#EAE4DA",
        brass: "#A9805B"
      },
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"]
      },
      maxWidth: {
        shell: "1320px",
        prose: "68ch"
      },
      borderRadius: {
        card: "10px",
        panel: "18px"
      },
      boxShadow: {
        soft: "0 24px 60px -32px rgba(16, 42, 33, 0.4)",
        lift: "0 34px 70px -42px rgba(16, 42, 33, 0.55)"
      },
      letterSpacing: {
        wider2: "0.18em",
        wider3: "0.28em"
      }
    }
  },
  plugins: []
};
