// Core React imports
import { useState } from "react";
// Component styles
import "./App.css";
// Data Transfer Objects for API communication
import { ShortenUrlRequest, ShortenUrlResponse } from "./types/dtos";

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
      // Create request Data Transfer Object matching backend C# model
      const requestDto = new ShortenUrlRequest(url);

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
    </div>
  );
}

export default App;
