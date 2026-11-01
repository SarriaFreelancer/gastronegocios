import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFC928",
          yellowHover: "#E5B31F",
          black: "#151515",
          darkBg: "#080808",
          card: "#141414",
          cardBorder: "#272727",
          cardHover: "#1E1E1E",
          orange: "#E94B24",
          whatsapp: "#25D366",
          grayText: "#A3A3A3",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        heading: ["var(--font-montserrat)", "sans-serif"],
        sans: ["var(--font-poppins)", "sans-serif"],
        script: ["Brush Script MT", "cursive", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(255, 201, 40, 0.25)",
        glowStrong: "0 0 40px rgba(255, 201, 40, 0.45)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};
export default config;
