/**
 * Data Transfer Object Tests
 *
 * Tests for DTO classes that handle API communication:
 * - ShortenUrlRequest construction and properties
 * - ShortenUrlResponse parsing from API data
 * - Edge cases and error handling
 */

import { describe, it, expect } from "vitest";
import { ShortenUrlRequest, ShortenUrlResponse } from "./dtos";

describe("ShortenUrlRequest", () => {
  it("should create a request with original URL only", () => {
    const url = "https://example.com/very/long/url";
    const request = new ShortenUrlRequest(url);

    expect(request.OriginalUrl).toBe(url);
    expect(request.ExpiresAt).toBeNull();
  });

  it("should create a request with original URL and expiration date", () => {
    const url = "https://example.com/very/long/url";
    const expiresAt = "2026-12-31T23:59:59Z";
    const request = new ShortenUrlRequest(url, expiresAt);

    expect(request.OriginalUrl).toBe(url);
    expect(request.ExpiresAt).toBe(expiresAt);
  });

  it("should handle empty URL", () => {
    const request = new ShortenUrlRequest("");

    expect(request.OriginalUrl).toBe("");
    expect(request.ExpiresAt).toBeNull();
  });
});

describe("ShortenUrlResponse", () => {
  it("should parse a successful response", () => {
    const mockData = {
      success: true,
      shortUrl: "http://short.url/abc123",
      shortCode: "abc123",
      errorMessage: null,
    };

    const response = new ShortenUrlResponse(mockData);

    expect(response.Success).toBe(true);
    expect(response.ShortUrl).toBe("http://short.url/abc123");
    expect(response.ShortCode).toBe("abc123");
    expect(response.ErrorMessage).toBeNull();
  });

  it("should parse a failed response", () => {
    const mockData = {
      success: false,
      shortUrl: null,
      shortCode: null,
      errorMessage: "Invalid URL provided",
    };

    const response = new ShortenUrlResponse(mockData);

    expect(response.Success).toBe(false);
    expect(response.ShortUrl).toBeNull();
    expect(response.ShortCode).toBeNull();
    expect(response.ErrorMessage).toBe("Invalid URL provided");
  });

  it("should handle missing fields gracefully", () => {
    const mockData = {};
    const response = new ShortenUrlResponse(mockData);

    expect(response.Success).toBeUndefined();
    expect(response.ShortUrl).toBeUndefined();
    expect(response.ShortCode).toBeUndefined();
    expect(response.ErrorMessage).toBeUndefined();
  });

  it("should handle partial response data", () => {
    const mockData = {
      success: true,
      shortUrl: "http://short.url/xyz789",
    };

    const response = new ShortenUrlResponse(mockData);

    expect(response.Success).toBe(true);
    expect(response.ShortUrl).toBe("http://short.url/xyz789");
    expect(response.ShortCode).toBeUndefined();
    expect(response.ErrorMessage).toBeUndefined();
  });
});
