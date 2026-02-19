import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Project-wide rule overrides
  {
    rules: {
      // Downgrade to warn — used widely in catch blocks and API routes; not a runtime bug
      "@typescript-eslint/no-explicit-any": "warn",
      // Downgrade to warn — isMounted + pathname-close patterns are intentional
      "react-hooks/set-state-in-effect": "warn",
      // Downgrade to warn — many imports are used for type inference only
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
]);

export default eslintConfig;
