import { ApiError, RateLimitError } from "./errors";

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds before first retry */
  initialDelayMs: number;
  /** Multiplier for exponential backoff */
  multiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  multiplier: 2,
};

/**
 * Creates an SWR onErrorRetry handler with exponential backoff.
 * Only retries on errors marked as retryable (network, server, rate limit).
 * Respects Retry-After header for rate limit errors (429).
 */
export function createOnErrorRetry(config: RetryConfig = DEFAULT_RETRY_CONFIG) {
  return (
    error: Error,
    _key: string,
    _config: unknown,
    revalidate: (opts?: { retryCount?: number }) => void,
    { retryCount }: { retryCount: number },
  ): void => {
    // Only retry ApiError subclasses that are marked retryable
    if (!(error instanceof ApiError) || !error.isRetryable) {
      return;
    }

    // Max retries reached
    if (retryCount >= config.maxRetries) {
      return;
    }

    // Calculate delay with exponential backoff
    let delay = config.initialDelayMs * Math.pow(config.multiplier, retryCount);

    // Respect Retry-After header for rate limit errors (429)
    if (error instanceof RateLimitError && error.retryAfter !== undefined) {
      // retryAfter is already in milliseconds from the fetcher
      delay = Math.max(delay, error.retryAfter);
    }

    setTimeout(() => revalidate({ retryCount }), delay);
  };
}
