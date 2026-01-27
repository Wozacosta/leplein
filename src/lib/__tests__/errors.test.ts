import { describe, it, expect } from 'vitest';

import {
  ApiError,
  NetworkError,
  RateLimitError,
  TimeoutError,
  ServerError,
  getErrorType,
  categorizeError,
} from '../errors';

describe('Error Classes', () => {
  describe('ApiError', () => {
    it('creates error with all properties', () => {
      const error = new ApiError('Test error', 'TEST_CODE', 400, false);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.status).toBe(400);
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('ApiError');
    });

    it('defaults isRetryable to false', () => {
      const error = new ApiError('Test', 'CODE');

      expect(error.isRetryable).toBe(false);
    });
  });

  describe('NetworkError', () => {
    it('creates error with default message', () => {
      const error = new NetworkError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Erreur de connexion');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.status).toBeUndefined();
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe('NetworkError');
    });

    it('accepts custom message', () => {
      const error = new NetworkError('Custom network error');

      expect(error.message).toBe('Custom network error');
    });
  });

  describe('RateLimitError', () => {
    it('creates error with correct properties', () => {
      const error = new RateLimitError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Trop de requêtes, veuillez patienter');
      expect(error.code).toBe('RATE_LIMIT');
      expect(error.status).toBe(429);
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe('RateLimitError');
    });

    it('stores retryAfter value', () => {
      const error = new RateLimitError(60);

      expect(error.retryAfter).toBe(60);
    });
  });

  describe('TimeoutError', () => {
    it('creates error with correct properties', () => {
      const error = new TimeoutError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('La requête a pris trop de temps');
      expect(error.code).toBe('TIMEOUT');
      expect(error.status).toBeUndefined();
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe('TimeoutError');
    });
  });

  describe('ServerError', () => {
    it('creates error with status', () => {
      const error = new ServerError(503);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Erreur serveur (503)');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.status).toBe(503);
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe('ServerError');
    });

    it('defaults to status 500', () => {
      const error = new ServerError();

      expect(error.status).toBe(500);
    });
  });
});

describe('getErrorType', () => {
  it('returns "network" for NetworkError', () => {
    expect(getErrorType(new NetworkError())).toBe('network');
  });

  it('returns "rate-limit" for RateLimitError', () => {
    expect(getErrorType(new RateLimitError())).toBe('rate-limit');
  });

  it('returns "timeout" for TimeoutError', () => {
    expect(getErrorType(new TimeoutError())).toBe('timeout');
  });

  it('returns "server" for ServerError', () => {
    expect(getErrorType(new ServerError())).toBe('server');
  });

  it('returns "server" for ApiError with 5xx status', () => {
    expect(getErrorType(new ApiError('Test', 'CODE', 500))).toBe('server');
    expect(getErrorType(new ApiError('Test', 'CODE', 502))).toBe('server');
    expect(getErrorType(new ApiError('Test', 'CODE', 503))).toBe('server');
  });

  it('returns "unknown" for ApiError with 4xx status', () => {
    expect(getErrorType(new ApiError('Test', 'CODE', 400))).toBe('unknown');
    expect(getErrorType(new ApiError('Test', 'CODE', 404))).toBe('unknown');
  });

  it('returns "unknown" for generic Error', () => {
    expect(getErrorType(new Error('generic'))).toBe('unknown');
  });

  it('returns "unknown" for non-Error values', () => {
    expect(getErrorType('string error')).toBe('unknown');
    expect(getErrorType(null)).toBe('unknown');
    expect(getErrorType(undefined)).toBe('unknown');
  });
});

describe('categorizeError', () => {
  it('returns NetworkError for fetch failures', () => {
    const error = categorizeError(new TypeError('Failed to fetch'));

    expect(error).toBeInstanceOf(NetworkError);
  });

  it('returns RateLimitError for 429 status', () => {
    const error = categorizeError(new Error('API error'), 429);

    expect(error).toBeInstanceOf(RateLimitError);
  });

  it('returns ServerError for 5xx status', () => {
    const error500 = categorizeError(new Error('Server error'), 500);
    const error503 = categorizeError(new Error('Server error'), 503);

    expect(error500).toBeInstanceOf(ServerError);
    expect(error503).toBeInstanceOf(ServerError);
    expect((error500 as ServerError).status).toBe(500);
    expect((error503 as ServerError).status).toBe(503);
  });

  it('returns ApiError for 4xx status', () => {
    const error = categorizeError(new Error('Not found'), 404);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.isRetryable).toBe(false);
  });

  it('returns TimeoutError for AbortError', () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    const error = categorizeError(abortError);

    expect(error).toBeInstanceOf(TimeoutError);
  });

  it('preserves ApiError subclasses', () => {
    const networkError = new NetworkError();
    const result = categorizeError(networkError);

    expect(result).toBe(networkError);
  });

  it('returns ApiError for unknown errors', () => {
    const error = categorizeError(new Error('Unknown'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('UNKNOWN_ERROR');
  });
});
