// Core React imports
import { useState, useEffect } from "react";
// Component styles
import "./App.css";
// Data Transfer Objects for API communication
import {
  ShortenUrlRequest,
  ShortenUrlResponse,
  QrCodeRequest,
} from "./types/dtos";

/**
 * Main App Component - URL Shortener Application
 *
 * This component provides a user interface for shortening URLs by:
 * - Accepting a long URL from the user
 * - Sending it to the backend API
 * - Displaying the shortened URL result
 * - Handling errors gracefully
 */
function App() {
  // State management for form and UI
  const [url, setUrl] = useState(""); // User's input URL to be shortened
  const [shortenedUrl, setShortenedUrl] = useState(""); // The resulting short URL from API
  const [loading, setLoading] = useState(false); // Loading state during API call
  const [error, setError] = useState(""); // Error message to display to user
  const [selectedTime, setSelectedTime] = useState("30 Days");

  // QR Code Generator states
  const [qrUrl, setQrUrl] = useState(""); // URL to generate QR code for
  const [qrCode, setQrCode] = useState(""); // Generated QR code image
  const [qrLoading, setQrLoading] = useState(false); // Loading state for QR generation
  const [qrError, setQrError] = useState(""); // Error message for QR generation
  const [showPokedex, setShowPokedex] = useState(false); // Toggle for Pokédex option
  const [pokedexNumber, setPokedexNumber] = useState("001"); // Selected Pokédex number

  useEffect(() => {
    return () => {
      if (qrCode && qrCode.startsWith("blob:")) {
        URL.revokeObjectURL(qrCode);
      }
    };
  }, [qrCode]);

  const handleChange = (event) => {
    setSelectedTime(event.target.value);
  };

  /**
   * Calculate expiry date based on selected time period
   * @param {string} timeOption - The selected time option ("30 Days", "60 Days", "90 Days")
   * @returns {string} ISO 8601 formatted date string
   */
  const calculateExpiryDate = (timeOption) => {
    const now = new Date();
    const days = parseInt(timeOption.split(" ")[0]); // Extract number from "30 Days"
    now.setDate(now.getDate() + days);
    return now.toISOString();
  };

  /**
   * Validate if the URL is from the correct short URL domain
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  const isValidShortUrl = (url) => {
    console.log("Validating URL:", url);

    try {
      return url.trim().startsWith("smallurl.co.uk");
    } catch (error) {
      console.error("URL validation error:", error);
      return false;
    }
  };

  /**
   * Handle form submission to shorten URL
   *
   * @param {Event} e - Form submission event
   *
   * Process:
   * 1. Prevent default form submission
   * 2. Clear previous results and errors
   * 3. Send POST request to API with URL
   * 4. Parse and validate response
   * 5. Display shortened URL or error message
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true); // Show loading state to user
    setError(""); // Clear any previous errors
    setShortenedUrl(""); // Clear any previous results

    try {
      // Calculate expiry date based on selected time
      const expiresAt = calculateExpiryDate(selectedTime);

      // Create request Data Transfer Object with expiry date
      const requestDto = new ShortenUrlRequest(url, expiresAt);
      // Make POST request to backend API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Inform server we're sending JSON
        },
        body: JSON.stringify(requestDto), // Convert DTO to JSON string
      });

      // Check if HTTP response status indicates an error
      if (!response.ok) {
        throw new Error(response.statusText || "Failed to shorten URL");
      }

      // Parse JSON response from server
      const data = await response.json();

      // Create response DTO to match backend C# model
      const responseDto = new ShortenUrlResponse(data);

      if (!responseDto.Success) {
        throw new Error(responseDto.ErrorMessage || "Failed to shorten URL");
      }

      setShortenedUrl(responseDto.ShortUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle QR code generation
   * @param {Event} e - Form submission event
   */
  const handleQrSubmit = async (e) => {
    e.preventDefault();
    setQrLoading(true);
    setQrError("");
    setQrCode("");

    try {
      if (!isValidShortUrl(qrUrl)) {
        throw new Error(
          "Invalid URL. Please use a shortened URL from smallurl.co.uk",
        );
      }

      // Extract shortcode from URL
      const shortcode = qrUrl.slice(-7);

      // Build query parameters for GET request or use POST with body
      // Option 1: Using POST with JSON body
      const requestDto = new QrCodeRequest(
        shortcode, // ShortenedUrl
        showPokedex, // PokemonSprite
        showPokedex ? pokedexNumber : null, // PkdexNumber (nullable)
      );
      const response = await fetch(`${import.meta.env.VITE_API_URL}/QRCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestDto),
      });

      if (!response.ok) {
        // Try to parse error message if backend sends JSON error
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              errorData.error ||
              "Failed to generate QR code",
          );
        }
        throw new Error(`Failed to generate QR code: ${response.statusText}`);
      }

      // Get the image as a blob (binary data)
      const blob = await response.blob();

      // Create a local URL for the blob to display in <img> tag
      const imageUrl = URL.createObjectURL(blob);
      setQrCode(imageUrl);

      // Optional: Get filename from Content-Disposition header if backend provides it
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          // Store filename for download if needed
          console.log("QR Code filename:", filenameMatch[1]);
        }
      }
    } catch (err) {
      setQrError(err.message || "Failed to generate QR code");
      console.error("QR Code generation error:", err);
    } finally {
      setQrLoading(false);
    }
  };

  /**
   * Handle Pokédex number input validation
   * @param {string} value - Input value
   */
  const handlePokedexChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 3 digits
    if (/^\d{0,3}$/.test(value)) {
      const num = parseInt(value) || 0;
      if (num >= 0 && num <= 479) {
        setPokedexNumber(value.padStart(3, "0"));
      }
    }
  };

  // Render the UI
  return (
    <div className="container">
      {/* Header section with logo, title and subtitle */}
      <div className="header">
        {/* Animated link icon */}
        <div className="icon-wrapper">
          <svg
            className="logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            {/* Chain link icon path */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <h1>URL Shortener</h1>
        <p className="subtitle">
          Transform your long URLs into short, shareable links
        </p>
      </div>

      {/* Main form for URL input and submission */}
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-wrapper">
          {/* URL input field with validation */}
          <input
            type="url" // Browser validates URL format
            placeholder="Paste your URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required // Field cannot be empty
            disabled={loading} // Disable during API call
            className="url-input"
          />
          <div className="expiry-section">
            <p className="expiry-label">Set your link's expiry time:</p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="time"
                  value="30 Days"
                  checked={selectedTime === "30 Days"}
                  onChange={handleChange}
                />
                <span className="radio-text">30 Days</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="time"
                  value="60 Days"
                  checked={selectedTime === "60 Days"}
                  onChange={handleChange}
                />
                <span className="radio-text">60 Days</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="time"
                  value="90 Days"
                  checked={selectedTime === "90 Days"}
                  onChange={handleChange}
                />
                <span className="radio-text">90 Days</span>
              </label>
            </div>
          </div>
          {/* Submit button with loading state */}
          <button type="submit" disabled={loading} className="submit-btn">
            {/* Show different content based on loading state */}
            {loading ? (
              <>
                {/* Animated spinner during loading */}
                <span className="spinner"></span>
                Shortening...
              </>
            ) : (
              <>
                {/* Lightning bolt icon for action */}
                <svg
                  className="btn-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Shorten URL
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error notification - only shown when there's an error */}
      {error && (
        <div className="error notification">
          {/* Alert icon for error state */}
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {/* Success result - only shown when we have a shortened URL */}
      {shortenedUrl && (
        <div className="result notification">
          {/* Success header with checkmark icon */}
          <div className="result-header">
            <svg
              className="success-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              {/* Checkmark circle icon */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2>Success!</h2>
          </div>
          {/* Display the shortened URL in a styled code block */}
          <div className="url-display">
            <code>{shortenedUrl}</code>
          </div>
          {/* Button to copy shortened URL to clipboard */}
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(shortenedUrl)}
          >
            {/* Copy icon */}
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy to Clipboard
          </button>
        </div>
      )}

      <div className="qr-code-generator">
        <h2>QR Code Generator</h2>
        <p style={{ fontStyle: "italic", fontSize: "0.9rem" }}>
          Currently in beta
        </p>
        <p>Generate a QR code for your shortened URL</p>

        {/* QR Code Generation Form */}
        <form onSubmit={handleQrSubmit} className="qr-form">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Enter your shortened URL"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              required
              disabled={qrLoading}
              className="url-input"
            />

            {/* Pokédex Option Checkbox */}
            <div className="pokedex-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showPokedex}
                  onChange={(e) => setShowPokedex(e.target.checked)}
                />
                <span>Add Pokédex Number (Gen 1-5)</span>
              </label>

              {/* Pokédex Number Input */}
              {showPokedex && (
                <div className="pokedex-input-wrapper">
                  <label htmlFor="pokedex-number">
                    Pokédex Number (001-479):
                  </label>
                  <input
                    id="pokedex-number"
                    type="number"
                    min="1"
                    max="479"
                    value={parseInt(pokedexNumber)}
                    onChange={handlePokedexChange}
                    className="pokedex-input"
                    placeholder="001"
                  />
                </div>
              )}
            </div>

            <button type="submit" disabled={qrLoading} className="submit-btn">
              {qrLoading ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="btn-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  Generate QR Code
                </>
              )}
            </button>
          </div>
        </form>

        {/* QR Error Display */}
        {qrError && (
          <div className="error notification">
            <svg
              className="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>{qrError}</p>
          </div>
        )}

        {/* QR Code Display */}
        {qrCode && (
          <div className="result notification">
            <div className="result-header">
              <svg
                className="success-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2>QR Code Generated!</h2>
            </div>
            <div className="qr-code-display">
              <img src={qrCode} alt="QR Code" />
              {showPokedex && (
                <p className="pokedex-info">
                  Pokédex #{pokedexNumber} included
                </p>
              )}
            </div>
            <button
              className="copy-btn"
              onClick={async () => {
                try {
                  // Fetch the blob again for download
                  const response = await fetch(qrCode);
                  const blob = await response.blob();

                  // Create download link
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `qr-code${showPokedex ? `-pokemon-${pokedexNumber}` : ""}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  // Clean up the URL object
                  URL.revokeObjectURL(link.href);
                } catch (error) {
                  console.error("Download failed:", error);
                }
              }}
            >
              <svg
                className="btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
