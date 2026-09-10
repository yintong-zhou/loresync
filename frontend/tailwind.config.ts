import type { Config } from "tailwindcss";

// Valori da brand-guidelines.md (mood Bold).
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    // Raggio 0px: sovrascritto, non esteso, cosi' nessuna utility `rounded-*`
    // puo' reintrodurre angoli arrotondati per distrazione.
    borderRadius: {
      none: "0",
      DEFAULT: "0",
      sm: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    extend: {
      colors: {
        primary: "#E10600",
        secondary: "#050505",
        accent: "#FFC400",
        "neutral-dark": "#0A0A0A",
        "neutral-light": "#F5F5F5",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Impact", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      // Scala 8/16/32/64/128: salti ampi e deliberati, niente valori intermedi.
      spacing: {
        "step-1": "8px",
        "step-2": "16px",
        "step-3": "32px",
        "step-4": "64px",
        "step-5": "128px",
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
