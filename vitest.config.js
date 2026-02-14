/**
 * Vitest Configuration
 *
 * Vitest is the testing framework for this project (Vite-native test runner).
 * Configuration:
 * - jsdom environment for DOM testing
 * - Global test APIs (describe, it, expect)
 * - Setup file for test initialization
 * - Code coverage reporting with v8
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()], // React support in tests
  test: {
    environment: "jsdom", // Simulate browser environment for React testing
    globals: true, // Make test functions globally available (no imports needed)
    setupFiles: "./src/test/setup.js", // Run setup before tests
    coverage: {
      provider: "v8", // Use V8 for coverage (faster than istanbul)
      reporter: ["text", "json", "html"], // Multiple coverage report formats
      exclude: [
        "node_modules/", // Don't measure coverage of dependencies
        "src/test/", // Don't measure coverage of test files
        "*.config.js", // Don't measure coverage of config files
      ],
    },
  },
});
