import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(240 10% 3.9%)",
        muted: "hsl(240 4.8% 95.9%)",
        primary: "hsl(221 83% 53%)",
        ring: "hsl(221 83% 53%)",
        destructive: "hsl(0 72% 51%)",
        secondary: "hsl(240 4.8% 95.9%)",
        border: "hsl(240 5.9% 90%)",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          "2xl": "1400px",
        },
      },
    },
  },
  plugins: [],
};

export default config;
