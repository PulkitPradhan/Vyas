import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./domain/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        critical: "#dc2626",
        warning: "#d97706",
        watch: "#16a34a",
      },
    },
  },
  plugins: [],
};

export default config;
