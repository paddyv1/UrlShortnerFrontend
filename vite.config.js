/**
 * Vite Configuration
 *
 * Vite is the build tool and development server for this project.
 * Configuration:
 * - React plugin for JSX/TSX support and Fast Refresh
 * - Default development server settings
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // Enable React support with Fast Refresh
});
