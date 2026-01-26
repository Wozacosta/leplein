import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocationPrompt } from "../LocationPrompt";

// Mutable mock values
const mockGeolocationValues = {
  status: "idle" as "idle" | "requesting" | "granted" | "denied" | "unavailable",
  error: null as string | null,
  requestPermission: vi.fn(),
  setManualCoordinates: vi.fn(),
};

// Mock useGeolocation
vi.mock("@/contexts/GeolocationContext", () => ({
  useGeolocation: () => mockGeolocationValues,
}));

describe("LocationPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default idle state
    mockGeolocationValues.status = "idle";
    mockGeolocationValues.error = null;
  });

  it("renders nothing when status is granted", () => {
    mockGeolocationValues.status = "granted";

    const { container } = render(<LocationPrompt />);

    expect(container.firstChild).toBeNull();
  });

  it("shows loading state when status is requesting", () => {
    mockGeolocationValues.status = "requesting";

    render(<LocationPrompt />);

    expect(screen.getByText(/recherche de votre position/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows LocationSearch when status is unavailable", () => {
    mockGeolocationValues.status = "unavailable";

    render(<LocationPrompt />);

    expect(screen.getByText(/géolocalisation non disponible/i)).toBeInTheDocument();
    // LocationSearch should be present
    expect(screen.getByLabelText(/rechercher une ville/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/paris/i)).toBeInTheDocument();
  });

  it("shows LocationSearch when status is denied", () => {
    mockGeolocationValues.status = "denied";

    render(<LocationPrompt />);

    // Should show retry button
    expect(screen.getByRole("button", { name: /réessayer/i })).toBeInTheDocument();
    // LocationSearch should be present as fallback
    expect(screen.getByLabelText(/rechercher une ville/i)).toBeInTheDocument();
  });

  it("shows LocationSearch when status is idle", () => {
    mockGeolocationValues.status = "idle";

    render(<LocationPrompt />);

    // Should show activation button
    expect(screen.getByRole("button", { name: /activer la géolocalisation/i })).toBeInTheDocument();
    // LocationSearch should be present as fallback
    expect(screen.getByLabelText(/rechercher une ville/i)).toBeInTheDocument();
  });

  it("calls requestPermission when activation button is clicked", async () => {
    const user = userEvent.setup();
    mockGeolocationValues.status = "idle";

    render(<LocationPrompt />);

    await user.click(screen.getByRole("button", { name: /activer la géolocalisation/i }));

    expect(mockGeolocationValues.requestPermission).toHaveBeenCalledTimes(1);
  });

  it("displays error message when error is present", () => {
    mockGeolocationValues.status = "denied";
    mockGeolocationValues.error = "Vous avez refusé l'accès à votre position";

    render(<LocationPrompt />);

    expect(screen.getByText(/vous avez refusé l'accès/i)).toBeInTheDocument();
  });

  it("shows helper text about browser settings when denied", () => {
    mockGeolocationValues.status = "denied";

    render(<LocationPrompt />);

    expect(screen.getByText(/paramètres de votre navigateur/i)).toBeInTheDocument();
  });
});
