/**
 * ESLint Configuration
 *
 * ESLint is the linting tool that checks code quality and style.
 * Configuration:
 * - JavaScript recommended rules
 * - React Hooks rules for proper hook usage
 * - React Refresh rules for Fast Refresh compatibility
 * - Custom rule for unused variables (allows capitalized constants)
 */

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]), // Don't lint build output
  {
    files: ["**/*.{js,jsx}"], // Lint JS and JSX files
    extends: [
      js.configs.recommended, // Base JavaScript rules
      reactHooks.configs.flat.recommended, // React Hooks best practices
      reactRefresh.configs.vite, // Vite Fast Refresh compatibility
    ],
    languageOptions: {
      ecmaVersion: 2020, // Support modern JavaScript features
      globals: globals.browser, // Browser global variables (window, document, etc.)
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true }, // Enable JSX parsing
        sourceType: "module", // Use ES modules
      },
    },
    rules: {
      // Allow unused variables if they start with capital letter or underscore
      // (useful for React components that might be imported elsewhere)
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
]);
