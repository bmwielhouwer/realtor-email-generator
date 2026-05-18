import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B2447",
          50: "#f3f4f8",
          100: "#dfe2ec",
          200: "#b6bccf",
          300: "#8089a8",
          400: "#4f597d",
          500: "#2c365e",
          600: "#1B2447",
          700: "#141b37",
          800: "#0e1328",
          900: "#080c1a",
        },
        gold: {
          DEFAULT: "#B8952A",
          50: "#fbf6e8",
          100: "#f3e5b3",
          200: "#e6ce78",
          300: "#d4b743",
          400: "#c4a330",
          500: "#B8952A",
          600: "#9a7c22",
          700: "#7c631b",
          800: "#5d4a14",
        },
        silver: {
          DEFAULT: "#8E9EAB",
          light: "#c0c9d3",
          dark: "#6b7a87",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
