/**
 * Data Transfer Objects (DTOs)
 *
 * These classes define the structure of data exchanged between the frontend
 * and backend API. They match the C# models on the backend to ensure
 * type safety and consistency across the application.
 */

/**
 * ShortenUrlRequest DTO
 *
 * Represents the data sent to the API when requesting a URL to be shortened.
 * Matches the C# ShortenUrlRequest model on the backend.
 *
 * @param {string} OriginalUrl - The full URL to be shortened (required)
 * @param {string|null} ExpiresAt - Optional expiration date for the short URL (ISO 8601 format)
 */
export class ShortenUrlRequest {
  constructor(OriginalUrl, ExpiresAt = null) {
    this.OriginalUrl = OriginalUrl;
    this.ExpiresAt = ExpiresAt;
  }
}

/**
 * ShortenUrlResponse DTO
 *
 * Represents the data received from the API after requesting a URL shortening.
 * Matches the C# ShortenUrlResponse model on the backend.
 *
 * This class maps the camelCase JSON response from the API to PascalCase
 * properties to match the C# naming conventions.
 *
 * @param {Object} data - The raw JSON response from the API
 * @param {boolean} data.success - Whether the operation was successful
 * @param {string} data.shortUrl - The complete shortened URL (e.g., "http://short.url/abc123")
 * @param {string} data.shortCode - Just the short code portion (e.g., "abc123")
 * @param {string|null} data.errorMessage - Error message if operation failed, null otherwise
 */
export class ShortenUrlResponse {
  constructor(data) {
    this.Success = data.success;
    this.ShortUrl = data.shortUrl;
    this.ShortCode = data.shortCode;
    this.ErrorMessage = data.errorMessage;
  }
}
