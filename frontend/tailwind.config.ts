import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F766E", // سبز-آبی متریاب (پایداری/بازیافت)
          dark: "#115E59",
        },
      },
    },
  },
  plugins: [],
};

export default config;
