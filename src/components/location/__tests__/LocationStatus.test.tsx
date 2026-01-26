import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SWRConfig } from "swr";
import { ReactNode } from "react";

import { LocationStatus } from "../LocationStatus";

// Mock BigDataCloud API response
const mockGeocodeResponse = {
  city: "Créteil",
  locality: "Val-de-Marne",
  principalSubdivision: "Île-de-France",
  countryName: "France",
  localityInfo: {
    administrative: [],
  },
};

// Default mock values
const mockGeolocationValues = {
  locationSource: "gps" as const,
  locationLabel: null as string | null,
};

// Mock useGeolocation with mutable values
vi.mock("@/contexts/GeolocationContext", () => ({
  useGeolocation: () => mockGeolocationValues,
}));

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

describe("LocationStatus", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset to default GPS values
    mockGeolocationValues.locationSource = "gps";
    mockGeolocationValues.locationLabel = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("displays city name when API returns successfully", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGeocodeResponse),
      }),
    );

    render(<LocationStatus lat={48.7833} lng={2.4167} />, {
      wrapper: createWrapper(),
    });

    // Wait for the city name to appear
    expect(await screen.findByText(/Près de Créteil/)).toBeInTheDocument();
  });

  it("shows loading state while fetching", () => {
    // Mock fetch to never resolve
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(<LocationStatus lat={48.7833} lng={2.4167} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Localisation...")).toBeInTheDocument();
  });

  it("handles API error gracefully with fallback", async () => {
    global.fetch = vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Network error")));

    render(<LocationStatus lat={48.7833} lng={2.4167} />, {
      wrapper: createWrapper(),
    });

    // Should show fallback message (text is in a nested span)
    expect(await screen.findByText("Position actuelle")).toBeInTheDocument();
  });

  it("uses locality as fallback when city is empty", async () => {
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

    render(<LocationStatus lat={48.7833} lng={2.4167} />, {
      wrapper: createWrapper(),
    });

    expect(
      await screen.findByText(/Près de Le Plessis-Trévise/),
    ).toBeInTheDocument();
  });

  it("uses principalSubdivision when city and locality are empty", async () => {
    const responseWithOnlySubdivision = {
      ...mockGeocodeResponse,
      city: "",
      locality: "",
      principalSubdivision: "Île-de-France",
    };

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responseWithOnlySubdivision),
      }),
    );

    render(<LocationStatus lat={48.7833} lng={2.4167} />, {
      wrapper: createWrapper(),
    });

    expect(
      await screen.findByText(/Près de Île-de-France/),
    ).toBeInTheDocument();
  });

  it("shows fallback when all location fields are empty", async () => {
    const emptyResponse = {
      city: "",
      locality: "",
      principalSubdivision: "",
      countryName: "France",
      localityInfo: { administrative: [] },
    };

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(emptyResponse),
      }),
    );

    render(<LocationStatus lat={48.7833} lng={2.4167} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText("Position actuelle")).toBeInTheDocument();
  });

  it("displays manual location label when locationSource is manual", () => {
    // Set up manual location mock
    mockGeolocationValues.locationSource = "manual";
    mockGeolocationValues.locationLabel = "Paris, 75001";

    render(<LocationStatus lat={48.8566} lng={2.3522} />, {
      wrapper: createWrapper(),
    });

    // Should display the manual label directly, not reverse geocode
    expect(screen.getByText("Paris, 75001")).toBeInTheDocument();
  });

  it("falls back to reverse geocoding when manual source has no label", async () => {
    // Manual source but no label - should fall back to API
    mockGeolocationValues.locationSource = "manual";
    mockGeolocationValues.locationLabel = null;

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGeocodeResponse),
      }),
    );

    render(<LocationStatus lat={48.7833} lng={2.4167} />, {
      wrapper: createWrapper(),
    });

    // Should still use reverse geocoding
    expect(await screen.findByText(/Près de Créteil/)).toBeInTheDocument();
  });
});
