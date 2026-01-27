import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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
  // Note: Only some tests use fake timers - they enable/disable as needed

  describe("stale indicator", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-25T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

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

  describe("out of stock indicator", () => {
    it("shows unavailable notice when selected fuel is out of stock", () => {
      const stationWithUnavailableFuel = createMockStation({
        Fuels: [createMockFuel({ id: 1, available: false })],
      });

      render(
        <StationCard station={stationWithUnavailableFuel} selectedFuelId={1} />,
      );

      expect(screen.getByText("Carburant indisponible")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("does not show unavailable notice when selected fuel is available", () => {
      const stationWithAvailableFuel = createMockStation({
        Fuels: [createMockFuel({ id: 1, available: true })],
      });

      render(
        <StationCard station={stationWithAvailableFuel} selectedFuelId={1} />,
      );

      expect(
        screen.queryByText("Carburant indisponible"),
      ).not.toBeInTheDocument();
    });

    it("applies muted styling when selected fuel is unavailable", () => {
      const stationWithUnavailableFuel = createMockStation({
        Fuels: [createMockFuel({ id: 1, available: false })],
      });

      const { container } = render(
        <StationCard station={stationWithUnavailableFuel} selectedFuelId={1} />,
      );

      const card = container.firstChild;
      expect(card).toHaveClass("opacity-60");
    });

    it("does not apply muted styling when fuel is available", () => {
      const stationWithAvailableFuel = createMockStation({
        Fuels: [createMockFuel({ id: 1, available: true })],
      });

      const { container } = render(
        <StationCard station={stationWithAvailableFuel} selectedFuelId={1} />,
      );

      const card = container.firstChild;
      expect(card).not.toHaveClass("opacity-60");
    });

    it("does not highlight fuel row when selected fuel is unavailable", () => {
      const stationWithUnavailableFuel = createMockStation({
        Fuels: [createMockFuel({ id: 1, available: false })],
      });

      const { container } = render(
        <StationCard station={stationWithUnavailableFuel} selectedFuelId={1} />,
      );

      // The fuel row should not have the green highlight styling
      const fuelRow = container.querySelector(".bg-green-50");
      expect(fuelRow).not.toBeInTheDocument();
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

  describe("directions/maps functionality (Story 4-1)", () => {
    let windowOpenSpy: ReturnType<typeof vi.spyOn>;
    const originalNavigator = global.navigator;

    beforeEach(() => {
      windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        writable: true,
      });
    });

    it("renders directions button with correct aria-label", () => {
      const station = createMockStation();
      render(<StationCard station={station} />);

      const directionsButton = screen.getByLabelText(
        "Ouvrir dans l'application de navigation",
      );
      expect(directionsButton).toBeInTheDocument();
      expect(directionsButton).toHaveTextContent("Y aller");
    });

    it("opens Google Maps with coordinates when available (non-iOS)", () => {
      // Mock non-iOS user agent
      Object.defineProperty(global, "navigator", {
        value: { userAgent: "Mozilla/5.0 Chrome/120.0.0.0" },
        writable: true,
      });

      const stationWithCoords = createMockStation({
        Coordinates: { latitude: 48.8566, longitude: 2.3522 },
      });

      render(<StationCard station={stationWithCoords} />);

      const directionsButton = screen.getByLabelText(
        "Ouvrir dans l'application de navigation",
      );
      fireEvent.click(directionsButton);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://www.google.com/maps/dir/?api=1&destination=48.8566,2.3522",
        "_blank",
      );
    });

    it("opens Apple Maps with coordinates on iOS devices", () => {
      // Mock iOS user agent
      Object.defineProperty(global, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        },
        writable: true,
      });

      const stationWithCoords = createMockStation({
        Coordinates: { latitude: 48.8566, longitude: 2.3522 },
      });

      render(<StationCard station={stationWithCoords} />);

      const directionsButton = screen.getByLabelText(
        "Ouvrir dans l'application de navigation",
      );
      fireEvent.click(directionsButton);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        "maps://maps.apple.com/?daddr=48.8566,2.3522",
        "_blank",
      );
    });

    it("falls back to address-based Google Maps search when no coordinates", () => {
      // Mock non-iOS user agent
      Object.defineProperty(global, "navigator", {
        value: { userAgent: "Mozilla/5.0 Chrome/120.0.0.0" },
        writable: true,
      });

      const stationWithoutCoords = createMockStation({
        Coordinates: undefined,
      });

      render(<StationCard station={stationWithoutCoords} />);

      const directionsButton = screen.getByLabelText(
        "Ouvrir dans l'application de navigation",
      );
      fireEvent.click(directionsButton);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "https://www.google.com/maps/search/?api=1&query=",
        ),
        "_blank",
      );
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining("123%20Rue%20de%20Test"),
        "_blank",
      );
    });

    it("includes station address in URL when falling back", () => {
      Object.defineProperty(global, "navigator", {
        value: { userAgent: "Mozilla/5.0 Chrome/120.0.0.0" },
        writable: true,
      });

      const stationWithAddress = createMockStation({
        Coordinates: undefined,
        Address: { street_line: "456 Avenue Test", city_line: "69001 Lyon" },
      });

      render(<StationCard station={stationWithAddress} />);

      const directionsButton = screen.getByLabelText(
        "Ouvrir dans l'application de navigation",
      );
      fireEvent.click(directionsButton);

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain("456%20Avenue%20Test");
      expect(calledUrl).toContain("69001%20Lyon");
    });
  });

  describe("copy address functionality (Story 4-2)", () => {
    const originalNavigator = global.navigator;
    let mockWriteText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(global, "navigator", {
        value: {
          ...originalNavigator,
          clipboard: { writeText: mockWriteText },
        },
        writable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        writable: true,
      });
    });

    it("renders copy button with correct aria-label", () => {
      const station = createMockStation();
      render(<StationCard station={station} />);

      expect(screen.getByLabelText("Copier l'adresse")).toBeInTheDocument();
    });

    it("copies correct address to clipboard when clicked", async () => {
      const station = createMockStation({
        Address: { street_line: "123 Rue de Test", city_line: "75001 Paris" },
      });

      render(<StationCard station={station} />);

      const copyButton = screen.getByLabelText("Copier l'adresse");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          "123 Rue de Test, 75001 Paris",
        );
      });
    });

    it("shows success feedback after successful copy", async () => {
      const station = createMockStation();
      render(<StationCard station={station} />);

      const copyButton = screen.getByLabelText("Copier l'adresse");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByLabelText("Adresse copiée")).toBeInTheDocument();
      });
    });

    it("shows error feedback when copy fails", async () => {
      mockWriteText.mockRejectedValue(new Error("Copy failed"));

      const station = createMockStation();
      render(<StationCard station={station} />);

      const copyButton = screen.getByLabelText("Copier l'adresse");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(
          screen.getByLabelText("Erreur lors de la copie"),
        ).toBeInTheDocument();
      });
    });

    it("clears feedback after 2 seconds", async () => {
      vi.useFakeTimers();

      const station = createMockStation();
      render(<StationCard station={station} />);

      const copyButton = screen.getByLabelText("Copier l'adresse");

      await act(async () => {
        fireEvent.click(copyButton);
        await Promise.resolve(); // Let the click handler run
      });

      expect(screen.getByLabelText("Adresse copiée")).toBeInTheDocument();

      // Fast-forward 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByLabelText("Copier l'adresse")).toBeInTheDocument();

      vi.useRealTimers();
    });

    it("uses fallback when Clipboard API is not available", async () => {
      // Remove clipboard API
      Object.defineProperty(global, "navigator", {
        value: { clipboard: undefined },
        writable: true,
      });

      // Mock execCommand on document
      const originalExecCommand = document.execCommand;
      document.execCommand = vi.fn().mockReturnValue(true);

      const station = createMockStation();
      render(<StationCard station={station} />);

      const copyButton = screen.getByLabelText("Copier l'adresse");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(document.execCommand).toHaveBeenCalledWith("copy");
      });

      await waitFor(() => {
        expect(screen.getByLabelText("Adresse copiée")).toBeInTheDocument();
      });

      document.execCommand = originalExecCommand;
    });
  });

  describe("share station functionality (Story 4-3)", () => {
    const originalNavigator = global.navigator;
    let mockShare: ReturnType<typeof vi.fn>;
    let mockWriteText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockShare = vi.fn().mockResolvedValue(undefined);
      mockWriteText = vi.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        writable: true,
      });
    });

    it("renders share button with correct aria-label", () => {
      Object.defineProperty(global, "navigator", {
        value: { share: mockShare, clipboard: { writeText: mockWriteText } },
        writable: true,
      });

      const station = createMockStation();
      render(<StationCard station={station} />);

      expect(
        screen.getByLabelText("Partager cette station"),
      ).toBeInTheDocument();
    });

    it("calls Web Share API when available", async () => {
      Object.defineProperty(global, "navigator", {
        value: { share: mockShare, clipboard: { writeText: mockWriteText } },
        writable: true,
      });

      const station = createMockStation({
        Brand: { id: 1, name: "Total", shortName: "Total", nb_stations: 100 },
        Address: { street_line: "123 Rue de Test", city_line: "75001 Paris" },
        Fuels: [
          createMockFuel({
            shortName: "Gazole",
            Price: { value: 1.72, text: "1.72 €/L" },
          }),
        ],
      });

      render(<StationCard station={station} />);

      const shareButton = screen.getByLabelText("Partager cette station");
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: "Station Total",
          text: expect.stringContaining("Total"),
        });
      });
    });

    it("falls back to clipboard when Web Share API not available", async () => {
      Object.defineProperty(global, "navigator", {
        value: { share: undefined, clipboard: { writeText: mockWriteText } },
        writable: true,
      });

      const station = createMockStation({
        Brand: { id: 1, name: "Total", shortName: "Total", nb_stations: 100 },
      });

      render(<StationCard station={station} />);

      const shareButton = screen.getByLabelText("Partager cette station");
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
      });

      const copiedText = mockWriteText.mock.calls[0][0];
      expect(copiedText).toContain("Total");
    });

    it("shows success feedback when fallback copy succeeds", async () => {
      Object.defineProperty(global, "navigator", {
        value: { share: undefined, clipboard: { writeText: mockWriteText } },
        writable: true,
      });

      const station = createMockStation();
      render(<StationCard station={station} />);

      const shareButton = screen.getByLabelText("Partager cette station");
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(
          screen.getByLabelText("Informations copiées"),
        ).toBeInTheDocument();
      });
    });

    it("shows error feedback when share and fallback both fail", async () => {
      mockWriteText.mockRejectedValue(new Error("Copy failed"));
      Object.defineProperty(global, "navigator", {
        value: { share: undefined, clipboard: { writeText: mockWriteText } },
        writable: true,
      });

      const station = createMockStation();
      render(<StationCard station={station} />);

      const shareButton = screen.getByLabelText("Partager cette station");
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(
          screen.getByLabelText("Erreur lors du partage"),
        ).toBeInTheDocument();
      });
    });

    it("does not show error when user cancels share (AbortError)", async () => {
      const abortError = new Error("Share cancelled");
      abortError.name = "AbortError";
      mockShare.mockRejectedValue(abortError);

      Object.defineProperty(global, "navigator", {
        value: { share: mockShare, clipboard: { writeText: mockWriteText } },
        writable: true,
      });

      const station = createMockStation();
      render(<StationCard station={station} />);

      const shareButton = screen.getByLabelText("Partager cette station");
      fireEvent.click(shareButton);

      // Wait for share to be called
      await waitFor(() => {
        expect(mockShare).toHaveBeenCalled();
      });

      // Should not show error feedback for AbortError (user cancelled)
      expect(
        screen.queryByLabelText("Erreur lors du partage"),
      ).not.toBeInTheDocument();
      // Should still show the share button in idle state
      expect(
        screen.getByLabelText("Partager cette station"),
      ).toBeInTheDocument();
    });

    it("includes station name, address, and price in share content", async () => {
      Object.defineProperty(global, "navigator", {
        value: { share: undefined, clipboard: { writeText: mockWriteText } },
        writable: true,
      });

      const station = createMockStation({
        Brand: { id: 1, name: "Shell", shortName: "Shell", nb_stations: 50 },
        Address: {
          street_line: "789 Boulevard Test",
          city_line: "13001 Marseille",
        },
        Fuels: [
          createMockFuel({
            shortName: "SP95",
            Price: { value: 1.85, text: "1.85 €/L" },
          }),
        ],
      });

      render(<StationCard station={station} />);

      const shareButton = screen.getByLabelText("Partager cette station");
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
      });

      const copiedText = mockWriteText.mock.calls[0][0];
      expect(copiedText).toContain("Shell");
      expect(copiedText).toContain("789 Boulevard Test, 13001 Marseille");
      expect(copiedText).toContain("SP95: 1.85 €/L");
    });

    it("clears share feedback after 2 seconds", async () => {
      vi.useFakeTimers();

      Object.defineProperty(global, "navigator", {
        value: { share: undefined, clipboard: { writeText: mockWriteText } },
        writable: true,
      });

      const station = createMockStation();
      render(<StationCard station={station} />);

      const shareButton = screen.getByLabelText("Partager cette station");

      await act(async () => {
        fireEvent.click(shareButton);
        await Promise.resolve(); // Let the click handler run
      });

      expect(screen.getByLabelText("Informations copiées")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(
        screen.getByLabelText("Partager cette station"),
      ).toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
