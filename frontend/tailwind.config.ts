import type { Config } from "tailwindcss";

// Valori da brand-guidelines.md (mood Bold). I colori vivono in
// `app/globals.css` come variabili, perche' cambiano col tema.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  // La variante `dark:` segue le stesse regole delle variabili: scelta
  // esplicita (`data-theme`) prima, dispositivo solo se non c'e' scelta.
  // Serve dove il tema cambia cio' che si mostra e non un colore — il logo.
  darkMode: [
    "variant",
    [
      "@media (prefers-color-scheme: dark) { &:not([data-theme=light] *) }",
      "&:is([data-theme=dark] *)",
    ],
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
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "neutral-dark": "rgb(var(--color-neutral-dark) / <alpha-value>)",
        "neutral-light": "rgb(var(--color-neutral-light) / <alpha-value>)",
        // Fissi: non si scambiano nel tema scuro.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
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
