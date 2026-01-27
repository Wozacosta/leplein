import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocationChanger } from "../LocationChanger";

// Mock useGeolocation
const mockSetManualCoordinates = vi.fn();
const mockRequestPermission = vi.fn();
let mockStatus = "granted";

vi.mock("@/contexts/GeolocationContext", () => ({
  useGeolocation: () => ({
    setManualCoordinates: mockSetManualCoordinates,
    requestPermission: mockRequestPermission,
    status: mockStatus,
  }),
}));

// Mock useReverseGeocode for LocationStatus
vi.mock("@/hooks/useReverseGeocode", () => ({
  useReverseGeocode: () => ({
    data: { city: "Paris" },
    error: null,
    isLoading: false,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("LocationChanger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatus = "granted";
  });

  it("renders location status with dropdown indicator", () => {
    render(<LocationChanger lat={48.859} lng={2.347} />);

    expect(screen.getByText(/près de paris/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument();
  });

  it("opens dropdown when clicking on location", async () => {
    const user = userEvent.setup();
    render(<LocationChanger lat={48.859} lng={2.347} />);

    await user.click(screen.getByRole("button", { expanded: false }));

    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument();
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText(/utiliser ma position/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/paris/i)).toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <LocationChanger lat={48.859} lng={2.347} />
        <div data-testid="outside">Outside</div>
      </div>,
    );

    await user.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes dropdown when pressing Escape", async () => {
    const user = userEvent.setup();
    render(<LocationChanger lat={48.859} lng={2.347} />);

    await user.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls requestPermission when clicking 'Utiliser ma position'", async () => {
    const user = userEvent.setup();
    mockStatus = "idle";
    render(<LocationChanger lat={48.859} lng={2.347} />);

    await user.click(screen.getByRole("button", { expanded: false }));
    await user.click(screen.getByText(/utiliser ma position/i));

    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it("performs search and calls setManualCoordinates on success", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          features: [
            {
              geometry: { coordinates: [2.347, 48.859] },
              properties: { label: "Paris, France" },
            },
          ],
        }),
    });

    render(<LocationChanger lat={45.0} lng={1.0} />);

    await user.click(screen.getByRole("button", { expanded: false }));
    await user.type(screen.getByPlaceholderText(/paris/i), "Paris");
    await user.click(screen.getByRole("button", { name: /ok/i }));

    await waitFor(() => {
      expect(mockSetManualCoordinates).toHaveBeenCalledWith(
        48.859,
        2.347,
        "Paris, France",
      );
    });

    // Dropdown should close after successful search
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("shows error when search query is empty", async () => {
    const user = userEvent.setup();
    render(<LocationChanger lat={48.859} lng={2.347} />);

    await user.click(screen.getByRole("button", { expanded: false }));
    await user.click(screen.getByRole("button", { name: /ok/i }));

    expect(screen.getByText(/veuillez entrer une ville/i)).toBeInTheDocument();
  });

  it("shows error when location not found", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ features: [] }),
    });

    render(<LocationChanger lat={48.859} lng={2.347} />);

    await user.click(screen.getByRole("button", { expanded: false }));
    await user.type(screen.getByPlaceholderText(/paris/i), "xyznotfound");
    await user.click(screen.getByRole("button", { name: /ok/i }));

    await waitFor(() => {
      expect(screen.getByText(/lieu non trouvé/i)).toBeInTheDocument();
    });
  });

  it("clears error when dropdown is closed and reopened", async () => {
    const user = userEvent.setup();
    render(<LocationChanger lat={48.859} lng={2.347} />);

    // Open and trigger error
    await user.click(screen.getByRole("button", { expanded: false }));
    await user.click(screen.getByRole("button", { name: /ok/i }));
    expect(screen.getByText(/veuillez entrer une ville/i)).toBeInTheDocument();

    // Close dropdown
    await user.keyboard("{Escape}");

    // Reopen - error should be cleared
    await user.click(screen.getByRole("button", { expanded: false }));
    expect(
      screen.queryByText(/veuillez entrer une ville/i),
    ).not.toBeInTheDocument();
  });

  it("has proper aria attributes for accessibility", async () => {
    const user = userEvent.setup();
    render(<LocationChanger lat={48.859} lng={2.347} />);

    const trigger = screen.getByRole("button", { expanded: false });
    expect(trigger).toHaveAttribute("aria-haspopup", "true");
    expect(trigger).toHaveAttribute(
      "aria-controls",
      "location-changer-dropdown",
    );

    await user.click(trigger);

    const dropdown = screen.getByRole("menu");
    expect(dropdown).toHaveAttribute("id", "location-changer-dropdown");
  });

  it("shows loading state during search", async () => {
    const user = userEvent.setup();

    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(pendingPromise);

    render(<LocationChanger lat={48.859} lng={2.347} />);

    await user.click(screen.getByRole("button", { expanded: false }));
    await user.type(screen.getByPlaceholderText(/paris/i), "Paris");
    await user.click(screen.getByRole("button", { name: /ok/i }));

    // Should show loading state with aria-label
    expect(
      screen.getByRole("button", { name: /recherche en cours/i }),
    ).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ features: [] }),
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /ok/i })).toBeInTheDocument();
    });
  });
});
