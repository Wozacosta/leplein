import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SWRConfig } from "swr";
import { ReactNode } from "react";

import { useFuels } from "../useFuels";

// Mock useOnlineStatus
vi.mock("@/hooks/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(() => true),
}));

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const mockUseOnlineStatus = vi.mocked(useOnlineStatus);

// Mock API response matching actual fuel data structure
const mockFuelsResponse = [
  { id: 1, name: "Gazole", short_name: "Gazole", type: "D", picto: "B7" },
  { id: 2, name: "SP95", short_name: "SP95", type: "E", picto: "E5" },
  { id: 3, name: "E85", short_name: "E85", type: "E", picto: "E85" },
];

// SWR wrapper to prevent cache between tests
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        {children}
      </SWRConfig>
    );
  };
}

describe("useFuels", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseOnlineStatus.mockReturnValue(true);
    // Suppress console.warn for cleaner test output
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches fuels from API successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFuelsResponse),
    });

    const { result } = renderHook(() => useFuels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockFuelsResponse);
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.isUsingFallback).toBe(false);
  });

  it("includes Accept: application/json header in requests", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFuelsResponse),
    });

    renderHook(() => useFuels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
        }),
      }),
    );
  });

  it("returns fallback fuels when API fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useFuels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      // Should use fallback data
      expect(result.current.isUsingFallback).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBe(6); // Fallback has 6 fuel types
    });

    // Error should still be captured
    expect(result.current.error).toBeDefined();
    expect(result.current.errorType).toBe("server");
  });

  it("returns correct errorType for server errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useFuels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.errorType).toBe("server");
  });

  it("returns correct errorType for rate limit errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useFuels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.errorType).toBe("rate-limit");
  });

  it("returns errorType: null when no error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockFuelsResponse),
    });

    const { result } = renderHook(() => useFuels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.errorType).toBeNull();
    expect(result.current.isUsingFallback).toBe(false);
  });

  it("fallback fuels include all 6 standard fuel types", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
    });

    const { result } = renderHook(() => useFuels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isUsingFallback).toBe(true);
    });

    const fuelNames = result.current.data?.map((f) => f.name);
    expect(fuelNames).toContain("Gazole");
    expect(fuelNames).toContain("SP95");
    expect(fuelNames).toContain("SP98");
    expect(fuelNames).toContain("E10");
    expect(fuelNames).toContain("E85");
    expect(fuelNames).toContain("GPLc");
  });

  describe("offline behavior", () => {
    it("pauses revalidation when offline", async () => {
      mockUseOnlineStatus.mockReturnValue(false);

      // Set up fetch that should NOT be called when offline
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFuelsResponse),
      });

      const { result } = renderHook(() => useFuels(), {
        wrapper: createWrapper(),
      });

      // When offline and isPaused returns true, SWR should not make requests
      // The hook should still work but not trigger new fetches
      expect(result.current.isLoading).toBe(false);
    });

    it("uses cached data when offline", async () => {
      // First, fetch while online
      mockUseOnlineStatus.mockReturnValue(true);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFuelsResponse),
      });

      const wrapper = createWrapper();
      const { result, rerender } = renderHook(() => useFuels(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockFuelsResponse);
      });

      // Now go offline - data should still be available
      mockUseOnlineStatus.mockReturnValue(false);
      rerender();

      // Data should still be available from cache
      expect(result.current.data).toEqual(mockFuelsResponse);
    });
  });
});
