import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4fa",
          100: "#d9e3f1",
          200: "#b1c4e0",
          300: "#7d9bc6",
          400: "#4a72ab",
          500: "#2a5290",
          600: "#1e3d70",
          700: "#162e57",
          800: "#0f2142",
          900: "#0a1730",
          950: "#050d1c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
