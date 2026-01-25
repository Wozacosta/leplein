import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { FuelPriceRow } from "../FuelPriceRow";
import type { StationFuelPrice } from "@/types/station";

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

describe("FuelPriceRow", () => {
  beforeEach(() => {
    // Mock current time for consistent timestamp testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("timestamp display", () => {
    it("displays the relative time ago for fuel update", () => {
      const twoHoursAgo = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString();
      const fuel = createMockFuel({
        Update: { value: twoHoursAgo, text: "Il y a 2h" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      expect(screen.getByText("il y a 2h")).toBeInTheDocument();
    });

    it("displays minutes format for recent updates", () => {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const fuel = createMockFuel({
        Update: { value: thirtyMinsAgo, text: "Il y a 30 min" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      expect(screen.getByText("il y a 30 min")).toBeInTheDocument();
    });

    it("displays days format for older updates", () => {
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const fuel = createMockFuel({
        Update: { value: threeDaysAgo, text: "Il y a 3j" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      expect(screen.getByText("il y a 3j")).toBeInTheDocument();
    });

    it("displays French date format for updates older than 7 days", () => {
      const twoWeeksAgo = new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const fuel = createMockFuel({
        Update: { value: twoWeeksAgo, text: "11/01/2026" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      // Should display French date format dd/mm/yyyy
      expect(screen.getByText("11/01/2026")).toBeInTheDocument();
    });
  });

  describe("timestamp styling", () => {
    it("displays gray text for fresh data (< 48 hours old)", () => {
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();
      const fuel = createMockFuel({
        Update: { value: oneDayAgo, text: "Il y a 1j" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      const timestamp = screen.getByText("il y a 1j");
      expect(timestamp).toHaveClass("text-gray-400");
      expect(timestamp).not.toHaveClass("text-orange-600");
    });

    it("displays orange text for stale data (> 48 hours old)", () => {
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const fuel = createMockFuel({
        Update: { value: threeDaysAgo, text: "Il y a 3j" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      const timestamp = screen.getByText("il y a 3j");
      expect(timestamp).toHaveClass("text-orange-600");
      expect(timestamp).not.toHaveClass("text-gray-400");
    });

    it("displays timestamp with small text size", () => {
      // Use a date 5 minutes ago to get "il y a X min" format
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const fuel = createMockFuel({
        Update: { value: fiveMinsAgo, text: "Il y a 5 min" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      const timestamp = screen.getByText(/il y a|à l'instant/);
      expect(timestamp).toHaveClass("text-xs");
    });
  });

  describe("timestamp accessibility and position", () => {
    it("renders timestamp alongside the price", () => {
      // Use a date 10 minutes ago to ensure "il y a" format
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const fuel = createMockFuel({
        Price: { value: 1.85, text: "1.85 €/L" },
        Update: { value: tenMinsAgo, text: "Il y a 10 min" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      // Both price and timestamp should be present
      expect(screen.getByText(/1,85/)).toBeInTheDocument();
      expect(screen.getByText(/il y a|à l'instant/)).toBeInTheDocument();
    });

    it("displays timestamp even when fuel is out of stock", () => {
      // Use a date 10 minutes ago to ensure "il y a" format
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const fuel = createMockFuel({
        available: false,
        Price: undefined,
        Update: { value: tenMinsAgo, text: "Il y a 10 min" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      // Should show "Rupture" badge
      expect(screen.getByText("Rupture")).toBeInTheDocument();
      // Timestamp should still be visible
      expect(screen.getByText(/il y a|à l'instant/)).toBeInTheDocument();
    });
  });

  describe("fuel information display", () => {
    it("displays fuel picto badge", () => {
      const fuel = createMockFuel({ picto: "E10" });

      render(<FuelPriceRow fuel={fuel} />);

      expect(screen.getByText("E10")).toBeInTheDocument();
    });

    it("displays fuel short name", () => {
      const fuel = createMockFuel({ shortName: "SP95-E10" });

      render(<FuelPriceRow fuel={fuel} />);

      expect(screen.getByText("SP95-E10")).toBeInTheDocument();
    });

    it("displays formatted price", () => {
      const fuel = createMockFuel({
        Price: { value: 1.899, text: "1.90 €/L" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      // formatPrice should format to French locale with €/L suffix
      expect(screen.getByText(/1,90\s*€\/L/)).toBeInTheDocument();
    });

    it("does not display price when out of stock", () => {
      const fuel = createMockFuel({
        available: false,
        Price: { value: 1.72, text: "1.72 €/L" },
      });

      render(<FuelPriceRow fuel={fuel} />);

      // Should show Rupture badge instead of price
      expect(screen.getByText("Rupture")).toBeInTheDocument();
      expect(screen.queryByText(/1,72\s*€\/L/)).not.toBeInTheDocument();
    });
  });

  describe("highlighting", () => {
    it("applies highlight styling when isHighlighted is true", () => {
      const fuel = createMockFuel();

      const { container } = render(
        <FuelPriceRow fuel={fuel} isHighlighted={true} />,
      );

      const row = container.firstChild;
      expect(row).toHaveClass("bg-green-50");
    });

    it("does not apply highlight styling by default", () => {
      const fuel = createMockFuel();

      const { container } = render(<FuelPriceRow fuel={fuel} />);

      const row = container.firstChild;
      expect(row).not.toHaveClass("bg-green-50");
    });

    it("applies larger text for highlighted price", () => {
      const fuel = createMockFuel();

      render(<FuelPriceRow fuel={fuel} isHighlighted={true} />);

      const price = screen.getByText(/1,72\s*€\/L/);
      expect(price).toHaveClass("text-green-700", "text-lg");
    });
  });
});
