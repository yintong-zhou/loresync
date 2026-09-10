import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  // Include anche le regole TypeScript: eslint-config-next 16 espone un flat
  // config (array), non piu' un oggetto "extends".
  ...nextCoreWebVitals,
];

export default config;
