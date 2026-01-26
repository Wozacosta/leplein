import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocationSearch } from "../LocationSearch";

// Mock useGeolocation
const mockSetManualCoordinates = vi.fn();

vi.mock("@/contexts/GeolocationContext", () => ({
  useGeolocation: () => ({
    setManualCoordinates: mockSetManualCoordinates,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("LocationSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders input and search button", () => {
    render(<LocationSearch />);

    expect(screen.getByLabelText(/rechercher une ville/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/paris/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /rechercher/i }),
    ).toBeInTheDocument();
  });

  it("shows error when submitting empty query", async () => {
    const user = userEvent.setup();
    render(<LocationSearch />);

    await user.click(screen.getByRole("button", { name: /rechercher/i }));

    expect(screen.getByText(/veuillez entrer une ville/i)).toBeInTheDocument();
    expect(mockSetManualCoordinates).not.toHaveBeenCalled();
  });

  it("calls setManualCoordinates on successful search", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          features: [
            {
              geometry: { coordinates: [2.347, 48.859] }, // [lng, lat]
              properties: { label: "Paris" },
            },
          ],
        }),
    });

    render(<LocationSearch />);

    await user.type(screen.getByPlaceholderText(/paris/i), "Paris");
    await user.click(screen.getByRole("button", { name: /rechercher/i }));

    await waitFor(() => {
      expect(mockSetManualCoordinates).toHaveBeenCalledWith(
        48.859, // lat
        2.347, // lng
        "Paris",
      );
    });
  });

  it("shows error when location not found", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ features: [] }),
    });

    render(<LocationSearch />);

    await user.type(screen.getByPlaceholderText(/paris/i), "xyznotfound");
    await user.click(screen.getByRole("button", { name: /rechercher/i }));

    await waitFor(() => {
      expect(screen.getByText(/lieu non trouvé/i)).toBeInTheDocument();
    });
    expect(mockSetManualCoordinates).not.toHaveBeenCalled();
  });

  it("shows error on network failure", async () => {
    const user = userEvent.setup();

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<LocationSearch />);

    await user.type(screen.getByPlaceholderText(/paris/i), "Paris");
    await user.click(screen.getByRole("button", { name: /rechercher/i }));

    await waitFor(() => {
      expect(screen.getByText(/erreur de connexion/i)).toBeInTheDocument();
    });
    expect(mockSetManualCoordinates).not.toHaveBeenCalled();
  });

  it("shows loading state during search", async () => {
    const user = userEvent.setup();

    // Create a promise that we control
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(pendingPromise);

    render(<LocationSearch />);

    await user.type(screen.getByPlaceholderText(/paris/i), "Paris");
    await user.click(screen.getByRole("button", { name: /rechercher/i }));

    // Button should show loading spinner with aria-label
    expect(
      screen.getByRole("button", { name: /recherche en cours/i }),
    ).toBeInTheDocument();

    // Input should be disabled
    expect(screen.getByPlaceholderText(/paris/i)).toBeDisabled();

    // Resolve the promise and wait for state update to complete
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ features: [] }),
    });

    // Wait for the component to finish updating
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/paris/i)).not.toBeDisabled();
    });
  });

  it("disables input and button during search", async () => {
    const user = userEvent.setup();

    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(pendingPromise);

    render(<LocationSearch />);

    await user.type(screen.getByPlaceholderText(/paris/i), "Paris");
    await user.click(screen.getByRole("button"));

    expect(screen.getByPlaceholderText(/paris/i)).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();

    // Resolve and wait for state update to complete
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ features: [] }),
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/paris/i)).not.toBeDisabled();
    });
  });

  it("handles API error response", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<LocationSearch />);

    await user.type(screen.getByPlaceholderText(/paris/i), "Paris");
    await user.click(screen.getByRole("button", { name: /rechercher/i }));

    await waitFor(() => {
      expect(screen.getByText(/erreur de connexion/i)).toBeInTheDocument();
    });
  });
});
