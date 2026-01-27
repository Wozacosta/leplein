import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SWRConfig } from "swr";
import { ReactNode } from "react";

import { useStations } from "../useStations";

// Mock data matching the actual API response structure
const mockStationListItem = {
  id: 94400004,
  Brand: {
    id: 42,
    name: "E.Leclerc",
    shortName: "eleclerc",
    nb_stations: 723,
  },
  type: "R" as const,
  name: "E.LECLERC VITRY-SUR-SEINE",
  Address: {
    street_line: "2 Rue Eugène Hénaff",
    city_line: "94400 Vitry-sur-Seine",
  },
  Coordinates: {
    latitude: 48.794,
    longitude: 2.416,
  },
  distance: 1190,
  Distance: {
    value: 1190,
    text: "1.19 km",
  },
};

const mockStationDetail = {
  ...mockStationListItem,
  Fuels: [
    {
      id: 1,
      name: "Gazole",
      shortName: "Gazole",
      type: "D" as const,
      picto: "B7",
      Update: {
        value: "2026-01-23T13:15:46Z",
        text: "23/01/2026 13:15:46",
      },
      available: true,
      Price: {
        value: 1.619,
        currency: "EUR",
        unit: "l",
        text: "1.619 €/l",
      },
    },
  ],
  LastUpdate: {
    value: "2026-01-23T13:15:47Z",
    text: "23/01/2026 13:15:47",
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

// Mock useOnlineStatus
vi.mock("@/hooks/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(() => true),
}));

describe("useStations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Suppress console.warn for cleaner test output
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null data when coordinates are null", () => {
    const { result } = renderHook(() => useStations(null, null), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
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
                json: () => Promise.resolve([mockStationListItem]),
              }),
            100,
          ),
        ),
    );

    const { result } = renderHook(() => useStations(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);
  });

  it("fetches stations when coordinates are provided", async () => {
    // Mock fetch for list and detail endpoints
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/stations/around/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockStationListItem]),
        });
      }
      if (url.includes("/station/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStationDetail),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    const { result } = renderHook(() => useStations(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    // Verify the first call was to the list endpoint
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/stations/around/48.7833,2.4167"),
      expect.any(Object),
    );
  });

  it("includes Accept: application/json header in requests", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockStationListItem]),
      }),
    );

    renderHook(() => useStations(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check that Accept header is included
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
        }),
      }),
    );
  });

  it("handles API errors gracefully", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: () => Promise.resolve({ error: "Server error" }),
      }),
    );

    const { result } = renderHook(() => useStations(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  it("does not fetch when lat is null", () => {
    global.fetch = vi.fn();

    renderHook(() => useStations(null, 2.4167), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("does not fetch when lng is null", () => {
    global.fetch = vi.fn();

    renderHook(() => useStations(48.7833, null), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("merges distance from list into station details", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/stations/around/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockStationListItem]),
        });
      }
      if (url.includes("/station/")) {
        // Detail endpoint doesn't have Distance - omit them from response
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          distance: _d,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Distance: _D,
          ...detailWithoutDistance
        } = mockStationDetail;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(detailWithoutDistance),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    const { result } = renderHook(() => useStations(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    await waitFor(() => {
      // Distance should be merged from list item
      expect(result.current.data?.[0]?.Distance?.value).toBe(1190);
    });
  });

  it("returns fallback data when detail fetch fails but list succeeds", async () => {
    // console.warn is already mocked in beforeEach

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/stations/around/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockStationListItem]),
        });
      }
      if (url.includes("/station/")) {
        // Simulate detail fetch failure
        return Promise.resolve({
          ok: false,
          status: 500,
          headers: new Headers(),
          json: () => Promise.resolve({ error: "Internal server error" }),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    const { result } = renderHook(() => useStations(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      // Should return the list item as fallback (without prices)
      expect(result.current.data?.length).toBe(1);
      expect(result.current.data?.[0]?.id).toBe(mockStationListItem.id);
      // Distance should still be preserved from list
      expect(result.current.data?.[0]?.Distance?.value).toBe(1190);
    });

    // Verify warning was logged
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Failed to fetch details for station"),
      expect.any(String),
    );
  });

  it("returns errorType for categorized errors", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        headers: new Headers(),
      }),
    );

    const { result } = renderHook(() => useStations(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.errorType).toBe("server");
  });

  it("returns isStale: false when no error", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/stations/around/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockStationListItem]),
        });
      }
      if (url.includes("/station/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStationDetail),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    const { result } = renderHook(() => useStations(48.7833, 2.4167), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.isStale).toBe(false);
    expect(result.current.errorType).toBeNull();
  });

  it("returns errorType: null when no error", () => {
    const { result } = renderHook(() => useStations(null, null), {
      wrapper: createWrapper(),
    });

    expect(result.current.errorType).toBeNull();
    expect(result.current.isStale).toBe(false);
  });
});
