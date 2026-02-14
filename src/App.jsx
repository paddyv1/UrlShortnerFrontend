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
      <h1>URL Shortener</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Paste your URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>

      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}

      {shortenedUrl && (
        <div className="result">
          <h2>Shortened URL:</h2>
          <p>{shortenedUrl}</p>
          <button onClick={() => navigator.clipboard.writeText(shortenedUrl)}>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
