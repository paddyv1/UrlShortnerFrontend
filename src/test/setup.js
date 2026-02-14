/**
 * Test Setup Configuration
 *
 * This file configures the testing environment:
 * - Imports jest-dom matchers for enhanced assertions
 * - Cleans up after each test to prevent memory leaks
 */

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Automatically cleanup DOM after each test to avoid memory leaks
afterEach(() => {
  cleanup();
});
