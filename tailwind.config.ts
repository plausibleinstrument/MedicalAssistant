import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f7f5",
          100: "#dfece6",
          500: "#2f6f5e",
          600: "#255a4c",
          700: "#1c4639",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-deva)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
