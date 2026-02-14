import { useState } from "react";
import "./App.css";
import { ShortenUrlRequest, ShortenUrlResponse } from "./types/dtos";

function App() {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortenedUrl("");
    ///comment
    try {
      // Create request DTO matching C# ShortenUrlRequest
      const requestDto = new ShortenUrlRequest(url);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestDto),
      });

      if (!response.ok) {
        throw new Error(response.statusText || "Failed to shorten URL");
      }

      const data = await response.json();
      console.log("Raw response data:", data);

      // Parse response DTO matching C# ShortenUrlResponse
      const responseDto = new ShortenUrlResponse(data);
      console.log("Response DTO:", responseDto);

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

  return (
    <div className="container">
      <div className="header">
        <div className="icon-wrapper">
          <svg
            className="logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
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

      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-wrapper">
          <input
            type="url"
            placeholder="Paste your URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={loading}
            className="url-input"
          />
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Shortening...
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Shorten URL
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
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
          <p>{error}</p>
        </div>
      )}

      {shortenedUrl && (
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
            <h2>Success!</h2>
          </div>
          <div className="url-display">
            <code>{shortenedUrl}</code>
          </div>
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(shortenedUrl)}
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
