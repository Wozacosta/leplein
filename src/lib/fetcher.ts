import {
  ApiError,
  NetworkError,
  RateLimitError,
  ServerError,
  TimeoutError,
} from "./errors";

/** Timeout for API requests in milliseconds */
export const TIMEOUT_MS = 10000;

/**
 * Fetcher with timeout and categorized error handling.
 * Use with SWR for all API data fetching.
 */
export async function fetcher<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
      const error = categorizeHttpError(response.status, retryAfter);
      console.warn(`API error: ${url}`, error.code, error.status);
      throw error;
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    // Already categorized
    if (error instanceof ApiError) {
      throw error;
    }

    // Timeout (AbortController)
    if (error instanceof DOMException && error.name === "AbortError") {
      const timeoutError = new TimeoutError();
      console.warn(`Request timeout: ${url}`);
      throw timeoutError;
    }

    // Network failure
    if (error instanceof TypeError) {
      const networkError = new NetworkError();
      console.warn(`Network error: ${url}`, error.message);
      throw networkError;
    }

    // Unknown error
    const unknownError = new ApiError(
      error instanceof Error ? error.message : "Une erreur est survenue",
      "UNKNOWN_ERROR",
      undefined,
      false,
    );
    console.warn(`Unknown error: ${url}`, error);
    throw unknownError;
  }
}

/**
 * Categorizes HTTP status codes into typed errors.
 */
function categorizeHttpError(status: number, retryAfter?: number): ApiError {
  if (status === 429) {
    return new RateLimitError(retryAfter);
  }
  if (status >= 500) {
    return new ServerError(status);
  }
  return new ApiError(
    `Erreur client (${status})`,
    "CLIENT_ERROR",
    status,
    false,
  );
}

/**
 * Parses the Retry-After header value.
 * Can be either a number of seconds or an HTTP date.
 */
function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;

  // Try parsing as seconds
  const seconds = parseInt(value, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to milliseconds
  }

  // Try parsing as HTTP date
  const date = Date.parse(value);
  if (!isNaN(date)) {
    const delayMs = date - Date.now();
    return delayMs > 0 ? delayMs : undefined;
  }

  return undefined;
}
