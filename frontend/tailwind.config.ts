import type { Config } from "tailwindcss";

// Valori derivati da brand-guidelines.md (LORESYNC, mood minimal).
// I colori sono esposti anche come CSS custom properties in app/globals.css.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#16181D",
        secondary: "#F4F5F7",
        accent: "#3457D5",
        "neutral-dark": "#3A3F4B",
        "neutral-light": "#E3E6EB",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      // Base 8px: la scala Tailwind di default e' in rem/4, questi alias
      // rendono espliciti gli step previsti dalle guideline.
      spacing: {
        "step-1": "8px",
        "step-2": "16px",
        "step-3": "24px",
        "step-4": "32px",
        "step-5": "48px",
        "step-6": "64px",
        "step-7": "96px",
      },
      borderRadius: {
        DEFAULT: "4px",
        lg: "8px",
      },
      maxWidth: {
        // 60-70 caratteri per riga sul body copy
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
