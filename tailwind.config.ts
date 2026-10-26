import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#06101a",
        parchment: "#f1c77d",
        sand: "#c58c48",
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(246, 190, 92, .28), 0 12px 42px rgba(246, 171, 57, .16)",
      },
    },
  },
  plugins: [],
};

export default config;
