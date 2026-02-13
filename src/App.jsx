import { useState } from "react";
import "./App.css";

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
      const response = await fetch("YOUR_API_ENDPOINT_HERE", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(response.statusText || "Failed to shorten URL");
      }

      const data = await response.json();
      setShortenedUrl(
        data.shortUrl || data.shortened_url || JSON.stringify(data),
      );
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
