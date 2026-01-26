import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { StationCard } from "../StationCard";
import type { Station, StationFuelPrice } from "@/types/station";

// Helper to create mock fuel data
function createMockFuel(
  overrides: Partial<StationFuelPrice> = {},
): StationFuelPrice {
  return {
    id: 1,
    name: "Gazole",
    shortName: "Gazole",
    type: "D",
    picto: "B7",
    Update: { value: new Date().toISOString(), text: "Aujourd'hui" },
    available: true,
    Price: { value: 1.72, text: "1.72 €/L" },
    ...overrides,
  };
}

// Helper to create mock station data
function createMockStation(overrides: Partial<Station> = {}): Station {
  return {
    id: 1,
    Brand: {
      id: 1,
      name: "Total",
      shortName: "Total",
      nb_stations: 100,
    },
    type: "R",
    name: "Station Total",
    Address: {
      street_line: "123 Rue de Test",
      city_line: "75001 Paris",
    },
    Fuels: [createMockFuel()],
    ...overrides,
  };
}

describe("StationCard", () => {
  beforeEach(() => {
    // Mock current time for consistent timestamp testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("stale indicator", () => {
    it("shows stale indicator when station has stale fuel data (> 48h)", () => {
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const staleStation = createMockStation({
        Fuels: [
          createMockFuel({
            Update: { value: threeDaysAgo, text: "Il y a 3j" },
          }),
        ],
      });

      render(<StationCard station={staleStation} />);

      expect(screen.getByText("Ancien")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Données potentiellement obsolètes"),
      ).toBeInTheDocument();
    });

    it("hides stale indicator when station data is fresh (< 48h)", () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const freshStation = createMockStation({
        Fuels: [
          createMockFuel({
            Update: { value: oneHourAgo, text: "Il y a 1h" },
          }),
        ],
      });

      render(<StationCard station={freshStation} />);

      expect(screen.queryByText("Ancien")).not.toBeInTheDocument();
    });

    it("shows stale indicator if any fuel is stale", () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const mixedStation = createMockStation({
        Fuels: [
          createMockFuel({
            id: 1,
            Update: { value: oneHourAgo, text: "Il y a 1h" },
          }),
          createMockFuel({
            id: 2,
            name: "SP95",
            shortName: "SP95",
            Update: { value: threeDaysAgo, text: "Il y a 3j" },
          }),
        ],
      });

      render(<StationCard station={mixedStation} />);

      expect(screen.getByText("Ancien")).toBeInTheDocument();
    });

    it("hides stale indicator when all fuels are fresh", () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const twoHoursAgo = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString();

      const allFreshStation = createMockStation({
        Fuels: [
          createMockFuel({
            id: 1,
            Update: { value: oneHourAgo, text: "Il y a 1h" },
          }),
          createMockFuel({
            id: 2,
            name: "SP95",
            shortName: "SP95",
            Update: { value: twoHoursAgo, text: "Il y a 2h" },
          }),
        ],
      });

      render(<StationCard station={allFreshStation} />);

      expect(screen.queryByText("Ancien")).not.toBeInTheDocument();
    });

    it("shows stale indicator exactly at 48h boundary (> 48h is stale)", () => {
      // Exactly 49 hours ago - should be stale
      const fortyNineHoursAgo = new Date(
        Date.now() - 49 * 60 * 60 * 1000,
      ).toISOString();
      const staleStation = createMockStation({
        Fuels: [
          createMockFuel({
            Update: { value: fortyNineHoursAgo, text: "Il y a 2j" },
          }),
        ],
      });

      render(<StationCard station={staleStation} />);

      expect(screen.getByText("Ancien")).toBeInTheDocument();
    });

    it("hides stale indicator at exactly 48h (not stale)", () => {
      // Exactly 47 hours ago - should NOT be stale
      const fortySevenHoursAgo = new Date(
        Date.now() - 47 * 60 * 60 * 1000,
      ).toISOString();
      const freshStation = createMockStation({
        Fuels: [
          createMockFuel({
            Update: { value: fortySevenHoursAgo, text: "Il y a 1j" },
          }),
        ],
      });

      render(<StationCard station={freshStation} />);

      expect(screen.queryByText("Ancien")).not.toBeInTheDocument();
    });

    it("hides stale indicator when station has no fuels", () => {
      const emptyFuelsStation = createMockStation({
        Fuels: [],
      });

      render(<StationCard station={emptyFuelsStation} />);

      expect(screen.queryByText("Ancien")).not.toBeInTheDocument();
    });
  });

  describe("basic rendering", () => {
    it("displays station brand name", () => {
      const station = createMockStation();

      render(<StationCard station={station} />);

      expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("displays station address", () => {
      const station = createMockStation();

      render(<StationCard station={station} />);

      expect(screen.getByText("123 Rue de Test")).toBeInTheDocument();
      expect(screen.getByText("75001 Paris")).toBeInTheDocument();
    });

    it("displays Autoroute badge for highway stations", () => {
      const autoroute = createMockStation({ type: "A" });

      render(<StationCard station={autoroute} />);

      expect(screen.getByText("Autoroute")).toBeInTheDocument();
    });

    it("does not display Autoroute badge for regular stations", () => {
      const regular = createMockStation({ type: "R" });

      render(<StationCard station={regular} />);

      expect(screen.queryByText("Autoroute")).not.toBeInTheDocument();
    });
  });
});
