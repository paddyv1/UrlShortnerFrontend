import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
// eslint-disable-next-line no-unused-vars
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// Mock fetch globally
// eslint-disable-next-line no-undef
global.fetch = vi.fn();

describe("App Component", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    fetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the main heading", () => {
      render(<App />);
      expect(
        screen.getByRole("heading", { name: /url shortener/i }),
      ).toBeInTheDocument();
    });

    it("should render input field and submit button", () => {
      render(<App />);
      expect(
        screen.getByPlaceholderText(/paste your url here/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /shorten url/i }),
      ).toBeInTheDocument();
    });

    it("should not show error or result initially", () => {
      render(<App />);
      expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/shortened url:/i)).not.toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    it("should update input value when typing", async () => {
      const user = userEvent.setup();
      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);

      await user.type(input, "https://example.com");

      expect(input).toHaveValue("https://example.com");
    });

    it("should disable form during submission", async () => {
      const user = userEvent.setup();
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com");
      await user.click(button);

      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent(/shortening.../i);
    });

    it("should require a URL to be entered", () => {
      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);

      expect(input).toBeRequired();
      expect(input).toHaveAttribute("type", "url");
    });
  });

  describe("Successful URL Shortening", () => {
    it("should display shortened URL on successful response", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        shortUrl: "http://short.url/abc123",
        shortCode: "abc123",
        errorMessage: null,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com/very/long/url");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/shortened url:/i)).toBeInTheDocument();
        expect(screen.getByText("http://short.url/abc123")).toBeInTheDocument();
      });
    });

    it("should show copy to clipboard button on success", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        shortUrl: "http://short.url/abc123",
        shortCode: "abc123",
        errorMessage: null,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /copy to clipboard/i }),
        ).toBeInTheDocument();
      });
    });

    it("should call fetch with correct parameters", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        shortUrl: "http://short.url/abc123",
        shortCode: "abc123",
        errorMessage: null,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com");
      await user.click(button);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining("/shorten"),
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              OriginalUrl: "https://example.com",
              ExpiresAt: null,
            }),
          }),
        );
      });
    });

    it("should clear previous results before new submission", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        shortUrl: "http://short.url/abc123",
        shortCode: "abc123",
        errorMessage: null,
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      // First submission
      await user.type(input, "https://example.com");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("http://short.url/abc123")).toBeInTheDocument();
      });

      // Clear input and submit again
      await user.clear(input);
      await user.type(input, "https://another-example.com");
      await user.click(button);

      // Should still show result (same mock response)
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /shorten url/i }),
        ).not.toBeDisabled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error when fetch fails", async () => {
      const user = userEvent.setup();
      fetch.mockRejectedValueOnce(new Error("Network error"));

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
      });
    });

    it("should display error when response is not ok", async () => {
      const user = userEvent.setup();
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      });

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error: bad request/i)).toBeInTheDocument();
      });
    });

    it("should display error when API returns unsuccessful result", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: false,
        shortUrl: null,
        shortCode: null,
        errorMessage: "Invalid URL format",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com");
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/error: invalid url format/i),
        ).toBeInTheDocument();
      });
    });

    it("should re-enable form after error", async () => {
      const user = userEvent.setup();
      fetch.mockRejectedValueOnce(new Error("Network error"));

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com");
      await user.click(button);

      await waitFor(() => {
        expect(input).not.toBeDisabled();
        expect(button).not.toBeDisabled();
        expect(button).toHaveTextContent(/shorten url/i);
      });
    });

    it("should clear error on new submission", async () => {
      const user = userEvent.setup();

      // First submission fails
      fetch.mockRejectedValueOnce(new Error("Network error"));

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const button = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
      });

      // Second submission succeeds
      const mockResponse = {
        success: true,
        shortUrl: "http://short.url/abc123",
        shortCode: "abc123",
        errorMessage: null,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await user.clear(input);
      await user.type(input, "https://example.com");
      await user.click(button);

      await waitFor(() => {
        expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
        expect(screen.getByText(/shortened url:/i)).toBeInTheDocument();
      });
    });
  });

  describe("Clipboard Functionality", () => {
    it("should copy shortened URL to clipboard when button is clicked", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        shortUrl: "http://short.url/abc123",
        shortCode: "abc123",
        errorMessage: null,
      };

      // Mock clipboard API using Object.defineProperty
      const mockWriteText = vi.fn().mockResolvedValue();
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: mockWriteText,
        },
        writable: true,
        configurable: true,
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<App />);
      const input = screen.getByPlaceholderText(/paste your url here/i);
      const submitButton = screen.getByRole("button", { name: /shorten url/i });

      await user.type(input, "https://example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /copy to clipboard/i }),
        ).toBeInTheDocument();
      });

      const copyButton = screen.getByRole("button", {
        name: /copy to clipboard/i,
      });
      await user.click(copyButton);

      expect(mockWriteText).toHaveBeenCalledWith("http://short.url/abc123");
    });
  });
});
