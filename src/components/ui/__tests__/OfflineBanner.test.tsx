import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { OfflineBanner } from "../OfflineBanner";

// Mock the useOnlineStatus hook
vi.mock("@/hooks/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(),
}));

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const mockUseOnlineStatus = vi.mocked(useOnlineStatus);

describe("OfflineBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when online", () => {
    mockUseOnlineStatus.mockReturnValue(true);

    render(<OfflineBanner />);

    expect(screen.queryByText(/hors ligne/i)).not.toBeInTheDocument();
  });

  it("renders offline message when offline", () => {
    mockUseOnlineStatus.mockReturnValue(false);

    render(<OfflineBanner />);

    expect(screen.getByText(/vous êtes hors ligne/i)).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    mockUseOnlineStatus.mockReturnValue(false);

    render(<OfflineBanner />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen readers', () => {
    mockUseOnlineStatus.mockReturnValue(false);

    render(<OfflineBanner />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
