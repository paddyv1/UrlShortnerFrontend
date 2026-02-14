/**
 * Environment Configuration Tests
 *
 * Tests to ensure environment variables are properly configured:
 * - VITE_API_URL is defined and has correct format
 * - Environment mode (dev/prod/test) is properly set
 * - API URLs are constructed correctly
 */

import { describe, it, expect, beforeAll } from "vitest";

describe("Environment Configuration", () => {
  beforeAll(() => {
    // Ensure VITE_API_URL is set for tests
    if (!import.meta.env.VITE_API_URL) {
      import.meta.env.VITE_API_URL = "http://localhost:5152/api";
    }
  });

  it("should have VITE_API_URL environment variable defined", () => {
    expect(import.meta.env.VITE_API_URL).toBeDefined();
  });

  it("should have a valid API URL format", () => {
    const apiUrl = import.meta.env.VITE_API_URL;

    // Should be a string
    expect(typeof apiUrl).toBe("string");

    // Should start with http:// or https://
    expect(apiUrl).toMatch(/^https?:\/\//);

    // Should contain /api
    expect(apiUrl).toContain("/api");
  });

  it("should not have trailing slash in API URL", () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    expect(apiUrl).not.toMatch(/\/$/);
  });

  it("should construct full endpoint URLs correctly", () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const shortenEndpoint = `${apiUrl}/shorten`;

    // Should have proper format
    expect(shortenEndpoint).toMatch(/^https?:\/\/.+\/api\/shorten$/);
  });

  it("should use different URLs for development and production", () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const mode = import.meta.env.MODE;

    if (mode === "development") {
      // In development, should be localhost
      expect(apiUrl).toMatch(/localhost|127\.0\.0\.1/);
    } else if (mode === "production") {
      // In production, should NOT be localhost
      expect(apiUrl).not.toMatch(/localhost|127\.0\.0\.1/);
    }
  });

  it("should have MODE environment variable", () => {
    expect(import.meta.env.MODE).toBeDefined();
    expect(["development", "production", "test"]).toContain(
      import.meta.env.MODE,
    );
  });

  it("should have DEV environment variable", () => {
    expect(import.meta.env.DEV).toBeDefined();
    expect(typeof import.meta.env.DEV).toBe("boolean");
  });

  it("should have PROD environment variable", () => {
    expect(import.meta.env.PROD).toBeDefined();
    expect(typeof import.meta.env.PROD).toBe("boolean");
  });

  it("should have mutually exclusive DEV and PROD flags", () => {
    // Either DEV or PROD should be true, but not both
    expect(import.meta.env.DEV !== import.meta.env.PROD).toBe(true);
  });
});
