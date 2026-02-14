// Request DTO - Matches C# ShortenUrlRequest
export class ShortenUrlRequest {
  constructor(OriginalUrl, ExpiresAt = null) {
    this.OriginalUrl = OriginalUrl;
    this.ExpiresAt = ExpiresAt;
  }
}
//
// Response DTO - Matches C# ShortenUrlResponse
export class ShortenUrlResponse {
  constructor(data) {
    this.Success = data.success;
    this.ShortUrl = data.shortUrl;
    this.ShortCode = data.shortCode;
    this.ErrorMessage = data.errorMessage;
  }
}
