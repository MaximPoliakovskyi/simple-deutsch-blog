// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ui: {
          darkButton: "#1F1F1F",
          darkButtonHover: "#2b2b2b",
        },
      },
    },
  },
} satisfies Config;
