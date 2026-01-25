import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { StationList } from "../StationList";
import { useGeolocation } from "@/contexts/GeolocationContext";
import { useStations } from "@/hooks/useStations";
import type { Station } from "@/types/station";

// Mock the hooks
vi.mock("@/contexts/GeolocationContext", () => ({
  useGeolocation: vi.fn(),
}));

vi.mock("@/hooks/useStations", () => ({
  useStations: vi.fn(),
}));

const mockUseGeolocation = vi.mocked(useGeolocation);
const mockUseStations = vi.mocked(useStations);

// Helper to create mock station data - uses street address as unique identifier
function createMockStation(
  id: number,
  streetAddress: string,
  fuels: Array<{
    id: number;
    shortName: string;
    available: boolean;
    price?: number;
  }>,
): Station {
  return {
    id,
    name: `Station ${id}`,
    Brand: {
      id: 1,
      name: "TotalEnergies",
      shortName: "Total",
      nb_stations: 100,
    },
    type: "R",
    Address: { street_line: streetAddress, city_line: "75001 Paris" },
    Fuels: fuels.map((f) => ({
      id: f.id,
      name: f.shortName,
      shortName: f.shortName,
      type: "D" as const,
      picto: "B7",
      Update: { value: "2026-01-25", text: "Aujourd'hui" },
      available: f.available,
      Price: f.price ? { value: f.price, text: `${f.price} €/L` } : undefined,
    })),
    Distance: { value: 1000, text: "1 km" },
  };
}

describe("StationList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("filtering by fuel availability", () => {
    // Using unique street addresses to identify each station in tests
    const stationsWithMixedAvailability: Station[] = [
      createMockStation(1, "10 Rue de Paris", [
        { id: 1, shortName: "Gazole", available: true, price: 1.8 },
        { id: 2, shortName: "SP95", available: true, price: 1.9 },
      ]),
      createMockStation(2, "20 Avenue des Champs", [
        { id: 1, shortName: "Gazole", available: false, price: 1.82 }, // Out of stock
        { id: 2, shortName: "SP95", available: true, price: 1.88 },
      ]),
      createMockStation(3, "30 Boulevard Saint-Michel", [
        { id: 1, shortName: "Gazole", available: true, price: 1.78 },
        { id: 2, shortName: "SP95", available: false, price: 1.92 }, // Out of stock
      ]),
    ];

    beforeEach(() => {
      mockUseGeolocation.mockReturnValue({
        coordinates: { lat: 48.8566, lng: 2.3522 },
        status: "granted",
        error: null,
        requestPermission: vi.fn(),
      });
    });

    it("filters stations to only show those with selected fuel available", () => {
      mockUseStations.mockReturnValue({
        data: stationsWithMixedAvailability,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      // Select Gazole (id: 1) - Station at "20 Avenue des Champs" has Gazole unavailable
      render(<StationList selectedFuelId={1} />);

      // Should show stations with Gazole available (identified by street address)
      expect(screen.getByText("10 Rue de Paris")).toBeInTheDocument();
      expect(screen.getByText("30 Boulevard Saint-Michel")).toBeInTheDocument();

      // Should NOT show station with Gazole unavailable
      expect(
        screen.queryByText("20 Avenue des Champs"),
      ).not.toBeInTheDocument();

      // Results count should show 2 stations
      expect(screen.getByText(/2 stations? trouvées?/)).toBeInTheDocument();
    });

    it("filters stations when SP95 is selected", () => {
      mockUseStations.mockReturnValue({
        data: stationsWithMixedAvailability,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      // Select SP95 (id: 2) - Station at "30 Boulevard Saint-Michel" has SP95 unavailable
      render(<StationList selectedFuelId={2} />);

      // Should show stations with SP95 available
      expect(screen.getByText("10 Rue de Paris")).toBeInTheDocument();
      expect(screen.getByText("20 Avenue des Champs")).toBeInTheDocument();

      // Should NOT show station with SP95 unavailable
      expect(
        screen.queryByText("30 Boulevard Saint-Michel"),
      ).not.toBeInTheDocument();

      // Results count should show 2 stations
      expect(screen.getByText(/2 stations? trouvées?/)).toBeInTheDocument();
    });

    it("shows all stations when 'Tous' is selected (undefined fuel)", () => {
      mockUseStations.mockReturnValue({
        data: stationsWithMixedAvailability,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      // No fuel selected (undefined) = show all
      render(<StationList selectedFuelId={undefined} />);

      // Should show all 3 stations
      expect(screen.getByText("10 Rue de Paris")).toBeInTheDocument();
      expect(screen.getByText("20 Avenue des Champs")).toBeInTheDocument();
      expect(screen.getByText("30 Boulevard Saint-Michel")).toBeInTheDocument();

      // Results count should show 3 stations
      expect(screen.getByText(/3 stations? trouvées?/)).toBeInTheDocument();
    });

    it("shows no stations if none have selected fuel available", () => {
      const stationsWithNoE85: Station[] = [
        createMockStation(1, "10 Rue de Paris", [
          { id: 1, shortName: "Gazole", available: true, price: 1.8 },
          { id: 3, shortName: "E85", available: false }, // E85 not available
        ]),
        createMockStation(2, "20 Avenue des Champs", [
          { id: 1, shortName: "Gazole", available: true, price: 1.82 },
          // No E85 fuel at all
        ]),
      ];

      mockUseStations.mockReturnValue({
        data: stationsWithNoE85,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      // Select E85 (id: 3)
      render(<StationList selectedFuelId={3} />);

      // Should show empty state
      expect(
        screen.getByText("Aucune station trouvée à proximité"),
      ).toBeInTheDocument();
    });
  });
});
