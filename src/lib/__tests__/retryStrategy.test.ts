import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { createOnErrorRetry, DEFAULT_RETRY_CONFIG } from '../retryStrategy';
import { ApiError, NetworkError, RateLimitError, ServerError } from '../errors';

describe('retryStrategy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('DEFAULT_RETRY_CONFIG', () => {
    it('has correct default values', () => {
      expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(3);
      expect(DEFAULT_RETRY_CONFIG.initialDelayMs).toBe(1000);
      expect(DEFAULT_RETRY_CONFIG.multiplier).toBe(2);
    });
  });

  describe('createOnErrorRetry', () => {
    it('retries on NetworkError with exponential backoff', () => {
      const onErrorRetry = createOnErrorRetry();
      const revalidate = vi.fn();

      // First retry (retryCount = 0) - should wait 1000ms
      onErrorRetry(new NetworkError(), 'key', {}, revalidate, { retryCount: 0 });

      expect(revalidate).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(revalidate).toHaveBeenCalledWith({ retryCount: 0 });
    });

    it('uses exponential backoff for subsequent retries', () => {
      const onErrorRetry = createOnErrorRetry();
      const revalidate = vi.fn();

      // Second retry (retryCount = 1) - should wait 2000ms
      onErrorRetry(new NetworkError(), 'key', {}, revalidate, { retryCount: 1 });

      vi.advanceTimersByTime(1999);
      expect(revalidate).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(revalidate).toHaveBeenCalledWith({ retryCount: 1 });
    });

    it('retries on RateLimitError', () => {
      const onErrorRetry = createOnErrorRetry();
      const revalidate = vi.fn();

      onErrorRetry(new RateLimitError(), 'key', {}, revalidate, { retryCount: 0 });

      vi.advanceTimersByTime(1000);
      expect(revalidate).toHaveBeenCalled();
    });

    it('retries on ServerError', () => {
      const onErrorRetry = createOnErrorRetry();
      const revalidate = vi.fn();

      onErrorRetry(new ServerError(503), 'key', {}, revalidate, { retryCount: 0 });

      vi.advanceTimersByTime(1000);
      expect(revalidate).toHaveBeenCalled();
    });

    it('does NOT retry on non-retryable errors (4xx)', () => {
      const onErrorRetry = createOnErrorRetry();
      const revalidate = vi.fn();

      const clientError = new ApiError('Not found', 'CLIENT_ERROR', 404, false);
      onErrorRetry(clientError, 'key', {}, revalidate, { retryCount: 0 });

      vi.advanceTimersByTime(10000);
      expect(revalidate).not.toHaveBeenCalled();
    });

    it('stops retrying after maxRetries reached', () => {
      const onErrorRetry = createOnErrorRetry();
      const revalidate = vi.fn();

      // Third retry (retryCount = 3) - should NOT retry (max is 3)
      onErrorRetry(new NetworkError(), 'key', {}, revalidate, { retryCount: 3 });

      vi.advanceTimersByTime(10000);
      expect(revalidate).not.toHaveBeenCalled();
    });

    it('accepts custom configuration', () => {
      const customConfig = {
        maxRetries: 5,
        initialDelayMs: 500,
        multiplier: 3,
      };
      const onErrorRetry = createOnErrorRetry(customConfig);
      const revalidate = vi.fn();

      // With custom config: delay = 500 * 3^1 = 1500ms for retryCount=1
      onErrorRetry(new NetworkError(), 'key', {}, revalidate, { retryCount: 1 });

      vi.advanceTimersByTime(1499);
      expect(revalidate).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(revalidate).toHaveBeenCalled();
    });

    it('allows retry at maxRetries - 1', () => {
      const onErrorRetry = createOnErrorRetry();
      const revalidate = vi.fn();

      // retryCount = 2 should still retry (max is 3)
      onErrorRetry(new NetworkError(), 'key', {}, revalidate, { retryCount: 2 });

      // Delay = 1000 * 2^2 = 4000ms
      vi.advanceTimersByTime(4000);
      expect(revalidate).toHaveBeenCalled();
    });

    it('handles generic errors as non-retryable', () => {
      const onErrorRetry = createOnErrorRetry();
      const revalidate = vi.fn();

      onErrorRetry(new Error('Generic error'), 'key', {}, revalidate, { retryCount: 0 });

      vi.advanceTimersByTime(10000);
      expect(revalidate).not.toHaveBeenCalled();
    });
  });
});
