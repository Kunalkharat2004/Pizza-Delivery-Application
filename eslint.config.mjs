// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    ignores: [
      "dist",
      "node_modules",
      "eslint.config.mjs",
      "jest.config.js",      
      "src/tests/**/*",
      "src/tests",
      ".*mjs"
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: "module",
    },
  },
  {
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-unused-vars":"off"
    },
  }
);