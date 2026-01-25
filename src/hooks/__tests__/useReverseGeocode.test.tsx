import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SWRConfig } from "swr";
import { ReactNode } from "react";

import { useReverseGeocode } from "../useReverseGeocode";

// Mock BigDataCloud API response
const mockGeocodeResponse = {
  city: "Créteil",
  locality: "Val-de-Marne",
  principalSubdivision: "Île-de-France",
  countryName: "France",
  localityInfo: {
    administrative: [
      { name: "France", order: 2 },
      { name: "Île-de-France", order: 4 },
    ],
  },
};

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

describe("useReverseGeocode", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns undefined data when coordinates are null", () => {
    const { result } = renderHook(() => useReverseGeocode(null, null), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it("does not fetch when lat is null", () => {
    global.fetch = vi.fn();

    renderHook(() => useReverseGeocode(null, 2.4167), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("does not fetch when lng is null", () => {
    global.fetch = vi.fn();

    renderHook(() => useReverseGeocode(48.7833, null), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns loading state initially when coordinates provided", async () => {
    // Mock fetch to delay response
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve(mockGeocodeResponse),
              }),
            100,
          ),
        ),
    );

    const { result } = renderHook(() => useReverseGeocode(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);
  });

  it("fetches location data when coordinates are provided", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGeocodeResponse),
      }),
    );

    const { result } = renderHook(() => useReverseGeocode(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.city).toBe("Créteil");
    });

    // Verify correct URL was called with French locale and Accept header
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "api.bigdatacloud.net/data/reverse-geocode-client",
      ),
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
        }),
      }),
    );
    // Verify URL contains required parameters
    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(calledUrl).toContain("latitude=48.7833");
    expect(calledUrl).toContain("longitude=2.4167");
    expect(calledUrl).toContain("localityLanguage=fr");
  });

  it("handles network errors gracefully", async () => {
    global.fetch = vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Network error")));

    const { result } = renderHook(() => useReverseGeocode(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  it("handles non-2xx responses as errors", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      }),
    );

    const { result } = renderHook(() => useReverseGeocode(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain("500");
    });
  });

  it("returns locality when city is missing", async () => {
    const responseWithoutCity = {
      ...mockGeocodeResponse,
      city: "",
      locality: "Le Plessis-Trévise",
    };

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responseWithoutCity),
      }),
    );

    const { result } = renderHook(() => useReverseGeocode(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data?.locality).toBe("Le Plessis-Trévise");
    });
  });
});
