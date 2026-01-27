import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { fetcher, TIMEOUT_MS } from "../fetcher";
import {
  NetworkError,
  RateLimitError,
  ServerError,
  TimeoutError,
} from "../errors";

describe("fetcher", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Suppress console.warn for cleaner test output
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns JSON data on successful response", async () => {
    const mockData = { id: 1, name: "Test" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetcher<typeof mockData>(
      "https://api.example.com/data",
    );

    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/data",
      expect.objectContaining({
        headers: { Accept: "application/json" },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("throws RateLimitError for 429 status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers(),
    });

    await expect(fetcher("https://api.example.com/data")).rejects.toThrow(
      RateLimitError,
    );
  });

  it("throws ServerError for 500 status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
    });

    await expect(fetcher("https://api.example.com/data")).rejects.toThrow(
      ServerError,
    );
  });

  it("throws ServerError for 503 status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      headers: new Headers(),
    });

    const error = await fetcher("https://api.example.com/data").catch((e) => e);
    expect(error).toBeInstanceOf(ServerError);
    expect(error.status).toBe(503);
  });

  it("throws NetworkError when fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetcher("https://api.example.com/data")).rejects.toThrow(
      NetworkError,
    );
  });

  it("throws TimeoutError when request times out", async () => {
    // Mock fetch that never resolves but properly rejects on abort
    global.fetch = vi.fn().mockImplementation(
      (_url: string, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          // Immediately check if already aborted
          if (options.signal.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }
          options.signal.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    // Start the fetch and advance time in the same tick
    const fetchPromise = fetcher("https://api.example.com/data");

    // Advance timers past timeout
    vi.advanceTimersByTime(TIMEOUT_MS + 100);

    await expect(fetchPromise).rejects.toThrow(TimeoutError);
  });

  it("exports TIMEOUT_MS constant", () => {
    expect(TIMEOUT_MS).toBe(10000);
  });

  it("logs warning for errors", async () => {
    // console.warn is already mocked in beforeEach
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
    });

    await fetcher("https://api.example.com/data").catch(() => {});

    expect(console.warn).toHaveBeenCalled();
  });
});
