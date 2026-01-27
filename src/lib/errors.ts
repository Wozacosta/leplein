/**
 * Custom error classes for API error handling.
 * Provides typed errors with categorization for retry logic and user messaging.
 */

export type ErrorType = 'network' | 'server' | 'rate-limit' | 'timeout' | 'unknown';

/**
 * Base API error class with categorization properties.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly isRetryable: boolean = false,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error for network connectivity issues (fetch failures).
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Erreur de connexion') {
    super(message, 'NETWORK_ERROR', undefined, true);
    this.name = 'NetworkError';
  }
}

/**
 * Error for rate limiting (HTTP 429).
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number) {
    super('Trop de requêtes, veuillez patienter', 'RATE_LIMIT', 429, true);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Error for request timeout (AbortController).
 */
export class TimeoutError extends ApiError {
  constructor() {
    super('La requête a pris trop de temps', 'TIMEOUT', undefined, true);
    this.name = 'TimeoutError';
  }
}

/**
 * Error for server errors (HTTP 5xx).
 */
export class ServerError extends ApiError {
  constructor(status: number = 500) {
    super(`Erreur serveur (${status})`, 'SERVER_ERROR', status, true);
    this.name = 'ServerError';
  }
}

/**
 * Gets the error type for user-friendly messaging and styling.
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof NetworkError) return 'network';
  if (error instanceof RateLimitError) return 'rate-limit';
  if (error instanceof TimeoutError) return 'timeout';
  if (error instanceof ServerError) return 'server';
  if (error instanceof ApiError && error.status && error.status >= 500) return 'server';
  return 'unknown';
}

/**
 * Categorizes a raw error and HTTP status into a typed ApiError.
 * Use this in the fetcher to convert fetch errors into categorized errors.
 */
export function categorizeError(error: unknown, status?: number): ApiError {
  // Already categorized - return as-is
  if (error instanceof ApiError) {
    return error;
  }

  // AbortController timeout
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new TimeoutError();
  }

  // Network failure (fetch throws TypeError for network errors)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError();
  }

  // HTTP status-based categorization
  if (status !== undefined) {
    if (status === 429) {
      return new RateLimitError();
    }
    if (status >= 500) {
      return new ServerError(status);
    }
    if (status >= 400) {
      return new ApiError(
        error instanceof Error ? error.message : 'Erreur client',
        'CLIENT_ERROR',
        status,
        false,
      );
    }
  }

  // Unknown error
  return new ApiError(
    error instanceof Error ? error.message : 'Une erreur est survenue',
    'UNKNOWN_ERROR',
    undefined,
    false,
  );
}
